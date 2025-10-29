window.nameCorrectionsAPI_URL = "https://raw.githubusercontent.com/Thundo54/tablice-td2-api/master/namesCorrections.json";
window.operatorConvertAPI_URL = 'https://raw.githubusercontent.com/Thundo54/tablice-td2-api/master/operatorConvert.json';

window.trainCategory = {
    "E": ['EI', 'EC', 'EN'],
    "O": ['MP', 'MH', 'MM', 'MO',
        'RP', 'RA', 'RM', 'RO'],
    "T": ['PW', "PX",
        'TC', 'TG', 'TR', 'TD', 'TM', 'TN', 'TK', 'TS', 'TH',
        'LP', 'LT', 'LS', 'LZ',
        'ZG', 'ZN', 'ZU']
};
window.operatorFullNames = {
    "IC": "PKP Intercity",
    "KM": "Koleje Mazowieckie",
    "SKMT": "SKM Trójmiasto",
    "PR": "POLREGIO",
    "KŚ": "Koleje Śląskie",
    "ŁKA": "Łódzka Kolej Aglomeracyjna",
    "KD": "Koleje Dolnośląskie",
    "": " "
};

async function getAPIsForTrainName(apiVersion) {
    if (localStorage.getItem('apiVersion') === apiVersion && window.operatorConvertData && window.nameCorrectionsData) {
        //console.log("APIs already loaded.");
        return;
    }

    try {
        const response = await fetch(window.nameCorrectionsAPI_URL);
        window.nameCorrectionsData = await response.json();
        console.log("Name corrections data loaded successfully.");
    } catch (error) {
        console.error("Error loading name corrections data:", error);
    }

    try {
        const responseOperator = await fetch(window.operatorConvertAPI_URL);
        window.operatorConvertData = await responseOperator.json();
        console.log("Operator convert data loaded successfully.");
    } catch (error) {
        console.error("Error loading operator convert data:", error);
    }

    localStorage.setItem('apiVersion', apiVersion);
}

function getTrainName(trainNumber, stockString, trainCategory) {
    //console.log("Getting train name for:", trainNumber, stockString, trainCategory);

    let operator = '';
    let trainNumberPrefix = '';
    let trainNo = trainNumber;
    let endTrainName = '';

    //return `IC ${trainNumber} JAKAŚ NAZWA`; // Placeholder implementation

    // Operator recognition

    let operatorList = [];

    for (const key in window.operatorConvertData.operators) {
        const splitStockString = stockString.split(";");

        for (let j = 0; j < splitStockString.length; j++) {
            if (key === splitStockString[j]) {
                operatorList.push(window.operatorConvertData.operators[key]);
            }
        }
    }

    // Get most common operator 
    if (operatorList.length > 0) {
        let counts = {};
        operatorList.forEach(function (operators) {
            operators.forEach(function (operator) {
                counts[operator] = (counts[operator] || 0) + 1;
            });
        });

        const mostCommonOperator = Object.keys(counts).reduce(function (a, b) {
            return counts[a] > counts[b] ? a : b;
        });

        operator = mostCommonOperator;
        //console.debug("Most common operator: ", mostCommonOperator);
    }

    // Train prefix recognition

    for (let j = 0; j < window.operatorConvertData.categories.length; j++) {
        let prefixData = window.operatorConvertData.categories[j];
        let trainOperator = operator;
        let prefixObject = prefixData.category;

        if (prefixData.operator === trainOperator) {
            for (let key in prefixObject) {
                if (trainCategory.startsWith(key)) {
                    trainNumberPrefix = prefixObject[key];
                    //console.debug(`Train with prefix: ${trainNumberPrefix} ${trainNo}`);
                }
            }
        }
    }

    // Train name recognition

    for (let j = 0; j < window.operatorConvertData.trainNames.length; j++) {
        let trainNameData = window.operatorConvertData.trainNames[j];
        let trainOperatorBefore = operator;
        let trainNoIs = trainNameData.trainNo;

        for (let k = 0; k < trainNoIs.length; k++) {
            if (trainNameData.operator === trainOperatorBefore) {
                if (trainNoIs[k] === trainNo.toString()) {
                    operator = trainNameData.operator;
                    endTrainName = trainNameData.trainName;
                    trainNumberPrefix = trainNameData.operator;

                    console.debug(`Name: ${endTrainName}, Operator: ${operator}, Number: ${trainNumberPrefix} ${trainNo}`);
                    break;
                }
            } else {
                break;
            }
        }

    }

    // Train name and prefix override

    // TODO: Add train name and prefix override

    return `${trainNumberPrefix} ${trainNo} ${endTrainName}`; // Placeholder implementation
}
