import mongoose from 'mongoose'

const Schema = mongoose.Schema

export const userDataSchema = new Schema(
  {
    telegram_id: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      trim: true,
    },
    first_name: {
      type: String,
      trim: true,
    },
    last_name: {
      type: String,
      trim: true,
    },
    updated_at: {
      type: Date,
      default: Date.now,
      select: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  { collection: 'users' }
)

export default mongoose.model('User', userDataSchema)
