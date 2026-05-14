import { stickerColorStyles, stickerCountryCodes } from "./constants.js";
import { isLightColor } from "./utils.js";

export function populateCountryCodeButtons(onCountryCodeSelected) {
    const container = document.getElementById("buttonsCodecontainer");

    stickerCountryCodes.forEach(countryCode => {
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

        container.appendChild(button);
    });

    container.addEventListener("click", (event) => {
        const clickedElement = event.target;

        if (clickedElement.tagName === "BUTTON") {
            const countryCode = clickedElement.dataset.countryCode;
            onCountryCodeSelected(countryCode);
        }
    });
}
