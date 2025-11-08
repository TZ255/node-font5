const { InputFile } = require('grammy')
const fetch = require('node-fetch') // Node 18+ can use global fetch

/**
 * Stream a TikTok video to a Telegram user without storing it in memory or disk
 * @param {object} ctx - grammy context
 * @param {string} videoURL - direct TikTok video URL
 * @param {string} caption - optional caption
 */
async function streamTikTokVideo(ctx, videoURL, caption = '') {
  try {
    // fetch the video as a stream
    const res = await fetch(videoURL)
    if (!res.ok) throw new Error(`Failed to fetch video: ${res.statusText}`)

    const readableStream = res.body // Node.js ReadableStream

    // send the video using InputFile with stream
    await ctx.replyWithVideo(new InputFile(readableStream), {
      parse_mode: 'HTML',
      caption: caption || '🎥 Here’s your TikTok video!'
    })
  } catch (err) {
    console.error('Error streaming TikTok video:', err)
    await ctx.reply('❌ Failed to download or send the video. Please try again.')
  }
}

module.exports = {
  streamTikTokVideo
}