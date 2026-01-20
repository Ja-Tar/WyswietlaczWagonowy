/**
 * @typedef {import('/display.js').TrainInfo} TrainInfo
 */

/**
 * @typedef {Object.<string, Array.<string>>} OperatorsMap
 */

/**
 * Like: {"R": "Os"}
 * @typedef {Object.<string, Array.<string>>} CategoryMap
 */

/**
 * @typedef {Object} operatorConvertAPI
 * @property {OperatorsMap} operators - map: stock name -> operator name
 * @property {object[]} categories
 * @property {string} categories.operator
 * @property {CategoryMap} categories.category - map: category (part or full name) -> operator specific naming
 * @property {object[]} overwrite
 * @property {string} overwrite.operator
 * @property {string} overwrite.operatorOverwrite
 * @property {string[]} overwrite.trainNoStartsWith
 * @property {CategoryMap} overwrite.category
 * @property {string} overwrite.remarks
 * @property {object[]} trainNames
 * @property {string} trainNames.operator
 * @property {string[]} trainNames.trainNo
 * @property {string} trainNames.categoryOverwrite
 * @property {string} trainNames.trainName
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
        console.log("Name corrections data loaded successfully.");
    } catch (error) {
        console.error("Error loading name corrections data:", error);
    }

    try {
        const responseOperator = await fetch(win.operatorConvertAPI_URL);
        /** @type {operatorConvertAPI} */
        win.operatorConvertData = await responseOperator.json();
        console.log("Operator convert data loaded successfully.");
    } catch (error) {
        console.error("Error loading operator convert data:", error);
    }

    localStorage.setItem('apiVersion', apiVersion);
}

/**
 * 
 * @param {string} number 
 * @param {string} stockString 
 * @param {string} trainCategory 
 * @returns {{prefix: string, number: string, name: string}}
 */
export function getTrainFullName(number, stockString, trainCategory) {
    console.debug('Stock string:', stockString);
    const operator = determineOperator(stockString);
    let prefix = getTrainPrefixByCategory(operator, trainCategory);

    let name = '';
    ({ trainNumberPrefix: prefix, endTrainName: name } = mapTrainName(operator, number, name, prefix));

    // Further train name and prefix override

    // TODO: Add train name and prefix override

    return {prefix, number, name}; // Placeholder implementation
}

/**
 * @param {string} operator 
 * @param {string} trainNo 
 * @param {string} endTrainName 
 * @param {string} trainNumberPrefix 
 * @returns {{operator: string, trainNumberPrefix: string, endTrainName: string}}
 */
function mapTrainName(operator, trainNo, endTrainName, trainNumberPrefix) {

    for (let j = 0; j < win.operatorConvertData.trainNames.length; j++) {
        let trainNameData = win.operatorConvertData.trainNames[j];
        let trainOperatorBefore = operator;
        let trainNoIs = trainNameData.trainNo;

        for (let k = 0; k < trainNoIs.length; k++) {
            if (trainNameData.operator === trainOperatorBefore) {
                if (trainNoIs[k] === trainNo) {  //BUG: ?? trainNo.toString()
                    if (!isNaN(parseInt(trainNo))) console.error("WTF?!", trainNo, trainNoIs[k]);
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
        let prefixData = win.operatorConvertData.categories[j];
        let trainOperator = operator;
        let prefixObject = prefixData.category;

        if (prefixData.operator === trainOperator) {
            for (let key in prefixObject) {
                if (trainCategory.startsWith(key)) {
                    return prefixObject[key];
                }
            }
        }
    }
}

/**
 * @param {string} stockString 
 * @returns {string}
 */
function determineOperator(stockString) {
    let operatorList = [];

    for (const key in win.operatorConvertData.operators) {
        const splitStockString = stockString.split(";");

        for (let j = 0; j < splitStockString.length; j++) {
            if (key === splitStockString[j]) {
                operatorList.push(win.operatorConvertData.operators[key]);
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

        return mostCommonOperator;
    }
}

