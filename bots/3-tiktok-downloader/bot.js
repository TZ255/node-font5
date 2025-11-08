const { Bot, webhookCallback, InlineKeyboard, InputFile } = require('grammy')
const { limit } = require("@grammyjs/ratelimiter");
const { hydrateReply, parseMode } = require("@grammyjs/parse-mode")
const UsersModel = require('./databases/users');
const { downloadTikTok } = require('../../routes/functions/TikTokDownload');

const TikTokDownloaderBot = async (app) => {
    try {
        const bot = new Bot(process.env.TIKTOK_BOT)

        //setwebhook
        let hookPath = `/telebot/${process.env.USER}/tiktokbot`
        app.use(hookPath, webhookCallback(bot, 'express'))
        await bot.api.setWebhook(`https://${process.env.DOMAIN}${hookPath}`)
            .then(() => console.log(`hook for AutoAcceptor is set`))
            .catch(e => console.log(e.message))

        //ratelimit 1 msg per 3 seconds
        bot.use(limit({ timeFrame: 3000, limit: 1 }))

        //install the hydratereply plugin
        bot.use(hydrateReply);

        // Set the default parse mode for ctx.reply.
        bot.api.config.use(parseMode("HTML"));

        bot.catch((err) => {
            const ctx = err.ctx;
            console.error(err.message, err);
        });

        bot.command("start", async (ctx) => {
            try {
                if (ctx.chat.type == 'private') {
                    const { first_name, id } = ctx.chat
                    let botname = ctx.me.username

                    //update user informations if not upsert
                    await UsersModel.findOneAndUpdate(
                        { chatid: id },
                        { $set: { first_name, chatid: id } },
                        { upsert: true }
                    )

                    await ctx.reply(`Hi there! \n👋 Welcome!  \n\nJust send me a TikTok video link and I’ll download it for you without a watermark 🎥✨\n\nExample:\n<code>https://vm.tiktok.com/ZMAduTudCU</code>`);
                }
            } catch (error) {
                console.error(error.message, error)
            }
        });


        bot.on('message:text', async (ctx) => {
            try {
                if (ctx.chat.type == 'private') {
                    const { first_name, id } = ctx.chat
                    let botname = ctx.me.username
                    let text = ctx.message.text

                    //update user informations if not upsert
                    await UsersModel.findOneAndUpdate(
                        { chatid: id },
                        { $set: { first_name, chatid: id } },
                        { upsert: true }
                    )

                    if (!text.startsWith('https://')) {
                        return await ctx.reply(`Hi there! \n\nJust send me a TikTok video link and I’ll download it for you without a watermark 🎥✨\n\nExample:\n<code>https://vm.tiktok.com/ZMAduTudCU/</code>`);
                    }

                    const tik = await downloadTikTok(text.trim())
                    if(tik.success === false) {
                        return await ctx.reply(tik.message)
                    }

                    await ctx.replyWithChatAction('upload_video')

                    return await ctx.replyWithVideo(tik.video, {
                        parse_mode: 'HTML',
                        caption: tik.caption + `\n\nDownloaded From: <b>DownloadFromTikTokerBot</b>`
                    })
                }
            } catch (error) {
                console.error(error)
            }
        })
    } catch (error) {
        console.log(error.message, error)
    }
}


module.exports = {
    TikTokDownloaderBot
}