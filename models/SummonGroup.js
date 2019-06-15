import mongoose from 'mongoose'

import { userDataSchema } from './User'

const Schema = mongoose.Schema

export const summonGroupDataSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      default: 'default',
      required: true,
    },
    group_id: {
      type: Number,
      required: true,
    },
    users: [userDataSchema],
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
  { collection: 'summonGroups' }
)

export default mongoose.model('SummonGroup', summonGroupDataSchema)
