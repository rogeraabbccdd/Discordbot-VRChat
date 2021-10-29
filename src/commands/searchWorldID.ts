import * as Discord from 'discord.js'
import { worldsApi } from '../vrc'
import { formatDistanceToNow } from 'date-fns'
import * as getColors from 'get-image-colors'
import * as chroma from 'chroma-js'
import { getWorldPageFromID } from '../utils/vrc'
import axios, { AxiosResponse, AxiosError } from 'axios'

export default async (message: Discord.Message): Promise<void> => {
  try {
    const id: string = message.content.trim().replace('vrc.wid ', '')
    if (id.length > 0) {
      const { data: world } = await worldsApi.getWorld(id)
      const imageResponse: AxiosResponse = await axios.get(world.imageUrl, { responseType: 'arraybuffer' })
      const colors: chroma.Color[] = await getColors(imageResponse.data as Buffer, imageResponse.headers['content-type'])
      const systemApproved: string = world.tags.includes('system_approved') ? 'Yes' : 'No'
      const adminApproved: string = world.tags.includes('admin_approved') ? 'Yes' : 'No'
      const tags: string = world.tags.filter((tag: string) => tag.includes('author_tag_')).map((tag: string) => tag.replace('author_tag_', '')).join(', ')
      const updateDate: Date = new Date(world.updated_at)
      const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
        .setTitle(world.name)
        .setDescription(world.description)
        .setThumbnail(world.imageUrl)
        .setURL(getWorldPageFromID(world.id))
        .setColor(colors[0].hex() as Discord.HexColorString)
        .addFields([
          {
            name: 'Visits',
            value: new Intl.NumberFormat('en-US').format(world.visits),
            inline: true
          },
          {
            name: 'Favorites',
            value: new Intl.NumberFormat('en-US').format(world.favorites || 0),
            inline: true
          },
          {
            name: 'Heat / Popularity',
            value: `${world.heat.toString()} / ${world.popularity.toString()}`,
            inline: true
          },
          // ==================================================================
          {
            name: 'System Approved',
            value: systemApproved,
            inline: true
          },
          {
            name: 'Admin Approved',
            value: adminApproved,
            inline: true
          },
          {
            name: 'Capacity',
            value: world.capacity.toString(),
            inline: true
          },
          // ==================================================================
          {
            name: 'Public',
            value: world.publicOccupants?.toString() || '-',
            inline: true
          },
          {
            name: 'Private',
            value: world.privateOccupants?.toString() || '-',
            inline: true
          },
          {
            name: 'Instance',
            value: world.instances?.length?.toString() || '0',
            inline: true
          },
          // ==================================================================
          {
            name: 'Last Update',
            value: `${updateDate.toLocaleDateString('zh-tw')} ${updateDate.toLocaleTimeString('en-us')} (${formatDistanceToNow(updateDate, { addSuffix: true })})`
          },
          // ==================================================================
          {
            name: 'Tags',
            value: tags
          }
        ])
      if (world.previewYoutubeId) {
        embed.addField('Preview', `https://www.youtube.com/watch?v=${world.previewYoutubeId}`)
      }
      embed.addField('Link', getWorldPageFromID(world.id))
      message.reply({ embeds: [embed] })
    } else {
      message.reply('Please use `vrc.uid <userid>`')
    }
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
