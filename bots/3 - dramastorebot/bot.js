const { Bot, webhookCallback, InlineKeyboard, InlineQueryResultBuilder } = require('grammy')
const { autoRetry } = require("@grammyjs/auto-retry");
require('dotenv').config()
const usersModel = require('./models/botusers')
const inviteModel = require('./models/invitelink')
const dramasModel = require('./models/vue-new-drama')
const homeModel = require('./models/vue-home-db')
const { nanoid } = require('nanoid')
let axios = require('axios').default
let cheerio = require('cheerio')
const telegraph = require('telegraph-node')

// important field
const dt = {
    ds: -1001245181784,
    databaseChannel: -1001239425048,
    subsDb: '-1001570087172',
    whats: process.env.WHATS,
    dstore_domain: 'https://dramastore.net',
    main_channel: `https://t.me/+mTx_t-6TBx9hNTc8`,
    shd: 741815228,
    htlt: 1473393723,
    naomy: 1006615854,
    jacky: 1937862156,
    loading: 1076477335,
    airt: 1426255234,
    hotel_king: -1001425392198,
    hotel_del_luna: -1001457093470,
    dr_stranger: -1001199318533,
    romance_book: -1001175513824,
    my_love_from_star: -1001220805172,
    tale: -1001167737100,
    fiery: -1001315216267,
    hwarang: -1001182807060,
    revenge: -1001863956613,
    link: process.env.BOT_LINK,
    aliProducts: -1002494520726
}


const DramaStoreBot = async (app) => {
    try {
        const bot = new Bot(process.env.DS_TOKEN)

        //set webhook
        let hookPath = `/telebot/${process.env.USER}/dramastore`
        await bot.api.setWebhook(`https://${process.env.DOMAIN}${hookPath}`, {
            drop_pending_updates: true
        })
            .then(() => {
                console.log(`webhook for dramastore is set`)
                bot.api.sendMessage(dt.shd, `${hookPath} set as webhook`)
                    .catch(e => console.log(e.message))
            })
            .catch(e => console.log(e.message))
        app.use(`${hookPath}`, webhookCallback(bot, 'express', { timeoutMilliseconds: 30000 }))

        //important middlewares
        const nkiriFetch = require('./functions/nkiri')
        const ph = new telegraph()
        const if_function_for_buttons = require('./functions/buttons')
        const postEpisodesInChannel = require('./functions/postEpisodeInChannel')
        const sendToDramastore = require('./functions/sendToDramastore')
        const naomymatusi = require('./functions/naomymatusi')
        const trendingFunctions = require('./functions/schedulers')
        const { sendTome, sendToMe } = require('./functions/partials/sendtome')
        const { createChatInviteLink } = require('./functions/partials/createLink')
        const { moveNewChannel, ApproveReqs } = require('./functions/smallfns')
        const StartCommand = require('./functions/start')


        // function to send any err in catch block
        function anyErr(err) {
            bot.api.sendMessage(741815228, err.message)
        }

        //use auto-retry
        bot.api.config.use(autoRetry());
        bot.catch((err) => {
            const ctx = err.ctx;
            console.error(`(Dstore): ${err.message}`, err);
        });

        var trendingRateLimit = []
        setInterval(() => { trendingRateLimit.length = 0 }, 10000) //clear every 10 secs

        setInterval(() => {
            let d = new Date()
            let date = d.getUTCDate()
            let day = d.getUTCDay()  // 0 to 6 where sunday = 0
            let hours = d.getUTCHours()
            let minutes = d.getUTCMinutes()
            let time = `${hours}:${minutes}`

            if (time == '0:0') {
                trendingFunctions.daily(bot, dt)

                if (day == 1) { trendingFunctions.weekly(bot, dt) } //every monday
                if (date == 1) { trendingFunctions.monthly(bot, dt) } //every trh 1
            }
        }, 1000 * 59)

        //delaying
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

        const other_channels = [dt.hotel_del_luna, dt.hotel_king, dt.dr_stranger, dt.romance_book, dt.my_love_from_star, dt.tale, dt.fiery, dt.hwarang, dt.revenge]


        bot.command('start', async ctx => {
            StartCommand(bot, ctx, dt, anyErr, trendingRateLimit)
        })

        bot.command(['fff'], async ctx => {
            try {
                if (ctx.match && !trendingRateLimit.includes(ctx.chat.id) && ctx.chat.type == 'private') {
                    let searching = await ctx.reply('Searching... ⏳')
                    await delay(1500)
                    trendingRateLimit.push(ctx.chat.id)
                    //send her command to me
                    await sendToMe(ctx, dt)
                    let domain = `http://www.dramastore.net`
                    let match = ctx.match
                    //replace all special characters except ' with '' and all +white spaces with ' '
                    let query = match.replace(/[^a-zA-Z0-9\s']/g, '').replace(/\s+/g, ' ').trim()
                    let queryArray = query.split(' ')

                    //case-insensitive regular expression from the query
                    // Create a regex that matches all keywords in any order
                    const regex = new RegExp(queryArray.map(kw => `(?=.*${kw})`).join(''), 'i');

                    let dramas = await dramasModel.find({ newDramaName: regex }).sort('-timesLoaded').limit(15)
                    let txt = `The following drama were found from your search command "<code>${match}</code>"\n\n`
                    let nodrama = `Oops! No drama found from your search command "<code>${match}</code>"`
                    if (dramas.length > 0) {
                        for (let [index, d] of dramas.entries()) {
                            txt = txt + `<b>${index + 1}. ${d.newDramaName} \n> ${d.tgChannel}</b>\n\n`
                        }
                        await ctx.api.deleteMessage(ctx.chat.id, searching.message_id)
                            .catch(e => console.log(e.message))
                    } else {
                        await ctx.api.deleteMessage(ctx.chat.id, searching.message_id)
                            .catch(e => console.log(e.message))
                        await ctx.reply(nodrama, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })
                        console.log(query)
                    }
                } else if (!ctx.match && !trendingRateLimit.includes(ctx.chat.id) && ctx.chat.type == 'private') {
                    await ctx.replyWithChatAction('typing')
                    await delay(1500)
                    await ctx.api.copyMessage(ctx.chat.id, dt.databaseChannel, 10669)
                }
            } catch (error) {
                await ctx.reply(`Oops! An error occurred while processing your searching request. Please forward this message to @shemdoe`)
            }
        })

        bot.command('block', async ctx => {
            if (ctx.chat.id == dt.shd || ctx.chat.id == dt.htlt) {
                let txt = ctx.message.text
                let id = Number(txt.split('/block ')[1])

                await usersModel.updateOne({ userId: id }, { blocked: true })
                ctx.reply(`The user with id ${id} is blocked successfully`)
            }

        })

        bot.command('unblock', async ctx => {
            let txt = ctx.message.text
            let id = Number(txt.split('/unblock ')[1].trim())

            await usersModel.updateOne({ userId: id }, { blocked: false })
            ctx.reply(`The user with id ${id} is unblocked successfully`)
            if (id == dt.naomy || id == dt.airt) {
                bot.api.sendMessage(id, "Unabahati @shemdoe kakuombea msamaha 😏... Unaweza kunitumia sasa.")
            }
            else {
                bot.api.sendMessage(id, `Good news! You're unblocked from using me, you can now request episodes`)
            }
        })

        bot.command('adult', async ctx => {
            try {
                if (ctx.chat.id == dt.shd) {
                    let txt = ctx.message.text
                    if (txt.includes('adult=')) {
                        let userId = Number(txt.split('adult=')[1])
                        let u = await usersModel.findOneAndUpdate({ userId }, { $set: { adult: false } }, { new: true })
                        await ctx.reply(`${u.fname} updated to ${u.adult}`)
                    } else {
                        let all = await usersModel.find({ adult: false })
                        let majina = 'Hawa hapa ambao tunaheshimiana\n\n'
                        for (let u of all) {
                            majina = majina + `${u.fname} - ${u.adult}\n\n`
                        }
                        await ctx.reply(majina)
                    }
                }
            } catch (error) {
                await ctx.reply(error.message)
            }
        })

        bot.command('trending_today', async ctx => {
            try {
                let id = ctx.chat.id

                if (!trendingRateLimit.includes(id)) {
                    trendingRateLimit.push(id)
                    let d = new Date().toUTCString()

                    let todays = await dramasModel.find().limit(20).select('newDramaName tgChannel today id').sort('-today')
                    let txt = `🔥 <u><b>Trending Today (UTC)</b></u>\n<code>${d}</code>\n\n\n`

                    todays.forEach((d, i) => {
                        let link = `<b><a href="http://dramastore.net/open/${d.id}">${i + 1}). ${d.newDramaName}</a></b>`
                        txt = txt + `${link}\n🔥 ${d.today.toLocaleString('en-US')}\n\n`
                    })
                    let exp = `\n<blockquote>To download: Click the name of the drama\n\n🔥 XXX - means how many times the drama was downloaded</blockquote>`
                    await ctx.reply(txt + exp, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })
                }
            } catch (err) {
                await ctx.reply(err.message)
            }
        })

        bot.command('trending_this_week', async ctx => {
            try {
                let id = ctx.chat.id

                if (!trendingRateLimit.includes(id)) {
                    trendingRateLimit.push(id)

                    let todays = await dramasModel.find().limit(30).select('newDramaName tgChannel thisWeek id').sort('-thisWeek')
                    let d = new Date().getDay()
                    if (d == 0) { d = 7 }
                    let txt = `🔥 <u><b>On Trending This Week (Day ${d})</b></u>\n\n\n`

                    todays.forEach((d, i) => {
                        let link = `<b><a href="http://dramastore.net/open/${d.id}">${i + 1}). ${d.newDramaName}</a></b>`
                        txt = txt + `${link}\n🔥 ${d.thisWeek.toLocaleString('en-US')}\n\n`
                    })
                    let exp = `\n<blockquote>To download: Click the name of the drama\n\n🔥 XXX - means how many times the drama was downloaded</blockquote>`
                    await ctx.reply(txt + exp, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })
                }
            } catch (err) {
                await ctx.reply(err.message)
            }
        })

        bot.command('trending_this_month', async ctx => {
            try {
                let id = ctx.chat.id

                if (!trendingRateLimit.includes(id)) {
                    trendingRateLimit.push(id)

                    let todays = await dramasModel.find().limit(35).select('newDramaName tgChannel thisMonth id').sort('-thisMonth')
                    let txt = `🔥 <u><b>On Trending This Month (UTC)</b></u>\n\n\n`

                    todays.forEach((d, i) => {
                        let link = `<b><a href="http://dramastore.net/open/${d.id}">${i + 1}). ${d.newDramaName}</a></b>`
                        txt = txt + `${link}\n🔥 ${d.thisMonth.toLocaleString('en-US')}\n\n`
                    })
                    let exp = `\n<blockquote>To download: Click the name of the drama\n\n🔥 XXX - means how many times the drama was downloaded</blockquote>`
                    await ctx.reply(txt + exp, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })
                }
            } catch (err) {
                await ctx.reply(err.message)
            }
        })

        bot.command('all_time', async ctx => {
            try {
                let id = ctx.chat.id

                if (!trendingRateLimit.includes(id)) {
                    trendingRateLimit.push(id)

                    let todays = await dramasModel.find().limit(45).select('newDramaName tgChannel timesLoaded id').sort('-timesLoaded')
                    let txt = `🔥 <u><b>Most Popular Dramas (of All Time)</b></u>\n\n\n`

                    todays.forEach((d, i) => {
                        let link = `<b><a href="http://dramastore.net/open/${d.id}">${i + 1}). ${d.newDramaName}</a></b>`
                        txt = txt + `${link}\n🔥 ${d.timesLoaded.toLocaleString('en-US')}\n\n`
                    })
                    let exp = `\n<blockquote>To download: Click the name of the drama\n\n🔥 XXX - means how many times the drama was downloaded</blockquote>`
                    await ctx.reply(txt + exp, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })
                }
            } catch (err) {
                await ctx.reply(err.message)
            }
        })

        bot.command('stats', async ctx => {
            let anas = await usersModel.countDocuments()
            ctx.reply(`Total bot's users are ${anas.toLocaleString('en-us')}`)

            let pps = await usersModel.aggregate([
                { $group: { _id: '$country.name', total: { $sum: 1 } } },
                { $sort: { "total": -1 } }
            ]).limit(20)

            let ttx = `Top 20 countries with most users\n\n`
            for (let u of pps) {
                ttx = ttx + `<b>• ${u._id}:</b> ${u.total.toLocaleString('en-us')} users\n`
            }
            await ctx.reply(ttx, { parse_mode: 'HTML' })
        })

        bot.command('add', async ctx => {
            let txt = ctx.message.text

            if (ctx.chat.id == dt.shd || ctx.chat.id == dt.htlt) {
                try {
                    let arr = txt.split('-')
                    let id = Number(arr[1])
                    let pts = Number(arr[2])
                    let param = arr[3]

                    let updt = await usersModel.findOneAndUpdate({ userId: id }, { $inc: { points: pts } }, { new: true })

                    if (param == 'e') {
                        let t1 = `Shemdoe just added ${pts} points to you. Your new points balance is ${updt.points} points.`
                        await bot.api.sendMessage(id, t1)
                    }

                    else if (param == 's') {
                        let t2 = `Shemdoe amekuongezea points ${pts}. Sasa umekuwa na jumla ya points ${updt.points}... Karibu sana! 😉.`
                        await bot.api.sendMessage(id, t2)
                    }

                    await ctx.reply(`Added, she has now ${updt.points}`)
                } catch (err) {
                    console.log(err.message)
                    ctx.reply(err.message)
                }
            }
        })

        bot.command('update_episodes', async ctx => {
            try {
                let id = ctx.chat.id
                if (id == dt.shd) {
                    let txt = ctx.message.text
                    let dname = txt.split('/update_episodes ')
                    let d_data = dname[1].split(' | ')
                    let dramaName = d_data[0]
                    let new_eps = d_data[1]

                    let dd = await dramasModel.findOneAndUpdate({ newDramaName: dramaName }, { noOfEpisodes: new_eps }, { new: true })
                    await ctx.reply(`${dd.newDramaName} episodes updated to ${dd.noOfEpisodes}`)
                }
            } catch (err) {
                await ctx.reply(err.message)
            }
        })

        bot.command('admin', async ctx => {
            try {
                if (ctx.chat.id == dt.shd) {
                    await bot.api.copyMessage(dt.shd, dt.databaseChannel, 5444)
                }
            } catch (err) {
                console.log(err.message)
                await ctx.reply(err.message)
            }
        })

        bot.command('migrate', async (ctx) => {
            moveNewChannel(bot, ctx, dt, InlineKeyboard)
        })

        bot.on('chat_join_request', async ctx => {
            ApproveReqs(bot, ctx, dt, delay)
        })

        //help command
        bot.command('help', ctx => {
            let ptsUrl = `http://dramastore.net/user/${ctx.chat.id}/boost/`
            let ptsKeybd = [
                { text: '🥇 My Points', callback_data: 'mypoints' },
                { text: '➕ Add points', url: ptsUrl }
            ]

            ctx.reply(`If you have issues regarding using me please contact my developer @shemdoe`, {
                reply_markup: {
                    inline_keyboard: [ptsKeybd]
                }
            })
        })

        bot.on('callback_query', async ctx => {
            sendToDramastore(bot, ctx, dt, anyErr, other_channels)
        })

        bot.use(async (ctx, next) => {
            postEpisodesInChannel(bot, ctx, next, dt, anyErr, axios, cheerio, ph, dramasModel, homeModel, other_channels, nanoid, delay)
        })

        bot.on(':text', async ctx => {
            naomymatusi(bot, ctx, dt, anyErr)
        })

        //scrap nkiri every five minutes
        setInterval(() => {
            //new links on dt.ali every even hours (12 links a day)
            let d = new Date()
            let mins = d.getMinutes()
            let hrs = d.getHours()
            let secs = d.getSeconds()
            let stampSeconds = Date.now() / 1000

            if (mins == 27 && hrs % 2 == 0) {
                let name = `${d.getDate()}/${d.getMonth() + 1} - ${hrs}:${mins}`
                let expire = stampSeconds + (60 * 60 * 4) //4 hours
                createChatInviteLink(bot, dt, name, expire).catch(e => console.log(e.message))
                    .then(() => {
                        bot.api.sendMessage(dt.shd, 'New link created')
                            .catch(e => console.log(e.message))
                    })
            }

            //run nkiri
            if (mins % 5 == 0) {
                nkiriFetch.nkiriFetch(dt, bot)
                    .catch(err => {
                        bot.api.sendMessage(-1002079073174, err.message)
                            .catch(e => console.log(e.message))
                    })
            }
        }, 1000 * 60)
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    DramaStoreBot
}
