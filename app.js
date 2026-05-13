import express from 'express';
import cors from 'cors';
import Sticker from './models/Figurita.js';
import StickerType from './models/TipoFigurita.js';

const app = express();
const serverPort = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
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

  const stickers = await Sticker.findAll({
    where: stickerFilters,
    include: [{ model: StickerType, as: 'tipo' }]
  });

  return stickers;
}

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
    if (!stickerName) {
      return res.status(400).json({ error: 'Parametro invalido' });
    }

    const sticker = await Sticker.findOne({
      where: { nombre: stickerName },
      include: [{ model: StickerType, as: 'tipo' }]
    });

    if (!sticker) {
      return res.status(404).json({ error: 'Figurita no encontrada' });
    }

    if (operation === "add") {
      sticker.cantidad += 1;
      sticker.obtenida = true;
    }
    else if (operation === "remove") {
      if (sticker.cantidad <= 0) {
        return res.status(400).json({ error: 'No se pueden tener cantidades negativas' });
      }
      sticker.cantidad -= 1;
      sticker.obtenida = sticker.cantidad > 0;
    } else {
      return res.status(400).json({ error: 'Operacion no valida' });
    }
    
    await sticker.save();

    res.status(200).json(sticker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la figurita' });
  }
});

app.listen(serverPort, () => {
  console.log(`Servidor de la API corriendo en http://localhost:${serverPort}`);
});
