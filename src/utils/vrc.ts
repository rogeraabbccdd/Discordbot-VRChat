export interface Level {
  level: number,
  name: string,
  tag: string,
  color: string
}

export interface VRCErrorResponse {
  message: string,
  // eslint-disable-next-line camelcase
  status_code: number
}

// https://vrchatapi.github.io/tutorials/tags/
export const levels: Level[] = [
  { level: 0, name: 'Visitor', tag: '', color: '#CCCCCC' },
  { level: 1, name: 'New User', tag: 'system_trust_basic', color: '#1778FF' },
  { level: 2, name: 'User', tag: 'system_trust_known', color: '#2BCF5C' },
  { level: 3, name: 'Known', tag: 'system_trust_trusted', color: '#FF7B42' },
  { level: 4, name: 'Trusted', tag: 'system_trust_veteran', color: '#8143E6' }
]

export const getLanguageFromTags = (tags: string[]): string => {
  return tags
    .filter((tag:string) => {
      return tag.startsWith('language_')
    })
    .map((language: string) => {
      return language.replace('language_', '').toUpperCase()
    })
    .join(', ')
}

export const getLevelFromTags = (tags: string[]): Level => {
  const userlevels: number[] = levels.filter((userlevel: Level) => {
    return tags.includes(userlevel.tag)
  }).map((userlevel: Level) => {
    return userlevel.level
  })
  return levels[Math.max(...userlevels)]
}

export const getUserPageFromID = (id: string): string => {
  return 'https://vrchat.com/home/user/' + id
}

export const getWorldPageFromID = (worldId: string, instanceId: string = ''): string => {
  if (instanceId.length > 0) {
    return `https://vrchat.com/home/launch?worldId=${worldId}&${instanceId}`
  } else {
    return `https://vrchat.com/home/world/${worldId}`
  }
}
