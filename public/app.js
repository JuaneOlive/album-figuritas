
const API_BASE_URL = "http://localhost:3000/api/figuritas";

function renderTablaFiguritas(Figuritas) {
    const tb = document.getElementById("table-body-figuritas");
    tb.innerHTML = "";
    Figuritas.forEach(Figurita => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${Figurita.nombre}</td>
                         <td>${Figurita.tipo.nombre}</td>
                         <td>${Figurita.cantidad}</td>
                         `;
        tb.appendChild(row);
    });
}

function vaciarFiguritas() {
    const tb = document.getElementById("table-body-figuritas");
    tb.innerHTML = "";
}

async function obtenerFiguritas(filtro) {

    let url = API_BASE_URL + (
            filtro 
                ? `?obtenida=${filtro === "pegadas"}` 
                : ""
        ); 
        

    const res = await fetch(url);
    
    if (!res.ok) {
        console.error("Error al cargar figuritas:", res.statusText);
        return;
    }
    
    const datos = await res.json();

    return datos.map(d => ({
        nombre: d.nombre,
        tipo: d.tipo,
        cantidad: d.cantidad
    }));

}

async function cargarFiguritas(filtro) {
    renderTablaFiguritas(await obtenerFiguritas(filtro));
}

async function populateFiguritas() {    

    const select = document.getElementById("SelectAgregarFigurita");

    const selectCopy = document.createElement("select");
        selectCopy.id = select.id;
        selectCopy.name = select.name;


    
    optionVacia = document.createElement("option");
    optionVacia.value = "";
    optionVacia.textContent = "Seleccione una figurita";
    selectCopy.appendChild(optionVacia);

    figuritasRaw = await obtenerFiguritas();
   
    figuritasRaw.forEach(figurita => {
        const option = document.createElement("option");
        option.value = figurita.nombre;
        option.textContent = figurita.nombre;
        selectCopy.appendChild(option); 
    });

    select.parentNode.replaceChild(selectCopy, select);
    
}



async function patchFigurita() {
    
    const nombreFigurita = document.getElementById("SelectAgregarFigurita").value;
    
    if (!nombreFigurita) {
        alert("Por favor, seleccione una figurita para agregar.");
        return;
    }

    const res = await fetch(`${API_BASE_URL}/${nombreFigurita}`, {
        method: "PATCH"
    });

    if (!res.ok) {
        console.error("Error al agregar figurita:", res.statusText);
        alert("Error al agregar figurita. Por favor, intente nuevamente.");
        return;
    }
}

document.getElementById("btnCargarFiguritas").addEventListener("click", () => cargarFiguritas());

document.getElementById("btnCargarFiguritasObtenidas").addEventListener("click", () => cargarFiguritas("pegadas"));

document.getElementById("btnCargarFiguritasFaltantes").addEventListener("click", () => cargarFiguritas("faltantes"));

document.getElementById("btnLimpiarFiguritas").addEventListener("click", vaciarFiguritas);

populateFiguritas();
