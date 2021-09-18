(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory(root));
    } else if (typeof exports === 'object') {
        module.exports = factory(root);
    } else {
        root.agogDatePicker = factory(root);
    }
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {

    'use strict';

    var agogDatePicker = {};
    var supports = !!document.querySelector && !!root.addEventListener;
    var settings;


    // Varsayılan ayarlar

    var defaults = {
        date: new Date(),
        lang: window.navigator.language,
        selector: '[data-agog-date-picker]',
        format: 'DD.MM.YYYY',
        callbackBefore: function () {},
        callbackAfter: function () {}
    };


    /**
     * Destroy the current initialization.
     * @public
     */
    // agogDatePicker.destroy = function () {
    //     if (!settings) return;

    //     // agogDatePicker.removeListeners();

    //     // document.querySelectorAll("." + settings.mainClass).forEach(item => item.remove())

    //     settings = null;

    // };

    agogDatePicker.destroy = function () {
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
    
    

    agogDatePicker.init = function (options) {

        if (!supports) return;

        agogDatePicker.destroy();

        // settings = extend(defaults, options || {});
        settings = Object.assign(defaults, options);
        agogDatePicker.settings = settings;

        let date;

        agogDatePicker.date = agogDatePicker.Day(date || new Date());
        agogDatePicker.calendar = agogDatePicker.Calendar(agogDatePicker.date.year,agogDatePicker.date.monthNumber);

        settings.callbackBefore();

        agogDatePicker.create();

        settings.callbackAfter();

    };

    agogDatePicker.Day = function(date) {
        date = date || new Date();
        const lang = agogDatePicker.settings.lang;
    
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

    agogDatePicker.Month = function(date, dayNumber) {
    
        let monthsSize = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let day = agogDatePicker.Day(date);
    
        let month = {
            day:day,
            monthsSize: monthsSize,
            lang: agogDatePicker.settings.lang,
            name: day.month,
            number: day.monthNumber,
            year: day.year,
            numberOfDays: day.monthNumber === 2 ? monthsSize[day.monthNumber - 1] + (isLeapYear(day.year) ? 1 : 0) : monthsSize[day.monthNumber - 1]
        }
    
        month.getDay = agogDatePicker.Day(new Date(month.year, month.number - 1, dayNumber));
        
        return month;
    }

    agogDatePicker.Calendar = function(year, monthNumber) {
    
        let calendar = {
            today: agogDatePicker.Day(),
            weekDays: []
        }
    
        for (let index = 0; index < 7; index++) {
            calendar.weekDays.push(undefined)
        }
    
        calendar.year = year || calendar.today.year;

        calendar.month = agogDatePicker.Month(new Date(calendar.year, (monthNumber || calendar.today.monthNumber) - 1));
    
        calendar.getMonth = function (monthNumber) {
            return agogDatePicker.Month(new Date(calendar.year, monthNumber - 1));
        }
    
        for (let i = 0; i < calendar.weekDays.length; i++) {
            const day = agogDatePicker.Month(new Date(calendar.year, calendar.today.monthNumber - 1),  i + 1).getDay;
            if (!calendar.weekDays.indexOf(day.day)>-1) {
                calendar.weekDays[day.dayNumber - 1] = day.day
            }
            
        }
    
        calendar.isLeapYear = function () {
            return isLeapYear(calendar.year);
        }
    
        calendar.getMonth = function (monthNumber) {
            return agogDatePicker.Month(new Date(calendar.year, monthNumber - 1));
        }
    
        calendar.getPreviousMonth = function () {
            if (calendar.month.number === 1) {
                return agogDatePicker.Month(new Date(calendar.year - 1, 11));
            }
    
            return agogDatePicker.Month(new Date(calendar.year, calendar.month.number - 2));
        }
    
        calendar.getNextMonth = function () {
            if (calendar.month.number === 12) {
                return agogDatePicker.Month(new Date(calendar.year + 1, 0));
            }
    
            return agogDatePicker.Month(new Date(calendar.year, calendar.month.number + 2));
        }
    
        calendar.goToDate = function (monthNumber, year) {
            calendar.month = agogDatePicker.Month(new Date(year, monthNumber - 1));
            calendar.year = year;
        }
    
        calendar.goToNextYear = function () {
            calendar.year += 1;
            calendar.month = agogDatePicker.Month(new Date(calendar.year, 0));
        }
    
        calendar.goToPreviousYear = function () {
            calendar.year -= 1;
            calendar.month = agogDatePicker.Month(new Date(calendar.year, 11));
        }
    
        calendar.goToNextMonth = function () {
            if (calendar.month.number === 12) {
                return calendar.goToNextYear();
            }
    
            calendar.month = agogDatePicker.Month(new Date(calendar.year, (calendar.month.number + 1) - 1));
        }
    
        calendar.goToPreviousMonth = function () {
            if (calendar.month.number === 1) {
                return calendar.goToPreviousYear();
            }
    
            calendar.month = agogDatePicker.Month(new Date(calendar.year, (calendar.month.number - 1) - 1));
        }
    
        return calendar;
    }

    var staticOption = {
        calendarDateElement: null,
        calendarDaysContainer: null,
        selectedDayElement: null,
        selectedItem: null
    }

    agogDatePicker.prevMonth = function () {
        agogDatePicker.calendar.goToPreviousMonth();
        agogDatePicker.renderCalendarDays();
    }

    agogDatePicker.nextMonth = function () {
        agogDatePicker.calendar.goToNextMonth();
        agogDatePicker.renderCalendarDays();
    }

    agogDatePicker.updateHeaderText = function () {
        staticOption.calendarDateElement.textContent = agogDatePicker.calendar.month.name+", "+agogDatePicker.calendar.year;
        const monthYear = agogDatePicker.calendar.month.name+", "+agogDatePicker.calendar.year;
        staticOption.calendarDateElement.setAttribute('aria-label', "current month "+monthYear);
    }

    agogDatePicker.isSelectedDate = function (date) {
        return date.date === agogDatePicker.date.date &&
            date.monthNumber === agogDatePicker.date.monthNumber &&
            date.year === agogDatePicker.date.year;
    }

    agogDatePicker.isCurrentCalendarMonth = function () {
        return agogDatePicker.calendar.month.number === agogDatePicker.date.monthNumber &&
            agogDatePicker.calendar.year === agogDatePicker.date.year;
    }

    agogDatePicker.selectDay = function (el, day) {

        if (isEqualTo(agogDatePicker.date, day)) return;

        agogDatePicker.date = day;

        if (day.monthNumber !== agogDatePicker.calendar.month.number) {
            agogDatePicker.prevMonth();
        } else {
            el.classList.add('selected');
            staticOption.selectedDayElement.classList.remove('selected');
            staticOption.selectedDayElement = el;
            agogDatePicker.destroy()
        }

        agogDatePicker.updateToggleText();


    }

    agogDatePicker.handleClickOut = function (e) {

        let datePickerContainer = document.querySelector(".date-picker");

        if (datePickerContainer) {
            var isClickInside = datePickerContainer.contains(e.target) || staticOption.selectedItem.contains(e.target);

            if (!isClickInside) {
                agogDatePicker.destroy()
            }
        }

    }




    agogDatePicker.getWeekDaysElementStrings = function () {
        return agogDatePicker.calendar.weekDays
            .map(function(weekDay) {return "<span>"+weekDay.substring(0, 3)+"</span>"})
            .join('');
    }

    agogDatePicker.getMonthDaysGrid = function () {
        const firstDayOfTheMonth = getDay(agogDatePicker.calendar.month, 1);
        const prevMonth = agogDatePicker.calendar.getPreviousMonth();
        const totalLastMonthFinalDays = firstDayOfTheMonth.dayNumber - 1;
        const totalDays = agogDatePicker.calendar.month.numberOfDays + totalLastMonthFinalDays;
        const monthList = [];

        for (let index = 0; index < totalDays.length; index++) {
            monthList.push(undefined)
        }

        for (let i = totalLastMonthFinalDays; i < totalDays; i++) {
            monthList[i] = getDay(agogDatePicker.calendar.month, i + 1 - totalLastMonthFinalDays)
        }

        for (let i = 0; i < totalLastMonthFinalDays; i++) {
            const inverted = totalLastMonthFinalDays - (i + 1);
            monthList[i] = getDay(prevMonth, prevMonth.numberOfDays - inverted);
        }


        return monthList;
    }

    agogDatePicker.updateToggleText = function () {
        const date = dayFormat(agogDatePicker.date, agogDatePicker.settings.format)
        staticOption.selectedItem.value = date;
        staticOption.selectedItem.dataset.value = agogDatePicker.date.timestamp;

    }

    agogDatePicker.updateMonthDays = function () {

        staticOption.calendarDaysContainer.innerHTML = '';

        agogDatePicker.getMonthDaysGrid().forEach(function(day) {
            const el = document.createElement('button');
            el.className = 'month-day';
            el.textContent = day.date;
            el.addEventListener('click', function(e) {agogDatePicker.selectDay(el, day)});
            el.setAttribute('aria-label', dayFormat(day, agogDatePicker.settings.format));

            if (day.monthNumber === agogDatePicker.calendar.month.number) {
                el.classList.add('current');
            }

            if (agogDatePicker.isSelectedDate(day)) {
                el.classList.add('selected');
                staticOption.selectedDayElement = el;
            }

            staticOption.calendarDaysContainer.appendChild(el);
        })
    }

    agogDatePicker.renderCalendarDays = function () {
        agogDatePicker.updateHeaderText();
        agogDatePicker.updateMonthDays();
        staticOption.calendarDateElement.focus();
    }

    agogDatePicker.create = function () {
        const items = document.querySelectorAll(settings.selector);

        for (let ii = 0; ii < items.length; ii++) {
            items[ii].addEventListener('focus', function(e) {
                agogDatePicker.destroy();
                staticOption.selectedItem = e.target;

                agogDatePicker.render(e);

                let day;

                if (e.target.value){
                    day = agogDatePicker.Day(stringToDate(e.target.value, agogDatePicker.settings.format));
                }
                else{
                    day = agogDatePicker.Day(new Date());
                }

                if (isEqualTo(agogDatePicker.date, day)) return;

                agogDatePicker.date = day;

                
                if (day.monthNumber !== agogDatePicker.calendar.month.number) {
                    agogDatePicker.calendar.goToDate(day.monthNumber,day.year);
                    agogDatePicker.render(e);
                } else {
                    let el = document.querySelector("button[aria-label='" + dayFormat(agogDatePicker.date, agogDatePicker.settings.format) + "']");

                    el.classList.add('selected');
                    staticOption.selectedDayElement.classList.remove('selected');
                    staticOption.selectedDayElement = el;
                }

                agogDatePicker.updateToggleText();


            })

        }
    };

    agogDatePicker.render = function (e) {
        let datePickerElement = document.createElement("div");
        datePickerElement.classList.add("date-picker");

        const monthYear = agogDatePicker.calendar.month.name+", "+agogDatePicker.calendar.year;
        datePickerElement.innerHTML = '<div class="calendar-dropdown">'+
          '<div class="header">' +
              '<button type="button" class="prev-month" aria-label="previous month"></button>' +
              '<p tabindex="0" aria-label="current month '+monthYear+'">'+monthYear+ '</p>' +
              '<button type="button" class="prev-month" aria-label="next month"></button>'+
          '</div>'+
          '<div class="week-days">'+agogDatePicker.getWeekDaysElementStrings()+'</div>'+
          '<div class="month-days"></div></div>';

        const calendarDropDown = datePickerElement.querySelector('.calendar-dropdown');

        const prevBtn = calendarDropDown.querySelectorAll('.prev-month')[0];
        const calendarDateElement = calendarDropDown.querySelector('p');
        const nextButton = calendarDropDown.querySelectorAll('.prev-month')[1];

        staticOption.calendarDateElement = calendarDateElement;
        staticOption.calendarDaysContainer = calendarDropDown.querySelector('.month-days');

        prevBtn.addEventListener('click', function() {agogDatePicker.prevMonth()});
        nextButton.addEventListener('click', function() {agogDatePicker.nextMonth()});
        document.addEventListener('click', function(e) {agogDatePicker.handleClickOut(e)});

        agogDatePicker.renderCalendarDays();

        e.target.parentNode.appendChild(datePickerElement);

        setTimeout(function () {
            datePickerElement.classList.add("active");
        }, 5);

    }
    agogDatePicker.addListeners = function () {

    };

    agogDatePicker.removeListeners = function () {

    };

    function getWeekNumber(date) {
        const firstDayOfTheYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfTheYear) / 86400000;
    
        return Math.ceil((pastDaysOfYear + firstDayOfTheYear.getDay() + 1) / 7)
    }
    
    function isLeapYear(year) {
        return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
    }
    
    function getDay(month, dayNumber) {
        return agogDatePicker.Day(new Date(month.year, month.number - 1, dayNumber));
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

    return agogDatePicker;

});