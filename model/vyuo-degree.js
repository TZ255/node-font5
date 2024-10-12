const mongoose = require('mongoose')
const Schema = mongoose.Schema

const vyuoSchema = new Schema({
    name: {type: String},
    code: {type: String},
    type: {type: String},
    owner: {type: String},
    location: {type: String},
    programmes: {type: Array},
}, {strict: false, timestamps: true})

const model = mongoose.model('Vyuo', vyuoSchema)
module.exports = model