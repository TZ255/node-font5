//midds
const cheerio = require('cheerio')
const axios = require('axios').default
const { nanoid } = require('nanoid')

const PassionUnder35Model = require('../database/pp-u35')

//function to capitalize
const capitalizeTip = (tip) => {
    switch (tip) {
        case 'under 3.5':
            return 'Under 3.5';
        case 'over 3.5':
            return 'Over 3.5';
    }
}

const checkOdds = async (bot, imp) => {
    try {
        //today date in yyyy-mm-dd +3
        let tdate = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' })
        //today date in dd/mm/yy +3
        let siku = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

        let sup_url = `https://passionpredict.com/under-3-5-goals?dt=${tdate}`
        let html = await axios.get(sup_url)
        let $ = cheerio.load(html.data)

        //check our odds length
        let ourDb = await PassionUnder35Model.find({ siku })

        //fetch PassionPredict table
        let tday_table = $(`.container .row .tabs section:nth-of-type(2) table tbody tr`)

        //compare length
        if (tday_table && ourDb.length < tday_table.length) {
            await PassionUnder35Model.deleteMany({ siku })
            tday_table.each(async (i, el) => {
                let time_data = $('td:nth-child(1)', el).text().trim()
                let time_arr = time_data.split(':')
                let hrs = Number(time_arr[0])
                let min = time_arr[1]
                let actual_time = hrs + 2
                if (actual_time >= 24) {
                    actual_time = `23`
                    min = '59'
                }
                String(actual_time).padStart(2, '0')
                let time = `${actual_time}:${min}`
                let nano = nanoid(4)

                let league = $('td:nth-child(2)', el).text().trim()
                let match = $('td:nth-child(3)', el).text().trim()

                //(?=\s) - This is a +ve lookahead that ensures there's a whitespace or \n after VS
                //(?<=\s) - This is a +ve lookbehind that ensures there's a whitespace or \n after VS
                match = match.replace(/\s+VS\s+/gi, ' - ')

                //for testing before production
                if (process.env.ENVIRONMENT === 'local') {
                    console.log(match)
                }
                let tip = $('td:nth-child(4)', el).text().trim()
                tip = capitalizeTip(tip)

                //check if we have match the add to database
                if (match.length > 5) {
                    await PassionUnder35Model.create({
                        time, siku, league, match, tip, nano
                    })
                }
            })
            await bot.api.sendMessage(imp.shemdoe, `PassionPredict found and created`)
        } else {
            await bot.api.sendMessage(imp.shemdoe, `PassionPredict - nothing found\n\n Our Length: ${ourDb.length}\nHer Length: ${tday_table.length}`)
        }
    } catch (err) {
        console.error(err)
        await bot.api.sendMessage(imp.shemdoe, 'Not getting odds... ' + err.message)
    }
}

const checkTomorrowOdds = async (bot, imp) => {
    try {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1)

        //tomorrow date in yyyy-mm-dd +3
        let tdate = tomorrow.toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' })
        //tomorrow date in dd/mm/yy +3
        let siku = tomorrow.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

        let sup_url = `https://passionpredict.com/under-3-5-goals?dt=${tdate}`

        let html = await axios.get(sup_url)
        let $ = cheerio.load(html.data)

        //check our odds length
        let ourDb = await PassionUnder35Model.find({ siku })

        //fetch PassionPredict table
        let tday_table = $(`.container .row .tabs section:nth-of-type(3) table tbody tr`)

        //compare length
        if (tday_table && ourDb.length < tday_table.length) {
            await PassionUnder35Model.deleteMany({ siku })
            tday_table.each(async (i, el) => {
                let time_data = $('td:nth-child(1)', el).text().trim()
                let time_arr = time_data.split(':')
                let hrs = Number(time_arr[0])
                let min = time_arr[1]
                let actual_time = String(hrs + 2).padStart(2, '0')
                if (actual_time >= 24) {
                    actual_time = `23`
                    min = '59'
                }
                let time = `${actual_time}:${min}`
                let nano = nanoid(4)

                let league = $('td:nth-child(2)', el).text().trim()
                let match = $('td:nth-child(3)', el).text().trim()
                match = match.replace(/\s+VS\s+/gi, ' - ')
                //for testing before production
                if (process.env.ENVIRONMENT === 'local') {
                    console.log(match)
                }
                let tip = $('td:nth-child(4)', el).text().trim()
                tip = capitalizeTip(tip)

                //check if we have match the add to database
                if (match.length > 5) {
                    await PassionUnder35Model.create({
                        time, siku, league, match, tip, nano
                    })
                }
            })
            await bot.api.sendMessage(imp.shemdoe, `PassionPredict tomorrow found and created`)
        } else {
            await bot.api.sendMessage(imp.shemdoe, `PassionPredict - nothing found\n\n Our Length: ${ourDb.length}\nHer Length: ${tday_table.length}`)
        }
    } catch (err) {
        console.error(err)
        await bot.api.sendMessage(imp.shemdoe, 'Not getting odds... ' + err.message)
    }
}

const checkMatokeoJana = async (bot, imp) => {
    try {
        let today = new Date();
        today.setDate(today.getDate() - 1);

        //today date in yyyy-mm-dd +3
        let ydate = today.toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' })
        //today date in dd/mm/yy +3
        let siku = today.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

        let sup_url = `https://passionpredict.com/under-3-5-goals?dt=${ydate}`

        let html = await axios.get(sup_url)
        let $ = cheerio.load(html.data)

        //fetch PassionPredict table
        let yday_table = $(`.container .row .tabs section:nth-of-type(1) table tbody tr`)

        //compare length
        if (yday_table && yday_table.length > 1) {
            yday_table.each(async (i, el) => {
                let match = $('td:nth-child(2)', el).text().trim()
                match = match.replace(/\s+VS\s+/gi, ' - ')
                let matokeo = $('td:nth-child(4)', el).text().trim().replace(/\s+/g, '')
                //for testingbefore production
                if (process.env.ENVIRONMENT === 'local') {
                    console.log(matokeo)
                }
                //update table
                let data = await PassionUnder35Model.findOne({ match, siku })
                if (data && (data.matokeo == '-:-' || data.matokeo == ':') && matokeo != ':') {
                    await data.updateOne({ $set: { matokeo } })
                }
            })
        } else {
            await bot.api.sendMessage(imp.shemdoe, `PassionPredict - no yesterday results`)
        }
    } catch (err) {
        console.error(err)
        await bot.api.sendMessage(imp.shemdoe, 'Not getting odds... ' + err.message)
    }
}



module.exports = {
    checkOdds, checkTomorrowOdds, checkMatokeoJana
}