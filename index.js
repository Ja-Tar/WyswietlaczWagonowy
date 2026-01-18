document.getElementById('input_box').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('submit').click();
    }
});

/**
 * 
 * @param {Event} parm_event 
 * @param {RegExp} regex 
 */
function validateField(parm_event, regex) {
    const inputField = parm_event.target;
    const isPasted = parm_event.type === "paste";
    let text = "";

    if (isPasted) {
        text = parm_event.clipboardData.getData('Text');
        console.log(text);
    }
}

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

function navigateToDisplay() {
    const inputBox = document.getElementById("input_box");
    const trainNumber = document.getElementById('train_number');
    const wagonNumber = document.getElementById('wagon_number');
    const displayDelayCheckbox = document.getElementById('delay');
    const trainNumberValue = trainNumber.value;
    const wagonNumberValue = wagonNumber.value;
    const displayTypeValue = displayDelayCheckbox.checked ? 'delay' : 'default'; // default

    if (validateRequiredFields(inputBox)) {
        window.location.href = `display.html?train=${trainNumberValue}&wagon=${wagonNumberValue}&type=${displayTypeValue}`;
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

document.getElementById('submit').addEventListener('click', navigateToDisplay);
document.getElementById('settings').addEventListener('click', toggleSettingsDiv);