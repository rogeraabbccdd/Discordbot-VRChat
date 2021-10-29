import * as Discord from 'discord.js'
import * as vrchat from 'vrchat'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { paginationEmbed } from '../utils/discord'
import { worldsApi } from '../vrc'
import { splitToBulks } from '../utils/misc'
import { getWorldPageFromID } from '../utils/vrc'

export default async (message: Discord.Message): Promise<void> => {
  try {
    const search: string = message.content.trim().replace('vrc.world ', '')
    const { data: worlds } = await worldsApi.searchWorlds(undefined, 'heat', undefined, undefined, 60, 'descending', 0, search)
    const pages: Discord.MessageEmbed[] = splitToBulks(worlds, 10).map((worlds: vrchat.LimitedWorld[]): Discord.MessageEmbed => {
      const embed: Discord.MessageEmbed = new Discord.MessageEmbed().setTitle('Search Results')
      for (const world of worlds) {
        embed.addField(world.name, getWorldPageFromID(world.id))
      }
      return embed
    })
    paginationEmbed('Search Result', message, pages)
  } catch (error: unknown) {
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
