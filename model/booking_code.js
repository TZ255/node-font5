const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bookSchema = new Schema({
    code: {
        type: String
    },
    date: {
        type: String
    },
    slip_no: {
        type: Number
    }
}, { timestamps: true, strict: false})

const BookingCodesModel = mongoose.connection.useDb('mkeka-wa-leo').model('Booking Code', bookSchema)
module.exports = BookingCodesModel