import * as Discord from 'discord.js'
import { findVRCID } from '../controllers/users'
import { usersApi } from '../vrc'
import { getLanguageFromTags, getLevelFromTags, getUserPageFromID, Level } from '../utils/vrc'
import { loginUrlShort } from '../utils/misc'
import axios, { AxiosError, AxiosResponse } from 'axios'

export default async (message: Discord.Message, me: boolean = false): Promise<void> => {
  try {
    let id: string = ''
    if (!me) {
      id = message.content.trim().replace('vrc.uid ', '')
    } else {
      id = await findVRCID(message.author.id)
    }
    if (id.length > 0) {
      const { data: user } = await usersApi.getUser(id)
      const level: Level = getLevelFromTags(user.tags)
      console.log()
      const language: string = getLanguageFromTags(user.tags)
      const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
        .setTitle(user.displayName)
        .setDescription(user.statusDescription)
        .setThumbnail(user.currentAvatarImageUrl)
        .setURL(getUserPageFromID(user.id))
        .setColor(level.color as Discord.HexColorString)
        .addFields([
          {
            name: 'Trust Level',
            value: level.name || '-',
            inline: true
          },
          {
            name: 'Date Joined',
            value: user.date_joined || '-',
            inline: true
          },
          {
            name: 'Languages',
            value: language || '-',
            inline: true
          },
          {
            name: 'Biography',
            value: user.bio || '-'
          },
          {
            name: 'Link',
            value: getUserPageFromID(user.id)
          }
          // Only visiable if user is your friend, otherwise it will be empty
          // {
          //   name: 'Last Login',
          //   value: formatDistanceToNow(new Date(user.last_login), { addSuffix: true }) || '-',
          //   inline: true
          // }
        ])
      // Only visiable if user is your friend, otherwise it will be offline
      // if (user.worldId && user.instanceId && user.worldId !== 'offline') {
      //   const { data: world } = await worldsApi.getWorld(user.worldId)
      //   embed.addFields([
      //     {
      //       name: 'World',
      //       value: world.name,
      //       inline: false
      //     },
      //     {
      //       name: 'Join',
      //       value: getWorldPageFromID(user.worldId, user.instanceId),
      //       inline: false
      //     }
      //   ])
      // } else {
      //   embed.addFields([
      //     {
      //       name: 'Status',
      //       value: 'Offline',
      //       inline: false
      //     }
      //   ])
      // }
      message.reply({ embeds: [embed] })
    } else {
      if (!me) {
        message.reply('Please use `vrc.uid <userid>`')
      } else {
        message.reply(`Your account has not linked yet.\n${loginUrlShort}`)
      }
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const { response } = error as AxiosError<AxiosResponse>
      if (response?.status === 404) {
        if (!me) message.reply('User not found.')
        else message.reply('Your account has not linked yet.\n' + loginUrlShort)
      } else {
        message.reply('Server Error.')
      }
      console.error(response?.data)
    } else {
      message.reply('Server Error.')
      console.log(error)
    }
  }
}
