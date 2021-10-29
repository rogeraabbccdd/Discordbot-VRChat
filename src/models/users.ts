import { Schema, model } from 'mongoose'

export interface User {
  discord: string
  vrc: string
}

const schema = new Schema<User>({
  discord: {
    type: String,
    unique: true
  },
  vrc: {
    type: String,
    unique: true
  }
})

const users = model<User>('users', schema)

export default users
