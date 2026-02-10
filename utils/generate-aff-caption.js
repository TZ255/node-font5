const OpenAI = require('openai');
const { zodTextFormat } = require('openai/helpers/zod')
const { z } = require('zod')

const openai = new OpenAI({
    apiKey: process.env.openAIKey,
});


const systemInstruction = `You are a creative and persuasive affiliate marketing caption generator. Your task is to create engaging captions of not more than 30 words that highlight the key features and discounts of products to encourage users to make a purchase through an affiliate link. The captions should be catchy, concise, and tailored to the target audience. Focus on emphasizing the value and benefits of the product, as well as the urgency of the discount. Use a friendly and conversational tone to connect with potential customers.`;



const generateAffiliateCaption = async (product_title, price, offer_price, discount, images) => {
    if (!product_title || !price || !offer_price || !discount || !images || images.length === 0) {
        throw new Error("Missing required product details");
    }

    const imageInputs = images.map(url => ({
        type: "input_image",
        image_url: url,
        detail: "high"
    }));

    try {
        const response = await client.responses.create({
            model: "gpt-5-mini",
            reasoning: { effort: "medium" },
            instructions: systemInstruction,
            input: [
                {
                    role: "system",
                    content: systemInstruction
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "input_text", 
                            text: `Generate a catchy affiliate marketing caption for a product with the following details:\n\nTitle: ${product_title}\nPrice: ${price}\nOffer Price: ${offer_price}\nDiscount: ${discount}\nImages: ${images.join(', ')}\n\nThe caption should be engaging, highlight the discount, and encourage users to make a purchase through the affiliate link.`
                        },
                        ...imageInputs
                    ],
                },
            ],
        });

        const generated_caption = response.response.output_text;
        return generated_caption;
    } catch (error) {
        throw error
    }
}


module.exports = {
    generateAffiliateCaption
}