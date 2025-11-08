const router = require('express').Router()
const elimit = require('express-rate-limit')
const vyuo_deg_db = require('../model/vyuo-degree')
const mkoa_db = require('../model/vyuo-degree')
const ds_users = require('../model/dramastore-users')
const bin_db = require('../model/bin')
const analytics = require('../model/analytics')
const graphModel = require('../model/graph-tips')

//times
const TimeAgo = require('javascript-time-ago')
const en = require('javascript-time-ago/locale/en')
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

const { Bot } = require('grammy')
const bot = new Bot(process.env.DS_TOKEN)
const bot_oh = new Bot(process.env.OH_TOKEN)

//others
const oh_vids = require('../model/ohmy-vids')
const { extractMyBetsToday } = require('../bots/regibot/fns/scheduled-odds')
const { correctScoreFn } = require('../bots/regibot/fns/correct-score')
const { scrapeBetimateBothToScore } = require('../bots/regibot/fns/Betimate')
const { checkOdds, checkTomorrowOdds, checkMatokeoJana } = require('../bots/regibot/fns/passionpredict')
const { downloadTikTok } = require('./functions/TikTokDownload')

//send success (no content) response to browser
const limiter = elimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15, // Limit each IP to 15 requests per `window` (here, per 1 minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "To many request, please try again after 3 minutes"
})
router.use(limiter)

router.get('/favicon.ico', (req, res) => res.status(204).end());

router.get('/', async (req, res) => {
    try {
        let vyuo_deg_db = await mkoa_db.find().sort('name')
        let vyuo = []
        vyuo_deg_db.forEach(chuo => {
            vyuo.push(
                { name: chuo.name, code: chuo.code, own: chuo.owner, type: chuo.type, loc: chuo.location }
            )
        })
        res.render('1-home/home', { vyuo })
    } catch (err) {
        console.log(err)
        console.log(err.message)
    }

})

router.get('/latra', (req, res) => {
    res.redirect('https://www.latra.go.tz/')
})

router.get('/privacy', (req, res) => {
    res.render('zzzpages/privacy')
})

router.get('/terms', (req, res) => {
    res.render('zzzpages/terms')
})

router.get('/disclaimer', (req, res) => {
    res.render('zzzpages/disclaimer')
})

router.get('/contact', (req, res) => {
    res.render('zzzpages/contact')
})

router.get('/about', (req, res) => {
    res.render('zzzpages/about')
})

router.get('/blog', (req, res) => {
    res.redirect(301, '/')
})

router.get('/withdraw-tax-1xbet-tanzania', (req, res) => {
    res.render('7-1xbet/calc')
})

router.get(['/blog/post.html', '/blog/post'], async (req, res) => {
    let vyuo_count = await vyuo_deg_db.countDocuments()
    let rand = Math.floor(Math.random() * vyuo_count)
    let rand_chuo = await vyuo_deg_db.findOne().skip(rand)
    res.render('3-landing/land', { rand_chuo })
})

router.get(['/pages/telegram.html', '/pages/telegram', '/pages/oh-telegram', '/pages/oh-telegram.html'], (req, res) => {
    res.render('4-old-landing/land')
})

router.get('/req/:uid/:msgid', async (req, res) => {
    let userId = Number(req.params.uid.trim())
    let msgid = Number(req.params.msgid.trim())

    try {
        let bin = await bin_db.findOne({ uid: `${userId}`, mid: `${msgid}`, ch: 'ds' })
        if (!bin) {
            await bot.api.copyMessage(userId, -1001239425048, msgid)
            let user = await ds_users.findOneAndUpdate({ userId }, { $inc: { downloaded: 1 } }, { new: true })
            await bin_db.create({ uid: `${userId}`, mid: `${msgid}`, ch: 'ds' })
            await analytics.findOneAndUpdate({}, { $inc: { times: 1 } })
            console.log(`${user.fname} - Got episode by req`)
        }
        res.redirect(`/dramastore/success/${userId}`)
    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.send('<h2 style="color: red;">Error:... </h2> ' + err.message)
    }
})

router.get('/dramastore/success/:userId', async (req, res) => {
    let userId = req.params.userId

    try {
        let user = await ds_users.findOne({ userId })
        let users = await ds_users.find().sort('-downloaded').select('fname downloaded updatedAt userId').limit(1000)
        let wote = []
        for (let huyu of users) {
            if (huyu.userId == 1473393723) {
                wote.push({ fname: huyu.fname, downloaded: huyu.downloaded, last: '🤪🤪🤪' })
            } else {
                wote.push({ fname: huyu.fname, downloaded: huyu.downloaded, last: timeAgo.format(new Date(huyu.updatedAt)) })
            }
        }
        let all_users = await ds_users.find().sort('-downloaded').select('fname downloaded')
        let rnk = all_users.findIndex(d => d.fname == user.fname) + 1
        res.render('5-epsent/sent', { user, wote, rnk })
    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.send('<h2 style="color: red;">Error:... </h2> ' + err.message)
    }
})

router.get('/oh-req/:uid/:mid', async (req, res) => {
    let userId = Number(req.params.uid.trim())
    let msgId = Number(req.params.mid.trim())

    try {
        let check_bin = await bin_db.findOne({ uid: `${userId}`, mid: `${msgId}`, ch: 'oh' })
        if (!check_bin) {
            await bot_oh.api.copyMessage(userId, -1001586042518, msgId)
            await bin_db.create({ uid: `${userId}`, mid: `${msgId}`, ch: 'oh' })
            console.log(userId + " - Got porn by req")
        }
        res.redirect(`/ohmy-channel/success/${userId}`)
    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.send('<h2 style="color: red;">Error:... </h2> ' + err.message)
    }
})

router.get('/ohmy-channel/success/:uid', async (req, res) => {
    let userId = Number(req.params.uid.trim())
    res.render('6-showsent/sent', { userId })
})

router.get('/mkekawaleo/tanzania', async (req, res) => {
    try {
        res.redirect('http://mkekawaleo.com/betslip/leo')
        await graphModel.findOneAndUpdate({ siku: '22/04/2023' }, { $inc: { loaded: 1 } })
    } catch (err) {
        console.log(err.message)
    }
})

router.get('/ohmy/:chatid/:nano', async (req, res) => {
    let chatid = req.params.chatid
    let nano = req.params.nano

    const offers = {
        adult_games_smrt: `https://redirecting5.eu/p/tveg/GFOt/46RX`,
        sexEmu: `https://redirecting5.eu/p/tveg/7G3I/m8RG`,
        adul_dating: `https://leadmy.pl/p/tveg/7mhb/BDLj`,
        crckR_smrt_lnk: `https://t.assxm.link/153258/3785/0?bo=2753,2754,2755,2756&source=ohmy&po=6456`
    }

    try {
        let ohmyDB = -1001586042518
        let shemdoe = 741815228

        res.redirect(offers.crckR_smrt_lnk)
        let vid = await oh_vids.findOne({ nano })
        setTimeout(() => {
            bot_oh.api.copyMessage(Number(chatid), ohmyDB, vid.msgId, {
                reply_markup: {
                    parse_mode: 'HTML',
                    inline_keyboard: [[
                        { text: 'Join Here For More...', url: 'https://t.me/+TCbCXgoThW0xOThk' }
                    ]]
                }
            })
                .then(() => console.log('Video sent by req'))
                .catch(async (err) => {
                    await bot.api.sendMessage(shemdoe, 'Web Req: ' + err.message)
                        .catch(e => console.log(e.message))
                })
        }, 10000)

    } catch (error) {
        console.log(`${error.message} on nano: "${nano}" for user "${chatid}"`)
    }
})

router.get('/:code', async (req, res) => {
    let code = req.params.code

    try {
        let chuo = await vyuo_deg_db.findOne({ code })
        let all = await vyuo_deg_db.find().sort('name').select('name code')
        if (!chuo) {
            res.sendStatus(404)
        } else {
            res.render('2-chuo/chuo', { chuo, all })
        }
    } catch (err) {
        console.log(err)
        console.log(err.message)
    }
})

router.get('/API/testing', async (req, res) => {
    try {
        res.end()
    } catch (err) {
        console.log(err)
        console.log(err.message)
        res.end()
    }
})

//this all placed on post requests because it is the last on our index.js
router.get('*', (req, res) => {
    res.sendStatus(404)
})

module.exports = router