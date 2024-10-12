

const PipyBot = async (app) => {
    try {
        const { Bot, webhookCallback } = require('grammy')
        const { autoRetry } = require("@grammyjs/auto-retry")
        const bot = new Bot(process.env.PIPY_TOKEN)

        const pipyUsers = require('./database/chats')
        const verifiedList = require('./database/verified')
        const tg_slips = require('./database/tg_slips')
        const vidb = require('./database/db')
        const mkekaMega = require('./database/mkeka-mega')
        const toDeleteModel = require('./database/MsgtoDelete')
        const switchUserText = require('./fns/text-arr')
        const otheFns = require('./fns/otherFn')
        const call_sendMikeka_functions = require('./fns/mkeka-1-2-3')

        const imp = {
            replyDb: -1001608248942,
            pzone: -1001352114412,
            rpzone: -1001549769969,
            prem_channel: -1001470139866,
            local_domain: 't.me/rss_shemdoe_bot?start=',
            prod_domain: 't.me/ohmychannelV2bot?start=',
            link_chatgroup: 'https://t.me/+xrfnFIgLbTc5Y2Jk',
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
            matangazoDB: -1001570087172,
            r_chatting: -1001722693791,
            r_testing: -4115709988,
            muvikap2: 5940671686,
            blackberry: 1101685785,
            TelegramChannelId: 777000,
            sio_shida: -1002110306030
        }

        //use auto-retry
        bot.api.config.use(autoRetry());

        //set webhook
        let hookPath = `/telebot/${process.env.USER}/pipytida`
        await bot.api.setWebhook(`https://${process.env.DOMAIN}${hookPath}`, {
            drop_pending_updates: true
        })
            .then(() => {
                console.log(`webhook for Pipy is set`)
                bot.api.sendMessage(imp.shemdoe, `${hookPath} set as webhook`)
                    .catch(e => console.log(e.message))
            })
            .catch(e => console.log(e.message))
        app.use(`${hookPath}`, webhookCallback(bot, 'express', {timeoutMilliseconds: 30000}))

        const mkArrs = ['mkeka', 'mkeka1', 'mkeka2', 'mkeka3', 'mikeka', 'mkeka wa leo', 'mikeka ya leo', 'mkeka namba 1', 'mkeka namba 2', 'mkeka namba 3', 'mkeka #1', 'mkeka #2', 'mkeka #3', 'mkeka no #1', 'mkeka no #2', 'mkeka no #3', 'za leo', 'naomba mkeka', 'naomba mikeka', 'naomba mkeka wa leo', 'nitumie mkeka', 'ntumie mkeka', 'nitumie mikeka ya leo', 'odds', 'odds za leo', 'odds ya leo', 'mkeka waleo', 'mkeka namba moja', 'mkeka namba mbili', 'mkeka namba tatu', 'nataka mkeka', 'nataka mikeka', 'mkeka wa uhakika', 'odds za uhakika', 'mkeka?', 'mkeka wa leo?', '/mkeka 1', '/mkeka 2', '/mkeka 3']

        async function create(bot, ctx) {
            let starter = await pipyUsers.findOne({ chatid: ctx.chat.id })
            if (!starter) {
                await pipyUsers.create({
                    chatid: ctx.chat.id,
                    username: ctx.chat.first_name,
                    promo: 'unknown',
                    refferer: "Pipy"
                })
                console.log('New user added to DB (Pipy)')
            }
        }

        //catching any error
        bot.catch((err) => {
            const ctx = err.ctx;
            console.error(`(Pipy): ${err.message}`, err);
        });

        //delaying
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

        let defaultReplyMkp = {
            keyboard: [
                [
                    { text: "MKEKA 1" },
                    { text: "MKEKA 2" },
                    { text: "MKEKA 3" },
                ]
            ],
            is_persistent: true,
            resize_keyboard: true
        }

        const admins = [imp.halot, imp.shemdoe, imp.blackberry, imp.xbongo, imp.TelegramChannelId]
        const chatGroups = [imp.r_chatting]

        bot.command('start', async ctx => {
            try {
                if (ctx.match) {
                    let pload = ctx.match
                    if (pload == 'ngono_bongo') {
                        console.log('Ngono Payload Started')
                        await bot.api.copyMessage(ctx.chat.id, imp.pzone, 8859, {
                            reply_markup: defaultReplyMkp
                        })
                    } else if (pload == 'watoa_huduma') {
                        await otheFns.watoaHudumaPrivateChat(bot, ctx, imp)
                    }
                    //add to database
                    await create(bot, ctx)

                } else {
                    await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7653, {
                        reply_markup: defaultReplyMkp
                    })

                    let stt = await pipyUsers.findOne({ chatid: ctx.chat.id })
                    if (!stt) {
                        await pipyUsers.create({
                            chatid: ctx.chat.id,
                            username: ctx.chat.first_name,
                            refferer: "Pipy"
                        })
                        await bot.api.sendMessage(imp.logsBin, '(Pipy) New user found me - Added to DB')
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

        bot.command('supatips', async ctx => {
            try {
                await call_sendMikeka_functions.supatips(ctx, bot, delay, imp)
            } catch (error) {
                console.log(err.message)
            }
        })

        const convoFn = async (ctx) => {
            if ([imp.halot, imp.shemdoe].includes(ctx.chat.id) && ctx.match) {
                let msg_id = Number(ctx.match.trim())
                let bads = ['deactivated', 'blocked', 'initiate', 'chat not found']
                try {
                    let all_users = await pipyUsers.find({ refferer: "Pipy" })
                    await ctx.reply(`Starting broadcasting for ${all_users.length} users`)

                    all_users.forEach((u, i) => {
                        setTimeout(() => {
                            bot.api.copyMessage(u.chatid, imp.mikekaDB, msg_id, { reply_markup: defaultReplyMkp })
                                .then(() => {
                                    if (i == all_users.length - 1) {
                                        ctx.reply('Nimemaliza convo').catch(e => console.log(e.message))
                                    }
                                })
                                .catch((err) => {
                                    if (bads.some((b) => err?.message.toLowerCase().includes(b))) {
                                        u.deleteOne()
                                        console.log(`${i + 1}. Pipy - ${u?.chatid} deleted`)
                                    } else { console.log(`🤷‍♂️ ${err.message}`) }
                                })
                        }, i * 50) //20 messages per second
                    })
                } catch (err) {
                    console.log(err.message)
                }
            }
        }

        bot.command('convo', async ctx => {
            convoFn(ctx)
        })

        bot.command(['mkeka', 'mkeka1'], async ctx => {
            try {
                if (ctx.chat.type == 'private') {
                    let rpid = ctx.message.message_id
                    await call_sendMikeka_functions.sendMkeka1(ctx, delay, bot, imp, rpid)
                } else {
                    //elekeza dm
                    await call_sendMikeka_functions.elekezaDM(bot, ctx, imp, delay)
                }
            } catch (err) {
                console.log(err)
                await bot.api.sendMessage(imp.shemdoe, err.message)
                    .catch(e => console.log(e.message))
            }
        })

        bot.command('mkeka2', async ctx => {
            try {
                if (ctx.chat.type == 'private') {
                    let rpid = ctx.message.message_id
                    await call_sendMikeka_functions.sendMkeka2(ctx, delay, bot, imp, rpid)
                } else {
                    //elekeza dm
                    await call_sendMikeka_functions.elekezaDM(bot, ctx, imp, delay)
                }
            } catch (err) {
                console.log(err)
                await bot.api.sendMessage(imp.shemdoe, err.message)
                    .catch(e => console.log(e.message))
            }
        })

        bot.command('mkeka3', async ctx => {
            try {
                if (ctx.chat.type == 'private') {
                    let rpid = ctx.message.message_id
                    await call_sendMikeka_functions.sendMkeka3(ctx, delay, bot, imp, rpid)
                } else {
                    //elekeza dm
                    await call_sendMikeka_functions.elekezaDM(bot, ctx, imp, delay)
                }
            } catch (err) {
                await bot.api.sendMessage(imp.shemdoe, err.message)
                    .catch((e) => console.log(e.message))
                console.log(err.message, err)
            }
        })

        bot.command('site', async ctx => {
            try {
                await ctx.reply(`Hello!, ukiona kimya tembelea site yangu ya mikeka \nhttps://mkekawaleo.com`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Fungua Hapa', url: 'http://mkekawaleo.com' }]
                        ]
                    },
                    reply_parameters: { message_id: ctx.message.message_id, allow_sending_without_reply: true }
                })
            } catch (error) {
                console.log(error.message, error)
            }
        })

        bot.command('kujisajili', async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7595, {
                    reply_parameters: { message_id: ctx.message.message_id, allow_sending_without_reply: true }
                })
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('kujisajili_bw', async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.matangazoDB, 99, {
                    reply_parameters: { message_id: ctx.message.message_id, allow_sending_without_reply: true }
                })
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('app_bw', async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.matangazoDB, 97, {
                    reply_parameters: { message_id: ctx.message.message_id, allow_sending_without_reply: true }
                })
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('kudeposit', async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7596, {
                    reply_parameters: { message_id: ctx.message.message_id, allow_sending_without_reply: true }
                })
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('stats', async ctx => {
            try {
                let nyumbusP = await pipyUsers.countDocuments({ refferer: "Pipy" })
                let jumla = nyumbusP
                let unknown = await pipyUsers.countDocuments({ promo: "unknown" })
                unknown = unknown.toLocaleString('en-us')
                let premier = await pipyUsers.countDocuments({ promo: "premier" })
                premier = premier.toLocaleString('en-us')
                await ctx.reply(`Mpaka sasa kwenye Database yetu tuna nyumbu <b>${nyumbusP.toLocaleString('en-us')}</b> wa Pipy.\n\nJumla kuu ni <b>${jumla.toLocaleString('en-us')}</b>. \n\nWote unique, kama tayari mmoja wetu kamuongeza mimi simuongezi.\n\nPia upande wa promo tuko na:\n1. Uncategoriized: ${unknown}\n2. Premier: ${premier}`, { parse_mode: 'HTML' })
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command(['jisajili_m', 'deposit_m'], async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7652, {
                    reply_parameters: { message_id: ctx.message.message_id, allow_sending_without_reply: true }
                })
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('betbuilder', async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7655, {
                    reply_parameters: { message_id: ctx.message.message_id, allow_sending_without_reply: true }
                })
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('block', async ctx => {
            try {
                if (ctx.chat.id == imp.shemdoe) {
                    let chatid = Number(ctx.message.text.split('block=')[1])
                    await pipyUsers.findOneAndUpdate({ chatid }, { $set: { blocked: true } })
                    await ctx.reply('User blocked successfully')
                }
            } catch (err) {
                await ctx.reply(err.message)
            }
        })

        bot.command('setbtn', async ctx => {
            try {
                await bot.api.sendMessage(imp.r_chatting, 'Chatting Rahatupu\n\nGroup bora bongo kwa huduma za kikubwa', {
                    reply_markup: defaultReplyMkp
                })
            } catch (error) {
                console.log(error.message)
            }
        })

        bot.command(['wakubwa', 'sodoma', 'sex', 'wadogo'], async ctx => {
            try {
                await bot.api.copyMessage(ctx.chat.id, imp.pzone, 8094, {
                    reply_parameters: { message_id: ctx.message.message_id, allow_sending_without_reply: true }
                })
            } catch (err) {
                console.log(err.message)
            }
        })

        bot.command('mod', async ctx => {
            try {
                if (admins.includes(ctx.chat.id)) {
                    await otheFns.modFunction(bot, ctx, imp, delay)
                }
            } catch (error) {
                await ctx.reply(error.message)
            }
        })

        bot.command('watoa_huduma', async ctx => {
            try {
                //angalia list mwenyewe
                if (admins.includes(ctx.chat.id)) {
                    await otheFns.listYangu(ctx)
                } else {
                    //kama ni kwenye group angalia list vinginevyo elekeza
                    if (chatGroups.includes(ctx.chat.id)) {
                        await otheFns.watoaHuduma(bot, imp, ctx.chat.id)
                    } else {
                        await ctx.reply(`Command hii /watoa_huduma inatumika tu ndani ya group letu la kuchat kuona list ya Dada Poa waaminifu waliothibitishwa na uongozi wa RT Groups.\n\nBonyeza link hapa chini kuingia kwenye group letu la kuchat\n${imp.link_chatgroup}\n${imp.link_chatgroup}`)
                    }
                }

            } catch (error) {
                console.log(error?.message)
            }
        })

        bot.command('clear_group', async ctx => {
            try {
                if (admins.includes(ctx.chat.id) || admins.includes(ctx.message.from.id)) {
                    await otheFns.clearingGroup(bot, imp, delay)
                }
            } catch (error) {
                await ctx.reply(error.message)
            }
        })

        bot.command('ondoa', async ctx => {
            try {
                if (chatGroups.includes(ctx.chat.id) && ctx.message.reply_to_message) {
                    let userid = ctx.message.reply_to_message.from.id
                    let fname = ctx.message.reply_to_message.from.first_name
                    let fullName = ctx.message.reply_to_message.from.last_name ? `${fname} ${ctx.message.reply_to_message.from.last_name}` : fname
                    let my_msgid = ctx.message.message_id
                    let rep_msgid = ctx.message.reply_to_message.message_id
                    let myid = ctx.message.from.id
                    let mention = `<a href="tg://user?id=123456789">${fullName}</a>`
                    let status = await ctx.getChatMember(myid)

                    if (['administrator', 'creator'].includes(status.status)) {
                        await ctx.banChatMember(userid, 0)
                        await ctx.reply(`<b>${mention}</b> amekula ban ya maisha kwenye hili group.`, {
                            reply_parameters: { message_id: rep_msgid },
                            parse_mode: 'HTML'
                        })
                    }

                }
            } catch (error) {
                await ctx.reply(error.message)
            }
        })

        bot.on('callback_query:data', async ctx => {
            try {
                let data = ctx.callbackQuery.data

                switch (data) {
                    case 'accept_pload':
                        let pload_link = `https://t.me/+PWiPWm0vB5Y4ZDhk`
                        let org_msg_id = ctx.callbackQuery.message.message_id
                        await ctx.api.deleteMessage(ctx.chat.id, org_msg_id)
                        await ctx.reply(`Hongera 👏 Ombi lako la kujiunga na channel yetu limekubaliwa\n\n🔞 <b>Ingia Sasa\n${pload_link}\n${pload_link}</b>`, { parse_mode: 'HTML' })
                        break;

                    case 'jisajili_m': case 'deposit_m':
                        await bot.api.copyMessage(ctx.chat.id, imp.pzone, 7652)
                        break;
                }
            } catch (error) {
                console.log('(Pipy): ' + error.message)
            }
        })

        bot.on(':new_chat_members', async ctx => {
            let bannedNames = ['sister g', 'nanaof']
            try {
                if (chatGroups.includes(ctx.chat.id)) {
                    const newMembers = ctx.message.new_chat_members;

                    for (let member of newMembers) {
                        const firstName = member.first_name ? member.first_name.toLowerCase() : '';
                        const lastName = member.last_name ? member.last_name.toLowerCase() : '';
                        const username = member.username ? member.username.toLowerCase() : '';
                        const fullName = `${firstName} ${lastName} ${username}`.trim();

                        if (bannedNames.some(b => fullName.includes(b))) {
                            await ctx.banChatMember(member.id, 0);
                            await bot.api.sendMessage(imp.blackberry, `${fullName} banned`)
                            await ctx.reply(`<b>${fullName}</b> amejaribu kuingia kwenye group, nimemuondoa`, { parse_mode: 'HTML' })
                        }
                    }
                }
            } catch (error) {
                console.log(error.message)
            }
        })

        bot.on('message:text', async ctx => {
            try {
                if (ctx.message && ctx.message.reply_to_message) {
                    if (admins.includes(ctx.chat.id) && ctx.message.reply_to_message.text) {
                        //call adminReplyToText
                        await otheFns.adminReplyToMessageFn(bot, ctx, imp)
                    }

                    if (ctx.message && ctx.message.reply_to_message && chatGroups.includes(ctx.chat.id) && admins.includes(ctx.message.from.id)) {
                        if (ctx.message.text.toLocaleLowerCase() == 'verified') {
                            //call verifying function
                            await otheFns.verifyFn(bot, ctx, imp)
                        } else if (ctx.message.text.toLocaleLowerCase() == 'unverify') {
                            //call verifying function
                            await otheFns.UnverifyFn(bot, ctx, imp)
                        } else if (ctx.message.text.toLocaleLowerCase().includes('loc=')) {
                            //update location
                            await otheFns.updateLocation(bot, ctx)
                        } else if (ctx.message.text.toLocaleLowerCase().includes('phone=')) {
                            //update phone number
                            await otheFns.updatePhone(bot, ctx)
                        } else if (ctx.message.text.toLocaleLowerCase().includes('itle=')) {
                            //update admin title
                            await otheFns.updateAdminTitle(bot, ctx, imp)
                        }
                    }

                    if (ctx.message && ctx.message.reply_to_message.photo && admins.includes(ctx.chat.id) && ctx.chat.type == 'private') {
                        //if its text reply to photo
                        await otheFns.adminReplyTextToPhotoFn(bot, ctx, imp)
                    }
                }

                //create user if not on database
                if (ctx.chat.type == 'private') {
                    await create(bot, ctx)
                }

                if (chatGroups.includes(ctx.chat.id)) {
                    //check if member is restricted in our superGroups
                    await otheFns.muteLongTextsAndVideos(bot, ctx, imp, delay)
                }

                //switch kybd, mkeka arrays, forwarding
                await switchUserText.switchTxt(call_sendMikeka_functions, bot, ctx, imp, mkArrs, delay)
            } catch (err) {
                console.log(err.message, err)
            }
        })

        bot.on('message:photo', async ctx => {
            try {
                if (ctx.chat.type == 'private') {
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

                    await bot.api.copyMessage(imp.halot, chatid, mid, {
                        caption: cap + `\n\nfrom = <code>${username}</code>\nid = <code>${chatid}</code>&mid=${mid}`,
                        parse_mode: 'HTML'
                    })
                }
                if (chatGroups.includes(ctx.chat.id) && !admins.includes(ctx.message.from.id)) {
                    //check if is verified (only applicable if all users are allowed to post)
                    await otheFns.checkSenderFn(bot, ctx, imp)

                    //check if restricted, if not mute 30 minutes
                    await otheFns.muteLongTextsAndVideos(bot, ctx, imp, delay)
                }
            } catch (err) {
                console.log(err.message, err)
            }
        })

        bot.on('message:video', async ctx => {
            try {
                if (chatGroups.includes(ctx.chat.id) && !admins.includes(ctx.message.from.id)) {
                    //check sender if is verified (only applicable if all users are allowed to post)
                    await otheFns.checkSenderFn(bot, ctx, imp)

                    //check if restricted, if not mute 30 minutes
                    await otheFns.muteLongTextsAndVideos(bot, ctx, imp, delay)
                }
            } catch (error) {
                console.log(error.message, error)
            }
        })

        bot.on('message:animation', async ctx => {
            try {
                if (chatGroups.includes(ctx.chat.id) && !admins.includes(ctx.message.from.id)) {
                    //check sender if is verified (only applicable if all users are allowed to post)
                    await otheFns.checkSenderFn(bot, ctx, imp)

                    //check if restricted, if not mute 30 minutes
                    await otheFns.muteLongTextsAndVideos(bot, ctx, imp, delay)
                }
            } catch (error) {
                console.log(error.message, error)
            }
        })

        //every  1 hour remind people
        setInterval(() => {
            let tzHours = Number(new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', timeStyle: 'short', hour12: false }).split(':')[0])
            let mins = new Date().getMinutes()
            //post kati ya saa tatu asubuhi hadi saa 8 usiku
            if ((tzHours > 8 || tzHours < 3) && mins % 24 == 0) {
                for (let G of chatGroups) {
                    otheFns.watoaHuduma(bot, imp, G).catch(err => console.log(err.message, err))
                }
            }

            //clear bin saa sita na dakika moja
            if (tzHours == 0 && mins == 1) {
                otheFns.clearingGroup(bot, imp, delay)
            }

            //every 10 minutes kati ya saa tatu asubuhi hadi saa nane usiku
            if (mins % 10 == 0 && (tzHours > 8 || tzHours < 3)) {
                otheFns.utapeliMsg(bot, imp)
            }
        }, 60000)

        if (process.env.environment == 'local') {
            await bot.api.deleteWebhook({ drop_pending_updates: true })
            bot.start().catch(e => {
                bot.api.sendMessage(741815228, e.message).catch(e => console.log(e.message))
            })
        }
    } catch (error) {
        console.log(error.message, error)
    }
}

module.exports = {
    PipyBot
}