import * as Discord from 'discord.js'
import { loginUrlShort } from './utils/misc'
import { ready } from './vrc'
import { searchUserID, searchUser, searchWorldID, searchWorld, help } from './commands'

export let bot: Discord.Client|undefined

if (process.argv.includes('-bot') || (!process.argv.includes('-web') && !process.argv.includes('-bot'))) {
  bot = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
  })

  // Init Discord bot
  bot.login(process.env.DISCORD_TOKEN)
  bot.on('ready', () => {
    console.log(`Discord bot ${bot?.user?.tag} logged in`)
    if (bot?.user) {
      bot.user.setActivity('vrc.help', { type: 'LISTENING' })
    }
  })

  // On Discord bot receive message
  bot.on('message', (message: Discord.Message) => {
    if (!message.content || message.author.bot) return
    if (!ready) {
      message.reply('Bot is not ready')
      return
    }

    if (message.content.startsWith('vrc.uid ')) {
      // Search user id
      searchUserID(message, 'search')
    } else if (message.content.startsWith('vrc.user ')) {
      // Search user name
      searchUser(message)
    } else if (message.content.startsWith('vrc.wid ')) {
      // Search world id
      searchWorldID(message)
    } else if (message.content.startsWith('vrc.world ')) {
      // Search world name
      searchWorld(message)
    } else if (message.content.startsWith('vrc.link')) {
      // Link account page
      message.reply(loginUrlShort)
    } else if (message.content.startsWith('vrc.me')) {
      // My ID
      searchUserID(message, 'me')
    } else if (message.content.startsWith('vrc.profile ')) {
      // My ID
      searchUserID(message, 'profile')
    } else if (message.content.startsWith('vrc.help')) {
      // Help
      help(message)
    }
  })
}
