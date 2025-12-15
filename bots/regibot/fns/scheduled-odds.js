//midds
const cheerio = require('cheerio')
const axios = require('axios')
const { nanoid } = require('nanoid')

const supatips_Model = require('../database/supatips')
const { GetJsDate, GetDayFromDateString } = require('./weekday')


//Mutating.com
async function extractMutatingTips(path, trh) {
    try {
        const url = `https://www.mutating.com/${path}`
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
        const normalizeText = (text) => (text || '').replace(/\s+/g, ' ').trim();
        const toTitleCase = (text) => {
            const cleaned = normalizeText(text).toLowerCase();
            return cleaned.split(' ').map(word =>
                word.split('-').map(w => w ? w[0].toUpperCase() + w.slice(1) : '').join('-')
            ).join(' ');
        };

        //empty results
        results.length = 0

        let currentLeague = null;

        $('main #myULis > section').each((_, section) => {
            const $section = $(section);
            const country = toTitleCase($section.find('.leaguediv .countrieslist').first().text());
            const leagueName = toTitleCase($section.find('.leaguediv .leagueslist').first().text());
            currentLeague = leagueName && country ? `${country} - ${leagueName}` : leagueName || country || null;

            if (!currentLeague) return;

            $section.find('a:has(.gamdediv)').each((__, matchAnchor) => {
                const $match = $(matchAnchor);
                const timeText = normalizeText($match.find('.w60 .nostart div[id]').first().text());
                const [hours, minutes] = timeText.split(':').map(Number);
                if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

                let newHours = (hours + 3) % 24;
                newHours = newHours < 10 ? '0' + newHours : newHours;
                const formattedTime = `${newHours}:${minutes < 10 ? '0' + minutes : minutes}`;

                const homeTeam = normalizeText($match.find('[id^="winclasshome"]').first().text());
                const awayTeam = normalizeText($match.find('[id^="winclassaway"]').first().text());
                const tip = normalizeText($match.find('.w80.predip').first().text());
                const prediction_url = $match.attr('href');

                if (!homeTeam || !awayTeam || !tip || !prediction_url) return;

                let nano = nanoid(6)

                if (!tip.toLowerCase().startsWith('calc')) {
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
            });
        });

        let db_length = await supatips_Model.countDocuments({ siku: trh })
        if (results.length > 0 && (db_length != results.length)) {
            await supatips_Model.deleteMany({ siku: trh })
            await supatips_Model.insertMany(results)
            console.log(`${results.length} Mutating.com tips fetched successfully for ${trh}`)
        } else {
            console.log(`No new Mutating.com tips to update for ${trh}. Existing records: ${db_length}, Fetched records: ${results.length}`)
        }
    } catch (error) {
        console.error('Error fetching or processing data:', error);
    }
}

module.exports = {
    extractMutatingTips
}
