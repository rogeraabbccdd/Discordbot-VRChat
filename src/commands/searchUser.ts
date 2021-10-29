import * as Discord from 'discord.js'
import * as vrchat from 'vrchat'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { paginationEmbed } from '../utils/discord'
import { usersApi } from '../vrc'
import { splitToBulks } from '../utils/misc'
import { getUserPageFromID } from '../utils/vrc'

export default async (message: Discord.Message): Promise<void> => {
  try {
    const search: string = message.content.trim().replace('vrc.user ', '')
    const { data: users } = await usersApi.searchUsers(search, undefined, 60)
    const pages: Discord.MessageEmbed[] = splitToBulks(users, 10).map((users: vrchat.LimitedUser[]): Discord.MessageEmbed => {
      const embed: Discord.MessageEmbed = new Discord.MessageEmbed().setTitle('Search Results')
      for (const user of users) {
        embed.addField(user.displayName, getUserPageFromID(user.id))
      }
      return embed
    })
    paginationEmbed('Search Result', message, pages)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const { response } = error as AxiosError<AxiosResponse>
      if (response?.status === 404) {
        message.reply('World not found.')
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
