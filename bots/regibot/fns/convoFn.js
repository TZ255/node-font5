const nyumbuModel = require("../database/chats");

const makeConvo = async (bot, ctx, imp, defaultReplyMkp) => {
    const admins = [imp.halot, imp.shemdoe];

    if (!admins.includes(ctx.chat.id) || !ctx.match) {
        return await ctx.reply('Not admin or no match');
    }

    const msg_id = Number(ctx.match.trim());
    const mikekaDB = imp.mikekaDB;
    const bads = ['deactivated', 'blocked', 'initiate', 'chat not found'];

    try {
        const all_users = await nyumbuModel.find({ refferer: "Regina" })
        await ctx.reply(`🚀 Starting broadcasting for ${all_users.length} users`);

        for (const user of all_users) {
            const chatid = user.chatid;

            try {
                await bot.api.copyMessage(chatid, mikekaDB, msg_id, {reply_markup: defaultReplyMkp});
            } catch (err) {
                const errorMsg = err?.message?.toLowerCase() || '';
                console.log(err?.message || 'Unknown error');

                if (bads.some((b) => errorMsg.includes(b))) {
                    await nyumbuModel.findOneAndDelete({ chatid });
                    console.log(`🗑 Regi User ${chatid} deleted for ${errorMsg}`);
                } else {
                    console.log(`🤷‍♂️ Regi Unexpected error for ${chatid}: ${err.message}`);
                }
            }
        }

        return await ctx.reply('✅ Finished broadcasting');
    } catch (err) {
        console.error('Broadcasting error:', err?.message || err);
        await ctx.reply('❌ Broadcasting failed');
    }
};

module.exports = makeConvo;
