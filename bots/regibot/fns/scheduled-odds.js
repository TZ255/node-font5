//midds
const cheerio = require('cheerio')
const axios = require('axios')
const { nanoid } = require('nanoid')

const supatips_Model = require('../database/supatips')
const bin_supatips_Model = require('../database/supatips-bin')
const tg_slips = require('../database/tg_slips')
const { GetJsDate, GetDayFromDateString } = require('./weekday')


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

//MyBetsToday
async function extractMyBetsToday(path, trh) {
    try {
        const url = `https://www.mybets.today/${path}`
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);
        const results = [];

        //empty results
        results.length = 0

        let currentLeague = null;

        $('article .listgames .titlegames, .listgames .event-fixtures').each((_, element) => {
            const $element = $(element);

            if ($element.hasClass('titlegames')) {
                // Extract the league name
                currentLeague = $element.find('.leaguename .link').text().trim();
            } else if ($element.hasClass('event-fixtures')) {
                if (currentLeague) {
                    // Extract time and date
                    const timeElement = $element.find('.timediv time');
                    let time = timeElement.text().trim();

                    // Add 3 hours to the time
                    const [hours, minutes] = time.split(':').map(Number);
                    let newHours = (hours + 3) % 24;
                    newHours = newHours < 10 ? '0' + newHours : newHours;
                    const formattedTime = `${newHours}:${minutes < 10 ? '0' + minutes : minutes}`;

                    // Extract home and away teams
                    const homeTeam = $element.find('.homediv .homeTeam .homespan').text().trim();
                    const awayTeam = $element.find('.awaydiv .awayTeam .awayspan').text().trim();
                    const tip = $element.find('.tipdiv span').text().trim();
                    const prediction_url = $element.find('a.linkgames').attr('href');

                    let nano = nanoid(6)

                    results.push({
                        league: currentLeague,
                        siku: trh,
                        time: formattedTime,
                        match: `${homeTeam} - ${awayTeam}`,
                        tip,
                        nano,
                        jsDate: GetJsDate(trh),
                        weekday: GetDayFromDateString(trh),
                        prediction_url
                    });
                }
            }
        });

        let db_length = await supatips_Model.countDocuments({siku: trh})
        if(results.length > 0 && (db_length != results.length)) {
            await supatips_Model.deleteMany({siku: trh})
            await supatips_Model.insertMany(results)
            console.log('MyBetsToday DirectWin Fetched successfully: ', trh)
        }
    } catch (error) {
        console.error('Error fetching or processing data:', error);
    }
}

module.exports = {
    checkOdds,
    checkMatokeo,
    check_waLeo,
    extractMyBetsToday
}