//midds
const cheerio = require('cheerio')
const axios = require('axios').default
const { nanoid } = require('nanoid')

const supatips_Model = require('../database/supatips')
const bin_supatips_Model = require('../database/supatips-bin')
const tg_slips = require('../database/tg_slips')


const checkOdds = async (bot, imp, tablehusika, siku) => {
    try {
        let sup_url = `https://www.supatips.com/today-predictions`

        let html = await axios.get(sup_url)
        let $ = cheerio.load(html.data)

        let text = ''
        let nanoArr = ''

        //check our odds length
        let ourDb = await supatips_Model.find({ siku })

        //fetch supatips table
        let tday_table = $(`${tablehusika} table tbody`)

        //compare length
        if (ourDb.length < (tday_table.length)) {
            await supatips_Model.deleteMany({ siku })
            tday_table.each(async (i, el) => {
                if (i >= 0) {
                    let time_data = $('td:nth-child(1)', el).text().trim()
                    let time_arr = time_data.split(':')
                    let hrs = Number(time_arr[0])
                    let min = time_arr[1]
                    let actual_time = hrs + 2
                    if (actual_time >= 24) {
                        actual_time = `23`
                        min = '59'
                    } else if (actual_time.toString().length == 1) {
                        actual_time = '0' + actual_time
                    }
                    let time = `${actual_time}:${min}`
                    let nano = nanoid(4)

                    let league = $('td:nth-child(2)', el).text()
                    let match = $('td:nth-child(3)', el).text()
                    match = match.replace(/ vs /g, ' - ')
                    let tip = $('td:nth-child(4)', el).text()

                    //create text
                    text = text + `⌚ ${time}, ${league}\n<b>⚽ ${match}</b>\n🎯 Tip: <b>${tip}</b>\n\n`
                    if (i == tday_table.length - 1) {
                        nanoArr = nanoArr + `${nano}`
                    } else {
                        nanoArr = nanoArr + `${nano}+`
                    }

                    //check if we have match the add to database
                    if (match.length > 5) {
                        await supatips_Model.create({
                            time, siku, league, match, tip, nano
                        })
                    }
                }
            })

            await bot.api.sendMessage(imp.shemdoe, `New matches found and mkeka created successfully\n\n` + text + `Arrs: ${nanoArr}`, {
                parse_mode: 'HTML'
            })
        } else {
            await bot.api.sendMessage(imp.shemdoe, `Automatic fetcher run and nothing found\n\n Our Length: ${ourDb.length}\nHer Length: ${tday_table.length}`)
        }
    } catch (err) {
        await bot.api.sendMessage(imp.shemdoe, 'Not getting odds... ' + err.message)
    }
}

const checkMatokeo = async (bot, imp, tablehusika, siku) => {
    try {
        let sup_url = `https://www.supatips.com/today-predictions`

        let html = await axios.get(sup_url)
        let $ = cheerio.load(html.data)

        //fetch supatips today table
        let tday_table = $(`${tablehusika} table tbody`)

        tday_table.each(async (i, el) => {
            if (i > 1) {
                let time_data = $('td:nth-child(1)', el).text().trim()
                let time_arr = time_data.split(':')
                let hrs = Number(time_arr[0])
                let min = time_arr[1].trim()
                let actual_time = hrs + 2
                if (actual_time >= 24) {
                    actual_time = `23`
                    min = '59'
                }
                let time = `${actual_time}:${min}`
                let nano = nanoid(4)

                let league = $('td:nth-child(2)', el).text()
                let match = $('td:nth-child(3)', el).text()
                match = match.replace(/ vs /g, ' - ').replace(/ vs/g, ' - ')

                let tip = $('td:nth-child(4)', el).text()
                let matokeo = $('td:nth-child(5)', el).text()

                //check matokeo, if updated, update
                if (matokeo.length > 2) {
                    let mtch = await supatips_Model.findOne({ match, siku })
                    if (mtch.matokeo == '-:-') {
                        await mtch.updateOne({ $set: { matokeo } })
                        await bot.api.sendMessage(imp.shemdoe, `Results for ${mtch.match} updated to ${matokeo}`)
                    }
                }
            }

        })
    } catch (err) {
        await bot.api.sendMessage(imp.shemdoe, 'Not getting odds... ' + err.message)
    }
}

const check_waLeo = async (bot, imp, siku) => {
    try {
        let checker = await tg_slips.find({ siku })
        if (!checker) {
            await bot.api.sendMessage(imp.shemdoe, 'Nakukumbusha, Post Mkeka wa Leo. Una hadi 03:11')
        } else {
            for (let c of checker) {
                if (c.posted == false) {
                    await bot.api.copyMessage(imp.mkekaLeo, imp.mikekaDB, c.mid)
                    await c.updateOne({ $set: { posted: true } })
                }
            }
        }
    } catch (err) {
        console.log(err.message, err)
        await bot.api.sendMessage(imp.shemdoe, err.message)
            .catch(e => console.log(e.message))
    }
}

module.exports = {
    checkOdds,
    checkMatokeo,
    check_waLeo
}