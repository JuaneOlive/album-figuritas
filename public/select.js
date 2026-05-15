import { stickerColorStyles } from "./constants.js";
import { isLightColor } from "./utils.js";

function getStickerCode(name) {
    const match = name.match(/^[A-Z]+/);
    return match ? match[0] : null;
}

export function initStickerAutocomplete(stickers) {
    const input = document.getElementById("addStickerSelect");
    const dropdown = document.getElementById("stickersDropdown");
    let focusedIndex = -1;

    function getItems() {
        return [...dropdown.querySelectorAll(".fwc-autocomplete__item")];
    }

    function applyFocus(items) {
        items.forEach((item, i) => {
            item.classList.toggle("is-focused", i === focusedIndex);
            if (i === focusedIndex) item.scrollIntoView({ block: "nearest" });
        });
    }

    function selectItem(item) {
        input.value = item.dataset.value;
        dropdown.classList.remove("is-open");
        focusedIndex = -1;
    }

    function renderDropdown(query) {
        const q = query.toLowerCase().trim();
        const hits = q
            ? stickers.filter(sticker => sticker.nombre.toLowerCase().includes(q))
            : stickers;

        dropdown.innerHTML = "";
        focusedIndex = -1;

        if (!hits.length) {
            const empty = document.createElement("li");
            empty.className = "fwc-autocomplete__empty";
            empty.setAttribute("role", "option");
            empty.textContent = "Sin resultados";
            dropdown.appendChild(empty);
            dropdown.classList.add("is-open");
            return;
        }

        hits.forEach(sticker => {
            const code = getStickerCode(sticker.nombre);
            const bg = stickerColorStyles[code] || "#474A4A";
            const textColor = isLightColor(bg) ? "#0A0A0A" : "#FFFFFF";

            const li = document.createElement("li");
            li.className = "fwc-autocomplete__item";
            li.setAttribute("role", "option");
            li.dataset.value = sticker.nombre;
            li.style.setProperty("--item-bg", bg);
            li.style.color = textColor;
            li.innerHTML =
                `<span class="fwc-autocomplete__code">${sticker.nombre}</span>` +
                `<span class="fwc-autocomplete__type">${sticker.tipo.nombre}</span>`;

            li.addEventListener("mousedown", event => {
                event.preventDefault();
                selectItem(li);
            });

            dropdown.appendChild(li);
        });

        dropdown.classList.add("is-open");
    }

    input.addEventListener("focus", () => renderDropdown(input.value));

    input.addEventListener("input", () => {
        focusedIndex = -1;
        renderDropdown(input.value);
    });

    input.addEventListener("keydown", event => {
        const items = getItems();

        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!dropdown.classList.contains("is-open")) renderDropdown(input.value);
            focusedIndex = Math.min(focusedIndex + 1, items.length - 1);
            applyFocus(items);
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            focusedIndex = Math.max(focusedIndex - 1, 0);
            applyFocus(items);
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            const target = focusedIndex >= 0 ? items[focusedIndex] : items[0];
            if (target && dropdown.classList.contains("is-open")) selectItem(target);
            return;
        }

        if (event.key === "Escape") {
            dropdown.classList.remove("is-open");
            focusedIndex = -1;
            input.blur();
        }
    });

    document.addEventListener("click", event => {
        if (!input.closest(".fwc-autocomplete").contains(event.target)) {
            dropdown.classList.remove("is-open");
            focusedIndex = -1;
        }
    });
}

export function resetStickerInput() {
    const input = document.getElementById("addStickerSelect");
    const dropdown = document.getElementById("stickersDropdown");

    if (input) {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (dropdown) {
        dropdown.classList.remove("is-open");
    }
}
