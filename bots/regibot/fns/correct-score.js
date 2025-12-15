//midds
const cheerio = require('cheerio')
const axios = require('axios')
const { nanoid } = require('nanoid')

const correctScoreModel = require('../database/cscore')
const bin_correctScoreModel = require('../database/supatips-bin')
const tg_slips = require('../database/tg_slips')
const { GetJsDate, GetDayFromDateString } = require('./weekday')

//MyBetsToday correctscore
async function correctScoreFn(path, trh) {
    try {
        const url = `https://www.mybets.today/${path}`
        const { data: html } = await axios.get(url, {
            headers: {
                // Some sites only respond correctly when a browser-like UA is sent
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
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
                    const timeElement = $element.find('.timediv');
                    let time = timeElement.text().trim();

                    // Add 3 hours to the time
                    const [hours, minutes] = time.split(':').map(Number);
                    let newHours = (hours + 3) % 24;
                    newHours = newHours < 10 ? '0' + newHours : newHours;
                    const formattedTime = `${newHours}:${minutes < 10 ? '0' + minutes : minutes}`;

                    // Extract home and away teams
                    const homeTeam = $element.find('.homediv .homeTeam .homespan').text().trim();
                    const awayTeam = $element.find('.awaydiv .awayTeam .awayspan').text().trim();
                    const tip = $element.find('.tipdiv').text().trim();
                    const prediction_url = $element.find('a.linkgames').attr('href');

                    let nano = nanoid(6)

                    //check the length of time, if good push it
                    if (formattedTime.length == 5) {
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
            }
        });

        let db_length = await correctScoreModel.countDocuments({ siku: trh })
        if (results.length > 0 && (db_length != results.length)) {
            await correctScoreModel.deleteMany({ siku: trh })
            await correctScoreModel.insertMany(results)
            console.log(`${results.length} CorrectScore matches fetched and inserted to db successfully for ${trh}`)
        }
    } catch (error) {
        console.error('Error fetching or processing data:', error);
    }
}

module.exports = {
    correctScoreFn
}