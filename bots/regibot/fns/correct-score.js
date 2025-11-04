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
                            weekday: GetDayFromDateString(trh)
                        });
                    }
                }
            }
        });

        let db_length = await correctScoreModel.countDocuments({ siku: trh })
        if (results.length > 0 && (db_length != results.length)) {
            await correctScoreModel.deleteMany({ siku: trh })
            await correctScoreModel.insertMany(results)
            console.log('MyBetsToday CorrectScore Fetched successfully: ', trh)
        }
    } catch (error) {
        console.error('Error fetching or processing data:', error);
    }
}

module.exports = {
    correctScoreFn
}