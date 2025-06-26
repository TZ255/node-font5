const { ExtractTextFromSlip } = require("../../../routes/functions/extractSlipText")
const { ShemdoeAssistant } = require("../../../routes/functions/kbase")
const myBongoChannelsModel = require("../database/my_channels")
const tgSlipsModel = require("../database/tg_slips")
const waombajiModel = require("../database/waombaji")
const { StructureBetslipCaption } = require("./structureSlipMessage")



const RegiChannelPostHandler = async (bot, ctx, imp) => {
    let msg_id = ctx.channelPost.message_id

    try {
        //text on mikeka DB
        if (ctx.channelPost?.text && ctx.channelPost.chat.id == imp.mikekaDB) {
            let txt = ctx.channelPost.text
            if (txt.toLowerCase().includes('wrap gsb')) {
                let waombaji = await waombajiModel.findOne({ pid: 'shemdoe' })
                await ctx.reply(`Hizi ni stats zilizopita:\n\n- Mkeka 1 = ${waombaji.mk1}\n- Mkeka 2 = ${waombaji.mk2}\n- Mkeka 3 = ${waombaji.mk3}\n\nPost mkeka mpya ku reset`)
                await delay(1000)
                await bot.api.copyMessage(ctx.chat.id, imp.mikekaDB, 2652)
                await delay(500)
                return await ctx.api.deleteMessage(ctx.chat.id, msg_id)
            }
            else if (txt.toLowerCase().includes('wrap betway')) {
                let waombaji = await waombajiModel.findOne({ pid: 'shemdoe' })
                await ctx.reply(`Hizi ni stats zilizopita:\n\n- Mkeka 1 = ${waombaji.mk1}\n- Mkeka 2 = ${waombaji.mk2}\n- Mkeka 3 = ${waombaji.mk3}\n\nPost mkeka mpya ku reset`)
                await delay(1000)
                await bot.api.copyMessage(ctx.chat.id, imp.mikekaDB, 2608)
                await delay(500)
                return await ctx.api.deleteMessage(ctx.chat.id, msg_id)
            }
            else if (txt.toLowerCase().includes('delete mkeka') && ctx.channelPost.reply_to_message) {
                let siku = new Date().toLocaleDateString('en-gb', { timeZone: 'Africa/Nairobi' })
                let mid = ctx.channelPost.reply_to_message.message_id
                await tgSlipsModel.findOneAndDelete({ mid, siku })
                let mm = await ctx.reply('Mkeka Deleted')
                await delay(2000)
                return await ctx.api.deleteMessage(ctx.chat.id, mm.message_id)
            }
        }

        // for regina only
        if (ctx.channelPost.reply_to_message && ctx.channelPost.chat.id == imp.mikekaDB) {
            let txt = ctx.channelPost.text
            let rp_id = ctx.channelPost.reply_to_message.message_id
            let rp_msg = ctx.channelPost.reply_to_message.text

            if (txt.includes(' - ') && !txt.toLowerCase().includes('graph')) {
                let data = txt.split(' - ')

                //create mkeka
                let brand = data[0].toLowerCase()
                let siku = data[1] + '/2025'

                //check if already there
                let check1 = await tgSlipsModel.findOne({ brand, siku })
                //if there update, if not create
                if (check1) {
                    await check1.updateOne({ $set: { mid: rp_id } })
                } else {
                    await tgSlipsModel.create({ brand, siku, mid: rp_id, posted: false })
                }

                //reset waombaji db
                await waombajiModel.findOneAndUpdate({ pid: 'shemdoe' }, { $set: { mk1: 0, mk2: 0, mk3: 0 } })

                let info = await ctx.reply(`Mkeka for ${siku} posted & waombaji reseted`, { reply_to_message_id: rp_id })
                setTimeout(() => {
                    ctx.api.deleteMessage(ctx.chat.id, info.message_id).catch(e => {
                        console.log(e.message, e)
                        ctx.reply(e.message).catch(ee => console.log(ee))
                    })
                }, 3000)
            }
            else if (txt.toLowerCase() === 'delete') {
                await tgSlipsModel.findOneAndDelete({ mid: rp_id })
                await ctx.reply('This post deleted from DB', { reply_to_message_id: rp_id })
            }
            else if (txt.toLowerCase() === 'whatsapp') {
                let cap = ctx.channelPost.reply_to_message?.caption
                let title = `*${cap.split('🔥')[0].trim().split('\n')[0].replace('Leo', 'Siku')}*\n\`\`\`${cap.split('🔥')[0].trim().split('\n')[1]}\`\`\``
                let odds = cap.split('Total Odds: ')[1].substring(0, 4)
                let splitData = cap.split('📠 Booking code:')[0].trim().split('•••')
                let booking_code = cap.split('📠 Booking code: ')[1].split('\n')[0].trim()
                let final_text = `${title}\n\n\n`
                let other_ct = `\n\n*🇰🇪 Kenya*\n*www.bet-link.top/betwinner/register*\n\n*🇺🇬 Uganda*\n*www.bet-link.top/gsb-ug/register*`
                let bottom_text = `•••\n\n*🔥 Total Odds: ${odds}*\n📲 Booking Code: *${booking_code}*\n\n> Mkeka huu umeandaliwa *BetWay*. Wanatoa refund kwa mkeka uliochanwa na mechi moja.\n\nIkiwa bado huna account\n*🔗 Jisajili Hapa!*\n\n*🇹🇿 Tanzania*\n*www.bet-link.top/betway/register*${other_ct}`
                if (cap.includes('Gal Sport')) {
                    bottom_text = `•••\n\n*🔥 Total Odds: ${odds}*\n📲 Booking Code: *${booking_code}*\n\n> Mkeka huu umeandaliwa *Gal Sport Betting*. Wanatoa bonus ya 150% kwa deposit ya kwanza.\n\nIkiwa bado huna account\n*🔗 Jisajili Hapa!*\n\n*🇹🇿 Tanzania*\n*www.bet-link.top/gsb/register*${other_ct}`
                }
                for (let [i, d] of splitData.entries()) {
                    if (i == 0) {
                        continue;
                    }
                    let match_data = d.trim().split('\n')
                    let title = match_data[0].trim()
                    let game = match_data[1].trim()
                    let tip = match_data[2].trim().replace('☑️', '🎯 ')
                    let expl = match_data[3].trim()

                    let t = `${title}\n*${game}*\n> *${tip}*\n> ${expl}\n\n\n`
                    final_text = final_text + t
                }
                let wa_msg = await ctx.reply(final_text + bottom_text)
                await ctx.deleteMessage()
                setTimeout(() => { ctx.api.deleteMessage(ctx.chat.id, wa_msg.message_id) }, 10000)
            } else if (txt.toLocaleLowerCase().startsWith('automate ') && ctx.channelPost?.reply_to_message?.photo) {
                let photo = ctx.channelPost.reply_to_message.photo.at(-1)
                let file = await ctx.api.getFile(photo.file_id)
                let imgUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`

                //extract
                let gpt_res = await ExtractTextFromSlip(imgUrl)

                if (!gpt_res.ok) return await ctx.reply(gpt_res?.error || 'Unknown error on fn call');

                let [, affiliate, booking] = txt.split(' ')
                console.log(affiliate, booking)
                //structure message
                const caption = StructureBetslipCaption(gpt_res, affiliate, booking)
                await ctx.api.editMessageCaption(ctx.channelPost.chat.id, rp_id, { parse_mode: 'HTML', caption })
                await ctx.deleteMessage()
            }
        }
    } catch (err) {
        console.log(err)
        await ctx.reply(err?.message)
    }
}

const RegiAIGroupHandler = async (bot, ctx, imp, userid) => {
    try {
        await ctx.replyWithChatAction('typing')
        const text = ctx.message.text
        const response = await ShemdoeAssistant(userid, text)
        return await ctx.reply(response)
    } catch (error) {
        console.error(error)
        await ctx.reply(err?.message)
    }
}


module.exports = {
    RegiChannelPostHandler,
    RegiAIGroupHandler
}