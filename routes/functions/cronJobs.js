const { correctScoreFn } = require("../../bots/regibot/fns/correct-score")
const { famecheckMatokeo, famecheckOdds } = require("../../bots/regibot/fns/fame-scheduled")
const { QualityTipsCheck } = require("../../bots/regibot/fns/qualitycheck")
const { extractMutatingTips } = require("../../bots/regibot/fns/scheduled-odds")

const cronJobFunction = () => {
    console.log('🕒 Cron Jobs initiated')
    setInterval(() => {
        let now = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi' })
        let timeStrings = now.split(':')
        let time2check = `${timeStrings[0]}:${timeStrings[1]}`
        let trhLeo = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

        //kesho
        let k = new Date()
        k.setDate(k.getDate() + 1)
        let trhKesho = k.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

        //after kesho
        let k2 = new Date()
        k2.setDate(k2.getDate() + 2)
        let afterKesho = k2.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

        //mtondogoo
        let k3 = new Date()
        k3.setDate(k3.getDate() + 3)
        let mtondogoo = k3.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

        //jana
        let j = new Date()
        j.setDate(j.getDate() - 1)
        let trhJana = j.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' })

        //Quality Check every hour at 14th minute
        if (timeStrings[1] == '14') {
            QualityTipsCheck().catch(e => console.log(e?.message))
        }

        switch (time2check) {
            //mybets.today correct score and mutating 1x2
            case '03:10': case '06:00': case '08:00': case '09:00': case '10:00':
                extractMutatingTips('soccer-predictions/', trhLeo)
                setTimeout(() => {
                    correctScoreFn('soccer-predictions/correct-score-predictions/', trhLeo)
                }, 5000);
                break;

            case '10:30': case '11:30': case '14:30': case "15:30": case '16:30': case '18:45': case '20:35': case '23:45':
                //extract tomorrow 1x2 and correct score in one go since theyre from different websites
                extractMutatingTips('soccer-prediction/tomorrow/', trhKesho)
                correctScoreFn('soccer-predictions/correct-score-predictions/tomorrow/', trhKesho)

                //extract after tomorrow 1x2 and correct score
                setTimeout(() => {
                    extractMutatingTips('soccer-predictions/after-tomorrow/', afterKesho)
                    correctScoreFn('soccer-predictions/correct-score-predictions/after-tomorrow/', afterKesho)
                }, 5000);

                //extract mutating for future days
                setTimeout(() => {
                    extractMutatingTips('soccer-predictions/future-days/', mtondogoo)
                }, 10000);
                break;


            //fametips
            case '03:07': case '04:07': case '05:07': case '06:57': case '07:57': case '08:57': case '09:57': case '10:57': case '11:57': case '12:57':
                famecheckOdds('#today-content', trhLeo)
                break;

            case '14:07': case '15:07': case '16:07': case '17:07': case '18:07': case '19:07': case '20:07': case '21:07': case '22:07': case '23:07': case '23:57':
                famecheckOdds('#tomorrow-content', trhKesho)
                break;
        }
    }, 59 * 1000)
}


module.exports = {
    cronJobFunction
}