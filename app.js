function Day(options) {
    const date = options.date || new Date();
    const lang = options.lang;

    let day = {
        Date: date,
        date: date.getDate(),
        day: date.toLocaleString(lang, { weekday: 'long' }),
        dayNumber: date.getDay() || 7,
        dayShort: date.toLocaleString(lang, { weekday: 'short' }),
        year: date.getFullYear(),
        yearShort: date.toLocaleString(lang, { year: '2-digit' }),
        month: date.toLocaleString(lang, { month: 'long' }),
        monthShort: date.toLocaleString(lang, { month: 'short' }),
        monthNumber: date.getMonth() + 1,
        timestamp: date.getTime(),
        week: getWeekNumber(date)
    }

    return day;

}

function Month(options) {
    const date = options.date || new Date();
    const lang = options.lang;
    const dayNumber = options.dayNumber;

    let monthsSize = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let day = Day({date:date, lang:lang});

    let month = {
        day:day,
        monthsSize: monthsSize,
        lang: lang,
        name: day.month,
        number: day.monthNumber,
        year: day.year,
        numberOfDays: day.monthNumber === 2 ? monthsSize[day.monthNumber - 1] + (isLeapYear(day.year) ? 1 : 0) : monthsSize[day.monthNumber - 1]
    }

    month.getDay = Day({date: new Date(month.year, month.number - 1, dayNumber), lang:month.lang});
    
    return month;
}

function Calendar(options) {
    const year = options.date;
    const lang = options.lang;
    const monthNumber = options.monthNumber;

    let calendar = {
        today: Day({lang:lang}),
        weekDays: []
    }

    for (let index = 0; index < 7; index++) {
        calendar.weekDays.push(undefined)
    }

    

    calendar.year = year || calendar.today.year;
    calendar.month = Month({date : new Date(calendar.year, (monthNumber || calendar.today.monthNumber) - 1), lang: lang});
    // calendar[Symbol.iterator] = function* () {
    //     let number = 1;
    //     yield calendar.getMonth(number);
    //     while (number < 12) {
    //         ++number;
    //         yield calendar.getMonth(number);
    //     }
    // }

    calendar.getMonth = function (monthNumber) {
        return Month({date: new Date(calendar.year, monthNumber - 1), lang: lang});
    }

    for (let i = 0; i < calendar.weekDays.length; i++) {
        const day = Month({ date: new Date(calendar.year, calendar.today.monthNumber - 1), lang: lang, dayNumber: i + 1}).getDay;
        if (!calendar.weekDays.indexOf(day.day)>-1) {
            calendar.weekDays[day.dayNumber - 1] = day.day
        }
        
    }


    calendar.isLeapYear = function () {
        return isLeapYear(calendar.year);
    }

    calendar.getMonth = function (monthNumber) {
        return Month({date : new Date(calendar.year, monthNumber - 1), lang: lang});
    }

    calendar.getPreviousMonth = function () {
        if (calendar.month.number === 1) {
            return Month({date : new Date(calendar.year - 1, 11), lang: lang});
        }

        return Month({date : new Date(calendar.year, calendar.month.number - 2), lang: lang});
    }

    calendar.getNextMonth = function () {
        if (calendar.month.number === 12) {
            return Month({date : new Date(calendar.year + 1, 0), lang: lang});
        }

        return Month({date : new Date(calendar.year, calendar.month.number + 2), lang: lang});
    }

    calendar.goToDate = function (monthNumber, year) {
        calendar.month = Month({date : new Date(year, monthNumber - 1), lang: lang});
        calendar.year = year;
    }

    calendar.goToNextYear = function () {
        calendar.year += 1;
        calendar.month = Month({date : new Date(calendar.year, 0), lang: lang});
    }

    calendar.goToPreviousYear = function () {
        calendar.year -= 1;
        calendar.month = Month({date : new Date(calendar.year, 11), lang: lang});
    }

    calendar.goToNextMonth = function () {
        if (calendar.month.number === 12) {
            return calendar.goToNextYear();
        }

        calendar.month = Month({date : new Date(calendar.year, (calendar.month.number + 1) - 1), lang: lang});
    }

    calendar.goToPreviousMonth = function () {
        if (calendar.month.number === 1) {
            return calendar.goToPreviousYear();
        }

        calendar.month = Month({date : new Date(calendar.year, (calendar.month.number - 1) - 1), lang: lang});
    }

    return calendar;
}


function DatePicker(options) {

    const date = options.date || new Date();
    const format = options.format || 'DD.MM.YYYY';
    const selector = options.selector;

    let datePicker = {
        lang: window.navigator.language,
        format: format,
        mounted: false,
        calendarDropDown: null,
        calendarDateElement: null,
        calendarDaysContainer: null,
        selectedDayElement: null,
        containerElement: "date-picker",
        selectedItem: null
    }

    datePicker.date = Day({date:date, lang: datePicker.lang});
    datePicker.calendar = Calendar({year:datePicker.date.year, monthNumber:datePicker.date.monthNumber, lang:datePicker.lang});


    datePicker.prevMonth = function () {
        datePicker.calendar.goToPreviousMonth();
        datePicker.renderCalendarDays();
    }

    datePicker.nextMonth = function () {
        datePicker.calendar.goToNextMonth();
        datePicker.renderCalendarDays();
    }

    datePicker.updateHeaderText = function () {
        datePicker.calendarDateElement.textContent = datePicker.calendar.month.name+", "+datePicker.calendar.year;
        const monthYear = datePicker.calendar.month.name+", "+datePicker.calendar.year;
        datePicker.calendarDateElement.setAttribute('aria-label', "current month "+monthYear);
    }

    datePicker.isSelectedDate = function (date) {
        return date.date === datePicker.date.date &&
            date.monthNumber === datePicker.date.monthNumber &&
            date.year === datePicker.date.year;
    }

    datePicker.isCurrentCalendarMonth = function () {
        return datePicker.calendar.month.number === datePicker.date.monthNumber &&
            datePicker.calendar.year === datePicker.date.year;
    }

    datePicker.selectDay = function (el, day) {


        if (isEqualTo(datePicker.date, day)) return;

        datePicker.date = day;

        if (day.monthNumber !== datePicker.calendar.month.number) {
            datePicker.prevMonth();
        } else {
            el.classList.add('selected');
            datePicker.selectedDayElement.classList.remove('selected');
            datePicker.selectedDayElement = el;
            datePicker.destroy()
        }

        datePicker.updateToggleText();


    }

    datePicker.handleClickOut = function (e) {

        let datePickerContainer = document.querySelector(".date-picker");

        if (datePickerContainer) {
            var isClickInside = datePickerContainer.contains(e.target) || datePicker.selectedItem.contains(e.target);

            if (!isClickInside) {
                datePicker.destroy()
            }
        }

    }

    datePicker.destroy = function () {
        let datePickers = document.querySelectorAll(".date-picker");

        for (let index = 0; index < datePickers.length; index++) {
            datePickers[index].classList.remove("active");
            setTimeout(function () {
                if(datePickers[index]){
                    datePickers[index].remove();
                }
                
            }, 100);
        }
    }


    datePicker.getWeekDaysElementStrings = function () {
        return datePicker.calendar.weekDays
            .map(function(weekDay) {return "<span>"+weekDay.substring(0, 3)+"</span>"})
            .join('');
    }

    datePicker.getMonthDaysGrid = function () {
        const firstDayOfTheMonth = getDay(datePicker.calendar.month, 1);
        const prevMonth = datePicker.calendar.getPreviousMonth();
        const totalLastMonthFinalDays = firstDayOfTheMonth.dayNumber - 1;
        const totalDays = datePicker.calendar.month.numberOfDays + totalLastMonthFinalDays;
        const monthList = [];

        for (let index = 0; index < totalDays.length; index++) {
            monthList.push(undefined)
        }

        for (let i = totalLastMonthFinalDays; i < totalDays; i++) {
            monthList[i] = getDay(datePicker.calendar.month, i + 1 - totalLastMonthFinalDays)
        }

        for (let i = 0; i < totalLastMonthFinalDays; i++) {
            const inverted = totalLastMonthFinalDays - (i + 1);
            monthList[i] = getDay(prevMonth, prevMonth.numberOfDays - inverted);
        }


        return monthList;
    }

    datePicker.updateToggleText = function () {
        const date = dayFormat(datePicker.date, datePicker.format)
        datePicker.selectedItem.value = date;
        datePicker.selectedItem.dataset.value = datePicker.date.timestamp;

    }

    datePicker.updateMonthDays = function () {
        datePicker.calendarDaysContainer.innerHTML = '';

        datePicker.getMonthDaysGrid().forEach(function(day) {
            const el = document.createElement('button');
            el.className = 'month-day';
            el.textContent = day.date;
            el.addEventListener('click', function(e) {datePicker.selectDay(el, day)});
            el.setAttribute('aria-label', dayFormat(day, datePicker.format));

            if (day.monthNumber === datePicker.calendar.month.number) {
                el.classList.add('current');
            }

            if (datePicker.isSelectedDate(day)) {
                el.classList.add('selected');
                datePicker.selectedDayElement = el;
            }

            datePicker.calendarDaysContainer.appendChild(el);
        })
    }

    datePicker.renderCalendarDays = function () {
        datePicker.updateHeaderText();
        datePicker.updateMonthDays();
        datePicker.calendarDateElement.focus();
    }


    datePicker.render = function (e) {
        let datePickerElement = document.createElement("div");
        datePickerElement.classList.add("date-picker");

        const monthYear = datePicker.calendar.month.name+", "+datePicker.calendar.year;
        datePickerElement.innerHTML = '<div class="calendar-dropdown">'+
          '<div class="header">' +
              '<button type="button" class="prev-month" aria-label="previous month"></button>' +
              '<p tabindex="0" aria-label="current month '+monthYear+'">'+monthYear+ '</p>' +
              '<button type="button" class="prev-month" aria-label="next month"></button>'+
          '</div>'+
          '<div class="week-days">'+datePicker.getWeekDaysElementStrings()+'</div>'+
          '<div class="month-days"></div></div>';

        datePicker.mounted = true;
        datePicker.calendarDropDown = datePickerElement.querySelector('.calendar-dropdown');

        const prevBtn = datePicker.calendarDropDown.querySelectorAll('.prev-month')[0];
        const calendarDateElement = datePicker.calendarDropDown.querySelector('p');
        const nextButton = datePicker.calendarDropDown.querySelectorAll('.prev-month')[1];

        datePicker.calendarDateElement = calendarDateElement;
        datePicker.calendarDaysContainer = datePicker.calendarDropDown.querySelector('.month-days');

        prevBtn.addEventListener('click', function() {datePicker.prevMonth()});
        nextButton.addEventListener('click', function() {datePicker.nextMonth()});
        document.addEventListener('click', function(e) {datePicker.handleClickOut(e)});

        datePicker.renderCalendarDays();

        e.target.parentNode.appendChild(datePickerElement);

        setTimeout(function () {
            datePickerElement.classList.add("active");
        }, 5);

    }

    datePicker.init = function () {
        const items = document.querySelectorAll(selector);

        for (let ii = 0; ii < items.length; ii++) {
            items[ii].addEventListener('focus', function(e) {
                datePicker.destroy();
                datePicker.selectedItem = e.target;

                datePicker.render(e);

                let day;

                if (e.target.value){
                    day = Day({date:stringToDate(e.target.value, datePicker.format), lang:datePicker.lang});
                }
                else{
                    day = Day(new Date());
                }

                if (isEqualTo(datePicker.date, day)) return;

                datePicker.date = day;

                
                if (day.monthNumber !== datePicker.calendar.month.number) {
                    datePicker.calendar.goToDate(day.monthNumber,day.year);
                    datePicker.render(e);
                } else {
                    let el = document.querySelector("button[aria-label='" + dayFormat(datePicker.date, datePicker.format) + "']");

                    el.classList.add('selected');
                    datePicker.selectedDayElement.classList.remove('selected');
                    datePicker.selectedDayElement = el;
                }

                datePicker.updateToggleText();


            })

        }

    }

    return datePicker;
}


/* helpers */

function getWeekNumber(date) {
    const firstDayOfTheYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfTheYear) / 86400000;

    return Math.ceil((pastDaysOfYear + firstDayOfTheYear.getDay() + 1) / 7)
}

function isLeapYear(year) {
    return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
}

function getDay(month, dayNumber) {
    return Day({date: new Date(month.year, month.number - 1, dayNumber), lang: month.lang});
}

function dayFormat(day, formatStr) {

    if (!String.prototype.padStart) {
        String.prototype.padStart = function padStart(targetLength,padString) {
            targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
            padString = String((typeof padString !== 'undefined' ? padString : ' '));
            if (this.length > targetLength) {
                return String(this);
            }
            else {
                targetLength = targetLength-this.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
                }
                return padString.slice(0,targetLength) + String(this);
            }
        };
    }

    return formatStr
        .replace(/\bYYYY\b/, day.year)
        .replace(/\bYYY\b/, day.yearShort)
        .replace(/\bWW\b/, day.week.toString().padStart(2, '0'))
        .replace(/\bW\b/, day.week)
        .replace(/\bDDDD\b/, day.day)
        .replace(/\bDDD\b/, day.dayShort)
        .replace(/\bDD\b/, day.date.toString().padStart(2, '0'))
        .replace(/\bD\b/, day.date)
        .replace(/\bMMMM\b/, day.month)
        .replace(/\bMMM\b/, day.monthShort)
        .replace(/\bMM\b/, day.monthNumber.toString().padStart(2, '0'))
        .replace(/\bM\b/, day.monthNumber)
}

function isEqualTo(date, day) {
    date = date.Date || date;

    return date.getDate() === day.date &&
        date.getMonth() === day.monthNumber - 1 &&
        date.getFullYear() === day.year;
}

function stringToDate(str, format) {
    switch (format) {
        case "DD.MM.YYYY":
            return new Date(str.replace(/(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"))
        default:
            return new Date(str)
    }
}

DatePicker({ selector: "[data-date-picker]" }).init();


