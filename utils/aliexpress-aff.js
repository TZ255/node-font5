const axios = require("axios");
const crypto = require("crypto");

const APP_KEY = "527494";
const APP_SECRET = "hx3BtC2fm98RclNnjexubB3BtO7dabyi";
const AFFILIATE_METHOD = "aliexpress.affiliate.productdetail.get";
const FIELDS = "commission_rate,sale_price,product_main_image_url,product_small_image_urls,product_video_url,product_title,product_detail_url,discount,target_sale_price,target_original_price,shop_name,evaluate_rate,lastest_volume";

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

function normalizeProduct(product) {
    const rawImages = Array.isArray(product?.product_small_image_urls?.string)
        ? product.product_small_image_urls.string
        : [];

    const images = Array.from(
        new Set(
            [
                product?.product_main_image_url,
                ...rawImages
            ].filter(Boolean)
        )
    );

    return {
        id: product?.product_id?.toString() || "",
        title: product?.product_title || "",
        salePrice: product?.target_sale_price || product?.sale_price || product?.app_sale_price || "",
        originalPrice: product?.target_original_price || product?.original_price || "",
        currency: product?.target_sale_price_currency || product?.sale_price_currency || product?.original_price_currency || product?.target_app_sale_price_currency || "",
        discount: product?.discount || "",
        productUrl: product?.product_detail_url || "",
        promotionUrl: product?.promotion_link || product?.product_detail_url || "",
        mainImage: product?.product_main_image_url || images[0] || "",
        images,
        videoUrl: product?.product_video_url || "",
        rating: product?.evaluate_rate || "",
        orders: product?.lastest_volume || 0,
        shopName: product?.shop_name || "",
        category: product?.second_level_category_name || product?.first_level_category_name || "",
        commissionRate: product?.commission_rate || product?.hot_product_commission_rate || "",
    };
}

function extractProductFromResponse(data) {
    const result = data?.aliexpress_affiliate_productdetail_get_response?.resp_result?.result;
    const product = result?.products?.product?.[0];

    if (!product) {
        throw new Error("Product not found in response");
    }

    return {
        normalized: normalizeProduct(product),
        rawProduct: product,
    };
}

async function getProductDetails(productId) {
    if (!productId) {
        throw new Error("Product id is required");
    }

    const params = {
        app_key: APP_KEY,
        method: AFFILIATE_METHOD,
        timestamp: Date.now().toString(),
        sign_method: "sha256",
        fields: FIELDS,
        product_ids: productId,
        target_currency: "USD",
        target_language: "EN",
        tracking_id: "default",
        country: "US",
    };

    params.sign = createSign(params);
    const url = `https://api-sg.aliexpress.com/sync?method=${AFFILIATE_METHOD}`;

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
            throw new Error(res.data.error_response.msg || "AliExpress API error");
        }

        const { normalized, rawProduct } = extractProductFromResponse(res.data);

        return {
            product: normalized,
            rawProduct,
            response: res.data,
        };
    } catch (err) {
        console.error(err.response?.data || err.message);
        throw err;
    }
}

module.exports = { getProductDetails };
