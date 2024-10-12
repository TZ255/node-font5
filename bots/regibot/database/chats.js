const mongoose = require('mongoose')
const Schema = mongoose.Schema

const nyumbuSchema = new Schema({
    chatid: {
        type: Number,
    },
    username: {
        type: String
    },
    refferer: {
        type: String
    },
    blocked: {type: Boolean, default: false}
}, {strict: false, timestamps: true })

const ohMy = mongoose.connection.useDb('ohmyNew')
const model = ohMy.model('nyumbuModel', nyumbuSchema)
module.exports = model