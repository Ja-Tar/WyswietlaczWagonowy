// API DEFINITIONS: 

/** 
 * @typedef {object} StopPoint
 * @property {string} stopName
 * @property {string} stopNameRAW
 * @property {string} stopType
 * @property {number} stopDistance
 * @property {string} pointId
 * @property {null | string} comments
 * @property {boolean} mainStop
 * @property {null | string} arrivalLine
 * @property {number} arrivalTimestamp
 * @property {number} arrivalRealTimestamp
 * @property {number} arrivalDelay
 * @property {null | string} departureLine
 * @property {number} departureTimestamp
 * @property {number} departureRealTimestamp
 * @property {number} departureDelay
 * @property {boolean} beginsHere
 * @property {boolean} terminatesHere
 * @property {number} confirmed
 * @property {number} stopped
 * @property {null | number} stopTime
 * @property {string} stationName
 * @property {string} stationHash
 * @property {string} stopNameType
 */

/** 
 * @typedef {object} TrainInfo
 * @property {string} id
 * @property {number} trainNo
 * @property {number} mass
 * @property {number} speed
 * @property {number} length
 * @property {number} distance
 * @property {string} stockString
 * @property {string} driverName
 * @property {number} driverId
 * @property {boolean} driverIsSupporter
 * @property {number} driverLanguageId
 * @property {number} driverLevel
 * @property {string} currentStationHash
 * @property {string} currentStationName
 * @property {string} signal
 * @property {string} connectedTrack
 * @property {number} online
 * @property {number} lastSeen
 * @property {string} region
 * @property {boolean} isTimeout
 * @property {boolean} driverIsDonator
 * @property {object | null} timetable
 * @property {number} timetable.trainMaxSpeed
 * @property {boolean} timetable.hasDangerousCargo
 * @property {boolean} timetable.hasExtraDeliveries
 * @property {string} timetable.warningNotes
 * @property {boolean} timetable.twr
 * @property {string} timetable.category
 * @property {StopPoint[]} timetable.stopList
 * @property {string} timetable.route
 * @property {number} timetable.timetableId
 * @property {string[]} timetable.sceneries
 * @property {string} timetable.path
 */

// ===============================

import { getAPIsForTrainName, getTrainFullName, correctStationName } from "./api/train_name.js";

const Theme = {
    AUTO: "auto",
    IC: "ic",
    PR: "pr"
}

// Change version on API update
const apiVersion = '1';

const urlParams = new URLSearchParams(window.location.search);
const trainNumber = urlParams.get('train');
const wagonNumber = urlParams.get('wagon');
const showDelay = parseInt(urlParams.get("delay")) || 0;
const displayTheme = urlParams.get('theme') || Theme.AUTO;
/** @type {HTMLIFrameElement} */
const iframe = document.querySelector('#container');
let iframeLoaded = false;

function resizeIframe() {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1050);
    iframe.style.width = `${1920 * scale}px`;
    iframe.style.height = `${1050 * scale}px`;
}

window.addEventListener('resize', resizeIframe);
resizeIframe();

// TODO: Major rework needed! (separate ic display function specific things to prepare for pr ones)
const templatesUrl = { ic: "template.html", pr: "template_pr.html" };

if (displayTheme === Theme.AUTO) {
    /* fetch main template.html (for now) */
    fetchTemplate("template.html");
    /* AUTO needs to change it later after loading train stock data */
    console.error("AUTO NOT IMPLEMENTED!!!"); // TODO: Add AUTO theme changes.
} else {
    fetchTemplate(templatesUrl[displayTheme]);
}

/**
 * @param {string} templateUrl 
 */
function fetchTemplate(templateUrl) {
    const options = { method: 'GET', headers: { 'Cache-Control': 'public' } };
    fetch(templateUrl, options)
        .then(response => {
            if (response.status === 200) {
                iframeLoaded = true;
            }
            return response.text();
        })
        .then(data => {
            iframe.srcdoc = data;
        })
        .catch(error => {
            console.error('Error fetching template:', error);
        });
}

function setDateAndTime() {
    if (!iframeLoaded) {
        console.warn("Iframe not LOADED!");
        return;
    };
    const dateDiv = iframe.contentDocument.getElementById('date');
    const minDiv = iframe.contentDocument.getElementById('min');
    const colonDiv = iframe.contentDocument.getElementById('colon');
    const secDiv = iframe.contentDocument.getElementById('sec');
    const weekdayName = iframe.contentDocument.getElementById("weekday_name");

    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    dateDiv.textContent = `${twoDigits(day)}.${twoDigits(month)}.${year}`;
    minDiv.textContent = `${twoDigits(hours)}`;
    secDiv.textContent = `${twoDigits(minutes)}`;
    if (colonDiv.style.visibility === 'visible') {
        colonDiv.style.visibility = 'hidden';
    } else {
        colonDiv.style.visibility = 'visible';
    }

    if (weekdayName) {
        const dayNamesPolish = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
        const dayNamesEnglish = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayNumber = date.getDay();
        weekdayName.textContent = `${dayNamesPolish[dayNumber]}/${dayNamesEnglish[dayNumber]}`;
    }
}

/**
 * @param {number} n 
 * @returns {string}
 */
function twoDigits(n) {
    return String(n).padStart(2, '0');
}

async function setTemperature() {
    if (!iframeLoaded) {
        console.warn("Iframe not LOADED!");
        return;
    };
    const temperatureDiv = iframe.contentDocument.getElementById('temperature');
    if (!temperatureDiv) return;

    const url = 'https://api.td2.info.pl/?method=getWeather';

    const options = { method: 'GET' };
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        if (data.success) {
            let temperature = data.message.main.temp; // temperature in Kelvin
            temperature = Math.round(temperature - 273.15); // convert to Celsius
            temperatureDiv.textContent = `${temperature}°C`;
        } else {
            console.error('Error fetching weather data');
        }
    } catch (fetchError) {
        console.error(fetchError);
        temperatureDiv.textContent = '--°C';
    }
}

/**
 * @returns {boolean} True -> OK
 */
async function setDataFromStacjownik() {
    const url = "https://stacjownik.spythere.eu/api/getActiveTrainList";

    const options = { method: 'GET' };
    try {
        //throw new Error('An error has occurred'); 
        const response = await fetch(url, options);
        /** @type {TrainInfo[]} */
        const data = await response.json();

        if (data.length > 0) {
            const train = data.find(_train => _train.trainNo === parseInt(trainNumber));
            if (train) {
                if (train.timetable) {
                    updateTrainDisplay(train);
                    return true;
                }
                console.error("No timetable set for the train");
                return false;
            }
            console.error('Train not found');
            return false;
        }
        console.error('No active trains found');
        return false;
    } catch (fetchError) {
        if (fetchError instanceof TypeError) {
            console.error('[Train timetable not found]:', fetchError);
        } else {
            console.error('Fetch error occurred:', fetchError); // Log other errors
        }
        return false;
    }
}

/**
 * 
 * @param {TrainInfo} train 
 */
function updateTrainDisplay(train) {
    // TODO: Check for changes and refresh only on them!
    displayCurrentSpeed(train);
    if (displayTheme === Theme.IC) {
        setTrainName(train);
        updateRoute(train);
    } else {
        setTrainNumber(train);
        updateDestination(train);
    }
    setRouteStations(train);
}

/**
 * @param {TrainInfo} train 
 */
function displayCurrentSpeed(train) {
    const currentSpeedDiv = iframe.contentDocument.getElementById('current_speed');
    const speed = train.speed;
    currentSpeedDiv.textContent = `${speed} km/h`;
}

/**
 * @param {TrainInfo} train 
 */
function setTrainName(train) {
    const trainName = getTrainFullName(trainNumber, train.stockString, train.timetable.category);
    const trainNameString = `${trainName.prefix} ${trainName.number} ${trainName.trainName}`
    iframe.contentDocument.getElementById('train_name').textContent = trainNameString;
    document.title = `Wagon ${wagonNumber} - ${trainNameString}`;
}

/**
 * @param {TrainInfo} train 
 */
function updateRoute(train) {
    const route = train.timetable.route.split('|'); // before split: DOBRZYNIEC|Wielichowo Główne
    iframe.contentDocument.getElementById('route_box').textContent = capitalizeStationNames(route).join(' - ');
}

/**
 * @param {TrainInfo} train 
 */
function setTrainNumber(train) {
    const trainName = getTrainFullName(trainNumber, train.stockString, train.timetable.category);
    const trainNameString = `${trainName.prefix} ${trainName.number}`
    iframe.contentDocument.getElementById('train_number').textContent = trainNameString;
    document.title = `Wagon ${wagonNumber} - ${trainNameString}`;
}

/**
 * @param {TrainInfo} train 
 */
function updateDestination(train) {
    const route = train.timetable.route.split('|');
    iframe.contentDocument.getElementById('destination').textContent = capitalizeStationNames(route)[1];
}

function capitalizeStationNames(route) {
    route = route.map(station => station.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
    return route;
}

/**
 * @param {StopPoint[]} stopPoints 
 * @returns 
 */
function formatStopsName(stopPoints) {
    stopPoints.forEach(stopPoint => {
        let formattedStopName = stopPoint.stopNameRAW;
        formattedStopName = formattedStopName.split(',');
        let stopNameType = formattedStopName[1];
        if (!stopNameType) {
            stopNameType = '';
        }
        formattedStopName = formattedStopName[0].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        stopPoint.stopNameRAW = correctStationName(formattedStopName);
        stopPoint.stopNameType = stopNameType.trim();
    });
    return stopPoints;
}

/**
 * @param {TrainInfo} train 
 */
function setRouteStations(train) {
    /** @type {StopPoint[]} */
    let nextStopsList = [];

    train.timetable.stopList.forEach(stopPoint => {
        if (stopPoint.confirmed === 0) {
            nextStopsList.push(stopPoint);
        }
    });

    nextStopsList = nextStopsList.filter(stopPoint => stopPoint.stopType.includes('ph') || stopPoint.beginsHere === true || stopPoint.terminatesHere === true);

    nextStopsList = formatStopsName(nextStopsList);

    nextStopsList.forEach(stopPoint => {
        if (stopPoint.stopNameType === 'po') {
            /* check if stop has been passed (stop without confirmed arrival) */
            const departureTime = stopPoint.departureRealTimestamp;
            const currentTime = new Date().getTime();
            if (currentTime > departureTime) {
                /* remove stop from the list */
                const index = nextStopsList.indexOf(stopPoint);
                if (index > -1) {
                    nextStopsList.splice(index, 1);
                }
            }
        }
    });

    if (displayTheme === Theme.IC) {
        // get first next stop
        if (nextStopsList.length > 0) {
            renderNextStops(nextStopsList);
        }
    } else if (displayTheme === Theme.PR) {
        renderStopHeader(nextStopsList[0], train.speed);
        // TODO: renderStopMap(nextStopsList);
    }
}

/**
 * @param {StopPoint[]} nextStopsList
 */
function renderNextStops(nextStopsList) {
    const restStationsDiv = iframe.contentDocument.getElementById('rest_stations');
    const nextStation = iframe.contentDocument.getElementById('next_station');
    const nextStationDelay = iframe.contentDocument.getElementById('next_station_delay');
    const oldDelayTime = iframe.contentDocument.getElementById('old_time');
    const newDelayTime = iframe.contentDocument.getElementById('new_time');
    const nextStationDelayName = iframe.contentDocument.getElementById('next_station_delay_name');

    const firstNextStop = nextStopsList[0];
    //console.log('First next stop:', firstNextStop); 
    let departureTime = firstNextStop.arrivalTimestamp;
    let departureDelay = firstNextStop.arrivalDelay;
    let realDepartureTime = firstNextStop.arrivalRealTimestamp;
    if (firstNextStop.beginsHere === true) {
        departureTime = firstNextStop.departureTimestamp;
        departureDelay = firstNextStop.departureDelay;
        realDepartureTime = firstNextStop.departureRealTimestamp;
        restStationsDiv.innerHTML = '';
    }

    departureTime = new Date(departureTime);
    departureTime = departureTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    realDepartureTime = new Date(realDepartureTime);
    realDepartureTime = realDepartureTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    nextStation.textContent = `${departureTime} ${firstNextStop.stopNameRAW}`;
    oldDelayTime.innerHTML = `<del>${departureTime}</del> (+${departureDelay})`;
    newDelayTime.textContent = `${realDepartureTime}`;
    nextStationDelayName.textContent = `${firstNextStop.stopNameRAW}`;

    if (departureDelay > 3 && showDelay) {
        nextStationDelay.style.display = '';
        nextStationDelay.classList.add('currently_displayed');
        nextStation.style.display = 'none';
        nextStation.classList.remove('currently_displayed');
    } else {
        nextStationDelay.style.display = 'none';
        nextStationDelay.classList.remove('currently_displayed');
        nextStation.style.display = '';
        nextStation.classList.add('currently_displayed');
    }

    if (nextStopsList.length > 5) {
        console.warn('Wykryto więcej niż 5 przystanków na trasie');
        // TODO: Dodać możliwość zmiany maksymalnej ilości + czy wyświetlać tylko główne stacje
        nextStopsList = nextStopsList.slice(0, 5);
    }

    if (nextStopsList.length > 1) {
        restStationsDiv.innerHTML = '';

        const restStations = nextStopsList.slice(1);

        restStations.forEach((stopPoint, index) => {
            let stopTime = stopPoint.arrivalTimestamp;
            if (stopPoint.beginsHere === true) {
                stopTime = stopPoint.departureTimestamp;
            }
            const stopTimeDate = new Date(stopTime);
            const stopTimeString = stopTimeDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            const stopName = stopPoint.stopNameRAW;
            const stopElement = document.createElement('span');

            stopElement.textContent = `${stopTimeString} ${stopName}${index < restStations.length - 1 ? ', ' : ''}`;
            restStationsDiv.appendChild(stopElement);
        });

    } else {
        restStationsDiv.innerHTML = '';
    }
}

/**
 * @param {StopPoint} nextStop
 * @param {number} trainSpeed
 */
function renderStopHeader(nextStop, trainSpeed) {
    const stationLabelElement = iframe.contentDocument.getElementById("station_label");
    const stationNameElement = iframe.contentDocument.getElementById("station");

    const currentTime = new Date().getTime();
    if ((nextStop.arrivalRealTimestamp > currentTime && trainSpeed < 20) || (nextStop.departureRealTimestamp > currentTime && nextStop.beginsHere === true)) {
        // TRAIN ARRIVED AT STATION
        stationLabelElement.textContent = "Stacja/Station:";
    } else {
        stationLabelElement.textContent = "Następna stacja/Next station:";
    }
    stationNameElement.textContent = nextStop.stopNameRAW;
}

async function changeValues() {
    if (!iframeLoaded) {
        console.warn("Iframe not LOADED!");
        return;
    };

    //if (displayType === 'delay') {
    //    nextStationDelay = iframe.contentDocument.getElementById('next_station_delay');
    //    nextStation = iframe.contentDocument.getElementById('next_station');
    //    nextStationDelay.style.display = '';
    //    nextStationDelay.classList.add('currently_displayed');
    //    nextStation.style.display = 'none';
    //    nextStation.classList.remove('currently_displayed');
    //}

    if (!trainNumber || !wagonNumber) {
        return;
    }

    await getAPIsForTrainName(apiVersion);
    setCarriageNumber();

    const success = await setDataFromStacjownik();

    if (!success) {
        displayErrorBox();
    } else {
        showMainDisplay();
    }

    function displayErrorBox() {
        iframe.contentDocument.getElementById('main_display').style.visibility = 'hidden';
        iframe.contentDocument.getElementById('loader_box').style.display = 'none';
        iframe.contentDocument.getElementById('error_box').style.display = 'flex';

        if (displayTheme === Theme.PR) {
            iframe.contentDocument.getElementById('top_bar').style.color = "transparent";
        }
    }

    function showMainDisplay() {
        iframe.contentDocument.getElementById('main_display').style.visibility = 'visible';
        iframe.contentDocument.getElementById('loader_box').style.display = 'none';

        if (displayTheme === Theme.PR) {
            iframe.contentDocument.getElementById('top_bar').style.removeProperty("color");
        }

        applyResponsiveStyles();
    }
}

function setCarriageNumber() {
    const carriageNumberElement = iframe.contentDocument.getElementById('carriage_number')
    if (!carriageNumberElement) return;
    carriageNumberElement.textContent = wagonNumber;
}

function showDebugScreen() {
    iframe.contentDocument.getElementById('main_display').style.visibility = 'visible';
    iframe.contentDocument.getElementById('loader_box').style.display = 'none';
    //iframe.contentDocument.getElementById('error_box').style.display = 'flex';

    applyResponsiveStyles();

    console.error('Train or wagon number not provided - displaying template only');
}

function applyResponsiveStyles() {
    if (!iframeLoaded) {
        console.warn("Iframe not LOADED!");
        return;
    };

    iframe.contentWindow.scrollText();

    if (displayTheme === Theme.IC) {
        if (iframe.contentDocument.getElementById('route_box').childElementCount === 0) {
            iframe.contentWindow.dynamicWrapText('route_box');
        }
        iframe.contentWindow.overflowRestStations();
    } else if (displayTheme === Theme.PR) {
        iframe.contentWindow.checkForWrap();
    }
}

iframe.onload = function () {
    if (!trainNumber || !wagonNumber) {
        showDebugScreen();
    }
    changeValues();
    setTemperature();
}

setInterval(setDateAndTime, 1000); // 1 second
setInterval(setTemperature, 600000); // 10 minutes
setInterval(changeValues, 15000); // 15 seconds
window.addEventListener('resize', applyResponsiveStyles);