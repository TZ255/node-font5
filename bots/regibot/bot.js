const { Bot, webhookCallback } = require('grammy')
const { autoRetry } = require("@grammyjs/auto-retry")
const nyumbuModel = require('./database/chats')
const dayoUsers = require('./database/dayo-chats')
const pipyUsers = require('./database/dayo-chats')
const tempChat = require('./database/temp-req')
const my_channels_db = require('./database/my_channels')
const mkekadb = require('./database/mkeka')
const tg_slips = require('./database/tg_slips')
const vidb = require('./database/db')
const mkekaMega = require('./database/mkeka-mega')
const graphDB = require('./database/graph-tips')
const waombajiModel = require('./database/waombaji')
const supatips_Model = require('./database/supatips')

//functions
const call_fametips_function = require('./fns/fametips')
const call_famescheduled_fn = require('./fns/fame-scheduled')
const call_betslip_function = require('./fns/betslip')
const call_oncallbackquery_function = require('./fns/oncallbackquery')
const call_sendMikeka_functions = require('./fns/mkeka-1-2-3')
const call_scheduled_checker_fn = require('./fns/scheduled-odds')
const call_venas15_fn = require('./fns/venas15')
const call_venas25_fn = require('./fns/venas25')
const call_passion35_fn = require('./fns/passionpredict')
const { QualityTipsCheck } = require('./fns/qualitycheck')
const { correctScoreFn } = require('./fns/correct-score')
const makeConvo = require('./fns/convoFn')
const { ExtractTextFromSlip } = require('../../routes/functions/extractSlipText')
const { StructureBetslipCaption } = require('./fns/structureSlipMessage')
const { ShemdoeAssistant } = require('../../routes/functions/kbase')
const { RegiChannelPostHandler, RegiAIGroupHandler } = require('./fns/channelPostHandler')



const reginaBot = async (app) => {
    try {
        const bot = new Bot(process.env.REGI_TOKEN)

        const imp = {
            replyDb: -1001608248942,
            pzone: -1001352114412,
            rpzone: -1001549769969,
            prem_channel: -1001470139866,
            local_domain: 't.me/rss_shemdoe_bot?start=',
            prod_domain: 't.me/ohmychannelV2bot?start=',
            shemdoe: 741815228,
            halot: 1473393723,
            sh1xbet: 5755271222,
            xzone: -1001740624527,
            ohmyDB: -1001586042518,
            xbongo: -1001263624837,
            mikekaDB: -1001696592315,
            logsBin: -1001845473074,
            mylove: -1001748858805,
            mkekaLeo: -1001733907813,
            rtcopyDB: -1002634850653,
            ai_group: -1002828977721
        }

        //use auto-retry
        bot.api.config.use(autoRetry());

        //set webhook
        let hookPath = `/telebot/${process.env.USER}/regina`
        app.use(`${hookPath}`, webhookCallback(bot, 'express', { timeoutMilliseconds: 30000 }))
        await bot.api.setWebhook(`https://${process.env.DOMAIN}${hookPath}`, {
            drop_pending_updates: true
        })
            .then(() => {
                console.log(`webhook for Regi is set`)
                bot.api.sendMessage(imp.shemdoe, `${hookPath} set as webhook`)
                    .catch(e => console.log(e.message))
            })
            .catch(e => console.log(e.message))

        const mkArrs = ['mkeka', 'mkeka1', 'mkeka2', 'mkeka3', 'mikeka', 'mkeka wa leo', 'mikeka ya leo', 'mkeka namba 1', 'mkeka namba 2', 'mkeka namba 3', 'mkeka #1', 'mkeka #2', 'mkeka #3', 'mkeka no #1', 'mkeka no #2', 'mkeka no #3', 'za leo', 'naomba mkeka', 'naomba mikeka', 'naomba mkeka wa leo', 'nitumie mkeka', 'ntumie mkeka', 'nitumie mikeka ya leo', 'odds', 'odds za leo', 'odds ya leo', 'mkeka waleo', 'mkeka namba moja', 'mkeka namba mbili', 'mkeka namba tatu', 'nataka mkeka', 'nataka mikeka', 'mkeka wa uhakika', 'odds za uhakika', 'mkeka?', 'mkeka wa leo?', '/mkeka 1', '/mkeka 2', '/mkeka 3']

        const gsb_ug = `https://track.africabetpartners.com/visit/?bta=35468&nci=5559`

        async function create(bot, ctx) {
            let starter = await nyumbuModel.findOne({ chatid: ctx.chat.id })
            if (!starter) {
                await nyumbuModel.create({
                    chatid: ctx.chat.id,
                    username: ctx.chat.first_name,
                    refferer: "Regina",
                    blocked: false
                })
            }
        }

        //delaying
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

        let defaultReplyMkp = {
            keyboard: [
                [
                    { text: "🔥 MKEKA 1" },
                    { text: "💰 MKEKA 2" },
                    { text: "🤑 MKEKA 3" },
                ]
            ],
            is_persistent: true,
            resize_keyboard: true
        }

        bot.catch((err) => {
            const ctx = err.ctx;
            console.error(`(Regi): ${err.message}`, err);
        });


        bot.command('start', async ctx => {
            try {
                if (ctx.match) {
                    let pload = ctx.match
                    if (pload == 'ngono_bongo') {
                        await bot.api.copyMessage(ctx.chat.id, imp.pzone, 8859, {
                            reply_markup: defaultReplyMkp
                        })
                    }
                    //add to database
                    await create(bot, ctx)

                } else {
                    await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7653, {
                        reply_markup: defaultReplyMkp
                    })

                    let stt = await nyumbuModel.findOne({ chatid: ctx.chat.id })
                    if (!stt) {
                        await nyumbuModel.create({
                            chatid: ctx.chat.id,
                            username: ctx.chat.first_name,
                            refferer: "Regina"
                        })
                        await bot.api.sendMessage(imp.logsBin, '(Regi) New user found me - Added to DB')
                    }
                }

            } catch (err) {
                console.log(err.message, err)
            }
        })

        bot.command('admin', async ctx => {
            try {
                let txt = `<u>Admin Commands</u>\n\n/stats - stats\n/convo-id - copy from mikekaDB\n/supaleo - fetch supatips (today)\n/supajana - fetch supatips (yesterday)\n/supakesho - fetch supatips (tomorrow)\n/graph - graph stats`
                if (ctx.chat.id == imp.shemdoe) { ctx.reply(txt, { parse_mode: 'HTML' }) }
            } catch (err) {
                await ctx.reply(err.message)
            }
        })

        bot.command(['help', 'stop'], async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7653)
                await create(bot, ctx)
            } catch (err) {
                console.log(err.message)
            }

        })

        bot.command('graph', async ctx => {
            try {
                let graphs = await graphDB.find()
                let txt = `https://font5.net/mkekawaleo/tanzania\n\n`

                for (let graph of graphs) {
                    txt = txt + `📅 ${graph.siku}\nStats: ${graph.loaded.toLocaleString("en-US")}\nLink: ${graph.link}\n\n`
                }
                await ctx.reply(txt, { disable_web_page_preview: true })
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('supatips', async ctx => {
            try {
                await call_sendMikeka_functions.supatips(ctx, bot, delay, imp)
            } catch (error) {
                console.log(err.message)
            }
        })


        bot.command('convo', async ctx => {
            makeConvo(bot, ctx, imp, defaultReplyMkp).catch(e => console.log(e?.message))
        })

        bot.command(['mkeka', 'mkeka1'], async ctx => {
            try {
                await call_sendMikeka_functions.sendMkeka1(ctx, delay, bot, imp)
            } catch (err) {
                console.log(err)
                await bot.api.sendMessage(imp.shemdoe, err.message)
                    .catch(e => console.log(e.message))
            }
        })

        bot.command('mkeka2', async ctx => {
            try {
                await call_sendMikeka_functions.sendMkeka2(ctx, delay, bot, imp)
            } catch (err) {
                console.log(err)
                await bot.api.sendMessage(imp.shemdoe, err.message)
                    .catch(e => console.log(e.message))
            }
        })

        bot.command('mkeka3', async ctx => {
            try {
                await call_sendMikeka_functions.sendMkeka3(ctx, delay, bot, imp)
            } catch (err) {
                await bot.api.sendMessage(imp.shemdoe, err.message)
                    .catch((e) => console.log(e.message))
                console.log(err.message)
            }

        })

        bot.command('wakesho', async ctx => {
            try {
                let d = new Date()
                d.setDate(d.getDate() + 1)
                let nairobi = d.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })
                let keka = await mkekaMega.find({ date: nairobi })
                let txt = `<b><u>🔥 Mkeka wa Kesho [ ${nairobi} ]</u></b>\n\n\n`
                let odds = 1
                if (keka) {
                    for (let m of keka) {
                        txt = txt + `<i>🕔 ${m.date},  ${m.time}</i>\n⚽️ ${m.match}\n<b>✅ ${m.bet.replace(/team/g, '').replace(/1 - /g, '1-').replace(/2 - /g, '2-')}</b> <i>@${m.odds}</i> \n\n\n`
                        odds = (odds * m.odds).toFixed(2)
                    }

                    let gsb = 'https://track.africabetpartners.com/visit/?bta=35468&nci=5439'

                    let finaText = txt + `<b>🔥 Total Odds: ${odds}</b>\n\nOption hizi zinapatikana Gal Sport Betting pekee, kama bado huna account,\n\n<b>👤 Jisajili Hapa</b>\n<a href="${gsb}">https://m.gsb.co.tz/register\nhttps://m.gsb.co.tz/register</a>\n\n<u>Msaada </u>\nmsaada wa kuzielewa hizi option bonyeza <b>/maelezo</b>`

                    await ctx.reply(finaText, { parse_mode: 'HTML', disable_web_page_preview: true })
                }
            } catch (err) {
                await bot.api.sendMessage(imp.shemdoe, err.message)
                    .catch((e) => console.log(e.message))
                console.log(err.message)
            }

        })

        bot.command('maelezo', async ctx => {
            await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7567)
                .catch((err) => console.log(err.message))
        })

        bot.command('site', async ctx => {
            await ctx.reply(`Hello!, ukiona kimya tembelea site yangu ya mikeka \nhttps://mkekawaleo.com`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Fungua Hapa', url: 'http://mkekawaleo.com' }]
                    ]
                }
            })
                .catch((err) => console.log(err.message))
        })

        bot.command('sll', async ctx => {
            await nyumbuModel.updateMany({}, { $set: { refferer: "Regina" } })
            ctx.reply('Updated')
        })

        bot.command('copy', async ctx => {
            try {
                if (ctx.message.reply_to_message) {
                    let userid = ctx.message.reply_to_message.text
                    userid = Number(userid.split('id = ')[1].split('&mid')[0].trim())

                    let pid = ctx.message.text
                    pid = Number(pid.split(' ')[1])

                    await bot.api.copyMessage(userid, imp.pzone, pid)
                    await ctx.reply(`msg with id ${pid} was copied successfully to user with id ${userid}`)
                }
            } catch (err) {
                console.log(err)
                await ctx.reply(err.message).catch(e => console.log(e.message))
            }
        })

        bot.command('post_to_channels', async ctx => {
            let txt = ctx.message.text
            let ch_link = 'https://t.me/+804l_wD7yYgzM2Q0'
            let pload_link = `https://t.me/regina_tzbot?start=ngono_bongo`
            let keyb = [
                [{ text: "❌❌ VIDEO ZA KUTOMBANA HAPA ❤️", url: pload_link },],
                [{ text: "🔥 Unganishwa Na Malaya Mikoa Yote 🔞", url: pload_link },],
                [{ text: "🍑🍑 Magroup Ya Ngono na Madada Poa 🔞", url: pload_link },],
                [{ text: "💋 XXX ZA BONGO ❌❌❌", url: pload_link },],
                [{ text: "🔥🔥 Connection Za Chuo na Mastaa 🔞", url: pload_link }]
            ]

            let mid = Number(txt.split('post_to_channels=')[1])

            let channels = await my_channels_db.find()

            for (ch of channels) {
                await bot.api.copyMessage(ch.ch_id, imp.pzone, mid, {
                    disable_notification: true,
                    reply_markup: {
                        inline_keyboard: keyb
                    }
                })
            }
        })

        bot.command('kujisajili_bw', async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.rtcopyDB, 21)
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('app_bw', async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.rtcopyDB, 23)
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('kujisajili', async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7595)
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('kudeposit', async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7596)
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('stats', async ctx => {
            try {
                let nyumbusH = await nyumbuModel.countDocuments({ refferer: "Helen" })
                let nyumbusR = await nyumbuModel.countDocuments({ refferer: "Regina" })
                let jumla = nyumbusH + nyumbusR
                await ctx.reply(`Mpaka sasa kwenye Database yetu tuna nyumbu <b>${nyumbusH.toLocaleString('en-us')}</b> wa Helen na nyumbu <b>${nyumbusR.toLocaleString('en-us')}</b> wa Regina.\n\nJumla kuu ni <b>${jumla.toLocaleString('en-us')}</b>. \n\nWote unique, kama tayari mmoja wetu kamuongeza mimi simuongezi.`, { parse_mode: 'HTML' })
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command(['jisajili_m', 'deposit_m'], async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7652)
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('betbuilder', async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7655)
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('block', async ctx => {
            try {
                if (ctx.chat.id == imp.shemdoe) {
                    let chatid = Number(ctx.message.text.split('block=')[1])
                    await nyumbuModel.findOneAndUpdate({ chatid }, { $set: { blocked: true } })
                    await ctx.reply('User blocked successfully')
                }
            } catch (err) {
                await ctx.reply(err.message)
            }
        })

        bot.command(['wakubwa', 'sodoma', 'sex', 'wadogo'], async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.pzone, 8094)
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('pending', async ctx => {
            try {
                let baki = await tempChat.countDocuments()
                await ctx.reply('Tuna requests ' + baki)
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('approving', async ctx => {
            let man = ctx.chat.id
            try {
                if (man == imp.halot || man == imp.shemdoe) {
                    let all = await tempChat.countDocuments()
                    let toBeApproved = await tempChat.find().limit(all - 10)
                    for (let u of toBeApproved) {
                        await bot.api.approveChatJoinRequest(u.cha_id, u.chatid)
                            .catch(async (e) => { await u.deleteOne() })
                        console.log(u.chatid + ' approved')
                        await u.deleteOne()
                        await delay(40)
                    }
                }
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.on('channel_post', async ctx => {
            RegiChannelPostHandler(bot, ctx, imp)
        })

        call_supatips_function(bot)
        call_fametips_function(bot)
        call_betslip_function(bot, imp)
        call_oncallbackquery_function(bot, delay)

        bot.on('message:text', async ctx => {
            try {
                if (['group', 'supergroup'].includes(ctx.chat.type) && ctx.chat.id == imp.ai_group) {
                    const userid = ctx.message.from.id
                    RegiAIGroupHandler(bot, ctx, imp, userid)
                }

                if (ctx.message.reply_to_message && ctx.chat.id == imp.halot) {
                    if (ctx.message.reply_to_message.text) {
                        let my_msg = ctx.message.text
                        let myid = ctx.chat.id
                        let my_msg_id = ctx.message.message_id
                        let umsg = ctx.message.reply_to_message.text
                        let ids = umsg.split('id = ')[1].trim()
                        let userid = Number(ids.split('&mid=')[0])
                        let mid = Number(ids.split('&mid=')[1])

                        if (my_msg == 'block 666') {
                            await nyumbuModel.findOneAndUpdate({ chatid: userid }, { blocked: true })
                            await ctx.reply(userid + ' blocked for mass massaging')
                        }

                        else if (my_msg == 'unblock 666') {
                            await nyumbuModel.findOneAndUpdate({ chatid: userid }, { blocked: false })
                            await ctx.reply(userid + ' unblocked for mass massaging')
                        }

                        else {
                            await bot.api.copyMessage(userid, myid, my_msg_id, { reply_to_message_id: mid })
                        }

                    }

                    else if (ctx.message.reply_to_message.photo) {
                        let my_msg = ctx.message.text
                        let umsg = ctx.message.reply_to_message.caption
                        let ids = umsg.split('id = ')[1].trim()
                        let userid = Number(ids.split('&mid=')[0])
                        let mid = Number(ids.split('&mid=')[1])


                        await bot.api.sendMessage(userid, my_msg, { reply_to_message_id: mid })
                    }
                }

                else {
                    //create user if not on database
                    await create(bot, ctx)

                    let userid = ctx.chat.id
                    let txt = ctx.message.text
                    let username = ctx.chat.first_name
                    let mid = ctx.message.message_id

                    //check if ni mkeka
                    if (mkArrs.includes(txt.toLowerCase())) {
                        await ctx.replyWithChatAction('typing')
                        await delay(1000)
                        await bot.api.copyMessage(userid, imp.pzone, 7664)
                    } else if (txt == '🔥 MKEKA 1' || txt == '🔥 MKEKA #1') {
                        await call_sendMikeka_functions.sendMkeka1(ctx, delay, bot, imp)
                    } else if (txt == '💰 MKEKA 2' || txt == '💰 MKEKA #2') {
                        await call_sendMikeka_functions.sendMkeka2(ctx, delay, bot, imp)
                    } else if (txt == '🤑 MKEKA 3' || txt == '🤑 MKEKA #3') {
                        await call_sendMikeka_functions.sendMkeka3(ctx, delay, bot, imp)
                    } else if (txt == '💯 BetWinner App (200% Bonus)' || txt.toLowerCase() == 'betwinner') {
                        await bot.api.copyMessage(userid, imp.rtcopyDB, 23)
                    } else if (txt == '👑 SUPATIPS') {
                        await call_sendMikeka_functions.supatips(ctx, bot, delay, imp)
                    } else if (txt == '💡 MSAADA') {
                        await bot.api.copyMessage(ctx.chat.id, imp.mikekaDB, 481)
                    } else if (txt == '🔥 MIKEKA YA UHAKIKA LEO 💰') {
                        await bot.api.copyMessage(ctx.chat.id, imp.mikekaDB, 592)
                    }
                    //forward to me if sio mkeka
                    else {
                        if (ctx.chat.type == 'private') {
                            await bot.api.sendMessage(imp.halot, `<b>${txt}</b> \n\nfrom = <code>${username}</code>\nid = <code>${userid}</code>&mid=${mid}`, { parse_mode: 'HTML', disable_notification: true })
                        }
                    }
                }
            } catch (err) {
                if (!err.message) {
                    await bot.api.sendMessage(imp.shemdoe, err.description)
                } else {
                    await bot.api.sendMessage(imp.shemdoe, err.message)
                }
            }
        })

        bot.on('message:photo', async ctx => {
            try {
                let mid = ctx.message.message_id
                let username = ctx.chat.first_name
                let chatid = ctx.chat.id
                let cap = ctx.message.caption

                if (ctx.message.reply_to_message && chatid == imp.halot) {
                    if (ctx.message.reply_to_message.text) {
                        let umsg = ctx.message.reply_to_message.text
                        let ids = umsg.split('id = ')[1].trim()
                        let userid = Number(ids.split('&mid=')[0])
                        let rmid = Number(ids.split('&mid=')[1])


                        await bot.api.copyMessage(userid, chatid, mid, {
                            reply_to_message_id: rmid
                        })
                    }

                    else if (ctx.message.reply_to_message.photo) {
                        let umsg = ctx.message.reply_to_message.caption
                        let ids = umsg.split('id = ')[1].trim()
                        let userid = Number(ids.split('&mid=')[0])
                        let rmid = Number(ids.split('&mid=')[1])


                        await bot.api.copyMessage(userid, chatid, mid, {
                            reply_to_message_id: rmid
                        })
                    }
                }


                else {
                    await bot.api.copyMessage(imp.halot, chatid, mid, {
                        caption: cap + `\n\nfrom = <code>${username}</code>\nid = <code>${chatid}</code>&mid=${mid}`,
                        parse_mode: 'HTML'
                    })
                }
            } catch (err) {
                if (!err.message) {
                    await bot.api.sendMessage(imp.shemdoe, err.description)
                    console.log(err)
                } else {
                    await bot.api.sendMessage(imp.shemdoe, err.message)
                    console.log(err)
                }
            }
        })

        setInterval(() => {
            let now = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi' })
            let timeStrings = now.split(':')
            let time2check = `${timeStrings[0]}:${timeStrings[1]}`
            let trhLeo = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

            //kesho
            let k = new Date()
            k.setDate(k.getDate() + 1)
            let trhKesho = k.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

            //after kesho
            let k2 = new Date()
            k2.setDate(k2.getDate() + 2)
            let afterKesho = k2.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

            //jana
            let j = new Date()
            j.setDate(j.getDate() - 1)
            let trhJana = j.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

            //Quality Check every hour at 14th minute
            if (timeStrings[1] == '14') {
                QualityTipsCheck(bot, imp).catch(e => console.log(e?.message))
            }

            switch (time2check) {
                //mybets.today correct score and mutating 1x2
                case '03:10': case '06:00': case '08:00': case '09:00': case '10:00':
                    call_scheduled_checker_fn.extractMyBetsToday('soccer-predictions/', trhLeo)
                    setTimeout(() => {
                        correctScoreFn('soccer-predictions/correct-score-predictions/', trhLeo)
                    }, 5000);
                    break;

                case '10:30': case '11:30': case '14:30': case "15:25": case '18:45': case '20:35': case '23:45':
                    //extract tomorrow 1x2
                    call_scheduled_checker_fn.extractMyBetsToday('soccer-predictions/tomorrow/', trhKesho)

                    //extract after tomorrow 1x2
                    setTimeout(() => {
                        call_scheduled_checker_fn.extractMyBetsToday('soccer-predictions/after-tomorrow/', afterKesho)
                    }, 5000);

                    //extract correct score tomorrow
                    setTimeout(() => {
                        correctScoreFn('soccer-predictions/correct-score-predictions/tomorrow/', trhKesho)
                    }, 10000);

                    //extract correct score after tomorrow
                    setTimeout(() => {
                        correctScoreFn('soccer-predictions/correct-score-predictions/after-tomorrow/', afterKesho)
                    }, 15000);
                    break;


                //fametips
                case '06:07': case '08:07': case '09:07': case '10:07': case '12:07': case '15:07':
                    call_famescheduled_fn.famecheckMatokeo('#yesterday-content', trhJana)
                    break;

                case '03:07': case '04:07': case '05:07': case '06:57': case '07:57': case '08:57': case '09:57': case '10:57': case '11:57': case '12:57':
                    call_famescheduled_fn.famecheckOdds('#today-content', trhLeo)
                    break;

                case '16:07': case '18:07': case '19:07': case '20:07': case '21:07': case '22:07': case '23:07': case '23:57':
                    call_famescheduled_fn.famecheckOdds('#tomorrow-content', trhKesho)
                    break;
            }
        }, 59 * 1000)
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    rbot: reginaBot
}