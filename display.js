// API DEFINITIONS: 

/** 
 * @typedef {object} StopPoint
 * @property {string} stopName
 * @property {string} stopNameRAW
 * @property {string} stopType
 * @property {number} stopDistance
 * @property {string} pointId
 * @property {null} comments
 * @property {boolean} mainStop
 * @property {string} arrivalLine
 * @property {number} arrivalTimestamp
 * @property {number} arrivalRealTimestamp
 * @property {number} arrivalDelay
 * @property {string} departureLine
 * @property {number} departureTimestamp
 * @property {number} departureRealTimestamp
 * @property {number} departureDelay
 * @property {boolean} beginsHere
 * @property {boolean} terminatesHere
 * @property {number} confirmed
 * @property {number} stopped
 * @property {number} stopTime
 * @property {string} stationName
 * @property {string} stationHash
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
 * @property {object} timetable
 * @property {number} timetable.trainMaxSpeed
 * @property {boolean} timetable.hasDangerousCargo
 * @property {boolean} timetable.hasExtraDeliveries
 * @property {string} timetable.warningNotes
 * @property {boolean} timetable.twr
 * @property {string} timetable.category
 * @property {object[]} timetable.stopList
 * @property {string} timetable.stopList.stopName
 * @property {string} timetable.stopList.stopNameRAW
 * @property {string} timetable.stopList.stopType
 * @property {number} timetable.stopList.stopDistance
 * @property {string} timetable.stopList.pointId
 * @property {null} timetable.stopList.comments
 * @property {boolean} timetable.stopList.mainStop
 * @property {null|string} timetable.stopList.arrivalLine
 * @property {number} timetable.stopList.arrivalTimestamp
 * @property {number} timetable.stopList.arrivalRealTimestamp
 * @property {number} timetable.stopList.arrivalDelay
 * @property {string|null} timetable.stopList.departureLine
 * @property {number} timetable.stopList.departureTimestamp
 * @property {number} timetable.stopList.departureRealTimestamp
 * @property {number} timetable.stopList.departureDelay
 * @property {boolean} timetable.stopList.beginsHere
 * @property {boolean} timetable.stopList.terminatesHere
 * @property {number} timetable.stopList.confirmed
 * @property {number} timetable.stopList.stopped
 * @property {null|number} timetable.stopList.stopTime
 * @property {string} timetable.stopList.stationName
 * @property {string} timetable.stopList.stationHash
 * @property {string} timetable.stopList.stopNameType
 * @property {string} timetable.route
 * @property {number} timetable.timetableId
 * @property {string[]} timetable.sceneries
 * @property {string} timetable.path
 */

// ===============================

// Change version on API update
const apiVersion = '1';

const urlParams = new URLSearchParams(window.location.search);
const trainNumber = urlParams.get('train');
const wagonNumber = urlParams.get('wagon');
const showDelay = parseInt(urlParams.get("delay")) || 0;
const displayTheme = urlParams.get('theme') || "auto";
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

if (displayTheme === "auto") {
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

    dateDiv.textContent = `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`;
    minDiv.textContent = `${hours < 10 ? '0' + hours : hours}`;
    secDiv.textContent = `${minutes < 10 ? '0' + minutes : minutes}`;
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

async function setTemperature() {
    if (!iframeLoaded) {
        console.warn("Iframe not LOADED!");
        return;
    };
    const temperatureDiv = iframe.contentDocument.getElementById('temperature');
    if (!temperatureDiv) return;

    let url = 'https://api.td2.info.pl/?method=getWeather';

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

async function setDataFromStacjownik() {
    let url = "https://stacjownik.spythere.eu/api/getActiveTrainList";

    const options = { method: 'GET' };
    try {
        //throw new Error('An error has occurred'); 
        const response = await fetch(url, options);
        const data = await response.json();

        if (data.length > 0) {
            let train = data.find(train => train.trainNo === parseInt(trainNumber));
            if (train) {
                updateTrainDisplay(train);
                return true;
            } else {
                console.error('Train not found');
                return false;
            }
        } else {
            console.error('No active trains found');
            return false;
        }
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
    console.log(train);
    let currentSpeedDiv = iframe.contentDocument.getElementById('current_speed');
    console.log('Stock string:', train.stockString);

    let speed = train.speed;
    currentSpeedDiv.textContent = `${speed} km/h`;

    let trainNameString = getTrainFullName(trainNumber, train.stockString, train.timetable.category);
    iframe.contentDocument.getElementById('train_name').textContent = trainNameString;
    document.title = `Wagon ${wagonNumber} - ${trainNameString}`;

    let route = train.timetable.route.split('|'); // before split: DOBRZYNIEC|Wielichowo Główne
    route = route.map(station => station.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
    iframe.contentDocument.getElementById('route_box').textContent = route.join(' - ');

    setRouteStations(train.timetable.stopList); // Pass correct stopPoints to the setRouteStations function
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
        stopPoint.stopNameRAW = formattedStopName;
        stopPoint.stopNameType = stopNameType.trim();
    });
    return stopPoints;
}

/**
 * @param {StopPoint[]} stopPoints 
 */
function setRouteStations(stopPoints) {
    /** @type {StopPoint[]} */
    let nextStopsList = [];

    stopPoints.forEach(stopPoint => {
        if (stopPoint.confirmed === 0) {
            nextStopsList.push(stopPoint);
        }
    });

    nextStopsList = nextStopsList.filter(stopPoint => stopPoint.stopType.includes('ph') || stopPoint.beginsHere === true || stopPoint.terminatesHere === true);

    nextStopsList = formatStopsName(nextStopsList);

    nextStopsList.forEach(stopPoint => {
        if (stopPoint.stopNameType === 'po') {
            /* check if stop has been passed (stop without confirmed arrival) */
            let departureTime = stopPoint.departureRealTimestamp;
            let currentTime = new Date().getTime();
            if (currentTime > departureTime) {
                /* remove stop from the list */
                let index = nextStopsList.indexOf(stopPoint);
                if (index > -1) {
                    nextStopsList.splice(index, 1);
                }
            }
        }
    });

    // get first next stop
    if (nextStopsList.length > 0) {
        renderNextStops(nextStopsList);
    }
}

function renderNextStops(nextStopsList) {
    let restStationsDiv = iframe.contentDocument.getElementById('rest_stations');
    const nextStation = iframe.contentDocument.getElementById('next_station');
    const nextStationDelay = iframe.contentDocument.getElementById('next_station_delay');
    const oldDelayTime = iframe.contentDocument.getElementById('old_time');
    const newDelayTime = iframe.contentDocument.getElementById('new_time');
    const nextStationDelayName = iframe.contentDocument.getElementById('next_station_delay_name');

    let firstNextStop = nextStopsList[0];
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

    let stationOverflow = false;

    if (nextStopsList.length > 5) {
        console.warn('Wykryto więcej niż 5 przystanków na trasie');
        // TODO: Dodać możliwość zmiany maksymalnej ilości + czy wyświetlać tylko główne stacje
        nextStopsList = nextStopsList.slice(0, 5);
        stationOverflow = true;
    }

    if (nextStopsList.length > 1) {
        restStationsDiv.innerHTML = '';

        let restStations = nextStopsList.slice(1);

        restStations.forEach((stopPoint, index) => {
            let stopTime = stopPoint.arrivalTimestamp;
            if (stopPoint.beginsHere === true) {
                stopTime = stopPoint.departureTimestamp;
            }
            stopTime = new Date(stopTime);
            stopTime = stopTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            let stopName = stopPoint.stopNameRAW;
            //stopName = stopName.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            let stopElement = document.createElement('span');
            stopElement.textContent = `${stopTime} ${stopName}` + (index < restStations.length - 1 ? ', ' : ''); // : stationOverflow ? '...' : '');
            restStationsDiv.appendChild(stopElement);
        });

    } else {
        restStationsDiv.innerHTML = '';
    }
    return nextStopsList;
}

async function changeValues() {
    if (!iframeLoaded) {
        console.warn("Iframe not LOADED!");
        return;
    };
    nextStationDelay = iframe.contentDocument.getElementById('next_station_delay');
    nextStation = iframe.contentDocument.getElementById('next_station');

    //if (displayType === 'delay') {
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

    let success = false;

    try {
        success = await setDataFromStacjownik();
    } catch (error) {
        console.error('Error fetching train data:', error);
    }

    if (!success) {
        iframe.contentDocument.getElementById('main_display').style.visibility = 'hidden';
        iframe.contentDocument.getElementById('loader_box').style.display = 'none';
        iframe.contentDocument.getElementById('error_box').style.display = 'flex';
    } else {
        iframe.contentDocument.getElementById('main_display').style.visibility = 'visible';
        iframe.contentDocument.getElementById('loader_box').style.display = 'none';

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

    if (displayTheme === "ic") {
        iframe.contentWindow.scrollText();
        if (iframe.contentDocument.getElementById('route_box').childElementCount === 0) {
            iframe.contentWindow.dynamicWrapText('route_box');
        }
        iframe.contentWindow.overflowRestStations();
    } else if (displayTheme === "pr") {
        // TODO: Add functions below!
        //iframe.contentWindow.wrapDirectionText();
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