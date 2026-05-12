
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

async function submitAgregarFigurita() {

}

async function populateFiguritas() {    
    figuritasRaw = await obtenerFiguritas("faltantes");
    figuritasRaw.forEach(figurita => {
        const option = document.createElement("option");
        option.value = figurita.nombre;
        option.textContent = figurita.nombre;
        document.getElementById("SelectAgregarFigurita").appendChild(option);
    });

    
    
}

document.getElementById("btnCargarFiguritas").addEventListener("click", () => cargarFiguritas("todas"));

document.getElementById("btnCargarFiguritasObtenidas").addEventListener("click", () => cargarFiguritas("pegadas"));

document.getElementById("btnCargarFiguritasFaltantes").addEventListener("click", () => cargarFiguritas("faltantes"));

document.getElementById("btnLimpiarFiguritas").addEventListener("click", vaciarFiguritas);

populateFiguritas();
