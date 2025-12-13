// midds
const cheerio = require('cheerio')
const axios = require('axios').default
const { nanoid } = require('nanoid')

const fametips_Model = require('../database/fametips')

// small helper for zero-padding
const pad2 = (n) => n.toString().padStart(2, '0');

const famecheckOdds = async (tablehusika, siku) => {
    try {
        const fame_url = 'https://www.tipsfame.com/'

        const html = await axios.get(fame_url, {
            headers: {
                // Some sites only respond correctly when a browser-like UA is sent
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        })

        const $ = cheerio.load(html.data)

        // fetch fametips table rows
        const tday_trs = $(`${tablehusika} table tbody tr`).toArray()

        if (!tday_trs || tday_trs.length < 1) {
            console.log(`Fame: Automatic fetcher run and nothing found for ${siku}`)
            return
        }

        // parse siku "dd/mm/yyyy" once
        const [dayStr, monthStr, yearStr] = siku.split('/')
        const day = Number(dayStr)
        const month = Number(monthStr) // 1–12
        const year = Number(yearStr)

        if (!day || !month || !year) {
            console.log(`Fame: Invalid siku format "${siku}", expected dd/mm/yyyy`)
            return
        }

        // clear old docs for this date, then insert fresh ones
        await fametips_Model.deleteMany({ siku })

        const docsToInsert = []

        for (const el of tday_trs) {
            const $el = $(el)

            // time col: td:nth-child(1)
            const time_data = $el.find('td').eq(0).text().trim()
            if (!time_data || !time_data.includes(':')) {
                // skip header or weird rows
                continue
            }

            const [hourStr, minuteStr] = time_data.split(':').map(t => t.trim())
            let hour = Number(hourStr)
            const minute = Number(minuteStr)

            if (Number.isNaN(hour) || Number.isNaN(minute)) {
                continue
            }

            // add +2 hours, wrap around 24h
            hour = (hour + 2) % 24

            const time = `${pad2(hour)}:${pad2(minute)}`

            const league = $el.find('td').eq(1).text().trim()

            let match = $el.find('td').eq(2).text().trim()
            match = match.replace(/\s*VS\s*/gi, ' - ')

            const tip = $el.find('td').eq(3).text().trim()

            // result (matokeo)
            let matokeo = $el.find('td').eq(4).text()
            matokeo = matokeo.replace(/\s+/g, '').trim()
            if (matokeo.length < 3) {
                matokeo = '-:-'
            }

            const UTC3 = Date.UTC(year, month - 1, day, hour, minute)
            const nano = nanoid(4)

            docsToInsert.push({
                time,
                league,
                match,
                tip,
                siku,
                nano,
                matokeo,
                UTC3
            })
        }

        if (!docsToInsert.length) {
            console.log(`Fame: No valid rows parsed for ${siku}`)
            return
        }

        await fametips_Model.insertMany(docsToInsert)
        console.log(
            `Fames: ${docsToInsert.length} matches found and mkeka created successfully for ${siku}`
        )
    } catch (err) {
        console.log('Fame: Not getting odds:', err.message)
    }
}

const famecheckMatokeo = async (tablehusika, siku) => {
    try {
        const sup_url = 'https://www.tipsfame.com/'

        const html = await axios.get(sup_url, {
            headers: {
                // Some sites only respond correctly when a browser-like UA is sent
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        })

        const $ = cheerio.load(html.data)

        const tday_trs = $(`${tablehusika} table tbody tr`).toArray()

        for (const el of tday_trs) {
            const $el = $(el)

            let match = $el.find('td').eq(2).text().trim()
            match = match.replace(/\s*VS\s*/gi, ' - ')

            let matokeo = $el.find('td').eq(4).text()
            matokeo = matokeo.replace(/\s+/g, '').trim()

            // only care if matokeo looks like a score (e.g. "2:1")
            if (matokeo.length > 2) {
                const mtch = await fametips_Model.findOne({ match, siku })
                if (!mtch) {
                    // not in our DB, skip quietly
                    continue
                }

                if (mtch.matokeo === '-:-' && mtch.matokeo !== matokeo) {
                    await mtch.updateOne({ $set: { matokeo } })
                    console.log(`Fame: Updated ${match} -> ${matokeo}`)
                }
            }
        }
    } catch (err) {
        console.log('Fame: Not getting results:', err.message)
    }
}

module.exports = {
    famecheckOdds,
    famecheckMatokeo
}
