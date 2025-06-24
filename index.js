const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const getRouter = require('./routes/get-routes')
const postRouter = require('./routes/post')
const { handlePriceBots } = require('./bots/handleBotFunctions')
const { CPABots } = require('./bots/1-mzansi/bot')
const { AutoAcceptorBot } = require('./bots/2-AutoAcceptor/bot')
const dayonce_bot = require('./bots/dayonce/bot')
const pipyTida_bot = require('./bots/pipytida/bot')
const regina_bot = require('./bots/regibot/bot')

const app = express()

// database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to Vyuo Degree'))
    .catch((err) => {
        console.log(err)
    })


// MIDDLEWARES
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.set('trust proxy', true) //our app is hosted on server using proxy to pass user request
//webhookbots
if (process.env.ENVIRONMENT == 'production') {
    dayonce_bot.DayoBot(app)
    pipyTida_bot.PipyBot(app)
    regina_bot.rbot(app)
    handlePriceBots(app)
    CPABots(app)
    AutoAcceptorBot(app)
}


app.use(getRouter)
app.use(postRouter)

app.listen(process.env.PORT || 3000, () => console.log('Listen to port 3000'))

process.on('unhandledRejection', (reason, promise) => {
    console.log(reason)
    //on production here process will change from crash to start cools
})

process.on('uncaughtException', async (err) => {
    console.log(err)
})

process.on('warning', e => console.warn(e.stack));