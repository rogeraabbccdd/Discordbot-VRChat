export const loginUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT}&redirect_uri=${encodeURI(process.env.HOST_URL || '')}&response_type=code&scope=identify`

export const loginUrlShort = new URL('/link', process.env.HOST_URL).toString()

export const inviteUrl = 'https://discord.com/oauth2/authorize?client_id=902091687663378433&permissions=274877958208&scope=bot%20applications.commands'

export const splitToBulks = <T>(arr: T[], bulkSize: number = 20): T[][] => {
  const bulks: T[][] = []
  for (let i = 0; i < Math.ceil(arr.length / bulkSize); i++) {
    bulks.push(arr.slice(i * bulkSize, (i + 1) * bulkSize))
  }
  return bulks
}
