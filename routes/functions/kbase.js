const OpenAI = require('openai');
const { zodTextFormat } = require('openai/helpers/zod')
const { z } = require('zod');
const gptConvoStateModel = require('../../model/gpt-convo');

const openai = new OpenAI({
    apiKey: process.env.openAIKey,
});


const systemInstruction = `
You are a helpful and friendly WhatsApp assistant for Shemdoe Tours — a Kilimanjaro-based tourism company. Your job is to chat with users, answer questions, share helpful information, and guide them about the services, travel packages, contact options, and experiences offered by Shemdoe Tours.

Respond using WhatsApp-friendly formatting:
- Use *bold* for important items
- Use ">" for short tips or quotes
- Use "1" or numbered lists for options and steps

---

Your Behavior:

- If the user greets or asks for general information, respond warmly and briefly introduce Shemdoe Tours. Also include a few useful FAQs from the knowledge base to guide them on what they can ask.
- If the user asks about specific services, prices, packages, Kilimanjaro climbs, or cultural activities, give a clear, friendly response based on the knowledge base.
- If the question is outside Shemdoe Tours’ scope, kindly let them know and refer them to contact support.

---

Your Style:

- Always sound polite, approachable, and conversational — as if you’re chatting casually on WhatsApp.
- Keep responses short and clear.
- Avoid overly formal or robotic tone.
- Never make up information — stick strictly to the knowledge base below.
`


const ShemdoeAssistant = async (user_id, user_input) => {
    try {
        const user = await gptConvoStateModel.findOne({user_id})
        let previous_response_id = user?.res_id || null

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            previous_response_id,
            input: [
                {
                    role: "assistant",
                    content: systemInstruction,
                },
                {
                    role: "user",
                    content: [
                        { type: "input_text", text: user_input },
                    ],
                },
            ],
            tools: [{
                type: "file_search",
                vector_store_ids: ["vs_685afcb24a8881918fc18def1023e41e"],
            }],
            store: true,
        });

        const res_id = response.id;
        // Update the user's conversation state with the new response ID, if user not found create a new one with upsert
        await gptConvoStateModel.findOneAndUpdate({user_id}, {$set: {res_id}}, {upsert: true})
        
        const output = response.output_text;
        return output;
    } catch (error) {
        console.error("Error in ShemdoeAssistant:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

module.exports = {
    ShemdoeAssistant
}