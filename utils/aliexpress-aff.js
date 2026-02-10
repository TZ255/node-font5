const axios = require("axios");
const crypto = require("crypto");

const APP_KEY = "527494";
const APP_SECRET = "hx3BtC2fm98RclNnjexubB3BtO7dabyi";

function createSign(params) {
    const keys = Object.keys(params)
        .filter(k => k !== "sign" && params[k] !== undefined && params[k] !== "")
        .sort();

    let base = "";

    for (const key of keys) {
        base += key + params[key];
    }

    const hmac = crypto.createHmac("sha256", APP_SECRET);
    hmac.update(base, "utf8");

    return hmac.digest("hex").toUpperCase();
}

async function getProductDetails(productIds) {
    const method = "aliexpress.affiliate.productdetail.get";

    const params = {
        app_key: APP_KEY,
        method: method, // MUST be inside params for signing
        timestamp: Date.now().toString(),
        sign_method: "sha256",
        fields: "commission_rate,sale_price",
        product_ids: productIds,
        target_currency: "USD",
        target_language: "EN",
        tracking_id: "default", // replace with your real tracking id
        country: "US",
    };

    params.sign = createSign(params);

    const url = `https://api-sg.aliexpress.com/sync?method=${method}`;

    try {
        const res = await axios.post(
            url,
            new URLSearchParams(params).toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                },
                timeout: 20000,
            }
        );

        if (res.data.error_response) {
            console.error("API Error:", res.data);
            throw new Error(res.data.error_response.msg || res.data.error_response.msg);
        }

        console.log(JSON.stringify(res.data, null, 2));

        // generate caption
        
        return res.data;
    } catch (err) {
        console.error(err.response?.data || err.message);
        throw err;
    }
}

module.exports = { getProductDetails };
