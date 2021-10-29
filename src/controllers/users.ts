import * as express from 'express'
import * as vrchat from 'vrchat'
import * as FormData from 'form-data'
import fetch, { Response } from 'node-fetch'
import axios, { AxiosError } from 'axios'
import users from '../models/users'

interface LinkPostData {
  username: string
  password: string
  twofa: string,
  code: string
}

export const link = async (req: express.Request, res: express.Response): Promise<void> => {
  const dataPost: LinkPostData = req.body

  // Check post data format, 2fa code is not necessary
  if (!dataPost.username || !dataPost.password || !dataPost.code) {
    res.status(400).send({ message: 'Invalid Data Format' })
    return
  }

  try {
    const id: { discord: string, vrc: string} = {
      discord: '',
      vrc: ''
    }

    // Login VRChat and get user ID
    // We don't use vrchat or axios here beacause it always return logged in API account
    // So we use node-fetch instead
    let response: Response = await fetch('https://api.vrchat.cloud/api/1/auth/user', {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${dataPost.username}:${dataPost.password}`).toString('base64')
      }
    })
    const dataUser: vrchat.User = await response.json() as vrchat.User
    const cookie: string = response.headers.raw()?.['set-cookie']?.[0] || ''
    if (!dataUser.displayName) {
      response = await fetch('https://api.vrchat.cloud/api/1/auth/twofactorauth/totp/verify',
        {
          method: 'post',
          body: JSON.stringify({ code: dataPost.code }),
          headers: {
            'Content-Type': 'application/json',
            cookie
          }
        }
      )
      const data2FA: vrchat.InlineResponse2001 = await response.json() as vrchat.InlineResponse2001
      if (!data2FA.verified) {
        throw new Error('login')
      }
      response = await fetch('https://api.vrchat.cloud/api/1/auth/user', {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${dataPost.username}:${dataPost.password}`).toString('base64'),
          cookie
        }
      })
      id.vrc = dataUser.id
    } else {
      id.vrc = dataUser.id
    }

    // Logout VRChat
    await fetch('https://api.vrchat.cloud/api/1/logout',
      {
        method: 'put',
        headers: {
          cookie
        }
      }
    )

    // Use Discord code to exchange token
    const fdToken: FormData = new FormData()
    fdToken.append('grant_type', 'authorization_code')
    fdToken.append('client_id', (process.env.DISCORD_CLIENT || '').replace(/abc/g, ''))
    fdToken.append('client_secret', process.env.DISCORD_SECRET || '')
    fdToken.append('code', dataPost.code)
    fdToken.append('redirect_uri', process.env.HOST_URL || '')
    fdToken.append('scope', 'identify')
    // eslint-disable-next-line camelcase
    const resToken: { data: { access_token: string } } = await axios.post('https://discord.com/api/oauth2/token', fdToken, {
      headers: fdToken.getHeaders()
    })

    // Get user Discord data
    // eslint-disable-next-line camelcase
    const resDiscord: { data: { id: string } } = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${resToken.data.access_token}` }
    })
    id.discord = resDiscord.data.id

    // Logout Discord
    const fdLogout: FormData = new FormData()
    fdLogout.append('token', resToken.data.access_token)
    fdLogout.append('client_id', (process.env.DISCORD_CLIENT || '').replace(/abc/g, ''))
    fdLogout.append('client_secret', process.env.DISCORD_SECRET)
    await axios.post('https://discord.com/api/oauth2/token/revoke', fdLogout, {
      headers: fdLogout.getHeaders()
    })

    // Check database if user already exists
    const user = await users.findOne({ $or: [{ discord: id.discord }, { vrc: id.vrc }] })
    if (user) {
      throw new Error('linked')
    }

    // Create new user
    await users.create({
      discord: id.discord,
      vrc: id.vrc
    })

    res.status(200).send({ message: 'Success.' })
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError
      console.log(err)
      if (err.config.url?.includes('discord')) {
        res.status(400).send({ message: 'Discord authorize failed.' })
      } else {
        res.status(500).send({ message: 'Server Error.' })
      }
    } else {
      const err = error as Error
      if (err.message === 'linked') {
        res.status(400).send({ message: 'Discord ID or VRChat ID is already linked.' })
      } else if (err.message === 'login') {
        res.status(400).send({ message: 'VRChat authorize failed.\nCheck your mail to verify login and try again.' })
      } else if (err.name === 'FetchError') {
        console.log(err)
        res.status(500).send({ message: 'VRChat authorize failed.\nCheck your mail to verify login and try again.' })
      } else {
        console.log(err)
        res.status(500).send({ message: 'Server Error.' })
      }
    }
  }
}

export const findVRCID = async (id: string): Promise<string> => {
  const user = await users.findOne({ discord: id })
  if (user) {
    return user.vrc
  }
  return ''
}
