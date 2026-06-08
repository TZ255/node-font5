const axios = require('axios')

const RAPID_API_HOST = 'instagram-looter2.p.rapidapi.com'
const RAPID_API_URL = 'https://' + RAPID_API_HOST + '/post-dl'

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

function buildVideoCaption(post) {
    const caption = cleanCaption(post.caption)
    const username = post.username ? String(post.username).replace(/^@+/, '').trim() : ''
    const instaLine = username ? 'Insta: @' + username : ''

    if (!instaLine) return caption.slice(0, 1024)

    const separatorLength = caption ? 2 : 0
    const maxCaptionLength = Math.max(0, 1024 - instaLine.length - separatorLength)
    const clippedCaption = caption.length > maxCaptionLength ? caption.slice(0, maxCaptionLength).trim() : caption

    return [clippedCaption, instaLine].filter(Boolean).join('\n\n')
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
        mediaType: media.type || 'video',
        caption: buildVideoCaption(post),
        username: post.username || '',
        fullName: post.full_name || '',
        sourceUrl: url
    }
}

module.exports = {
    instaLoot,
    cleanCaption
}

