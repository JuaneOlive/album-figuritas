import { populateCountryCodeButtons } from "./countryButtons.js";
import { initStickerAutocomplete } from "./select.js";
import {
    clearStickersTable,
    initTableButtons,
    renderStickersTable,
    updateRenderedStickerQuantity
} from "./tableButtons.js";

const STICKERS_API_URL = "http://localhost:3000/api/figuritas";

function buildStickersQueryString(filters = {}) {
    const queryParams = {};

    if (filters.obtenida !== undefined) {
        queryParams.obtenida = filters.obtenida;
    }

    if (filters.codigo !== undefined) {
        queryParams.codigo = filters.codigo;
    }

    const queryString = new URLSearchParams(queryParams).toString();

    if (queryString) {
        return `?${queryString}`;
    }

    return "";
}

function buildStickersUrl(filters) {
    return STICKERS_API_URL + buildStickersQueryString(filters);
}

async function getStickers(filters) {
    const url = buildStickersUrl(filters);
    const res = await fetch(url);

    if (!res.ok) {
        console.error("Error al cargar figuritas:", res.statusText);
        return [];
    }

    const data = await res.json();

    return data.map(item => ({
        nombre: item.nombre,
        tipo: item.tipo,
        cantidad: item.cantidad
    }));
}

async function patchSticker(stickerName, operation) {
    if (!stickerName) {
        alert("Por favor, seleccione una figurita para agregar.");
        return null;
    }

    const res = await fetch(`${STICKERS_API_URL}/${stickerName}?operation=${operation}`, {
        method: "PATCH"
    });

    if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error || "Error al actualizar figurita. Por favor, intente nuevamente.";
        console.error("Error al actualizar figurita:", errorMessage);
        alert(errorMessage);
        return null;
    }

    return res.json();
}

async function loadStickers(filters) {
    const stickers = await getStickers(filters);
    renderStickersTable(stickers);
}

async function initStickerSelect() {
    const stickers = await getStickers();
    initStickerAutocomplete(stickers);
}

function initMainFilterButtons() {
    document.getElementById("loadStickersButton").addEventListener("click", () => loadStickers());

    document.getElementById("loadOwnedStickersButton").addEventListener("click", () => {
        loadStickers({ obtenida: true });
    });

    document.getElementById("loadMissingStickersButton").addEventListener("click", () => {
        loadStickers({ obtenida: false });
    });

    document.getElementById("clearStickersButton").addEventListener("click", clearStickersTable);
}

function initStickerForm() {
    document.getElementById("addStickerForm").addEventListener("submit", (event) => {
        event.preventDefault();
    });

    document.getElementById("addStickerButton").addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const stickerName = document.getElementById("addStickerSelect").value;
        const updatedSticker = await patchSticker(stickerName, "add");

        if (updatedSticker) {
            updateRenderedStickerQuantity(updatedSticker);
        }
    });

    document.getElementById("removeStickerButton").addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const stickerName = document.getElementById("addStickerSelect").value;
        const updatedSticker = await patchSticker(stickerName, "remove");

        if (updatedSticker) {
            updateRenderedStickerQuantity(updatedSticker);
        }
    });
}

function initApp() {
    initStickerSelect();
    initMainFilterButtons();
    initStickerForm();

    populateCountryCodeButtons((countryCode) => {
        loadStickers({ codigo: countryCode });
    });

    initTableButtons(patchSticker);
}

initApp();
