const mongoose = require('mongoose')
const Schema = mongoose.Schema

const betiMateBtssSchema = new Schema({
    match: {type: String},
    league: {type: String},
    odds: {type: Number, default: 1},
    time: {type: String},
    date: {type: String},
    bet: {type: String},
    status: {type: String, default: 'Pending'},
    weekday: {type: String, default: 'unknown'},
    jsDate: {type: String, default: 'unknown'},
}, {strict: false, timestamps: true })

let mkeka_wa_leo = mongoose.connection.useDb('mkeka-wa-leo')
let betiMateBTTSModel = mkeka_wa_leo.model('betimate-btts', betiMateBtssSchema)

module.exports = betiMateBTTSModel
// module.exports = mongoose.model('betimate-btts', betiMateBtssSchema)