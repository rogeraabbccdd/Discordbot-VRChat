import * as Discord from 'discord.js'
import { bot } from '../bot'
import { loginUrlShort, inviteUrl } from '../utils/misc'

export default async (message: Discord.Message): Promise<void> => {
  const avatar: string = `https://cdn.discordapp.com/avatars/${bot?.user?.id || ''}/${bot?.user?.avatar || ''}.png`
  const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
    .setTitle('Discord VRChat Bot')
    .setURL('https://github.com/rogeraabbccdd/Discordbot-VRChat')
    .setDescription('A Discord bot for VRChat communities.')
    .setThumbnail(avatar)
    .setColor('#1a2026')
    .setFooter('Made with ❤ by Kento.')
    .addFields([
      {
        name: 'Search User ID',
        value: 'Search user by ID\n`vrc.uid usr_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`'
      },
      {
        name: 'Search User',
        value: 'Search user by display name, only return 60 results.\n`vrc.user xxxx`'
      },
      {
        name: 'Search World ID',
        value: 'Search world by ID\n`vrc.wid wrld_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`'
      },
      {
        name: 'Search World',
        value: 'Search world by name, only return 60 results.\n`vrc.world xxxx`'
      },
      {
        name: 'Link VRChat Account',
        value: '`vrc.link`'
      },
      {
        name: 'Your VRChat Profile',
        value: '`vrc.me` or ' + loginUrlShort
      },
      {
        name: 'Other User VRChat Profile',
        value: 'Show mentioned user\'s VRChat profile.\n`vrc.profile @user`'
      },
      {
        name: 'Add Bot',
        value: inviteUrl
      },
      {
        name: 'Source Code',
        value: '[GitHub](https://github.com/rogeraabbccdd/Discordbot-VRChat)'
      }
    ])

  message.reply({ embeds: [embed] })
}
