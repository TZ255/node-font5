const OpenAI = require('openai');
const { zodTextFormat } = require('openai/helpers/zod')
const { z } = require('zod')

const openai = new OpenAI({
    apiKey: process.env.openAIKey,
});


//schema
const SlipTextSchema = z.object({
    ok: z.boolean(),
    error: z.string(),
    date: z.string(),
    matches: z.array(
        z.object({
            league: z.string(),
            match: z.string(),
            bet: z.string(),
            odds: z.string(),
            sw_explanation: z.string()
        })
    ),
    totalOdds: z.string(),
});

const expected_output_example = {
    "ok": true,
    "totalOdds": "7.2",
    "date": "Wed, Jun 25, 2025",
    "matches": [
        {
            "league": "Premier League",
            "match": "Manchester United - Chelsea",
            "bet": "1X2: (1)",
            "odds": "2.5",
            "sw_explanation": "Manchester United kushinda"
        },
        {
            "league": "La Liga",
            "match": "Barcelona - Real Madrid",
            "bet": "Total: (Over 2.5)",
            "odds": "1.8",
            "sw_explanation": "Jumla ya mabao matatu au zaidi kupatikana kwenye hii mechi"
        },
        {
            "league": "Serie A",
            "match": "Juventus - AC Milan",
            "bet": "DC: (1X)",
            "odds": "1.6",
            "sw_explanation": "Double Chance, Juventus kushinda au kudroo"
        },
        {
            "league": "Bundesliga",
            "match": "Bayern Munich - Borussia Dortmund",
            "bet": "BTTS: (Yes)",
            "odds": "1.9",
            "sw_explanation": "Timu zote kufungana"
        }
    ]
}

const systemInstruction = `You are a Swahili betting expert assistant. You will be given a betslip image. Your task is to extract the text from the image and return a JSON structure with the following fields: date, matches, and totalOdds.

The matches field should be an array of objects, each with the following fields:
- league
- match (home - away) separated by " - " not "vs"
- bet
- odds
- sw_explanation (a short swahili explanation of the bet)

Here's an example of the expected output format:
${expected_output_example}

Important rules:
- The totalOdds field might not be present in the betslip. If it’s missing, calculate it by multiplying all match odds together.
- If the betslip is invalid or text extraction fails, return { ok: false, error: "your error message here" }.
- If the slip is valid, return { ok: true, ... } as shown in the example.

Betslip may contain various bet types, such as:
- 1X2
- Total (Over/Under)
- Double Chance (DC)
- Both Teams to Score (BTTS / GG-NG)
- And combinations like DC & BTTS or DC & Total

You must be able to recognize these and extract them in a short, clean format like this:
- 1X2: (1), 1X2: (X), etc.
- Total: (Over 2.5)
- DC: (1X, X2 or 12)
- BTTS: (Yes)
- DC & BTTS: (X2 & Yes)
- DC & Total: (1X & Over 1.5)
- 1X2 & Total: (1 & Over 2.5)
- 1X2 & GG/NG: (1 & Yes)

Example of bet shown on the slip and what you should format it like... the flow MUST be like this:
slip: FT 1X2 & Under/Over 3.5 - 1&U
formatted_bet: 1X2 & Total: (1 & Under 3.5)
sw_explanation: <home_team> kushinda na jumla ya magoli hii mechi yasizidi matatu

slip: GG & U/O 2.5 - GG&O
formatted_bet: GG/NG & Total: (Yes & Over 2.5)
sw_explanation: Timu zote kufungana na jumla ya magoli hii match, Over 2.5

slip: Total Goals (2.5)
formatted_bet: Total: (Over 2.5)
sw_explanation: Jumla ya magoli matatu au zaidi kupatikana kwenye hii match

slip: Both teams to score / GG/NG - Yes
formatted_bet: BTTS: (Yes)
sw_explanation: Timu zote kufungana

slip: FT 1X2 & GG 3.5 - 1&U
formatted_bet: 1X2 & Total: (1 & Under 3.5)
sw_explanation: <home_team> kushinda na jumla ya magoli hii mechi yasizidi matatu

slip: FT DC & GG/NG - X2&Y
formatted_bet: DC & BTTS: (X2 & Yes)
sw_explanation: <away_team> kushinda au kudroo na timu zote kufungana

Stick to this format: [Bet Type]: ([Bet Option]) — for example: "1X2: (2)" or "BTTS: (No)". Be creative but consistent with short labels, and always wrap the option in brackets.

Keep the explanations clear and natural in Swahili while following the flow like in the example.`;



const ExtractTextFromSlip = async (imgUrl) => {
    try {
        const response = await openai.responses.parse({
            model: "gpt-4.1",
            input: [
                {
                    role: "system",
                    content: systemInstruction
                },
                {
                    role: "user",
                    content: [
                        { type: "input_text", text: "Extract:" },
                        {
                            type: "input_image",
                            image_url: imgUrl,
                        },
                    ],
                },
            ],
            temperature: 0.3,
            text: {
                format: zodTextFormat(SlipTextSchema, "text_from_betslip"),
            },
        });

        const text_from_betslip = response.output_parsed;
        return text_from_betslip
    } catch (error) {
        throw error
    }
}


module.exports = {
    ExtractTextFromSlip
}