function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]))
}

function isForwardedFromChannel(message) {
    const origin = message?.forward_origin
    const storyChatType = message?.story?.chat?.type

    return origin?.type === 'channel'
        || origin?.sender_chat?.type === 'channel'
        || message?.forward_from_chat?.type === 'channel'
        || storyChatType === 'channel'
}

async function banChannelForwarder(ctx, imp, admins) {
    const message = ctx.message
    const sender = message?.from

    if (ctx.chat?.id !== imp.r_chatting || !sender) return false
    if (admins.includes(sender.id) || message.is_automatic_forward) return false
    if (!isForwardedFromChannel(message)) return false

    const banSeconds = 7 * 24 * 60 * 60
    const until_date = (message.date || Math.floor(Date.now() / 1000)) + banSeconds
    const name = sender.last_name ? `${sender.first_name} ${sender.last_name}` : sender.first_name
    const mention = `<a href="tg://user?id=${sender.id}">${escapeHtml(name)}</a>`

    try {
        await ctx.banChatMember(sender.id, { until_date })
        await ctx.api.deleteMessage(ctx.chat.id, message.message_id).catch(e => { })
        await ctx.reply(`<b>${mention}</b> amepigwa ban ya siku 7 kwa kuforward spam kwenye group.`, {
            parse_mode: 'HTML'
        }).catch(e => { })
        await ctx.api.sendMessage(imp.blackberry, `<b>${mention}</b> amepigwa ban ya siku 7 kwa kuforward spam kwenye group.`, {
            parse_mode: 'HTML'
        }).catch(e => { })
    } catch (error) {
        console.log('(Pipy channel forward ban): ' + error.message, error)
        await ctx.api.sendMessage(imp.blackberry, `(Pipy channel forward ban): ${error.message}`).catch(e => { })
    }

    return true
}


module.exports = {
    banChannelForwarder
}