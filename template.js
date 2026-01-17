function scrollText() {
    const elements = document.querySelectorAll('.scroll');

    // Remove existing clones and kill GSAP animations
    gsap.globalTimeline.clear();
    const clones = document.querySelectorAll('.clone');
    clones.forEach(clone => clone.remove());

    elements.forEach(element => {
        const parentWidth = element.parentElement.offsetWidth;
        const textWidth = element.offsetWidth;
        const textLength = element.textContent.length;
        const elementId = element.id;
        let maxTextLength;
        let addText = '';

        maxTextLength = 21;
        addText = '    ';
        element.textContent = element.textContent.trim();

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

            const texts = gsap.utils.toArray(`#${elementId}`),
                loop = horizontalLoop(texts, { paused: false, repeat: -1, speed: 1 });
        }
    });
}

function dynamicWrapText(elementId) {
    const container = document.getElementById(elementId);
    const originalText = container.textContent.trim();
    container.innerHTML = '<div id="left"></div><div id="right"></div>';
    const left = document.getElementById('left');
    const right = document.getElementById('right');
    left.classList.add('line_left');
    right.classList.add('line_right');
    left.textContent = originalText;

    if (left.scrollWidth > left.clientWidth) {
        const route = originalText.split(' - ');
        right.textContent = route.pop();
        left.textContent = route.pop() + ' -';
    } else {
        right.remove();
        left.classList.add('line_one');
    }
}

function overflowRestStations() {
    const restStations = document.getElementById('rest_stations');
    const mainDisplay = document.getElementById('main_display');
    const nextStation = document.getElementsByClassName('currently_displayed')[0];
    let fontSize = parseFloat(restStations.style.fontSize.replace('vw', '')) || 2.8; // Ensure fontSize is a number
    let marginSize = parseFloat(nextStation.style.margin.replace('vh 0', '')) || 4; // Ensure marginSize is a number

    // First, adjust font size
    while (mainDisplay.scrollHeight <= mainDisplay.clientHeight && fontSize < 2.8) {
        fontSize += 0.1;
        restStations.style.fontSize = `${fontSize}vw`;
    }

    // Add adjustment of margin if needed
    while (mainDisplay.scrollHeight > mainDisplay.clientHeight && marginSize > 0.5) {
        marginSize -= 0.1;
        nextStation.style.margin = `${marginSize}vh 0`;
    }

    while (mainDisplay.scrollHeight <= mainDisplay.clientHeight && marginSize < 4) { // Assuming a max margin size
        marginSize += 0.1;
        nextStation.style.margin = `${marginSize}vh 0`;
    }

    // Reduce font size as needed
    while (mainDisplay.scrollHeight > mainDisplay.clientHeight && fontSize > 2 && marginSize <= 1) {
        fontSize -= 0.1;
        restStations.style.fontSize = `${fontSize}vw`;
    }
}