import { stickerColorStyles, stickerCountryCodes } from "./constants.js";
import { isLightColor } from "./utils.js";

function createCountryButton(countryCode) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = countryCode;
    button.id = `filter-${countryCode}`;
    button.className = `fwc-select-country-button`;
    button.dataset.countryCode = countryCode;

    const bg = stickerColorStyles[countryCode];
    if (bg) {
        button.style.setProperty("--btn-bg", bg);
        button.style.color = isLightColor(bg) ? "#0A0A0A" : "#FFFFFF";
    }

    return button;
}

export function populateCountryCodeButtons(onCountryCodeSelected) {
    const mainContainer = document.getElementById("buttonsCodecontainer");

    // Contenedor 1: FWC + CC (2 botones)
    const specialContainer = document.createElement("div");
    specialContainer.className = "fwc-country-buttons-special";

    const specialCodes = stickerCountryCodes.slice(0, 2);
    specialCodes.forEach(code => {
        specialContainer.appendChild(createCountryButton(code));
    });

    // Contenedor 2: resto de países (48 botones)
    const countriesContainer = document.createElement("div");
    countriesContainer.className = "fwc-country-buttons-grid";

    const countryCodes = stickerCountryCodes.slice(2);
    countryCodes.forEach(code => {
        countriesContainer.appendChild(createCountryButton(code));
    });

    // Agregar ambos contenedores
    mainContainer.appendChild(specialContainer);
    mainContainer.appendChild(countriesContainer);

    // Event delegation en el contenedor principal
    mainContainer.addEventListener("click", (event) => {
        const clickedElement = event.target;

        if (clickedElement.tagName === "BUTTON") {
            const countryCode = clickedElement.dataset.countryCode;
            onCountryCodeSelected(countryCode);
        }
    });
}
