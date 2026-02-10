import { horizontalLoop } from "./api/gsap_simless_loop.js";

/** @type {*} */ 
const gsap = (window.gsap);

const lastTexts = {};

function scrollText() {
    const elements = document.querySelectorAll('.scroll');
    if (!checkIfRefreshNeeded(elements)) return;

    // Remove existing clones and kill GSAP animations
    gsap.globalTimeline.clear();
    const clones = document.querySelectorAll('.clone');
    clones.forEach(clone => clone.remove());

    elements.forEach(element => {
        const textLength = element.textContent.length;
        const elementId = element.id;

        const maxTextLength = 15;
        const addText = '      ';
        //element.textContent = element.textContent.trim();

        if (textLength > maxTextLength) {
            element.textContent += addText;

            // Marquee effect infinite loop
            const textClone = element.cloneNode(true);
            textClone.classList.add('clone');
            textClone.classList.remove('scroll');
            element.parentElement.appendChild(textClone);

            // Second clone for the seamless loop
            const textClone2 = element.cloneNode(true);
            textClone2.classList.add('clone');
            textClone2.classList.remove('scroll');
            element.parentElement.appendChild(textClone2);

            const texts = gsap.utils.toArray(`#${elementId}`);
            horizontalLoop(texts, { paused: false, repeat: -1, speed: 0.7 });
        } else {
            element.removeAttribute("style");
        }
    });
}

/**
 * 
 * @param {NodeListOf<Element>} elements 
 * @returns {boolean}
 */
function checkIfRefreshNeeded(elements) {
    let needed = false;
    elements.forEach(element => {
        if (element.textContent !== lastTexts[element.id]) {
            lastTexts[element.id] = element.textContent;
            needed = true;
        }
    });
    return needed;
}

function checkForWrap() {
    const destinationBox = document.getElementById("number_destination_box");
    const destinationElement = document.getElementById("destination");

    if (destinationBox.scrollWidth > destinationBox.clientWidth) {
        destinationElement.classList.add("smaller");
    }
}

function checkForStationWrap() {
    const stationLabels = document.getElementsByClassName("stop_name");
    for (const i of Object.keys(stationLabels)) {
        const width = stationLabels[parseInt(i)].offsetWidth;
        const textSize = parseFloat(getComputedStyle(stationLabels[parseInt(i)]).fontSize) + 0.4;
        if (width > textSize + 2) {
            stationLabels[parseInt(i)].classList.add("wrap");
        }
    }
}

window.scrollText = scrollText;
window.checkForWrap = checkForWrap;
window.checkForStationWrap = checkForStationWrap;