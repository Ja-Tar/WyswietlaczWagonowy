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
    const showDelay = displayDelayCheckbox.checked;
    const displayTheme = displayThemeSelect.value;

    if (validateRequiredFields(inputBox)) {
        window.location.href = `display.html?train=${trainNumberValue}&wagon=${wagonNumberValue}&delay=${showDelay}&theme=${displayTheme}`;
    }
}

function toggleSettingsDiv() {
    const settingsDiv = document.getElementById('settings_div');
    if (settingsDiv.classList.contains('show')) {
        settingsDiv.style.maxHeight = '0';
        settingsDiv.style.opacity = '0';
        settingsDiv.style.padding = '0 2vw';
    } else {
        settingsDiv.style.maxHeight = settingsDiv.scrollHeight + 'px';
        settingsDiv.style.opacity = '1';
        settingsDiv.style.padding = '2vh 2vw';
    }
    settingsDiv.classList.toggle('show');
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
document.getElementById('settings').addEventListener('click', toggleSettingsDiv);

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

selectTheme(companyThemeSelect.value)
companyThemeSelect.addEventListener("change", (ev) => selectTheme(ev.target.value))