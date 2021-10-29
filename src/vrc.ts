import 'dotenv/config'
import * as vrchat from 'vrchat'
import * as schedule from 'node-schedule'
import axios, { AxiosError } from 'axios'

// VRChat API Configuration
export const configuration: vrchat.Configuration = new vrchat.Configuration({
  username: process.env.VRC_USERNAME,
  password: process.env.VRC_PASSWORD,
  apiKey: process.env.VRC_APIKEY,
  baseOptions: {
    headers: {
      Cookie: 'apiKey=' + process.env.VRC_APIKEY
    }
  }
})

// VRChat APIs
export const authApi: vrchat.AuthenticationApi = new vrchat.AuthenticationApi(configuration)
export const usersApi: vrchat.UsersApi = new vrchat.UsersApi(configuration)
export const worldsApi: vrchat.WorldsApi = new vrchat.WorldsApi(configuration)

// Is API ready?
export let ready: Boolean = false

// Function to init VRChat API
const init = async (): Promise<void> => {
  try {
    // Login VRChat API
    const { data } = await authApi.getCurrentUser()
    // Verify VRChat 2FA
    if (!data.displayName) {
      if (process.env.VRC_2FACODE && process.env.VRC_2FACODE.length > 0) {
        const { data } = await authApi.verify2FA({ code: process.env.VRC_2FACODE })
        if (!data.verified) {
          throw new Error('2FA code is invalid')
        } else {
          console.log('VRC API logged in.')
          ready = true
        }
      } else {
        throw new Error('VRC_2FACODE is required to login')
      }
    } else {
      console.log('VRC API logged in.')
      ready = true
    }
  } catch (error: unknown) {
    console.log('VRC API login Error.')
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError
      console.log(err.response?.data)
    } else {
      const err = error as Error
      console.log(err.message)
    }
  }
}

init()

// Re-login every Sunday 0:00 AM
schedule.scheduleJob({ hour: 0, minute: 0, dayOfWeek: 0 }, () => {
  console.log('Re-login VRChat API.')
  init()
})
