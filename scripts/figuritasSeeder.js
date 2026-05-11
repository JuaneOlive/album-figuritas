import sequelize from '../data/db.js';
import Figurita from '../models/Figurita.js';
import TipoFigurita from '../models/TipoFigurita.js';
import { pathToFileURL } from 'url';

const equipos = [
  'MEX', 'CAN', 'USA', 'HAI', 'CUW', 'PAN', 'BRA', 'PAR',
  'ECU', 'ARG', 'URU', 'COL', 'CZE', 'BIH', 'SUI', 'SCO',
  'TUR', 'GER', 'NED', 'SWE', 'BEL', 'ESP', 'FRA', 'NOR',
  'AUT', 'POR', 'ENG', 'CRO', 'RSA', 'MAR', 'CIV', 'TUN',
  'EGY', 'CPV', 'SEN', 'ALG', 'COD', 'GHA', 'KOR', 'QAT',
  'JPN', 'IRN', 'KSA', 'IRQ', 'JOR', 'UZB', 'NZL', 'AUS'
];

function crearDiccionarioTipos(tipos) {
  return tipos.reduce((diccionario, tipo) => {
    diccionario[tipo.nombre] = tipo.id;
    return diccionario;
  }, {});
}

function validarTiposRequeridos(tiposPorNombre) {
  const tiposRequeridos = ['jugador', 'escudo', 'formación', 'coca-cola', 'fwc'];
  const tiposFaltantes = tiposRequeridos.filter((tipo) => !tiposPorNombre[tipo]);

  if (tiposFaltantes.length > 0) {
    throw new Error(`Faltan tipos de figurita en la base: ${tiposFaltantes.join(', ')}`);
  }
}

function generarFiguritas(tiposPorNombre) {
  const figuritas = [];

  for (let numero = 1; numero <= 19; numero++) {
    figuritas.push({
      numero,
      nombre: `FWC${numero}`,
      tipoId: tiposPorNombre.fwc
    });
  }

  for (const equipo of equipos) {
    for (let numero = 1; numero <= 20; numero++) {
      let tipoId = tiposPorNombre.jugador;

      if (numero === 1) {
        tipoId = tiposPorNombre.escudo;
      }

      if (numero === 13) {
        tipoId = tiposPorNombre.formación;
      }

      figuritas.push({
        numero,
        nombre: `${equipo}${numero}`,
        tipoId
      });
    }
  }

  for (let numero = 1; numero <= 14; numero++) {
    figuritas.push({
      numero,
      nombre: `CC${numero}`,
      tipoId: tiposPorNombre['coca-cola']
    });
  }

  return figuritas;
}

export async function inicializarFiguritas() {
  const cantidad = await Figurita.count();

  if (cantidad > 0) {
    console.log('Ya existen figuritas cargadas, no se inicializa.');
    return;
  }

  const tipos = await TipoFigurita.findAll();
  const tiposPorNombre = crearDiccionarioTipos(tipos);

  validarTiposRequeridos(tiposPorNombre);

  const figuritas = generarFiguritas(tiposPorNombre);

  await Figurita.bulkCreate(figuritas);
  console.log(`${figuritas.length} figuritas inicializadas con éxito.`);
}

async function main() {
  try {
    await sequelize.authenticate();
    await inicializarFiguritas();
  } catch (error) {
    console.error('Error al inicializar figuritas:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
