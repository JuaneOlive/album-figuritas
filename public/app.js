const STICKERS_API_URL = "http://localhost:3000/api/figuritas";

function renderStickersTable(stickers) {
    const tableBody = document.getElementById("stickersTableBody");
    tableBody.innerHTML = "";
    stickers.forEach(sticker => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${sticker.nombre}</td>
                         <td>${sticker.tipo.nombre}</td>
                         <td>${sticker.cantidad}</td>
                         `;
        tableBody.appendChild(row);
    });
}

function clearStickersTable() {
    const tableBody = document.getElementById("stickersTableBody");
    tableBody.innerHTML = "";
}

async function getStickers(filter) {

    let url = STICKERS_API_URL + (
            filter
                ? `?obtenida=${filter === "pegadas"}`
                : ""
        );


    const res = await fetch(url);

    if (!res.ok) {
        console.error("Error al cargar figuritas:", res.statusText);
        return;
    }

    const data = await res.json();

    return data.map(item => ({
        nombre: item.nombre,
        tipo: item.tipo,
        cantidad: item.cantidad
    }));

}

async function loadStickers(filter) {
    renderStickersTable(await getStickers(filter));
}

async function populateStickers() {

    const select = document.getElementById("addStickerSelect");

    const selectCopy = document.createElement("select");
        selectCopy.id = select.id;
        selectCopy.name = select.name;



    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Seleccione una figurita";
    selectCopy.appendChild(emptyOption);

    const rawStickers = await getStickers();

    rawStickers.forEach(sticker => {
        const option = document.createElement("option");
        option.value = sticker.nombre;
        option.textContent = sticker.nombre;
        selectCopy.appendChild(option);
    });

    select.parentNode.replaceChild(selectCopy, select);

}



async function patchSticker(operation) {

    const stickerName = document.getElementById("addStickerSelect").value;

    if (!stickerName) {
        alert("Por favor, seleccione una figurita para agregar.");
        return;
    }

    const res = await fetch(`${STICKERS_API_URL}/${stickerName}?operation=${operation}`, {
        method: "PATCH"
    });

    if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error || "Error al actualizar figurita. Por favor, intente nuevamente.";
        console.error("Error al actualizar figurita:", errorMessage);
        alert(errorMessage);
        return;
    }
}

document.getElementById("loadStickersButton").addEventListener("click", () => loadStickers());

document.getElementById("loadOwnedStickersButton").addEventListener("click", () => loadStickers("pegadas"));

document.getElementById("loadMissingStickersButton").addEventListener("click", () => loadStickers("faltantes"));

document.getElementById("clearStickersButton").addEventListener("click", clearStickersTable);

document.getElementById("addStickerButton").addEventListener("click", () => patchSticker("add"));

document.getElementById("removeStickerButton").addEventListener("click", () => patchSticker("remove"));

populateStickers();
