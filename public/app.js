import { populateCountryCodeButtons } from "./countryButtons.js";
import { initStickerAutocomplete } from "./select.js";
import {
    clearStickersTable,
    initTableButtons,
    renderStickersTable,
    appendStickersToTable,
    updateRenderedStickerQuantity
} from "./tableButtons.js";
import { createLazyLoader } from "./lazyLoad.js";

const STICKERS_API_URL = "/api/figuritas";
let currentLazyLoader = null;

function buildStickersQueryString(filters = {}, pagination = {}) {
    const queryParams = {};

    if (filters.obtenida !== undefined) {
        queryParams.obtenida = filters.obtenida;
    }

    if (filters.codigo !== undefined) {
        queryParams.codigo = filters.codigo;
    }

    if (pagination.limit !== undefined) {
        queryParams.limit = pagination.limit;
    }

    if (pagination.offset !== undefined) {
        queryParams.offset = pagination.offset;
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
    const stickers = data.stickers || data;

    return stickers.map(item => ({
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

async function getStickersPage(filters, offset = 0) {
    const url = STICKERS_API_URL + buildStickersQueryString(filters, { limit: 50, offset });
    const res = await fetch(url);

    if (!res.ok) {
        console.error("Error al cargar figuritas:", res.statusText);
        return { items: [], hasMore: false, total: 0 };
    }

    const data = await res.json();
    const stickers = data.stickers || data;
    const items = Array.isArray(stickers) ? stickers : [];

    const mappedItems = items.map(item => ({
        nombre: item.nombre,
        tipo: item.tipo,
        cantidad: item.cantidad
    }));

    return {
        items: mappedItems,
        hasMore: data.offset !== undefined ? (data.offset + data.limit < data.total) : false,
        total: data.total || items.length
    };
}

async function loadStickers(filters) {
    if (currentLazyLoader) {
        currentLazyLoader.stop();
    }

    const firstPage = await getStickersPage(filters, 0);

    if (firstPage.items.length === 0) {
        renderStickersTable([]);
        return;
    }

    renderStickersTable(firstPage.items);

    currentLazyLoader = createLazyLoader({
        sentinel: document.getElementById("stickersLazySentinel"),
        fetcher: async (offset) => {
            return getStickersPage(filters, offset);
        },
        renderer: (items) => {
            appendStickersToTable(items);
        },
        onError: (error) => {
            console.error("Error al cargar figuritas adicionales:", error);
            alert("Error al cargar más figuritas. Intenta nuevamente.");
        }
    });
}

async function initStickerSelect() {
    const stickers = await getStickers();
    initStickerAutocomplete(stickers);
}

function clearAllStickers() {
    if (currentLazyLoader) {
        currentLazyLoader.stop();
        currentLazyLoader = null;
    }
    clearStickersTable();
}

function initMainFilterButtons() {
    document.getElementById("loadStickersButton").addEventListener("click", () => loadStickers());

    document.getElementById("loadOwnedStickersButton").addEventListener("click", () => {
        loadStickers({ obtenida: true });
    });

    document.getElementById("loadMissingStickersButton").addEventListener("click", () => {
        loadStickers({ obtenida: false });
    });

    document.getElementById("clearStickersButton").addEventListener("click", clearAllStickers);
}

function initStickerForm() {
    document.getElementById("addStickerButton").addEventListener("click", async () => {
        const stickerName = document.getElementById("addStickerSelect").value;
        const updatedSticker = await patchSticker(stickerName, "add");

        if (updatedSticker) {
            updateRenderedStickerQuantity(updatedSticker);
        }
    });

    document.getElementById("removeStickerButton").addEventListener("click", async () => {
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
