const { default: axios } = require('axios');
const cheerio = require('cheerio');
const { GetJsDate, GetDayFromDateString, GMTTimeToGMT3, mmddyyyy_to_ddmmyyyy } = require('./weekday');
const betiMateBTTSModel = require('../database/betimates');

const BASE_URL = 'https://betimate.com/en/football-predictions/both-to-score?';
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY

const scrapeBetimateBothToScore = async (jsDate) => {
    try {
        const url = BASE_URL+jsDate
        const html = await axios.get(`https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURI(url)}`);
        const $ = cheerio.load(html.data);

        const matches = [];

        $('.predictions-table').each((_, table) => {
            const league = $(table).find('.home-league-title a').text().trim();

            $(table).find('.prediction-body').each((_, body) => {
                const home = $(body).find('.homeTeam').text().trim();
                const away = $(body).find('.awayTeam').text().trim();
                const match = `${home} vs ${away}`;

                const time = $(body).find('time.date_bah').text()?.split(' ')[1].trim()
                const date = $(body).find('time.date_bah').text()?.split(' ')[0].trim()
                date = mmddyyyy_to_ddmmyyyy(date)
                const noText = $(body).find('.probability-sub').eq(0).text().trim();
                const yesText = $(body).find('.probability-sub').eq(1).text().trim();

                const yesPercent = parseInt(yesText);
                const noPercent = parseInt(noText);

                let tip = '';
                if (yesPercent >= 75) tip = 'GG';
                else if (noPercent >= 75) tip = 'NG';

                if (tip) {
                    matches.push({
                        league,
                        match,
                        time: GMTTimeToGMT3(time),
                        date,
                        yesPercent,
                        noPercent,
                        bet: tip,
                        jsDate,
                        weekday: GetDayFromDateString(date)
                    });
                }
            });
        });

        if (matches.length > 1) await betiMateBTTSModel.deleteMany({jsDate});
        await betiMateBTTSModel.insertMany(matches)
        console.log(`${matches.length} Betimate BTTS Saved`)
    } catch (error) {
        console.error('Error scraping:', error.message);
        return [];
    }
}

module.exports = {
    scrapeBetimateBothToScore
}