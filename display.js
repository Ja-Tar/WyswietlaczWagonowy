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
 * @property {object} [timetable]
 * @property {number} timetable.trainMaxSpeed
 * @property {boolean} timetable.hasDangerousCargo
 * @property {boolean} timetable.hasExtraDeliveries
 * @property {string} timetable.warningNotes
 * @property {boolean} timetable.twr
 * @property {string} timetable.category
 * @property {StopPoint[]} timetable.stopList
 * @property {string} timetable.route
 * @property {[string, string]} [timetable.formattedRoute]
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
};

// URL PARAMS
const urlParams = new URLSearchParams(window.location.search);
const trainNumber = urlParams.get('train');
const wagonNumber = urlParams.get('wagon');
const showDelay = parseInt(urlParams.get("delay") ?? 1);
const displayTheme = urlParams.get('theme') ?? Theme.AUTO;
/** Default -> 20km/h */
const stopSpeed = parseInt(urlParams.get('stopSpeed') ?? 20);
const newPrLayout = parseInt(urlParams.get('prLayout') ?? 1);
const mainStationsOnly = parseInt(urlParams.get('mainStations') ?? 0);
const maxDisplayedStops = parseInt(urlParams.get('stopsNumber') ?? 5);

/** @type {HTMLIFrameElement} */
const iframe = document.querySelector('#container');
let iframeLoaded = false;
const devMode = localStorage.getItem("dev");

function resizeIframe() {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1050);
    iframe.style.width = `${1920 * scale}px`;
    iframe.style.height = `${1050 * scale}px`;
}

window.addEventListener('resize', resizeIframe);
resizeIframe();

const templatesUrl = { ic: "template.html", pr: "template_pr.html" };

if (displayTheme === Theme.AUTO) {
    /* AUTO needs to change it later after loading train stock data */
    console.error("AUTO NOT IMPLEMENTED!!!"); // ADD: AUTO theme changes
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
    }
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
    }
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
    let url = "";
    if (devMode) {
        url = `${window.location.origin}/exampleData/getActiveTrainList.json`;
    } else {
        url = "https://stacjownik.spythere.eu/api/getActiveTrainList";
    }

    const options = { method: 'GET' };
    try {
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
    train = formatTrainRoute(train);
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
 * @returns {TrainInfo} with formattedRoute
 */
function formatTrainRoute(train) {
    const route = train.timetable?.route;
    if (!route) return train; // before split: DOBRZYNIEC|Wielichowo Główne
    const capitalizedRoute = capitalizeStationNames(route.split("|"));
    const formattedRoute = capitalizedRoute.map(stopName => correctStationName(stopName));
    train.timetable.formattedRoute = formattedRoute;
    return train;
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
    const trainNameString = `${trainName.prefix} ${trainName.trainNo} ${trainName.trainName}`;
    iframe.contentDocument.getElementById('train_name').textContent = trainNameString;
    document.title = `Wagon ${wagonNumber} - ${trainNameString}`;
}

/**
 * @param {TrainInfo} train
 */
function updateRoute(train) {
    const route = train.timetable.formattedRoute;
    iframe.contentDocument.getElementById('route_box').textContent = route.join(' - ');
}

/**
 * @param {TrainInfo} train
 */
function setTrainNumber(train) {
    const trainName = getTrainFullName(trainNumber, train.stockString, train.timetable.category);
    const trainNameString = `${trainName.prefix} ${trainName.trainNo}`;
    iframe.contentDocument.getElementById('train_number').textContent = trainNameString;
    document.title = `Wagon ${wagonNumber} - ${trainNameString}`;
}

/**
 * @param {TrainInfo} train
 */
function updateDestination(train) {
    const route = train.timetable.formattedRoute;
    iframe.contentDocument.getElementById('destination').textContent = route[1];
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

/** @type {{Object.<string, number>}} StopNameRaw, arrivalTimestamp */
const removedStopsName = {};
let checking = false;
let atStation = false;
let atOrigin = false;

/**
 * @param {TrainInfo} train
 */
function setRouteStations(train) {
    const timetableStops = train.timetable.stopList;

    const filteredTimetableStops = timetableStops.filter(stopPoint => stopPoint.stopType.includes('ph') || stopPoint.beginsHere === true || stopPoint.terminatesHere === true);

    const formattedTimetableStops = formatStopsName(filteredTimetableStops);

    /** @type {StopPoint[]} */
    const nextStopsList = [];

    formattedTimetableStops.forEach(stopPoint => {
        if (stopPoint.confirmed === 0) {
            nextStopsList.push(stopPoint);
        }
    });

    const doneStopList = monitorArrivalCondition(nextStopsList, train);

    console.debug("Is at station:", atStation);
    console.debug("Removed stops:", removedStopsName);
    checking = true;

    if (doneStopList.length < 1) {
        if (displayTheme === Theme.IC) {
            // ADD: End screen for IC display
        } else if (displayTheme === Theme.PR) {
            atStation = true;
            renderStopHeader(formattedTimetableStops.at(-1));
            renderStopMap(formattedTimetableStops, []);
            atStation = false; // REMOVE Maybe not needed 
        }
        return;
    }

    if (displayTheme === Theme.IC) {
        // get first next stop
        renderNextStops(doneStopList);
    } else if (displayTheme === Theme.PR) {
        renderStopHeader(doneStopList[0]);
        renderStopMap(formattedTimetableStops, doneStopList);
    }
}

/**
 * @param {StopPoint[]} nextStopsList 
 * @param {TrainInfo} train 
 * @returns {StopPoint[]}
 */
function monitorArrivalCondition(nextStopsList, train) {
    const currentTime = new Date().getTime();

    nextStopsList = nextStopsList.filter(stopPoint => !(removedStopsName?.[stopPoint.stopNameRAW] === stopPoint.arrivalTimestamp));
    if (nextStopsList < 1) return [];

    if (checking === true) {
        // Normal flow
        if (nextStopsList[0].stopNameType === "po") {
            if (atOrigin) {
                atStation = false;
                atOrigin = false;
            }

            if (nextStopsList[0].arrivalRealTimestamp < currentTime && train.speed < stopSpeed && atStation === false) {
                atStation = true;
            }

            if (atStation === true && train.speed > stopSpeed) {
                atStation = false;
                const removedStop = nextStopsList.splice(0, 1)[0];
                removedStopsName[removedStop.stopNameRAW] = removedStop.arrivalTimestamp;
            }
        } else {
            if ((nextStopsList[0].arrivalRealTimestamp < currentTime && train.speed < stopSpeed) || nextStopsList[0].beginsHere === true) {
                atStation = true;
            }

            if (nextStopsList[0].arrivalRealTimestamp > currentTime) {
                atStation = false;
            }
        }
    } else {
        let firstCheckedStop = false;

        // Fallback for starting website
        nextStopsList = nextStopsList.filter(stopPoint => {
            if (stopPoint.stopNameType === 'po' && firstCheckedStop === false) {
                /* check if stop has been passed (stop without confirmed arrival) */
                const departureTime = stopPoint.departureRealTimestamp;
                if (currentTime > departureTime) {
                    removedStopsName[stopPoint.stopNameRAW] = stopPoint.arrivalTimestamp;
                    return false;
                }
            } else {
                firstCheckedStop = true;
            }
            return true;
        });

        if (nextStopsList[0].beginsHere === true) {
            atStation = true;
            atOrigin = true;
        }
    }
    return nextStopsList;
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

    if (mainStationsOnly) {
        nextStopsList = nextStopsList.filter((stopPoint) => stopPoint.mainStop === true);
    }

    if (nextStopsList.length > maxDisplayedStops) {
        console.warn(`Wykryto więcej niż ${maxDisplayedStops} przystanków na trasie`);
        nextStopsList = nextStopsList.slice(0, maxDisplayedStops);
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

    iframe.contentWindow.scrollText();
}

let lastStationText = "";

/**
 * @param {StopPoint} nextStop
 */
function renderStopHeader(nextStop) {
    const stationLabelElement = iframe.contentDocument.getElementById("station_label");
    const stationNameElement = iframe.contentDocument.getElementById("station");

    if (atStation) {
        // TRAIN ARRIVED AT STATION
        stationLabelElement.textContent = "Stacja/Station:";
    } else {
        stationLabelElement.textContent = "Następna stacja/Next station:";
    }

    if (lastStationText === nextStop.stopNameRAW) return;

    stationNameElement.textContent = nextStop.stopNameRAW;
    lastStationText = nextStop.stopNameRAW;
    iframe.contentWindow.scrollText();
}

const DEPARTED_IMG = {
    START: "./static/map/start_passed.svg",
    STOP: "./static/map/stop_passed.svg",
    END: "./static/map/end_passed.svg"
};

/**
 * @param {StopPoint[]} stopsList StopPoint list with passed stops
 * @param {StopPoint[]} nextStopsList
 */
function renderStopMap(stopsList, nextStopsList) {
    const mainDisplay = iframe.contentDocument.getElementById("main_display");
    const DISPLAY_CONFIG = {
        CAROUSEL_START: "repeat(7, 9.7vw) 15vw 9.7vw",
        CAROUSEL_CONTINUE: "13vw repeat(6, 9.7vw) 13vw 9.7vw",
        CONTINUOS: "13vw repeat(7, 9.7vw) 13vw",
        END: "15vw repeat(8, 9.7vw)"
    };

    // First and last stop

    setStop("start", stopsList.at(0));
    setStop("end", stopsList.at(-1));

    // First station checks

    if (nextStopsList[0]?.stopNameRAW !== stopsList[0].stopNameRAW) {
        trainDeparted("start", DEPARTED_IMG.START);
        moveTrainIndicator("start", true);
    }

    // If timetable is done

    if (nextStopsList.length < 1) {
        // ADD: Implement no stations left / no stations
        showArrivedLayout();
        moveTrainIndicator("end", false);
        // Also change data updates to 1m, don't show error screen on no data
        // Implement some kind of route continue when new timetable is given
        return;
    }

    // Smaller layout for less then 9 stops

    if (stopsList.length <= 9) {
        showSmallerLayout();
        return;
    }

    if (nextStopsList.length <= 7) {
        stopCarousel();
        showEndLayout();
        return;
    }

    if (nextStopsList.includes(stopsList.at(2))) {
        showCarouselStartLayout();
        return;
    }

    if (!newPrLayout) {
        stopCarousel();
        showContinuosLayout();
    } else {
        showCarouselLayout();
    }

    /**
     * Layout for arrived trains (all stops are confirmed === 1)
     */
    function showArrivedLayout() {
        nextStopsList.push(stopsList.at(-1));
        if (stopsList.length <= 9) {
            showSmallerLayout();
        } else {
            showEndLayout();
        }
        return;
    }

    /**
     * Shows only stops that are in timetable, because it's too short
     */
    function showSmallerLayout() {
        mainDisplay.style.gridTemplateColumns = DISPLAY_CONFIG.END;
        mainDisplay.style.alignSelf = "center";

        /** @type {string[]} */
        const emptyStops = [];

        stopsList.shift();
        stopsList.pop();

        let firstPassedStopIndex = 0;

        for (let i = 1; i < 8; i++) {
            const stop = stopsList.at(-i);
            if (stop) {
                if (nextStopsList.includes(stop)) {
                    setStop(`stop${-i + 8}`, stop);
                } else {
                    setPassedStop(`stop${-i + 8}`, stop);
                    if (firstPassedStopIndex === 0) {
                        firstPassedStopIndex = -i + 8;
                    }
                }
            } else {
                setEmptyStop(`stop${-i + 8}`);
                emptyStops.push(`stop${-i + 8}`);
                if (firstPassedStopIndex === 0) {
                    firstPassedStopIndex = -i + 8;
                }
            }
        }

        if (!firstPassedStopIndex) {
            firstPassedStopIndex = 7;
        }

        if (!nextStopsList[0].beginsHere === true) {
            if (atStation) {
                if (firstPassedStopIndex + 1 > 7) {
                    moveTrainIndicator("end", false);
                } else {
                    moveTrainIndicator(`stop${firstPassedStopIndex + 1}`, false);
                }
            } else {
                if (!emptyStops.includes(`stop${firstPassedStopIndex}`)) {
                    moveTrainIndicator(`stop${firstPassedStopIndex}`, true);
                }
            }
        }

        mainDisplay.style.gridTemplateColumns = `repeat(${stopsList.length + 2}, 9.7vw)`;
    }

    /**
     * If stop (7) is the last one move it closer to end station, stop moving stops afer departure, and only move train icon.
     */
    function showEndLayout() {
        mainDisplay.style.gridTemplateColumns = DISPLAY_CONFIG.END;
        mainDisplay.style.marginLeft = '-10vw';

        const currentNextStopIndex = stopsList.indexOf(nextStopsList[0]);
        const numberOfStopsLeft = stopsList.length - currentNextStopIndex - 1;

        let currentStop = 0;
        for (let i = 1; i < 8; i++) {
            const elementId = `stop${i}`;
            if (-i + 8 > numberOfStopsLeft) {
                // PASSED
                setPassedStop(elementId, stopsList.at(-(-i + 9)));
                if (!atStation) {
                    moveTrainIndicator(elementId, true);
                }
            } else {
                // NOT PASSED
                setStop(elementId, nextStopsList[currentStop]);
                if (atStation && currentStop === 0) {
                    moveTrainIndicator(elementId, false);
                }
                currentStop += 1;
            }
        }

        if (nextStopsList[0].terminatesHere === true && atStation) {
            moveTrainIndicator("end", false);
        }
    }

    /**
     * Show all stops after 6 one on 7 stop element, stop showing after departure from second stop.
     */
    function showCarouselStartLayout() {
        mainDisplay.style.gridTemplateColumns = DISPLAY_CONFIG.CAROUSEL_START;
        const currentNextStopIndex = stopsList.indexOf(nextStopsList[0]);
        const removeStartOnlyStops = -currentNextStopIndex + 2;

        for (let i = 1; i < 7; i++) {
            const elementId = `stop${i}`;
            if (currentNextStopIndex <= i) {
                // NOT PASSED
                setStop(elementId, stopsList[i]);
                if (atStation && currentNextStopIndex === i) {
                    moveTrainIndicator(elementId, false);
                }
            } else {
                // PASSED
                setPassedStop(elementId, stopsList[i]);
                moveTrainIndicator(elementId, true);
            }
        }

        nextStopsList.splice(0, removeStartOnlyStops);
        startCarousel(nextStopsList);
    }

    /**
     * Show rest of stops that doesn't fit on 7 stop element, stop showing when there is only 1 stop to show.
     * 
     * Alternative to ContinuosLayout
     */
    function showCarouselLayout() {
        mainDisplay.style.gridTemplateColumns = DISPLAY_CONFIG.CAROUSEL_CONTINUE;
        mainDisplay.style.marginLeft = '-10vw';
        const currentNextStopIndex = stopsList.indexOf(nextStopsList[0]);

        setPassedStop("stop1", stopsList[currentNextStopIndex - 1]);
        moveTrainIndicator("stop1", true);

        for (let i = 0; i < 5; i++) {
            const elementId = `stop${i + 2}`;
            setStop(elementId, nextStopsList[i]);
            if (atStation && i === 0) {
                moveTrainIndicator(elementId, false);
            }
        }

        startCarousel(nextStopsList);
    }

    /**
     * Move stops to only show one passed (1), current / next (2), and other (3, 4, 5, 6, 7) 
     */
    function showContinuosLayout() {
        mainDisplay.style.gridTemplateColumns = DISPLAY_CONFIG.CONTINUOS;

        const currentNextStopIndex = stopsList.indexOf(nextStopsList[0]);
        const passedStop = stopsList.at(currentNextStopIndex - 1);

        setPassedStop("stop1", passedStop);
        setStop("stop2", nextStopsList[0]);

        if (atStation) {
            moveTrainIndicator("stop2", false);
        } else {
            moveTrainIndicator("stop1", true);
        }

        for (let i = 3; i < 8; i++) {
            setStop(`stop${i}`, nextStopsList[i - 2]);
        }
    }
}

/**
 * 
 * @param {string} elementId 
 * @param {StopPoint} stopPoint
 */
function setStop(elementId, stopPoint) {
    setStopName(elementId, stopPoint.stopNameRAW);
    if (elementId === "start") return;
    if (elementId !== "end") {
        setDepartTime(elementId, stopPoint.departureTimestamp);
    } else {
        setDepartTime(elementId, stopPoint.arrivalTimestamp);
    }
}

/**
 * @param {string} elementId
 */
function setEmptyStop(elementId) {
    const nameElement = iframe.contentDocument.getElementById(`${elementId}_name`);
    const timeElement = iframe.contentDocument.getElementById(`${elementId}_time`);
    const imgElement = iframe.contentDocument.getElementById(`${elementId}_img`);

    nameElement.style.display = "none";
    timeElement.style.display = "none";
    imgElement.style.display = "none";
}

/**
 * 
 * @param {string} elementId 
 * @param {StopPoint} stopPoint
 */
function setPassedStop(elementId, stopPoint) {
    setStopName(elementId, stopPoint.stopNameRAW);
    trainDeparted(elementId, DEPARTED_IMG.STOP);
    setDepartTime(elementId);
}

/**
 * @param {string} elementId 
 * @param {string} [stopName]
 */
function setStopName(elementId, stopName) {
    const nameElement = iframe.contentDocument.getElementById(`${elementId}_name`);

    nameElement.textContent = stopName;
}

/**
 * @param {string} elementId 
 * @param {number} [departureTimestamp]
 */
function setDepartTime(elementId, departureTimestamp) {
    if (elementId > 7) {
        elementId = "end";
    }
    const timeElement = iframe.contentDocument.getElementById(`${elementId}_time`);

    if (timeElement.children.length) {
        console.warn("Train icon HERE: ", elementId);
        return;
    }

    if (departureTimestamp) {
        const departureTime = new Date(departureTimestamp);
        const hours = departureTime.getHours();
        const minutes = departureTime.getMinutes();
        timeElement.innerText = `${twoDigits(hours)}:${twoDigits(minutes)}`;
    } else {
        timeElement.innerText = "";
    }
}

/**
 * @param {string} elementId 
 * @param {string} departedImgSrc
 */
function trainDeparted(elementId, departedImgSrc) {
    const nameElement = iframe.contentDocument.getElementById(`${elementId}_name`);
    const imgElement = iframe.contentDocument.getElementById(`${elementId}_img`);

    nameElement.classList.add("passed");
    imgElement.src = departedImgSrc;
}

/**
 * @param {string} elementId 
 * @param {boolean} passed 
 */
function moveTrainIndicator(elementId, passed) {
    if (elementId > 7) {
        elementId = "end";
    }
    const timeElement = iframe.contentDocument.getElementById(`${elementId}_time`);
    const iconElement = iframe.contentDocument.getElementById("train_icon");

    timeElement.innerHTML = "";
    if (!passed) {
        timeElement.appendChild(iconElement);
        iconElement.removeAttribute("style");
    } else {
        if (iconElement.parentElement !== timeElement) {
            timeElement.appendChild(iconElement);
        }
        iconElement.style.transform = "translateX(5vw)";
    }
}

let carouselRunning = false;
let carouselStep = 0;
let carouselMappedStops = [];
let carouselId = 0;

/**
 * @param {StopPoint[]} nextStopsList 
 */
function startCarousel(nextStopsList) {
    nextStopsList.splice(0, 5);
    nextStopsList.pop();
    const mappedStops = nextStopsList.map(stopPoint => [stopPoint.stopNameRAW, stopPoint.departureTimestamp]);

    if (arraysEqual(carouselMappedStops, mappedStops)) return;
    if (carouselRunning) stopCarousel();

    carouselRunning = true;
    carouselMappedStops = mappedStops;
    nextStationCarousel();
    carouselId = setInterval(nextStationCarousel, 5000);
}

function nextStationCarousel() {
    if (carouselStep >= carouselMappedStops.length) {
        carouselStep = 0;
    }
    setStopName("stop7", carouselMappedStops[carouselStep][0]);
    setDepartTime("stop7", carouselMappedStops[carouselStep][1]);
    carouselStep += 1;
}

/**
 * Stops last stop showing next stations if on
 */
function stopCarousel() {
    if (carouselRunning) {
        clearInterval(carouselId);
        carouselRunning = false;
    }
}

/**
 * @param {Array} a 
 * @param {Array} b 
 * @returns {boolean}
 */
function arraysEqual(a, b) {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
        const va = a[i], vb = b[i];
        const bothArr = Array.isArray(va) && Array.isArray(vb);
        if (bothArr) {
            if (!arraysEqual(va, vb)) return false;
        } else {
            if (!Object.is(va, vb)) return false;
        }
    }
    return true;
}

let error = false;

async function changeValues() {
    if (!trainNumber || !wagonNumber) {
        return;
    }

    await getAPIsForTrainName();
    setCarriageNumber();

    const success = await setDataFromStacjownik();

    if (!iframeLoaded) {
        console.warn("Iframe not LOADED!");
        return;
    }

    if (!success) {
        displayErrorBox();
        error = true;
    } else {
        showMainDisplay();
        if (error) {
            hideErrorBox();
        }
    }

    function displayErrorBox() {
        iframe.contentDocument.getElementById('main_display').style.visibility = 'hidden';
        iframe.contentDocument.getElementById('loader_box').style.display = 'none';
        iframe.contentDocument.getElementById('error_box').style.display = 'flex';
        if (displayTheme === Theme.PR) {
            iframe.contentDocument.getElementById('top_bar').style.color = "transparent";
        }
    }

    function hideErrorBox() {
        iframe.contentDocument.getElementById('main_display').style.visibility = 'visible';
        iframe.contentDocument.getElementById('error_box').style.display = 'none';
        if (displayTheme === Theme.PR) {
            iframe.contentDocument.getElementById('top_bar').removeAttribute("style");
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
    const carriageNumberElement = iframe.contentDocument.getElementById('carriage_number');
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
    }

    if (displayTheme === Theme.IC) {
        if (iframe.contentDocument.getElementById('route_box').childElementCount === 0) {
            iframe.contentWindow.dynamicWrapText('route_box');
        }
        iframe.contentWindow.overflowRestStations();
    } else if (displayTheme === Theme.PR) {
        iframe.contentWindow.checkForWrap();
        iframe.contentWindow.checkForStationWrap();
    }
}

iframe.onload = function () {
    if (!trainNumber || !wagonNumber) {
        showDebugScreen();
    }
    changeValues();
    setTemperature();
    setInterval(setDateAndTime, 1000); // 1 second
    setInterval(setTemperature, 600000); // 10 minutes
    setInterval(changeValues, 15000); // 15 seconds
};

window.addEventListener('resize', applyResponsiveStyles);