document.getElementById('input_box').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('submit').click();
    }
});

document.getElementById('submit').addEventListener('click', function () {
    const trainNumber = document.getElementById('train_number');
    const wagonNumber = document.getElementById('wagon_number');
    const displayDelayCheckbox = document.getElementById('delay');
    const trainNumberValue = trainNumber.value;
    const wagonNumberValue = wagonNumber.value;
    const displayTypeValue = displayDelayCheckbox.checked ? 'delay' : 'default'; // default

    if (trainNumberValue && wagonNumberValue) {
        window.location.href = `display.html?train=${trainNumberValue}&wagon=${wagonNumberValue}&type=${displayTypeValue}`;
    } else {
        function setInvalidStyle(element) {
            element.style.borderColor = 'red';
            element.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            setTimeout(() => {
                element.style.backgroundColor = '';
                element.style.borderColor = '';
            }, 2000);
        }

        if (!trainNumberValue) setInvalidStyle(trainNumber);
        if (!wagonNumberValue) setInvalidStyle(wagonNumber);
    }
});

document.getElementById('settings').addEventListener('click', function () {
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
});