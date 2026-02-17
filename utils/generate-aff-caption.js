const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.openAIKey,
});

const systemInstruction = `You are a creative and persuasive affiliate marketing caption generator. Write upbeat Telegram album captions (max 30 words) that spotlight the strongest benefits, price/discount, and invite users to tap the affiliate link. Keep it plain text, no hashtags or URLs.`;

const formatPrice = (price, currency) => {
    if (!price) return null;
    return currency ? `${currency} ${price}` : `${price}`;
}

function buildProductDetailsText(product) {
    const {
        title,
        salePrice,
        originalPrice,
        currency,
        discount,
        rating,
        orders,
        shopName,
        category,
    } = product;

    const formattedSalePrice = formatPrice(salePrice, currency);
    const formattedOriginalPrice = formatPrice(originalPrice, currency);

    return [
        `Title: ${title}`,
        category ? `Category: ${category}` : null,
        formattedSalePrice ? `Current price: ${formattedSalePrice}` : null,
        formattedOriginalPrice ? `Original price: ${formattedOriginalPrice}` : null,
        discount ? `Discount: ${discount}` : null,
        rating ? `Rating: ${rating}` : null,
        orders ? `Recent orders: ${orders}` : null,
        shopName ? `Store: ${shopName}` : null,
    ].filter(Boolean).join("\n");
}

const generateAffiliateCaption = async (product) => {
    if (!product || !product.title || !product.salePrice || !product.currency) {
        throw new Error("Missing required product details");
    }

    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const imageInputs = images.slice(0, 4).map(url => ({
        type: "input_image",
        image_url: url,
        detail: "high"
    }));

    const userPrompt = [
        "Create a short affiliate caption for this AliExpress product.",
        "Keep it under 30 words, highlight the discount/value, and add a clear CTA like 'Shop now' or 'Claim the deal'.",
        "No links, markdown, or hashtags.",
        "",
        buildProductDetailsText(product)
    ].join("\n");

    try {
        const response = await openai.responses.create({
            model: "gpt-5-mini",
            input: [
                {
                    role: "system",
                    content: systemInstruction
                },
                {
                    role: "user",
                    content: [
                        { type: "input_text", text: userPrompt },
                        ...imageInputs
                    ],
                },
            ],
            reasoning: {
                effort: "medium"
            },
            text: {
                verbosity: "low"
            }
        });

        return response.output_text?.trim() || 'No caption generated.';
    } catch (error) {
        console.error("Error generating affiliate caption:", error?.message || error);
        return "Sorry, I couldn't generate a caption for this product.";
    }
};

module.exports = {
    generateAffiliateCaption
};
