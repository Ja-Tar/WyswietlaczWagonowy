/**
 * @typedef {Object.<string, Array.<string>>} OperatorsMap
 */

/**
 * Like: {"R": "Os"}
 * @typedef {Object.<string, Array.<string>>} CategoryMap
 */

/**
 * @typedef {Object} OverwriteData
 * @property {string} operator
 * @property {string} operatorOverwrite
 * @property {string[]} trainNoStartsWith
 * @property {CategoryMap} category
 * @property {string} remarks Nazwa pociągu
 */

/**
 * @typedef {Object} TrainNameData
 * @property {string} operator
 * @property {string[]} trainNo
 * @property {string} categoryOverwrite
 * @property {string} trainName
 */

/**
 * @typedef {Object} operatorConvertAPI
 * @property {OperatorsMap} operators - map: stock name -> operator name
 * @property {object[]} categories
 * @property {string} categories.operator
 * @property {CategoryMap} categories.category - map: category (part or full name) -> operator specific naming
 * @property {OverwriteData[]} overwrite
 * @property {TrainNameData[]} trainNames
 */

window.nameCorrectionsAPI_URL = "https://raw.githubusercontent.com/Ja-Tar/tablice-td2-api/master/namesCorrections.json";
window.operatorConvertAPI_URL = 'https://raw.githubusercontent.com/Ja-Tar/tablice-td2-api/master/operatorConvert.json';

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

/**
* @typedef {Window & {
* operatorConvertData?: operatorConvertAPI,
* nameCorrectionsData?: any,
* operatorConvertAPI_URL?: string,
* nameCorrectionsAPI_URL?: string,
* trainCategory: Object.<string, Array.<string>>,
* operatorFullNames: Object.<string, string>
* }} WindowWithAPIs
*/

/** @type {WindowWithAPIs} */
const win = window;

export async function getAPIsForTrainName(apiVersion) {
    if (localStorage.getItem('apiVersion') === apiVersion && win.operatorConvertData && win.nameCorrectionsData) {
        //console.log("APIs already loaded.");
        return;
    }

    try {
        const response = await fetch(win.nameCorrectionsAPI_URL);
        win.nameCorrectionsData = await response.json();
    } catch (error) {
        console.error("Error loading name corrections data:", error);
    }

    try {
        const responseOperator = await fetch(win.operatorConvertAPI_URL);
        win.operatorConvertData = await responseOperator.json();
    } catch (error) {
        console.error("Error loading operator convert data:", error);
    }

    localStorage.setItem('apiVersion', apiVersion);
}

/**
 * @param {string} stopName
 * @returns {string}
 */
export function correctStationName(stopName) {
    let output = stopName;
    for (const element of Object.keys(win.nameCorrectionsData)) {
        output = output.replaceAll(element, win.nameCorrectionsData[element]);
    }
    return output;
}

/**
 * 
 * @param {Number} number 
 * @param {string} stockString 
 * @param {string} trainCategory 
 * @returns {{prefix: string, trainName: string, name: string}}
 */
export function getTrainFullName(number, stockString, trainCategory) {
    console.debug('Stock string:', stockString);

    const operator = determineOperator(stockString);
    let prefix = getTrainPrefixByCategory(operator, trainCategory);

    let trainName = '';
    ({ trainNumberPrefix: prefix, endTrainName: trainName } = mapTrainName(operator, number, trainCategory));

    const overwrite = overwriteTrainInfo(operator, number, trainCategory);
    if (overwrite) {
        prefix = overwrite.trainNumberPrefix;
        trainName = overwrite.endTrainName;
    }

    return { prefix, number, trainName };
}

/**
 * @param {string} operator 
 * @param {Number} trainNo 
 * @returns {{operator: string, trainNumberPrefix: string, endTrainName: string}}
 */
function mapTrainName(operator, trainNo) {
    let endTrainName = "";
    let trainNumberPrefix = "";

    for (let j = 0; j < win.operatorConvertData.trainNames.length; j++) {
        const trainNameData = win.operatorConvertData.trainNames[j];
        const trainOperatorBefore = operator;
        const trainNoIs = trainNameData.trainNo;

        for (let k = 0; k < trainNoIs.length; k++) {
            if (trainNameData.operator === trainOperatorBefore) {
                if (trainNoIs[k] === trainNo.toString()) {
                    if (isNaN(parseInt(trainNo))) console.error("WTF?!", trainNo, trainNoIs[k]);
                    operator = trainNameData.operator;
                    endTrainName = trainNameData.trainName;
                    trainNumberPrefix = trainNameData.categoryOverwrite;
                }
            } else {
                break;
            }
        }
    }

    return { operator, trainNumberPrefix, endTrainName };
}

/**
 * @param {string} operator 
 * @param {string} trainCategory 
 * @returns {string}
 */
function getTrainPrefixByCategory(operator, trainCategory) {
    for (let j = 0; j < win.operatorConvertData.categories.length; j++) {
        const prefixData = win.operatorConvertData.categories[j];
        const trainOperator = operator;
        const prefixObject = prefixData.category;

        if (prefixData.operator === trainOperator) {
            for (const key in prefixObject) {
                if (trainCategory.startsWith(key)) {
                    return prefixObject[key];
                }
            }
        }
    }
    console.warn("No prefix found!")
    return "";
}

/**
 * @param {string} stockString 
 * @returns {string | null}
 */
function determineOperator(stockString) {
    const operatorList = [];

    for (const key of Object.keys(win.operatorConvertData.operators)) {
        const splitStockString = stockString.split(";");

        for (let j = 0; j < splitStockString.length; j++) {
            if (key === splitStockString[j]) {
                operatorList.push(win.operatorConvertData.operators[key]);
            }
        }
    }

    // Get most common operator 
    if (operatorList.length > 0) {
        const counts = {};
        operatorList.forEach(operators => {
            operators.forEach(operator => {
                counts[operator] = (counts[operator] || 0) + 1;
            });
        });

        const mostCommonOperator = Object.keys(counts).reduce((a, b) => {
            return counts[a] > counts[b] ? a : b;
        });

        return mostCommonOperator;
    } else {
        return null;
    }
}

/**
 * @param {string} operator 
 * @param {Number} trainNo 
 * @param {string} trainCategory 
 * @returns {{operator: string, trainNumberPrefix: string, endTrainName: string} | null}
 */
function overwriteTrainInfo(operator, trainNo, trainCategory) {
    let trainNumberPrefix = "";

    /** @type {Object.<string, OverwriteData>} */
    const matches = {};
    for (const key of Object.keys(win.operatorConvertData.overwrite)) {
        const overwriteData = win.operatorConvertData.overwrite[parseInt(key)];
        if (operator === overwriteData.operator) {
            for (const key2 of Object.keys(overwriteData.trainNoStartsWith)) {
                const startsWithNumber = overwriteData.trainNoStartsWith[parseInt(key2)];
                if (trainNo.toString().startsWith(startsWithNumber)) {
                    matches[startsWithNumber] = overwriteData;
                }
            }
        }
    }
    /** @type {[string, OverwriteData][]} */
    let chosenOverwrite = [];
    if (Object.keys(matches).length < 1) {
        return null;
    } else if (Object.keys(matches).length > 1) {
        const matchesSorted = Object.entries(matches).sort(([a, ], [b, ]) => b - a);
        chosenOverwrite = matchesSorted[0][1];
    } else {
        chosenOverwrite = Object.entries(matches)[0][1];
    }

    const prefixObject = chosenOverwrite.category;
    const endTrainName = chosenOverwrite.remarks;
    operator = chosenOverwrite.operatorOverwrite;

    for (const key in prefixObject) {
        if (trainCategory.startsWith(key)) {
            trainNumberPrefix = prefixObject[key];
        }
    }

    return {operator, trainNumberPrefix, endTrainName};
}

win.overwriteTrainInfo = overwriteTrainInfo;