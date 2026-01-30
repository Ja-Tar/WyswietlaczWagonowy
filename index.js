// VALIDATION

/**
 * @param {Element} element 
 * @returns {boolean}
 */
function validateRequiredFields(element) {
    for (const el of element.querySelectorAll("[required]")) {
        if (!el.checkValidity()) {
            el.reportValidity();
            return false;
        }
    }
    return true;
}

// NAVIGATION

function navigateToDisplay() {
    const inputBox = document.getElementById("input_box");
    const urlParams = getUrlParamsFromInputs();

    if (validateRequiredFields(inputBox)) {
        window.location.href = `display.html?${urlParams.toString()}`;
    }
}

/**
 * @returns {URLSearchParams}
 */
function getUrlParamsFromInputs() {
    // TODO: Maybe make this automatic - from list of element id
    const trainNumber = document.getElementById('train_number');
    const wagonNumber = document.getElementById('wagon_number');
    const displayDelayCheckbox = document.getElementById('delay');
    const displayThemeSelect = document.getElementById("company_theme");
    const stopSpeed = document.getElementById("stop_speed");
    const prLayoutCheckbox = document.getElementById("pr_layout");
    const mainStationsCheckbox = document.getElementById("main_stations");
    const stopsNumber = document.getElementById("stops_number");

    const trainNumberValue = trainNumber.value;
    const wagonNumberValue = wagonNumber.value;
    const showDelay = Number(displayDelayCheckbox.checked);
    /** @type {('ic'|'pr'|'')} */
    const displayTheme = displayThemeSelect.value;
    const stopSpeedValue = parseInt(stopSpeed.value);
    const prLayout = Number(prLayoutCheckbox.checked);
    const mainStations = Number(mainStationsCheckbox.checked);
    const stopsNumberValue = parseInt(stopsNumber.value);

    const urlParams = new URLSearchParams();
    urlParams.set("train", trainNumberValue);
    urlParams.set("wagon", wagonNumberValue);

    if (showDelay !== 1) {
        urlParams.set("delay", showDelay);
    }
    if (displayTheme !== "") {
        urlParams.set("theme", displayTheme);
    }
    if (stopSpeedValue !== 20) {
        urlParams.set("stopSpeed", stopSpeedValue);
    }

    // IC ONLY

    if (displayTheme === "ic") {
        if (mainStations !== 0) {
            urlParams.set("mainStations", mainStations);
        }
        if (stopsNumberValue !== 5) {
            urlParams.set("stopsNumber", stopsNumberValue);
        }
    }

    // PR ONLY

    if (prLayout && displayTheme === "pr") {
        urlParams.set("prLayout", prLayout);
    }

    return urlParams;
}

/**
 * @param {KeyboardEvent} e 
 */
function submitOnEnter(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('submit').click();
    }
}

document.getElementById('input_box').addEventListener('keydown', submitOnEnter);
document.getElementById('submit').addEventListener('click', navigateToDisplay);

// THEME CHANGES

/**
 * @param {string | null} themeName 
 */
function selectTheme(themeName) {
    if (themeName) {
        document.documentElement.dataset.companyTheme = themeName;
    }
}

const companyThemeSelect = document.getElementById("company_theme");

selectTheme(companyThemeSelect.value);
companyThemeSelect.addEventListener("change", (ev) => selectTheme(ev.target.value));