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
    /** @type {('ic'|'pr'|'')} */
    const companyTheme = document.getElementById("company_theme")?.value || "";
    const normalOptions = [{id: 'train_number'}, {id: 'wagon_number'}, {id: "stop_speed", default: 20}];
    const themeRelatedOptions = {
        ic: [{id: 'delay', default: 1}, {id: 'main_stations', default: 0}, {id: 'stops_number', default: 5}],
        pr: [{id:'pr_layout', default: 0}]
    };

    // FIX: Finish this!!!!
    // BUG: Finish this!!!!

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