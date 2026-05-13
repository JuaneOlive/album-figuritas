export function renderStickersTable(stickers) {
    const tableBody = document.getElementById("stickersTableBody");

    tableBody.innerHTML = "";
    stickers.forEach(sticker => {
        const actionCell = document.createElement("td");
        const addButton = document.createElement("button");
        const removeButton = document.createElement("button");

        addButton.type = "button";
        addButton.textContent = "+";
        addButton.dataset.operation = "add";
        addButton.dataset.nombre = sticker.nombre;

        removeButton.type = "button";
        removeButton.textContent = "-";
        removeButton.dataset.nombre = sticker.nombre;
        removeButton.dataset.operation = "remove";

        actionCell.appendChild(addButton);
        actionCell.appendChild(removeButton);

        const row = document.createElement("tr");
        row.dataset.nombre = sticker.nombre;
        row.innerHTML = `<td>${sticker.nombre}</td>
                         <td>${sticker.tipo.nombre}</td>
                         <td data-sticker-quantity>${sticker.cantidad}</td>
                         `;
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

export function clearStickersTable() {
    const tableBody = document.getElementById("stickersTableBody");
    tableBody.innerHTML = "";
}

export function updateRenderedStickerQuantity(updatedSticker) {
    const row = document.querySelector(`tr[data-nombre="${updatedSticker.nombre}"]`);

    if (!row) {
        return;
    }

    const quantityCell = row.querySelector("[data-sticker-quantity]");

    if (quantityCell) {
        quantityCell.textContent = updatedSticker.cantidad;
    }
}

export function initTableButtons(onPatchSticker) {
    const tableBody = document.getElementById("stickersTableBody");

    tableBody.addEventListener("click", async (event) => {
        const clickedElement = event.target;

        if (clickedElement.tagName === "BUTTON") {
            event.preventDefault();
            event.stopPropagation();
            const operation = clickedElement.dataset.operation;
            const nombre = clickedElement.dataset.nombre;
            const updatedSticker = await onPatchSticker(nombre, operation);

            if (updatedSticker) {
                updateRenderedStickerQuantity(updatedSticker);
            }
        }
    });
}
