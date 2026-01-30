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
    const trainNumber = document.getElementById('train_number');
    const wagonNumber = document.getElementById('wagon_number');
    const displayDelayCheckbox = document.getElementById('delay');
    const displayThemeSelect = document.getElementById("company_theme");
    const trainNumberValue = trainNumber.value;
    const wagonNumberValue = wagonNumber.value;
    const showDelay = +displayDelayCheckbox.checked;
    const displayTheme = displayThemeSelect.value;

    if (validateRequiredFields(inputBox)) {
        window.location.href = `display.html?train=${trainNumberValue}&wagon=${wagonNumberValue}&delay=${showDelay}&theme=${displayTheme}`;
    }
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