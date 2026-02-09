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
 * @typedef OptionConfig
 * @property {string} id
 * @property {string | number} [default]
 */

/**
 * @typedef {Object.<string, OptionConfig[]>} ThemeRelatedOptionsConfig
 */

/**
 * @typedef {('ic'|'pr'|'')} CompanyThemeOptions
 */

/**
 * @returns {URLSearchParams}
 */
function getUrlParamsFromInputs() {
    /** @type {CompanyThemeOptions} */
    const companyTheme = document.getElementById("company_theme")?.value || "";
    /** @type {OptionConfig[]} */
    const normalOptions = [ // NOTE Add options here as needed!
        { id: 'train_number' },
        { id: 'wagon_number' },
        { id: 'company_theme', default: "" },
        { id: "stop_speed", default: 20 }
    ];
    /** @type {ThemeRelatedOptionsConfig} */
    const themeRelatedOptions = {
        ic: [
            { id: 'delay', default: 1 },
            { id: 'main_stations', default: 0 },
            { id: 'stops_number', default: 5 }
        ],
        pr: [
            { id: 'pr_layout', default: 1 }
        ]
    };

    if (companyTheme === "") return new URLSearchParams(); // ADD For AUTO
    const allOptions = normalOptions.concat(themeRelatedOptions[companyTheme] || []);
    const urlParams = new URLSearchParams();

    allOptions.forEach(optionConfig => {
        const element = document.getElementById(optionConfig.id);

        if (!element) console.error("No element found", optionConfig.id);

        /** @type {null | number | string} */
        let value = null;
        if (element?.type === "checkbox") {
            value = Number(element.checked);
        } else if (element?.type === "number") {
            value = parseInt(element.value);
            if (isNaN(value)) console.error("PARSE INT is NAN!");
        } else if (element.tagName === "SELECT") {
            value = element.value;
        } else {
            console.error("Wrong input element type!", element);
        }

        if (!element.name) console.error("No element NAME tag found!", element);

        if (value !== optionConfig?.default) {
            urlParams.set(element.name, value);
        }
    });

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