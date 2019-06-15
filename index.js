import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import _ from 'lodash'
// import moment from 'moment'

import User from './models/User'
import GroupChat from './models/GroupChat'
import SummonGroup from './models/SummonGroup'

const dotenvError = dotenv.config()

if (dotenvError.error) {
  throw dotenvError.error
}

let mongoUrl = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

const mongo = mongoose.connect(mongoUrl, {
  useCreateIndex: true,
  useNewUrlParser: true,
})

const TOKEN = process.env.BOT_TOKEN

const bot = new TelegramBot(TOKEN, { polling: true })

bot.onText(/^\/ping$/, async msg => {
  console.log(msg)
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'pong')
})

bot.onText(/^\/summon$/, async (msg, match) => {
  console.log(msg)
  const chatId = msg.chat.id

  try {
    if (msg.from.is_bot) return false
    if (msg.chat.type === 'private') return false

    let groupChat = await GroupChat.findOne({ telegram_id: msg.chat.id }).exec()

    if (groupChat === null) {
      let summonGroup = new SummonGroup({
        group_id: chatId,
      })

      await summonGroup.save()

      groupChat = new GroupChat({
        telegram_id: msg.chat.id,
        title: msg.chat.title,
        summon_groups: [summonGroup],
      })

      await groupChat.save()

      bot.sendMessage(chatId, 'Group Created Successfully')
      return false
    }

    let summonGroup = await SummonGroup.findOne({
      group_id: chatId,
      title: 'default',
    }).exec()

    if (summonGroup === null) {
      summonGroup = new SummonGroup({
        title: 'default',
        group_id: chatId,
      })

      await summonGroup.save()

      groupChat.summon_groups.push(summonGroup)

      await groupChat.save()

      bot.sendMessage(chatId, 'Group Created Successfully')

      return false
    }

    if (summonGroup.users.length === 0) {
      bot.sendMessage(chatId, 'This group is empty :(')
      return false
    }

    let users = summonGroup.users

    users = _.chunk(users, 5)

    users.forEach(item => {
      let message = ``
      item.forEach(user => {
        message += ` @${user.username}`
      })
      bot.sendMessage(chatId, message.trim())
    })
  } catch (err) {
    console.log(err)
    bot.sendMessage(chatId, 'Failed to test')
  }
})

bot.onText(/^\/summon\s(\S+)$/, async (msg, match) => {
  console.log(msg, match)

  const chatId = msg.chat.id

  const commandTitle = match[1]

  try {
    if (msg.from.is_bot) return false
    if (msg.chat.type === 'private') return false

    let groupChat = await GroupChat.findOne({ telegram_id: msg.chat.id }).exec()

    if (groupChat === null) {
      let summonGroup = new SummonGroup({
        title: commandTitle,
        group_id: chatId,
      })
      await summonGroup.save()

      groupChat = new GroupChat({
        telegram_id: msg.chat.id,
        title: msg.chat.title,
        summon_groups: [summonGroup],
      })

      await groupChat.save()
      bot.sendMessage(chatId, 'Group Created Successfully')
      return false
    }

    let summonGroup = await SummonGroup.findOne({
      group_id: chatId,
      title: commandTitle,
    }).exec()

    console.log(summonGroup)

    if (summonGroup === null) {
      summonGroup = new SummonGroup({
        title: commandTitle,
        group_id: chatId,
      })

      console.log(summonGroup)

      await summonGroup.save()

      groupChat.summon_groups.push(summonGroup)

      await groupChat.save()

      bot.sendMessage(chatId, 'Group Created Successfully')

      return false
    }

    if (summonGroup.users.length === 0) {
      bot.sendMessage(chatId, 'This group is empty :(')
      return false
    }

    let users = summonGroup.users
    console.log(users)
    users = _.chunk(users, 5)
    console.log(users)
    users.forEach(item => {
      let message = ``
      item.forEach(user => {
        message += ` @${user.username}`
      })
      console.log(message)
      bot.sendMessage(chatId, message.trim())
    })
  } catch (err) {
    console.log(err)
    bot.sendMessage(chatId, 'Failed to test')
  }
})

bot.onText(/^\/summon_add$/, async (msg, match) => {
  console.log(msg)
  const chatId = msg.chat.id

  try {
    if (msg.from.is_bot) return false
    if (msg.chat.type === 'private') return false

    let groupChat = await GroupChat.findOne({ telegram_id: msg.chat.id }).exec()

    if (groupChat === null) {
      bot.sendMessage(chatId, 'This group is not created yet :(')
      return false
    }

    let summonGroup = await SummonGroup.findOne({
      group_id: chatId,
      title: 'default',
    }).exec()

    if (summonGroup === null) {
      bot.sendMessage(chatId, 'This summon group is not created yet :(')
      return false
    }

    let user = await User.findOne({ telegram_id: msg.from.id }).exec()

    if (user === null) {
      user = new User({
        telegram_id: msg.from.id,
        username: msg.from.username,
        first_name: msg.from.first_name,
        last_name: msg.from.last_name,
      })

      await user.save()
    }

    let findUser = summonGroup.users.filter(item => {
      return item.telegram_id === user.telegram_id
    })

    if (findUser.length > 0) {
      bot.sendMessage(chatId, 'You were already in this group')
      return false
    }

    summonGroup.users.push(user)

    await summonGroup.save()

    bot.sendMessage(chatId, 'You are added to the group')
  } catch (err) {
    console.log(err)
    bot.sendMessage(chatId, 'Failed to test')
  }
})

bot.onText(/^\/summon_add\s(\S+)$/, async (msg, match) => {
  console.log(msg, match)
  const chatId = msg.chat.id

  const commandTitle = match[1]

  try {
    if (msg.from.is_bot) return false
    if (msg.chat.type === 'private') return false

    let groupChat = await GroupChat.findOne({ telegram_id: msg.chat.id }).exec()

    if (groupChat === null) {
      bot.sendMessage(chatId, 'This group is not created yet :(')
      return false
    }

    let summonGroup = await SummonGroup.findOne({
      group_id: chatId,
      title: commandTitle,
    }).exec()

    if (summonGroup === null) {
      bot.sendMessage(chatId, 'This summon group is not created yet :(')
      return false
    }

    let user = await User.findOne({ telegram_id: msg.from.id }).exec()

    if (!user) {
      user = new User({
        telegram_id: msg.from.id,
        username: msg.from.username,
        first_name: msg.from.first_name,
        last_name: msg.from.last_name,
      })

      await user.save()
    }

    let findUser = summonGroup.users.filter(item => {
      return item.telegram_id === user.telegram_id
    })

    if (findUser.length > 0) {
      bot.sendMessage(chatId, 'You were already in this group')
      return false
    }

    summonGroup.users.push(user)

    await summonGroup.save()

    bot.sendMessage(chatId, 'You are added to the group')
  } catch (err) {
    console.log(err)
    bot.sendMessage(chatId, 'Failed to test')
  }
})

bot.onText(/^\/summon_rem$/, async (msg, match) => {
  console.log(msg)
  const chatId = msg.chat.id

  try {
    if (msg.from.is_bot) return false
    if (msg.chat.type === 'private') return false

    let groupChat = await GroupChat.findOne({ telegram_id: msg.chat.id }).exec()

    if (groupChat === null) {
      bot.sendMessage(chatId, 'This group is not created yet :(')
      return false
    }

    let summonGroup = await SummonGroup.findOne({
      group_id: chatId,
      title: 'default',
    }).exec()

    if (summonGroup === null) {
      bot.sendMessage(chatId, 'This summon group is not created yet :(')
      return false
    }

    let user = await User.findOne({ telegram_id: msg.from.id }).exec()

    if (!user) {
      user = new User({
        telegram_id: msg.from.id,
        username: msg.from.username,
        first_name: msg.from.first_name,
        last_name: msg.from.last_name,
      })

      await user.save()
    }

    let findUser = summonGroup.users.filter(item => {
      return item.telegram_id === user.telegram_id
    })

    if (findUser.length === 0) {
      bot.sendMessage(chatId, 'You are not in this group')
      return false
    }

    let removeUser = summonGroup.users.filter(item => {
      return item.telegram_id !== user.telegram_id
    })

    summonGroup.users = removeUser

    await summonGroup.save()

    bot.sendMessage(chatId, 'You are removed from this group')
  } catch (err) {
    console.log(err)
    bot.sendMessage(chatId, 'Failed to test')
  }
})

bot.onText(/^\/summon_rem\s(\S+)$/, async (msg, match) => {
  console.log(msg, match)
  const chatId = msg.chat.id

  const commandTitle = match[1]

  try {
    if (msg.from.is_bot) return false
    if (msg.chat.type === 'private') return false

    let groupChat = await GroupChat.findOne({ telegram_id: msg.chat.id }).exec()

    if (groupChat === null) {
      bot.sendMessage(chatId, 'This group is not created yet :(')
      return false
    }

    let summonGroup = await SummonGroup.findOne({
      group_id: chatId,
      title: commandTitle,
    }).exec()

    if (summonGroup === null) {
      bot.sendMessage(chatId, 'This summon group is not created yet :(')
      return false
    }

    let user = await User.findOne({ telegram_id: msg.from.id }).exec()

    if (user === null) {
      user = new User({
        telegram_id: msg.from.id,
        username: msg.from.username,
        first_name: msg.from.first_name,
        last_name: msg.from.last_name,
      })

      await user.save()
    }

    let findUser = summonGroup.users.filter(item => {
      return item.telegram_id === user.telegram_id
    })

    if (findUser.length === 0) {
      bot.sendMessage(chatId, 'You are not in this group')
      return false
    }

    let removeUser = summonGroup.users.filter(item => {
      return item.telegram_id !== user.telegram_id
    })

    summonGroup.users = removeUser

    await summonGroup.save()

    bot.sendMessage(chatId, 'You are removed from this group')
  } catch (err) {
    console.log(err)
    bot.sendMessage(chatId, 'Failed to test')
  }
})
