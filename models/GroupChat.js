import mongoose from 'mongoose'

import { summonGroupDataSchema } from './SummonGroup'

const Schema = mongoose.Schema

export const groupChatDataSchema = new Schema(
  {
    telegram_id: {
      type: Number,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    summon_groups: [summonGroupDataSchema],
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
  { collection: 'groupChats' }
)

export default mongoose.model('GroupChat', groupChatDataSchema)
