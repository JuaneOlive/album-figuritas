import databaseConnection from '../data/db.js';
import Sticker from '../models/Figurita.js';
import StickerType from '../models/TipoFigurita.js';
import { pathToFileURL } from 'url';

const teamCodes = [
  'MEX', 'RSA', 'KOR', 'CZE',
  'CAN', 'BIH', 'QAT', 'SUI',
  'BRA', 'MAR', 'HAI', 'SCO',
  'USA', 'PAR', 'AUS', 'TUR',
  'GER', 'CUW', 'CIV', 'ECU',
  'NED', 'JPN', 'SWE', 'TUN',
  'BEL', 'EGY', 'IRN', 'NZL',
  'ESP', 'CPV', 'KSA', 'URU',
  'FRA', 'SEN', 'IRQ', 'NOR',
  'ARG', 'ALG', 'AUT', 'JOR',
  'POR', 'COD', 'UZB', 'COL',
  'ENG', 'CRO', 'GHA', 'PAN'
];

const stickerGroups = {
  A: ['MEX', 'RSA', 'KOR', 'CZE'],
  B: ['CAN', 'BIH', 'QAT', 'SUI'],
  C: ['BRA', 'MAR', 'HAI', 'SCO'],
  D: ['USA', 'PAR', 'AUS', 'TUR'],
  E: ['GER', 'CUW', 'CIV', 'ECU'],
  F: ['NED', 'JPN', 'SWE', 'TUN'],
  G: ['BEL', 'EGY', 'IRN', 'NZL'],
  H: ['ESP', 'CPV', 'KSA', 'URU'],
  I: ['FRA', 'SEN', 'IRQ', 'NOR'],
  J: ['ARG', 'ALG', 'AUT', 'JOR'],
  K: ['POR', 'COD', 'UZB', 'COL'],
  L: ['ENG', 'CRO', 'GHA', 'PAN']
};

function getGroupForTeamCode(teamCode, groups) {
  for (const [group, teams] of Object.entries(groups)) {
    if (teams.includes(teamCode)) {
      return group;
    }
  }
  return null;
}


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

  for (let stickerNumber = 0; stickerNumber <= 19; stickerNumber++) {
    stickers.push({
      numero: stickerNumber,
      nombre: `FWC${stickerNumber}`,
      tipoId: typesByName.fwc,
      cantidad: 0,
      codigo: "FWC"
    });
  }

  for (const teamCode of teamCodes) {
    const group = getGroupForTeamCode(teamCode, stickerGroups);

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
        cantidad: 0,
        codigo: teamCode,
        grupo: group
      });
    }
  }

  for (let stickerNumber = 1; stickerNumber <= 14; stickerNumber++) {
    stickers.push({
      numero: stickerNumber,
      nombre: `CC${stickerNumber}`,
      tipoId: typesByName['coca-cola'],
      cantidad: 0,
      codigo: "CC"
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
