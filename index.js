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
const { TikTokDownloaderBot } = require('./bots/3-tiktok-downloader/bot')

const app = express()

// global middlewares
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.set('trust proxy', true)

async function startServer() {
  try {
    // 1. connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to Vyuo Degree')

    // 2. setup bots only in production
    if (process.env.ENVIRONMENT === 'production') {
      dayonce_bot.DayoBot(app)
      pipyTida_bot.PipyBot(app)
      regina_bot.rbot(app)
      handlePriceBots(app)
      CPABots(app)
      AutoAcceptorBot(app)
      TikTokDownloaderBot(app)
    }

    // 3. routes
    app.use(getRouter)
    app.use(postRouter)

    // 4. start server
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))

  } catch (err) {
    console.error('❌ Startup error:', err)
  }
}

// Run the app
startServer()

// safety handlers
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason))
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err))
process.on('warning', (e) => console.warn(e.stack))
