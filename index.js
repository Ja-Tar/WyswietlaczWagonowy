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
    const elementIds = ['train_number', 'wagon_number', "pr_layout", "main_stations", "stops_number"];
    const defaultValues = [null, null, 1, 20, 0, 0, 5]; // null -> send always
    if (elementIds.length !== defaultValues.length) throw new ReferenceError("Different value / id number");
    
    /** @type {('ic'|'pr'|'')} */
    const companyTheme = document.getElementById("company_theme")?.value || "";
    const normalOptions = ['train_number', 'wagon_number', "stop_speed"]
    const themeRelatedOptions = {
        ic: ['delay', 'main_stations', 'stops_number'],
        pr: ['pr_layout']
    };

    /** @type {HTMLInputElement[] | HTMLSelectElement[]} */
    const elements = [];
    elementIds.forEach(elementId => elements.push(document.getElementById(elementId)));

    const urlParams = new URLSearchParams();
    elements.forEach((inputElement, i) => {
        /** @type {null | Number | string} */
        let value = null;
        if (inputElement?.type === "checkbox") {
            value = Number(inputElement.checked);
        } else if (inputElement?.type === "number") {
            value = parseInt(inputElement.value);
        } else if (inputElement.tagName === "SELECT") {
            value = inputElement.value;
        } else {
            console.error("Wrong input element type!!!", inputElement);
        }

        if (themeRelatedOptions?.[companyTheme].includes(inputElement.id)) {
            debugger;
        }
        if (defaultValues[i] === null || value !== defaultValues[i]) {
            urlParams.set(inputElement.name, value);
        }
    });

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