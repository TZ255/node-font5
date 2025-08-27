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
        let tday_table = $(`main .container section:nth-of-type(1) section.grid`)

        //compare length
        if (tday_table && tday_table.length > 1) {
            await PassionUnder35Model.deleteMany({ siku })
            tday_table.each(async (i, el) => {
                let table_li = $('ul li', el)
                table_li.each(async (i, liEl) => {
                    let time_data = $('div:nth-child(1) div span', liEl).text().trim()
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

                    let league = $('div:nth-child(1) div p', el).text()
                        .replace(/\s+/g, ' ')          // collapse multiple spaces/newlines
                        .trim()                        // remove leading/trailing spaces
                        .replace(/^[:\s]+/, '');       // remove any leading colons or spaces
                    let home_team = $('div:nth-child(2) div:nth-child(1) p', liEl).text().trim()
                    let away_team = $('div:nth-child(2) div:nth-child(2) p', liEl).text().trim()
                    let match = `${home_team} - ${away_team}`

                    //results
                    let home_results = $('div:nth-child(3) div:nth-child(1)', liEl).text().trim()
                    let away_results = $('div:nth-child(3) div:nth-child(2)', liEl).text().trim()
                    let matokeo = `${home_results}:${away_results}`


                    //for testing before production
                    if (process.env.ENVIRONMENT === 'local') {
                        console.log(match)
                    }
                    let tip = $('div:nth-child(4)', liEl).text().trim()
                    let odds = $('div:nth-child(5)', liEl).text().trim()

                    //check if we have match the add to database
                    if (match.length > 5) {
                        await PassionUnder35Model.create({
                            time, siku, league, match, tip, nano, odds
                        })
                    }
                })
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
        let tday_table = $(`main .container section:nth-of-type(1) section.grid`)

        //compare length
        if (tday_table && tday_table.length > 1) {
            await PassionUnder35Model.deleteMany({ siku })
            tday_table.each(async (i, el) => {
                let table_li = $('ul li', el)
                table_li.each(async (i, liEl) => {
                    let time_data = $('div:nth-child(1) div span', liEl).text().trim()
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

                    let league = $('div:nth-child(1) div p', el).text()
                        .replace(/\s+/g, ' ')          // collapse multiple spaces/newlines
                        .trim()                        // remove leading/trailing spaces
                        .replace(/^[:\s]+/, '');       // remove any leading colons or spaces
                    let home_team = $('div:nth-child(2) div:nth-child(1) p', liEl).text().trim()
                    let away_team = $('div:nth-child(2) div:nth-child(2) p', liEl).text().trim()
                    let match = `${home_team} - ${away_team}`

                    //results
                    let home_results = $('div:nth-child(3) div:nth-child(1)', liEl).text().trim()
                    let away_results = $('div:nth-child(3) div:nth-child(2)', liEl).text().trim()
                    let matokeo = `${home_results}:${away_results}`


                    //for testing before production
                    if (process.env.ENVIRONMENT === 'local') {
                        console.log(match)
                    }
                    let tip = $('div:nth-child(4)', liEl).text().trim()
                    let odds = $('div:nth-child(5)', liEl).text().trim()

                    //check if we have match the add to database
                    if (match.length > 5) {
                        await PassionUnder35Model.create({
                            time, siku, league, match, tip, nano, odds
                        })
                        console.log(time, league, match, tip, odds)
                    }
                })
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
        let yday_table = $(`main .container section:nth-of-type(1) section.grid`)

        //compare length
        if (yday_table && yday_table.length > 1) {
            yday_table.each(async (i, el) => {
                let table_li = $('ul li', el)
                table_li.each(async (i, liEl) => {
                    let league = $('div:nth-child(1) div p', el).text()
                        .replace(/\s+/g, ' ')          // collapse multiple spaces/newlines
                        .trim()                        // remove leading/trailing spaces
                        .replace(/^[:\s]+/, '');       // remove any leading colons or spaces
                    let home_team = $('div:nth-child(2) div:nth-child(1) p', liEl).text().trim()
                    let away_team = $('div:nth-child(2) div:nth-child(2) p', liEl).text().trim()
                    let match = `${home_team} - ${away_team}`

                    //results
                    let home_results = $('div:nth-child(3) div:nth-child(1)', liEl).text().trim()
                    let away_results = $('div:nth-child(3) div:nth-child(2)', liEl).text().trim()
                    let matokeo = `${home_results}:${away_results}`

                    //update table
                    let data = await PassionUnder35Model.findOne({ match, siku })
                    if (data && (data.matokeo == '-:-' || data.matokeo == ':') && matokeo != ':') {
                        await data.updateOne({ $set: { matokeo } })
                        console.log(matokeo)
                    }
                })
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