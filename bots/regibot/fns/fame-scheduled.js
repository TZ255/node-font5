//midds
const cheerio = require('cheerio')
const axios = require('axios').default
const { nanoid } = require('nanoid')

const fametips_Model = require('../database/fametips')


const famecheckOdds = async (bot, imp, tablehusika, siku) => {
    try {
        let fame_url = `https://www.tipsfame.com/`

        let html = await axios.get(fame_url)
        let $ = cheerio.load(html.data)

        let text = ''
        let nanoArr = ''

        //check our odds length
        let ourDb = await fametips_Model.find({ siku })

        //fetch fametips table
        let tday_trs = $(`#pills-tabContent ${tablehusika} table tbody tr`)

        //compare length
        if (tday_trs && tday_trs.length > 1) {
            await fametips_Model.deleteMany({ siku })
            tday_trs.each(async (i, el) => {
                let time_data = $('td:nth-child(1)', el).text()
                let time_arr = time_data.split(':')
                let hrs = Number(time_arr[0])
                let actual_time = hrs + 2
                if (actual_time > 24) {
                    actual_time = '0' + (actual_time - 25)
                }
                let min = time_arr[1]
                let time = `${actual_time}:${min}`

                let mwk = Number(siku.split('/')[2])
                let mwz = Number(siku.split('/')[1])
                let trh = Number(siku.split('/')[0])
                let nano = nanoid(4)
                let UTC3 = Date.UTC(mwk, mwz - 1, trh, actual_time, Number(min))

                let league = $('td:nth-child(2)', el).text().trim()
                let match = $('td:nth-child(3)', el).text().trim()
                match = match.replace(/\s*VS\s*/gi, ' - ')

                let tip = $('td:nth-child(4)', el).text().trim()
                let matokeo = $('td:nth-child(5)', el).text().trim()
                matokeo = matokeo.replace(/\n/g, '')
                if (matokeo.length < 2) {
                    matokeo = '-:-'
                }

                //create text
                text = text + `⌚ ${time}, ${league}\n<b>⚽ ${match}</b>\n🎯 Tip: <b>${tip} (${matokeo})</b>\n\n`
                if (i == tday_trs.length - 1) {
                    nanoArr = nanoArr + `${nano}`
                } else {
                    nanoArr = nanoArr + `${nano}+`
                }

                await fametips_Model.create({
                    time, league, match, tip, siku, nano, matokeo, UTC3
                })
            })

            await bot.api.sendMessage(imp.shemdoe, `Fames: New matches found and mkeka created successfully\n\n` + text + `Arrs: ${nanoArr}`, {
                parse_mode: 'HTML'
            })
        } else {
            await bot.api.sendMessage(imp.shemdoe, `Fame: Automatic fetcher run and nothing found\n\n Our Length: ${ourDb.length}\nHer Length: ${tday_trs.length}`)
        }
    } catch (err) {
        await bot.api.sendMessage(imp.shemdoe, 'Not getting odds... ' + err.message)
    }
}

const famecheckMatokeo = async (bot, imp, tablehusika, siku) => {
    try {
        let sup_url = `https://www.tipsfame.com/`

        let html = await axios.get(sup_url)
        let $ = cheerio.load(html.data)

        //fetch supatips today table
        let tday_trs = $(`#pills-tabContent ${tablehusika} table tbody tr`)

        tday_trs.each(async (i, el) => {
            let match = $('td:nth-child(3)', el).text().trim()
            match = match.replace(/\s*VS\s*/gi, ' - '); // replace vs with - (* any spaces follow)
            let matokeo = $('td:nth-child(5)', el).text().trim().replace(/\n/g, '')
            //check matokeo, if updated, update
            if (matokeo.length > 2) {
                let mtch = await fametips_Model.findOne({ match, siku })
                if (mtch.matokeo == '-:-') {
                    await mtch.updateOne({ $set: { matokeo } })
                }
            }
        })
        
    } catch (err) {
        await bot.api.sendMessage(imp.shemdoe, 'Not getting odds... ' + err.message)
    }
}

module.exports = {
    famecheckOdds,
    famecheckMatokeo
}