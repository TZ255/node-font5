const moment = require('moment');

//English day to swahili
const WeekDayFn = (engDay) => {
    switch (engDay) {
        case 'Monday':
            return "Jumatatu"

        case 'Tuesday':
            return "Jumanne"

        case 'Wednesday':
            return "Jumatano"

        case 'Thursday':
            return "Alhamis"

        case 'Friday':
            return "Ijumaa"

        case 'Saturday':
            return "Jumamosi"

        case 'Sunday':
            return "Jumapili"

        default:
            return "Siku"
    }
}

const GetDayFromDateString = (ddmmyyyy) => {
    // Split the input string into day, month, and year
    const [day, month, year] = ddmmyyyy.split('/').map(Number);

    // Create a new Date object (month is zero-indexed in JavaScript)
    const date = new Date(year, month - 1, day);

    // Array of days to match JavaScript's getDay() output
    const daysOfWeek = ["jumapili", "jumatatu", "jumanne", "jumatano", "alhamisi", "ijumaa", "jumamosi"];

    // Return the day of the week
    return daysOfWeek[date.getDay()];
}

const GetJsDate = (ddmmyyyy) => {
    // Split the input string into day, month, and year
    const [day, month, year] = ddmmyyyy.split('/')

    let jsDate = `${year}-${month}-${day}`

    return jsDate
}

//change swahili weekday to English
function SwahiliDayToEnglish(day) {
    const days = {
        'jumapili': 'Sunday',
        'jumatatu': 'Monday',
        'jumanne': 'Tuesday',
        'jumatano': 'Wednesday',
        'alhamisi': 'Thursday',
        'ijumaa': 'Friday',
        'jumamosi': 'Saturday'
    };

    const translatedDay = days[day.toLowerCase()];

    if (translatedDay) {
        return translatedDay;
    } else {
        return 'Invalid day';
    }
}

module.exports = {
    WeekDayFn, GetDayFromDateString, GetJsDate, SwahiliDayToEnglish
}