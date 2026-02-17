const axios = require("axios");

const TINYURL_ENDPOINT = "https://api.tinyurl.com/create";
const TINYURL_TOKEN = process.env.TINYURL_TOKEN;

async function shortenUrl(longUrl) {
    if (!longUrl) {
        throw new Error("URL is required for shortening");
    }

    const res = await axios.post(
        TINYURL_ENDPOINT,
        {
            url: longUrl,
            domain: "tinyurl.com",
        },
        {
            headers: {
                Authorization: `Bearer ${TINYURL_TOKEN}`,
                "Content-Type": "application/json",
            },
            timeout: 10000,
        }
    );

    const tinyUrl = res?.data?.data?.tiny_url;
    if (!tinyUrl) {
        throw new Error("TinyURL did not return a short link");
    }

    return tinyUrl;
}

module.exports = {
    shortenUrl,
};
