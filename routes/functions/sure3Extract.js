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
    matches: z.array(
        z.object({
            time: z.string(),
            league: z.string(),
            match: z.string(),
            bet: z.string(),
            odds: z.string(),
        })
    ),
    totalOdds: z.string(),
});

const expected_output_example = {
    "ok": true,
    "matches": [
        {
            "time": "19:30",
            "league": "Premier League",
            "match": "Manchester United - Chelsea",
            "bet": "Over 2.5",
            "odds": "2.5",
        },
        {
            "time": "21:00",
            "league": "Premier League",
            "match": "Manchester City - Liverpool",
            "bet": "Home Win",
            "odds": "2.5",
        },
        {
            "time": "21:00",
            "league": "La Liga",
            "match": "Barcelona - Real Madrid",
            "bet": "Away Win",
            "odds": "1.8",
        },
        {
            "time": "22:00",
            "league": "Serie A",
            "match": "Juventus - AC Milan",
            "bet": "GG - Yes",
            "odds": "1.6",
        },
        {
            "time": "17:30",
            "league": "Bundesliga",
            "match": "Bayern Munich - Borussia Dortmund",
            "bet": "GG - No",
            "odds": "1.9",
        },
        {
            "time": "17:30",
            "league": "Algeria - Ligue 1",
            "match": "MC Alger - JS Saoura",
            "bet": "1 & Over 2.5",
            "odds": "2.67",
        },
        {
            "time": "18:00",
            "league": "Italy - Serie A",
            "match": "Inter Milan - Napoli",
            "bet": "1 & Over 1.5",
            "odds": "2.37",
        },
        {
            "time": "18:00",
            "league": "France - Ligue 1",
            "match": "PSG - Lyon",
            "bet": "2 & Over 2.5",
            "odds": "2.37",
        },
        {
            "time": "15:00",
            "league": "France - Ligue 1",
            "match": "PSG - Lyon",
            "bet": "2 & Over 1.5",
            "odds": "2.37",
        },
        {
            "time": "15:00",
            "league": "France - Ligue 1",
            "match": "PSG - Lyon",
            "bet": "1X & Over 2.5",
            "odds": "2.37",
        },
        {
            "time": "21:45",
            "league": "Netherlands - Eredivisie",
            "match": "Ajax - PSV Eindhoven",
            "bet": "X2 & Over 2.5",
            "odds": "1.87",
        },
        {
            "time": "21:45",
            "league": "Netherlands - Eredivisie",
            "match": "Ajax - PSV Eindhoven",
            "bet": "1X & Under 4.5",
            "odds": "1.87",
        },
        {
            "time": "20:00",
            "league": "Netherlands - Eredivisie",
            "match": "Ajax - PSV Eindhoven",
            "bet": "Away Multigoals: 1 - 3",
            "odds": "1.87",
        },
        {
            "time": "20:00",
            "league": "France - Ligue 1",
            "match": "PSG - Lyon",
            "bet": "Home Multigoals: 1 - 3",
            "odds": "2.37",
        },
        {
            "time": "20:00",
            "league": "France - Ligue 1",
            "match": "PSG - Lyon",
            "bet": "Home Multigoals: 1 - 2",
            "odds": "2.37",
        },
        {
            "time": "16:00",
            "league": "France - Ligue 1",
            "match": "PSG - Lyon",
            "bet": "1st Half Multigoals: 1 - 3",
            "odds": "2.37",
        },
        {
            "time": "16:00",
            "league": "France - Ligue 1",
            "match": "PSG - Lyon",
            "bet": "1st Half Multigoals: 1 - 2",
            "odds": "2.37",
        },
        {
            "time": "16:00",
            "league": "France - Ligue 1",
            "match": "PSG - Lyon",
            "bet": "1st 10 min: Draw",
            "odds": "2.37",
        }
    ],
    "totalOdds": "7.2",
}

const systemInstruction = `You are a betting expert assistant. You will be given a betslip image. Your task is to extract the text from the image and return a JSON structure with the following fields: matches, and totalOdds.

The matches field should be an array of objects, each with the following fields:
- time in HH:MM format
- league
- match (home - away), separated by " - " (not "vs"), using popular short team names (omit FC, SC, etc.)
- bet
- odds

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
- 1st 10 min: Draw

Format bet value and return its direct bet type, such as:
- 1 will be "Home Win"
- 2 will be "Away Win"
- X will be "Draw"
- Total bets will be formatted as "Over 2.5", "Under 3.5", etc.
- For Multigoals, determine the home and away teams and use "Home Multigoals: 1 - 3", "Away Multigoals: 1 - 2", etc instead of the team name.
- For 1st Half Multigoals, use "1st Half Multigoals: 1 - 3", "1st Half Multigoals: 1 - 2", etc.
- For FT Double chances use "Double Chance: 12, 1X or X2" based on the bet and for HT Double chances use "HT Double Chance: 12, 1X or X2" based on the bet.
- For BTTS use "GG - Yes" or "GG - No" based on the bet.
- For combinations like "DC & BTTS, 1X2 & Total etc", format as for example "1 & Over 2.5, 1X & Under 3.5, 12 & GG etc".
- For First 10 min: 1X2 - X format as 1st 10 min: Draw
`;



const ExtractSure3FromSlip = async (imgUrl, user_msg = '') => {
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
            temperature: 0.2,
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
    ExtractSure3FromSlip
}