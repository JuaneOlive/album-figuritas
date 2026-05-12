import databaseConnection from '../data/db.js';
import Sticker from '../models/Figurita.js';
import StickerType from '../models/TipoFigurita.js';
import { pathToFileURL } from 'url';

const teamCodes = [
  'MEX', 'CAN', 'USA', 'HAI', 'CUW', 'PAN', 'BRA', 'PAR',
  'ECU', 'ARG', 'URU', 'COL', 'CZE', 'BIH', 'SUI', 'SCO',
  'TUR', 'GER', 'NED', 'SWE', 'BEL', 'ESP', 'FRA', 'NOR',
  'AUT', 'POR', 'ENG', 'CRO', 'RSA', 'MAR', 'CIV', 'TUN',
  'EGY', 'CPV', 'SEN', 'ALG', 'COD', 'GHA', 'KOR', 'QAT',
  'JPN', 'IRN', 'KSA', 'IRQ', 'JOR', 'UZB', 'NZL', 'AUS'
];

function createTypeDictionary(stickerTypes) {
  return stickerTypes.reduce((typeDictionary, stickerType) => {
    typeDictionary[stickerType.nombre] = stickerType.id;
    typeDictionary[stickerType.nombre.toLowerCase()] = stickerType.id;
    return typeDictionary;
  }, {});
}

function validateRequiredTypes(typesByName) {
  const requiredTypes = ['Jugador', 'Escudo', 'Formación', 'Coca-Cola', 'FWC'];
  const missingTypes = requiredTypes.filter((typeName) => !typesByName[typeName]);

  if (missingTypes.length > 0) {
    throw new Error(`Faltan tipos de figurita en la base: ${missingTypes.join(', ')}`);
  }
}

function generateStickers(typesByName) {
  const stickers = [];

  for (let stickerNumber = 1; stickerNumber <= 19; stickerNumber++) {
    stickers.push({
      numero: stickerNumber,
      nombre: `FWC${stickerNumber}`,
      tipoId: typesByName.fwc,
      cantidad: 0
    });
  }

  for (const teamCode of teamCodes) {
    for (let stickerNumber = 1; stickerNumber <= 20; stickerNumber++) {
      let stickerTypeId = typesByName.jugador;

      if (stickerNumber === 1) {
        stickerTypeId = typesByName.escudo;
      }

      if (stickerNumber === 13) {
        stickerTypeId = typesByName.formación;
      }

      stickers.push({
        numero: stickerNumber,
        nombre: `${teamCode}${stickerNumber}`,
        tipoId: stickerTypeId,
        cantidad: 0
      });
    }
  }

  for (let stickerNumber = 1; stickerNumber <= 14; stickerNumber++) {
    stickers.push({
      numero: stickerNumber,
      nombre: `CC${stickerNumber}`,
      tipoId: typesByName['coca-cola'],
      cantidad: 0
    });
  }

  return stickers;
}

export async function initializeStickers() {
  const existingStickerCount = await Sticker.count();

  if (existingStickerCount > 0) {
    console.log('Ya existen figuritas cargadas, no se inicializa.');
    return;
  }

  const stickerTypes = await StickerType.findAll();
  const typesByName = createTypeDictionary(stickerTypes);

  validateRequiredTypes(typesByName);

  const stickers = generateStickers(typesByName);

  await Sticker.bulkCreate(stickers);
  console.log(`${stickers.length} figuritas inicializadas con éxito.`);
}

async function runStickerSeeder() {
  try {
    await databaseConnection.authenticate();
    await initializeStickers();
  } catch (error) {
    console.error('Error al inicializar figuritas:', error);
    process.exitCode = 1;
  } finally {
    await databaseConnection.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runStickerSeeder();
}
