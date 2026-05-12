const STICKERS_API_URL = "http://localhost:3000/api/figuritas";

const stickerColorStyles = {
  FWC: "#d4b96a",
  CC: "#FF2800",
  MEX: "#00532a",
  CAN: "#c8102e",
  USA: "#1a3d7c",
  HAI: "#00209f",
  CUW: "#012d5a",
  PAN: "#003082",
  BRA: "#007a33",
  PAR: "#00338d",
  ECU: "#d59f00",
  ARG: "#5c92c8",
  URU: "#0072B5",
  COL: "#c29d00",
  CZE: "#0f3b6b",
  BIH: "#001f6e",
  SUI: "#c8102e",
  SCO: "#003087",
  TUR: "#c8102e",
  GER: "#101010",
  NED: "#b31b1b",
  SWE: "#003087",
  BEL: "#101010",
  ESP: "#a70616",
  FRA: "#003087",
  NOR: "#b31b1b",
  AUT: "#c8102e",
  POR: "#004b2d",
  ENG: "#c8102e",
  CRO: "#c8102e",
  RSA: "#006234",
  MAR: "#a51d27",
  CIV: "#007a3d",
  TUN: "#c8102e",
  EGY: "#a50f18",
  CPV: "#001f5d",
  SEN: "#007a3d",
  ALG: "#00501f",
  COD: "#001f5d",
  GHA: "#00501f",
  KOR: "#101010",
  QAT: "#6f1e38",
  JPN: "#c8102e",
  IRN: "#1f8a3f",
  KSA: "#004a21",
  IRQ: "#006400",
  JOR: "#004d2f",
  UZB: "#117c41",
  NZL: "#001f4d",
  AUS: "#001f4d"
};

const stickerCountryCodes = [
  "FWC",
  "CC",
  "MEX",
  "CAN",
  "USA",
  "HAI",
  "CUW",
  "PAN",
  "BRA",
  "PAR",
  "ECU",
  "ARG",
  "URU",
  "COL",
  "CZE",
  "BIH",
  "SUI",
  "SCO",
  "TUR",
  "GER",
  "NED",
  "SWE",
  "BEL",
  "ESP",
  "FRA",
  "NOR",
  "AUT",
  "POR",
  "ENG",
  "CRO",
  "RSA",
  "MAR",
  "CIV",
  "TUN",
  "EGY",
  "CPV",
  "SEN",
  "ALG",
  "COD",
  "GHA",
  "KOR",
  "QAT",
  "JPN",
  "IRN",
  "KSA",
  "IRQ",
  "JOR",
  "UZB",
  "NZL",
  "AUS"
];

function isLightColor(hex) {
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 180;
}

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
    let url;

    if (filter === "pegadas" || filter === "faltantes") {
        url = STICKERS_API_URL + `?obtenida=${filter === "pegadas"}`;
    } else {
        url = STICKERS_API_URL;
    }

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

        let key = sticker.nombre.match(/^[A-Z]+/)[0] || "";
        let style =stickerColorStyles[key];
        
        option.style.backgroundColor = style;
        option.style.color = isLightColor(style) ? "#000" : "#fff";

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

populateStickers();

document.getElementById("loadStickersButton").addEventListener("click", () => loadStickers());

document.getElementById("loadOwnedStickersButton").addEventListener("click", () => loadStickers("pegadas"));

document.getElementById("loadMissingStickersButton").addEventListener("click", () => loadStickers("faltantes"));

document.getElementById("clearStickersButton").addEventListener("click", clearStickersTable);

document.getElementById("addStickerButton").addEventListener("click", () => patchSticker("add"));

document.getElementById("removeStickerButton").addEventListener("click", () => patchSticker("remove"));




