import * as Discord from 'discord.js'
import * as FileType from 'file-type'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { findVRCID } from '../controllers/users'
import { usersApi } from '../vrc'
import { getLanguageFromTags, getLevelFromTags, getUserPageFromID, Level } from '../utils/vrc'
import { loginUrlShort } from '../utils/misc'

export default async (message: Discord.Message, type: 'me'|'search'|'profile' = 'search'): Promise<void> => {
  try {
    let id: string = ''
    if (type === 'search') {
      id = message.content.trim().replace('vrc.uid ', '')
    } else if (type === 'me') {
      id = await findVRCID(message.author.id)
    } else if (type === 'profile') {
      const mention = message.mentions.users.first()?.id || ''
      if (mention.length > 0) {
        id = await findVRCID(mention)
      }
    }
    if (id.length > 0) {
      const { data: user } = await usersApi.getUser(id)
      const level: Level = getLevelFromTags(user.tags)
      console.log()
      const language: string = getLanguageFromTags(user.tags)
      const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
        .setTitle(user.displayName)
        .setDescription(user.statusDescription)
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
      embed.setThumbnail(user.profilePicOverride || user.currentAvatarImageUrl)
      if (user.profilePicOverride.length > 0) {
        const { data } = await axios.get(user.profilePicOverride, { responseType: 'stream' })
        const type = await FileType.fromStream(data)
        const fileName: string = `image.${type?.ext || ''}`
        const attachment: Discord.MessageAttachment = new Discord.MessageAttachment(user.profilePicOverride, fileName)
        embed.setThumbnail(`attachment://${fileName}`)
        message.reply({ embeds: [embed], files: [attachment] })
      } else {
        embed.setThumbnail(user.currentAvatarImageUrl)
        message.reply({ embeds: [embed] })
      }
    } else {
      if (type === 'search') {
        message.reply('Please use `vrc.uid <userid>`')
      } else if (type === 'me') {
        message.reply(`Your account has not linked yet.\n${loginUrlShort}`)
      } else if (type === 'profile') {
        message.reply('No mentioned user or user account not linked yet.')
      }
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const { response } = error as AxiosError<AxiosResponse>
      if (response?.status === 404) {
        if (type === 'me') message.reply('Your account has not linked yet.\n' + loginUrlShort)
        else message.reply('User ')
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
