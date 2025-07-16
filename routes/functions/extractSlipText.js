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
- match (home - away), separated by " - " (not "vs"), using popular short team names (omit FC, SC, etc.)
- bet
- odds
- sw_explanation (a short Swahili explanation of the bet)

Example output format:
${JSON.stringify(expected_output_example, null, 2)}

Rules:
- If totalOdds is missing from the betslip, calculate it by multiplying all match odds (e.g., 2.11 * 1.77 * 1.88 * 1.55 = 10.88).
- If the betslip is invalid or text extraction fails, return { ok: false, error: "your error message here" }.
- If the slip is valid, return { ok: true, ... } as shown in the example.

Recognize and extract various bet types, such as:
- 1X2
- Total (Over/Under)
- Double Chance (DC)
- Both Teams to Score (BTTS / GG-NG)
- Combinations like DC & BTTS or DC & Total

Format bets as:
- 1X2: (1), 1X2: (X), etc.
- Total: (Over 2.5)
- DC: (1X, X2, or 12)
- BTTS: (Yes)
- DC & BTTS: (X2 & Yes)
- DC & Total: (1X & Over 1.5)
- 1X2 & Total: (1 & Over 2.5)
- 1X2 & GG/NG: (1 & Yes)

Interpret ambiguous or shorthand bets correctly. For example:
- "FT 1X2 & Under/Over 3.5 - 1&U" → 1X2 & Total: (1 & Under 3.5)
- "GG & U/O 2.5 - GG&O" → BTTS & Total: (Yes & Over 2.5)
- "Total Goals (2.5)" → Total: (Over 2.5)
- "Both teams to score / GG/NG - Yes" → BTTS: (Yes)
- "FT DC & GG/NG - X2&Y" → DC & BTTS: (X2 & Yes)

Always use the format: [Bet Type]: ([Bet Option]), e.g., "1X2: (2)" or "BTTS: (No)".

Keep Swahili explanations clear and natural, following the example flow.`;



const ExtractTextFromSlip = async (imgUrl, user_msg = '') => {
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
                        { type: "input_text", text: `Careful analyze and extract required data: ${user_msg}` },
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