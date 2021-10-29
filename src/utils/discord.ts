import * as Discord from 'discord.js'

// Rewrite to TypeScript for discord.js v13 from
// https://github.com/saanuregh/discord.js-pagination/blob/master/index.js
export const paginationEmbed = async (title: string, msg: Discord.Message, pages: Discord.MessageEmbed[], emojiList: string[] = ['⏪', '⏩'], timeout: number = 60000): Promise<void> => {
  try {
    if (!msg || !msg.channelId) throw new Error('Channel is inaccessible.')
    if (!pages) throw new Error('Pages are not given.')
    if (emojiList.length !== 2) throw new Error('Need two emojis.')
    let page: number = 0
    const curPage = await msg.reply({ embeds: [pages[page].setTitle(title).setFooter(`Page ${page + 1} / ${pages.length}`)] })
    for (const emoji of emojiList) await curPage.react(emoji)
    const reactionCollector: Discord.ReactionCollector = curPage.createReactionCollector({
      time: timeout,
      filter (reaction: Discord.MessageReaction, user: Discord.User): boolean {
        return emojiList.includes(reaction.emoji.name as string) && !user.bot && user.id === msg.author.id
      }
    })
    reactionCollector.on('collect', (reaction: Discord.MessageReaction, user: Discord.User) => {
      if (!curPage || curPage.deleted) {
        reactionCollector.stop()
        return
      }
      reaction.users.remove(msg.author.id)
      switch (reaction.emoji.name) {
        case emojiList[0]:
          page = page > 0 ? --page : pages.length - 1
          break
        case emojiList[1]:
          page = page + 1 < pages.length ? ++page : 0
          break
        default:
          break
      }
      curPage.edit({ embeds: [pages[page].setTitle(title).setFooter(`Page ${page + 1} / ${pages.length}`)] })
    })
    reactionCollector.on('end', () => {
      if (curPage && !curPage.deleted) curPage.reactions.removeAll()
      else reactionCollector.stop()
    })
  } catch (error: unknown) {
    const err = error as Error
    console.log(err.message)
  }
}
