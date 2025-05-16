const dayoUsersModel = require('../database/chats');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeConvo = async (bot, ctx, imp, defaultReplyMkp) => {
    const admins = [imp.halot, imp.shemdoe];

    if (!admins.includes(ctx.chat.id) || !ctx.match) {
        return await ctx.reply('Not admin or no match');
    }

    const msg_id = Number(ctx.match.trim());
    if (isNaN(msg_id)) {
        return await ctx.reply('⚠ Invalid message ID.');
    }

    const mikekaDB = imp.mikekaDB;
    const bads = ['deactivated', 'blocked', 'initiate', 'chat not found'];

    try {
        const all_users = await dayoUsersModel.find({ refferer: "Dayo" }).select('chatid -_id');
        await ctx.reply(`🚀 Starting broadcasting for ${all_users.length} users`);

        const batchSize = 20;

        for (let i = 0; i < all_users.length; i += batchSize) {
            const batch = all_users.slice(i, i + batchSize);

            await Promise.all(batch.map(async user => {
                const chatid = user.chatid;

                try {
                    await bot.api.copyMessage(chatid, mikekaDB, msg_id, {
                        reply_markup: defaultReplyMkp
                    });
                } catch (err) {
                    const errorMsg = err?.message?.toLowerCase() || '';
                    console.log(err?.message || 'Unknown error');

                    if (bads.some(b => errorMsg.includes(b))) {
                        await dayoUsersModel.findOneAndDelete({ chatid });
                        console.log(`🗑 Dayo User ${chatid} deleted for ${errorMsg}`);
                    } else {
                        console.log(`🤷‍♂️ Dayo Unexpected error for ${chatid}: ${err.message}`);
                    }
                }
            }));

            await sleep(1000); // Delay between batches
        }

        return await ctx.reply('✅ Finished broadcasting');
    } catch (err) {
        console.error('Broadcasting error:', err?.message || err);
        await ctx.reply('❌ Broadcasting failed');
    }
};

module.exports = makeConvo;
