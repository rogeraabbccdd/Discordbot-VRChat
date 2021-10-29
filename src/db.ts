import { connect } from 'mongoose'

const init = async (): Promise<void> => {
  try {
    if (process.env.DBURL) {
      await connect(process.env.DBURL)
      console.log('Connected to database.')
    } else {
      throw new Error('DBURL not defined')
    }
  } catch (error) {
    console.error(error)
    process.exit()
  }
}

init()
