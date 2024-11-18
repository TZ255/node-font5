const PassionUnder35Model = require('../database/pp-u35')
const fametips_Model = require('../database/fametips')
const supatips_Model = require('../database/supatips')
const venas25Model = require('../database/venas25')
const venas15Model = require('../database/venas15')
const mkekaMega = require('../database/mkeka-mega')
const { default: axios } = require('axios')
const DBOT = process.env.DAYO_TOKEN

const QualityTipsCheck = async (bot, imp) => {
    //today date in dd/mm/yy +3
    let siku = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

    try {
        const models = [
            { name: "Passion Under 3.5", model: PassionUnder35Model, query: 'siku' },
            { name: "fametips", model: fametips_Model, query: 'siku' },
            { name: "supatips", model: supatips_Model, query: 'siku' },
            { name: "venas15", model: venas15Model, query: 'siku' },
            { name: "venas25", model: venas25Model, query: 'siku' },
            { name: "Mega Odds", model: mkekaMega, query: 'date' },
        ];

        for (const { name, model, query } of models) {
            const count = await model.countDocuments({ [query]: siku });
            if (count === 0) {
                let DURL = `https://api.telegram.org/bot${DBOT}/sendMessage`
                let text = `❌❌ No any matches for ${name}`
                await axios.post(DURL, {chat_id: imp.shemdoe, text})
            }
        }
    } catch (error) {
        console.log(error?.message)
    }
}

module.exports = {
    QualityTipsCheck
}
