const StructureBetslipCaption = (gpt_res, affiliate, booking, date) => {
    const matches = gpt_res.matches;
    const totalOdds = gpt_res.totalOdds;
    const aff = {
        gsb: {
            href: 'http://bet-link.top/gsb/register',
            link_text: 'www.gsb.co.tz/register',
            promo: 'Machaguo haya yanapatikana Gal Sport pamoja na ofa ya 200% kwenye deposit ya kwanza.',
            namba: 1
        },
        betway: {
            href: 'http://bet-link.top/betway/register',
            link_text: 'www.betway.co.tz/register',
            promo: 'Machaguo haya yanapatikana BetWay pamoja na ofa ya 200% kwenye deposit yako ya kwanza.',
            namba: 2
        },
        leonbet: {
            href: 'http://bet-link.top/leonbet/register',
            link_text: 'www.leonbet.co.tz/register',
            promo: 'Machaguo haya yanapatikana Leonbet pamoja na ofa ya 200% kwenye deposit ya kwanza.',
            namba: 1
        },
        yellowbet: {
            href: 'http://bet-link.top/yellowbet-ke/register',
            link_text: 'www.yellowbet.ke/register',
            promo: 'Bet placed at Yellow Bet. Receive 100% bonus on your first deposit up to KES 10,000.',
            namba: 4
        }
    }

    const caption = `
<b>Mkeka wa Leo | Mkeka No. #${aff[affiliate].namba}</b>
<code>🗓 ${date}, 2025</code>


<b>🔥 Total Odds: ${totalOdds}</b>

•••

<u>${matches[0].league}</u>
⚽️ <b><a href="${aff[affiliate].href}">${matches[0].match}</a></b>
☑️ <b>${matches[0].bet}</b>
${matches[0].sw_explanation}

•••

<u>${matches[1].league}</u>
⚽️ <b><a href="${aff[affiliate].href}">${matches[1].match}</a></b>
☑️ <b>${matches[1].bet}</b>
${matches[1].sw_explanation}

•••

<u>${matches[2].league}</u>
⚽️ <b><a href="${aff[affiliate].href}">${matches[2].match}</a></b>
☑️ <b>${matches[2].bet}</b>
${matches[2].sw_explanation}

•••

<u>${matches[3].league}</u>
⚽️ <b><a href="${aff[affiliate].href}">${matches[3].match}</a></b>
☑️ <b>${matches[3].bet}</b>
${matches[3].sw_explanation}


<b>📠 Booking</b> 👉 <code>${booking}</code> 👈
▬▬▬▬▬▬▬▬▬▬▬▬▬

<blockquote>${aff[affiliate].promo}</blockquote> 

Ikiwa bado huna account <b>Unaweza Jisajili Hapa Chini</b>

<b><u>🔗 Tanzania 🇹🇿</u>
<a href="${aff[affiliate].href}">${aff[affiliate].link_text}</a>
<a href="${aff[affiliate].href}">${aff[affiliate].link_text}</a>

<u>🔗 Kenya 🇰🇪</u>
<a href="https://bet-link.top/yellowbet-ke/register">www.yellowbet.ke/register</a>

<u>🔗 Uganda 🇺🇬</u>
<a href="https://bet-link.top/gsb-ug/register">www.gsb.ug/#/register</a>

••••
@mkeka_wa_leo</b>
    `


    return caption;
}


const StructureYellowBetslipCaption = (gpt_res, affiliate, booking, date) => {
    const matches = gpt_res.matches;
    const totalOdds = gpt_res.totalOdds;
    const aff = {
        gsb: {
            href: 'http://bet-link.top/gsb/register',
            link_text: 'www.gsb.co.tz/register',
            promo: 'Machaguo haya yanapatikana Gal Sport pamoja na ofa ya 200% kwenye deposit ya kwanza.',
            namba: 1
        },
        betway: {
            href: 'http://bet-link.top/betway/register',
            link_text: 'www.betway.co.tz/register',
            promo: 'Machaguo haya yanapatikana BetWay pamoja na ofa ya 200% kwenye deposit yako ya kwanza.',
            namba: 2
        },
        leonbet: {
            href: 'http://bet-link.top/leonbet/register',
            link_text: 'www.leonbet.co.tz/register',
            promo: 'Machaguo haya yanapatikana Leonbet pamoja na ofa ya 200% kwenye deposit ya kwanza.',
            namba: 1
        },
        yellowbet: {
            href: 'http://bet-link.top/yellowbet-ke/register',
            link_text: 'www.yellowbet.ke/register',
            promo: 'Bet placed at Yellow Bet. Receive 100% bonus on your first deposit up to KES 10,000.',
            namba: 1
        }
    }

    const caption = `
<b>Today's Betslip | Slip No. #${aff[affiliate].namba}</b>
<code>🗓 ${date}, 2025</code>


<b>🔥 Total Odds: ${totalOdds}</b>

•••

<u>${matches[0].league}</u>
⚽️ <b><a href="${aff[affiliate].href}">${matches[0].match}</a></b>
☑️ <b>${matches[0].bet}</b>
${matches[0].sw_explanation}

•••

<u>${matches[1].league}</u>
⚽️ <b><a href="${aff[affiliate].href}">${matches[1].match}</a></b>
☑️ <b>${matches[1].bet}</b>
${matches[1].sw_explanation}

•••

<u>${matches[2].league}</u>
⚽️ <b><a href="${aff[affiliate].href}">${matches[2].match}</a></b>
☑️ <b>${matches[2].bet}</b>
${matches[2].sw_explanation}

•••

<u>${matches[3].league}</u>
⚽️ <b><a href="${aff[affiliate].href}">${matches[3].match}</a></b>
☑️ <b>${matches[3].bet}</b>
${matches[3].sw_explanation}


<b>📠 Booking</b> 👉 <code>${booking}</code> 👈
▬▬▬▬▬▬▬▬▬▬▬▬▬

<blockquote>${aff[affiliate].promo}</blockquote> 

No account? <b>Register Below</b>

<b><u>🔗 Kenya 🇰🇪</u>
<a href="${aff[affiliate].href}">${aff[affiliate].link_text}</a>
<a href="${aff[affiliate].href}">${aff[affiliate].link_text}</a>

<u>🔗 Uganda 🇺🇬</u>
<a href="https://bet-link.top/gsb-ug/register">www.gsb.ug/#/register</a>

<u>🔗 Tanzania 🇹🇿</u>
<a href="https://bet-link.top/gsb/register">www.gsb.co.tz/#/register</a>

••••
@mkeka_wa_leo</b>
    `


    return caption;
}


module.exports = { StructureBetslipCaption, StructureYellowBetslipCaption };