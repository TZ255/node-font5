const Tiktok = require("@tobyg74/tiktok-api-dl")

const downloadTikTok = async (url) => {
    try {
        const result = await Tiktok.Downloader(url, {version: 'v3'})
        if (result.status !== 'success') {
            return {success: false, message: result?.message || 'Failed to download the video. Try again later'}
        }
        if (result?.result.type !== 'video') {
            return {success: false, message: 'Error! The link you sent does not contain video'}
        }

        return {success: true, video: result.result.videoSD, caption: `${result.result?.author.nickname || 'TikTok'}: ${result.result?.desc || 'Video'}`}
    } catch (error) {
        console.log('TikTok Dowload Error:', error.message)
    }
}

module.exports = {downloadTikTok}