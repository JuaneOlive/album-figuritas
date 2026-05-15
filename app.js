import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Sticker from './models/Figurita.js';
import StickerType from './models/TipoFigurita.js';

const app = express();
const serverPort = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    res.set('Cache-Control', 'public, max-age=3600');
  }
  next();
});
app.use(express.static('public'));

function createBadRequestError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validateStickerQuery(query) {
  const obtenida = query.obtenida;
  const codigo = query.codigo;

  if (obtenida !== undefined && obtenida !== 'true' && obtenida !== 'false') {
    throw createBadRequestError('El filtro obtenida debe ser true o false');
  }

  if (codigo !== undefined && codigo.trim() === '') {
    throw createBadRequestError('El filtro codigo no puede estar vacio');
  }
}

function buildStickerFilters(query) {
  validateStickerQuery(query);

  const obtenida = query.obtenida;
  const codigo = query.codigo;
  const stickerFilters = {};

  if (obtenida !== undefined) {
    stickerFilters.obtenida = obtenida === 'true';
  }

  if (codigo) {
    stickerFilters.codigo = codigo.toUpperCase();
  }
  return stickerFilters;
}

async function findStickers(query) {
  const stickerFilters = buildStickerFilters(query);

  const { sequelize } = require('sequelize');
  const { literal } = require('sequelize');

  const stickers = await Sticker.findAll({
    where: stickerFilters,
    include: [{ model: StickerType, as: 'tipo' }],
    order: [
      [literal(`CASE
        WHEN codigo = 'FWC' THEN 0
        WHEN codigo = 'CC' THEN 1
        WHEN codigo = 'MEX' THEN 2
        WHEN codigo = 'RSA' THEN 3
        WHEN codigo = 'KOR' THEN 4
        WHEN codigo = 'CZE' THEN 5
        WHEN codigo = 'CAN' THEN 6
        WHEN codigo = 'BIH' THEN 7
        WHEN codigo = 'QAT' THEN 8
        WHEN codigo = 'SUI' THEN 9
        WHEN codigo = 'BRA' THEN 10
        WHEN codigo = 'MAR' THEN 11
        WHEN codigo = 'HAI' THEN 12
        WHEN codigo = 'SCO' THEN 13
        WHEN codigo = 'USA' THEN 14
        WHEN codigo = 'PAR' THEN 15
        WHEN codigo = 'AUS' THEN 16
        WHEN codigo = 'TUR' THEN 17
        WHEN codigo = 'GER' THEN 18
        WHEN codigo = 'CUW' THEN 19
        WHEN codigo = 'CIV' THEN 20
        WHEN codigo = 'ECU' THEN 21
        WHEN codigo = 'NED' THEN 22
        WHEN codigo = 'JPN' THEN 23
        WHEN codigo = 'SWE' THEN 24
        WHEN codigo = 'TUN' THEN 25
        WHEN codigo = 'BEL' THEN 26
        WHEN codigo = 'EGY' THEN 27
        WHEN codigo = 'IRN' THEN 28
        WHEN codigo = 'NZL' THEN 29
        WHEN codigo = 'ESP' THEN 30
        WHEN codigo = 'CPV' THEN 31
        WHEN codigo = 'KSA' THEN 32
        WHEN codigo = 'URU' THEN 33
        WHEN codigo = 'FRA' THEN 34
        WHEN codigo = 'SEN' THEN 35
        WHEN codigo = 'IRQ' THEN 36
        WHEN codigo = 'NOR' THEN 37
        WHEN codigo = 'ARG' THEN 38
        WHEN codigo = 'ALG' THEN 39
        WHEN codigo = 'AUT' THEN 40
        WHEN codigo = 'JOR' THEN 41
        WHEN codigo = 'POR' THEN 42
        WHEN codigo = 'COD' THEN 43
        WHEN codigo = 'UZB' THEN 44
        WHEN codigo = 'COL' THEN 45
        WHEN codigo = 'ENG' THEN 46
        WHEN codigo = 'CRO' THEN 47
        WHEN codigo = 'GHA' THEN 48
        WHEN codigo = 'PAN' THEN 49
        ELSE 50
      END`), 'ASC'],
      ['numero', 'ASC']
    ]
  });

  return stickers;
}

function validatePatchStickerParams(stickerName, operation) {
  if (!stickerName) {
    throw createBadRequestError('Parametro invalido');
  }

  if (operation !== 'add' && operation !== 'remove') {
    throw createBadRequestError('Operacion no valida');
  }
}

async function findStickerByName(stickerName) {
  return Sticker.findOne({
    where: { nombre: stickerName },
    include: [{ model: StickerType, as: 'tipo' }]
  });
}

function applyStickerOperation(sticker, operation) {
  if (operation === 'add') {
    sticker.cantidad += 1;
    sticker.obtenida = true;
    return;
  }

  if (sticker.cantidad <= 0) {
    throw createBadRequestError('No se pueden tener cantidades negativas');
  }

  sticker.cantidad -= 1;
  sticker.obtenida = sticker.cantidad > 0;
}

async function updateSticker(stickerName, operation) {
  validatePatchStickerParams(stickerName, operation);

  const sticker = await findStickerByName(stickerName);

  if (!sticker) {
    const error = new Error('Figurita no encontrada');
    error.statusCode = 404;
    throw error;
  }

  applyStickerOperation(sticker, operation);

  await sticker.save();

  return sticker;
}

app.get('/health', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/figuritas', async (req, res) => {
  try {
    const stickers = await findStickers(req.query);
    res.status(200).json(stickers);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al obtener las figuritas' });
  }
});

app.patch('/api/figuritas/:nombre', async (req, res) => {
  try {
    const stickerName = req.params.nombre.toUpperCase();
    const operation = req.query.operation;
    const sticker = await updateSticker(stickerName, operation);

    res.status(200).json(sticker);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar la figurita' });
  }
});

app.listen(serverPort, '127.0.0.1', () => {
  console.log(`Servidor de la API corriendo en http://127.0.0.1:${serverPort}`);
});
