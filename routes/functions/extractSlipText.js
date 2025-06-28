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
            "league": "Premier League",
            "match": "Manchester City - Liverpool",
            "bet": "1X2: (X)",
            "odds": "2.5",
            "sw_explanation": "Mechi kuisha sare"
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
        },
        {
            "league": "Algeria - Ligue 1",
            "match": "MC Alger - JS Saoura",
            "bet": "1X2 & Total: (1 & Over 2.5)",
            "odds": "2.67",
            "sw_explanation": "MC Alger kushinda na jumla ya magoli hii mechi, Over 2.5"
        },
        {
            "league": "Italy - Serie A",
            "match": "Inter Milan - Napoli",
            "bet": "1X2 & BTTS: (1 & Yes)",
            "odds": "2.37",
            "sw_explanation": "Inter Milan kushinda na timu zote kufungana"
        },
        {
            "league": "France - Ligue 1",
            "match": "PSG - Lyon",
            "bet": "DC & BTTS: (X2 & Yes)",
            "odds": "2.37",
            "sw_explanation": "Lyon kushinda au kudroo na timu zote kufungana"
        },
        {
            "league": "France - Ligue 1",
            "match": "PSG - Lyon",
            "bet": "DC & BTTS: (12 & Yes)",
            "odds": "2.37",
            "sw_explanation": "Double Chance, timu yoyote kushinda, na wote kufungana"
        },
        {
            "league": "France - Ligue 1",
            "match": "PSG - Lyon",
            "bet": "DC & Total: (12 & Over 2.5)",
            "odds": "2.37",
            "sw_explanation": "Double Chance, timu yoyote kushinda, na jumla ya magoli hii mechi, Over 2.5"
        },
        {
            "league": "Netherlands - Eredivisie",
            "match": "Ajax - PSV Eindhoven",
            "bet": "DC & Total: (1X & Over 1.5)",
            "odds": "1.87",
            "sw_explanation": "Ajax kushinda au kudroo na jumla ya magoli hii mechi, Over 1.5"
        },
        {
            "league": "Netherlands - Eredivisie",
            "match": "Ajax - PSV Eindhoven",
            "bet": "BTTS & Total: (Yes & Over 2.5)",
            "odds": "1.87",
            "sw_explanation": "Timu zote kufungana, na jumla ya magoli hii match, Over 2.5"
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
${JSON.stringify(expected_output_example, null, 2)}

Important rules:
- The totalOdds field might not be present in the betslip. If it’s missing, calculate it by multiplying all match odds together. Be careful here as the totalOdds field must be correct
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

Be attentive to the betslip as it may contain ambiguities or different formats. Bet like 1&U which mean "1 and Under" should be interpreted correctly: For example FT 1X2 & Under/Over 1.5 - 1&O should be interpreted as "1X2 & Total: (1 & Over 1.5)".

Example of bet shown on the slip and expected bet value... the flow MUST be like this:
slip: FT 1X2 & Under/Over 3.5 - 1&U
expected_value: 1X2 & Total: (1 & Under 3.5)
sw_explanation: <home_team> kushinda na jumla ya magoli hii mechi, Under 3.5

slip: GG & U/O 2.5 - GG&O
expected_value: BTTS & Total: (Yes & Over 2.5)
sw_explanation: Timu zote kufungana na jumla ya magoli hii match, Over 2.5

slip: Total Goals (2.5)
expected_value: Total: (Over 2.5)
sw_explanation: Jumla ya magoli matatu au zaidi kupatikana kwenye hii match

slip: Both teams to score / GG/NG - Yes
expected_value: BTTS: (Yes)
sw_explanation: Timu zote kufungana

slip: FT 1X2 & GG 3.5 - 1&U
expected_value: 1X2 & Total: (1 & Under 3.5)
sw_explanation: <home_team> kushinda na jumla ya magoli hii mechi yasizidi matatu

slip: FT DC & GG/NG - X2&Y
expected_value: DC & BTTS: (X2 & Yes)
sw_explanation: <away_team> kushinda au kudroo na timu zote kufungana

Stick to this format: [Bet Type]: ([Bet Option]) — for example: "1X2: (2)" or "BTTS: (No)". Be creative but consistent with short labels, and always wrap the option in brackets.

Keep the explanations clear and natural in Swahili while following the flow like in the example.`;



const ExtractTextFromSlip = async (imgUrl) => {
    try {
        const response = await openai.responses.parse({
            model: "gpt-4.1-mini",
            input: [
                {
                    role: "assistant",
                    content: systemInstruction
                },
                {
                    role: "user",
                    content: [
                        { type: "input_text", text: "Careful analyze and extract required data:" },
                        {
                            type: "input_image",
                            image_url: imgUrl,
                            detail: "high"
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