const axios = require('axios')
const https = require('https')

const RAPID_API_HOST = 'instagram-looter2.p.rapidapi.com'
const RAPID_API_URL = 'https://' + RAPID_API_HOST + '/post-dl'
const CDN_HTTPS_AGENT = new https.Agent({ family: 4 })
const CDN_HEADERS = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'video/mp4,video/*,image/avif,image/webp,image/apng,image/*,*/*',
    'Referer': 'https://www.instagram.com/'
}

function assertInstagramUrl(url) {
    try {
        const parsed = new URL(url)
        const host = parsed.hostname.replace(/^www\./, '').toLowerCase()

        if (host !== 'instagram.com' && !host.endsWith('.instagram.com')) {
            throw new Error('Invalid Instagram link')
        }

        return parsed.toString()
    } catch (error) {
        throw new Error('Invalid Instagram link')
    }
}

function cleanCaption(caption) {
    if (!caption) return ''

    return String(caption)
        .split(/\n+/)
        .map(line => line
            .split(/\s+/)
            .filter(word => word && !word.includes('@') && !word.includes('#'))
            .join(' ')
            .replace(/\s{2,}/g, ' ')
            .trim()
        )
        .filter(Boolean)
        .join('\n')
        .trim()
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

function getInstagramUsername(username) {
    const cleaned = username ? String(username).replace(/^@+/, '').trim() : ''
    return /^[A-Za-z0-9._]+$/.test(cleaned) ? cleaned : ''
}

function buildVideoCaption(post) {
    const caption = cleanCaption(post.caption)
    const username = getInstagramUsername(post.username)
    const visibleInstaLine = username ? '📸 Insta: @' + username : ''

    if (!visibleInstaLine) return escapeHtml(caption.slice(0, 1024))

    const separatorLength = caption ? 2 : 0
    const maxCaptionLength = Math.max(0, 1024 - visibleInstaLine.length - separatorLength)
    const clippedCaption = caption.length > maxCaptionLength ? caption.slice(0, maxCaptionLength).trim() : caption
    const instaLine = '📸 Insta: <a href="https://www.instagram.com/' + username + '/">@' + escapeHtml(username) + '</a>'

    return [escapeHtml(clippedCaption), instaLine].filter(Boolean).join('\n\n')
}

function getFileNameFromUrl(url, fallback) {
    try {
        const parsed = new URL(url)
        const filename = parsed.pathname.split('/').filter(Boolean).pop()
        return filename || fallback
    } catch (error) {
        return fallback
    }
}

async function fetchMediaBuffer(url, fallbackFileName) {
    const response = await axios.request({
        method: 'GET',
        url,
        responseType: 'arraybuffer',
        timeout: 60000,
        maxRedirects: 5,
        httpsAgent: CDN_HTTPS_AGENT,
        headers: CDN_HEADERS,
        validateStatus: status => status >= 200 && status < 400
    })

    const buffer = Buffer.from(response.data)
    if (!buffer.length) throw new Error('Downloaded Instagram media is empty')

    return {
        buffer,
        contentType: response.headers['content-type'] || '',
        fileName: getFileNameFromUrl(url, fallbackFileName),
        bytes: buffer.length
    }
}

async function instaLoot(instagramUrl) {
    const apiKey = process.env.RAPID_API_KEY

    if (!apiKey) {
        throw new Error('RAPID_API_KEY is not set')
    }

    const url = assertInstagramUrl(instagramUrl)

    const response = await axios.request({
        method: 'GET',
        url: RAPID_API_URL,
        params: { url },
        timeout: 30000,
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': RAPID_API_HOST,
            'Content-Type': 'application/json'
        },
        validateStatus: status => status >= 200 && status < 500
    })

    if (response.status >= 400) {
        throw new Error('Instagram looter request failed with status ' + response.status)
    }

    if (!response.data?.status || !response.data?.data) {
        throw new Error('Instagram looter returned no usable data')
    }

    const post = response.data.data
    const medias = Array.isArray(post.medias) ? post.medias : []
    const media = medias.find(item => item?.type === 'video' && item?.link)

    if (!media?.link) {
        throw new Error('No video link found for this Instagram post')
    }

    return {
        mediaLink: media.link,
        thumbnailLink: media.img || '',
        mediaType: media.type || 'video',
        caption: buildVideoCaption(post),
        username: post.username || '',
        fullName: post.full_name || '',
        sourceUrl: url
    }
}

module.exports = {
    instaLoot,
    fetchMediaBuffer,
    cleanCaption
}

