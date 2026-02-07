const txtArr = async (txt, call_sendMikeka_functions, bot, ctx, imp, userid, username, mid, mkArrs, delay, rp_id) => {
    const mikekaFns = require('./mkeka-1-2-3')
    try {
        switch (txt) {
            case 'MKEKA 1':
                if (ctx.chat.type == 'private') {
                    await call_sendMikeka_functions.sendMkeka1(ctx, delay, bot, imp, rp_id,);
                }
                break;
            case 'MKEKA 2':
                if (ctx.chat.type == 'private') {
                    await call_sendMikeka_functions.sendMkeka2(ctx, delay, bot, imp, rp_id);
                }
                break;
            case 'MKEKA 3':
                if (ctx.chat.type == 'private') {
                    await call_sendMikeka_functions.sendMkeka3(ctx, delay, bot, imp, rp_id);
                }
                break;
            case '💯 BetWinner App (200% Bonus)':
                await bot.api.copyMessage(userid, imp.rtcopyDB, 23);
                break;
            case '👑 SUPATIPS':
                await call_sendMikeka_functions.supatips(ctx, bot, delay, imp);
                break;
            case '💡 MSAADA':
                await bot.api.copyMessage(ctx.chat.id, imp.mikekaDB, 481);
                break;
            case '🔥 MIKEKA YA UHAKIKA LEO 💰':
                await bot.api.copyMessage(ctx.chat.id, imp.mikekaDB, 592);
                break;
            default:
                //check if ni mkeka anataka
                if ( txt && mkArrs.some(m => txt.toLowerCase().includes(m))) {
                    await ctx.replyWithChatAction('typing');
                    await delay(1000);
                    await bot.api.copyMessage(userid, imp.pzone, 7664);
                }
        }
    } catch (error) {
        console.log(error.message, error)
    }
}

module.exports = {
    switchTxt: txtArr
}