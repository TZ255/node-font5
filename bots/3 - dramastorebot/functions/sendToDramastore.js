const dramaModel = require('../models/botdramas')
const episodesModel = require('../models/botepisodes')
const nextEpModel = require('../models/botnextEp')
const usersModel = require('../models/botusers')
const newDramas = require('../models/vue-new-drama')
const if_function_for_buttons = require('./buttons')

module.exports = async (bot, ctx, dt, anyErr, other_channels) => {
    try {
        // check if is callbackquery for updating drama
        if (ctx.callbackQuery.data.includes('push')) {
            let callbackMsgId = ctx.callbackQuery.message.message_id
            let shemdoeReplyMarkup = ctx.callbackQuery.message.reply_markup

            let tgLink = shemdoeReplyMarkup.inline_keyboard[0][0].url

            shemdoeReplyMarkup.inline_keyboard.pop()

            let sending = await ctx.reply('sending drama to channels....')

            await bot.api.copyMessage(dt.ds, ctx.chat.id, callbackMsgId, {
                reply_markup: shemdoeReplyMarkup
            })

            other_channels.forEach(ch => {
                bot.api.copyMessage(ch, ctx.chat.id, callbackMsgId, {
                    reply_markup: shemdoeReplyMarkup
                })
            })

            setTimeout(() => {
                bot.api.deleteMessage(ctx.chat.id, callbackMsgId)
                    .then(() => { bot.api.deleteMessage(ctx.chat.id, sending.message_id) })
                    .catch((err) => {
                        if (err.message.includes(`delete`)) {
                            ctx.answerCallbackQuery({
                                text: `Can't close this message.... Too old, delete it instead.`,
                                show_alert: true
                            })
                        }
                    })
            }, 5000)



        }

        else if (ctx.callbackQuery.data.includes('getEp')) {
            let epnoMsgId = ctx.callbackQuery.data.split('getEp')[1].trim()

            let dParam = 'shemdoe'

            if (ctx.callbackQuery.data.includes('2getEp')) {
                dParam = '2shemdoe'
            }

            let cname = ctx.callbackQuery.message.sender_chat.title
            if (cname.includes('Official -')) {
                let dname = cname.split('Official - ')[1].trim()
                await newDramas.findOneAndUpdate({ newDramaName: dname }, { $inc: { timesLoaded: 30 } })
                console.log('30 times loaded added to - ' + dname)
            }

            ctx.answerCallbackQuery({
                text: 'dramastore',
                url: `${dt.link}${dParam}${epnoMsgId}`,
                cache_time: 14400 //4 hours
            })
        }
        else if (ctx.callbackQuery.data.includes('mypoints')) {
            let chatId = ctx.chat.id

            let txt = ''
            let user = await usersModel.findOne({ userId: chatId })

            // for spellings, if remain one remove s
            if (user.points == 1) {
                txt = `${user.fname}\n\nTotal downloaded episodes: ${user.downloaded}\n\nYou have ${user.points} point.\n\nClick "➕ Add points button" to increase your points.`
            } else {
                txt = `${user.fname}\n\nTotal downloaded episodes: ${user.downloaded}\n\nYou have ${user.points} points.\n\nClick "➕ Add points button" to increase your points.`
            }


            ctx.answerCallbackQuery({
                text: txt,
                show_alert: true,
                cache_time: 2
            })
        }
        else if (ctx.callbackQuery.data.includes('closePtsMsg')) {
            bot.api.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id).catch((err) => {
                if (err.message.includes('delete')) {
                    ctx.answerCallbackQuery({
                        text: `Can't close this message.... Too old, delete it instead.`,
                        show_alert: true
                    })
                }
            })

        }

        else if (ctx.callbackQuery.data.includes('help')) {
            let msg = `Steps to download this episode. Click:\n➜ Download Now\n➜ Go to Download Page\n➜ Get Your Episode\n\n🎉 Voila! You are done.`

            ctx.answerCallbackQuery({
                text: msg,
                show_alert: true,
                cache_time: 14400 //4 hours
            })
        }

        else if (ctx.callbackQuery.data.includes('newHbtn')) {
            let msg = `To download this episode click the "⬇ DOWNLOAD NOW" button and Tap "START" at bottom of the bot to get the file.  \n\n📞 Any problem contact @shemdoe`

            ctx.answerCallbackQuery({
                text: msg,
                show_alert: true,
                cache_time: 14400 //4 hours
            })
        }

        else if (ctx.callbackQuery.data.includes('newHbtn2')) {
            let msg = `- To download this episode click the "⬇ DOWNLOAD NOW" button. \n- Confirm your download in Bot by opening our offer page for 10 seconds  \n\n📞 Any problem contact @shemdoe`

            ctx.answerCallbackQuery({
                text: msg,
                show_alert: true,
                cache_time: 14400 //4 hours
            })
        }

        else if (ctx.callbackQuery.data.includes('epinfo')) {
            let data = ctx.callbackQuery.data.split('_')
            let epno = data[0].split('epinfo')[1]
            let msg = `Info About This Episode\n\n▶ Ep. No: ${epno}\n\n💾 Size: ${data[1]}\n\n📸 Quality: ${data[2]}`

            ctx.answerCallbackQuery({
                text: msg,
                show_alert: true,
                cache_time: 14400 //4 hours
            })
        }

        else if (ctx.callbackQuery.data.includes('niupendo')) {
            let callbackMsgId = ctx.callbackQuery.message.message_id
            bot.api.deleteMessage(ctx.chat.id, callbackMsgId)
            ctx.reply('Nakupenda pia Zumaridi 😍 zaidi ata ya shemdoe')
        }

        else if (ctx.callbackQuery.data.includes('nimekutukana')) {
            let callbackMsgId = ctx.callbackQuery.message.message_id
            bot.api.deleteMessage(ctx.chat.id, callbackMsgId)
            ctx.reply('😏 Mxeeew! Lione na domo lako kama la Mr. Paul 😭😂😂')
        }

        else {
            let id = ctx.callbackQuery.id
            let chatId = ctx.callbackQuery.from.id
            let fname = ctx.callbackQuery.from.first_name
            let txt = ''

            if (chatId == dt.naomy) {
                txt = 'Hii ni dramastore\nKaribu Zumaridi 😂, @shemdoe anakupenda sana'
            }
            else if (chatId == dt.jacky) {
                txt = 'Hii ni dramastore\nKaribu Jacky, @shemdoe anakupenda sana'
            } else {
                txt = "Korean Drama Store (@dramastore1)"
            }
            ctx.answerCallbackQuery({ text: txt, show_alert: false })
        }
    } catch (err) {
        anyErr(err)
    }
}