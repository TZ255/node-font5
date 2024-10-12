module.exports = async (bot, ctx, dt, anyErr) => {
    const muhimu = [dt.naomy, dt.jacky, dt.airt]
    try {
        if (ctx.message.reply_to_message && [dt.htlt, dt.shd].includes(ctx.chat.id)) {
            let myid = ctx.chat.id
            let my_msg_id = ctx.message.message_id
            let umsg = ctx.message.reply_to_message.text
            let ids = umsg.split('id = ')[1].trim()
            let userid = Number(ids.split('&mid=')[0])
            let mid = Number(ids.split('&mid=')[1])

            await bot.api.copyMessage(userid, myid, my_msg_id, { reply_parameters: { message_id: mid, allow_sending_without_reply: true } })
        } else {
            await ctx.replyWithChatAction('typing')
            let userid = ctx.chat.id
            let txt = ctx.message.text
            let username = ctx.chat.first_name
            let mid = ctx.message.message_id

            if (muhimu.includes(ctx.chat.id)) {
                await bot.api.sendMessage(dt.shd, `<b>${txt}</b> \n\nfrom = <code>${username}</code>\nid = <code>${userid}</code>&mid=${mid}`, { parse_mode: 'HTML' })
            } else {
                await bot.api.sendMessage(dt.htlt, `<b>${txt}</b> \n\nfrom = <code>${username}</code>\nid = <code>${userid}</code>&mid=${mid}`, { parse_mode: 'HTML', disable_notification: true })
            }

            //elekeza kutafuta drama
            setTimeout(() => {
                ctx.api.copyMessage(ctx.chat.id, dt.databaseChannel, 12062, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🔍 Find drama here', url: 'https://dramastore.net/list/all' }
                            ]
                        ]
                    }
                })
                    .catch(e => console.log(e.message))
            }, 500)
        }
    } catch (err) {
        console.log(err.message, err)
    }

}
