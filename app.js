import express from 'express';
import cors from 'cors';
import Figurita from './models/Figurita.js';
import TipoFigurita from './models/TipoFigurita.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/figuritas', async (req, res) => {
  try {
    const { obtenida } = req.query;
    const where = {};

    if (obtenida !== undefined) {
      where.obtenida = obtenida === 'true';
    }

    const figuritas = await Figurita.findAll({
      where,
      include: [{ model: TipoFigurita, as: 'tipo' }]
    });

    res.status(200).json(figuritas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las figuritas' });
  }
});

app.patch('/api/figuritas/:nombre', async (req, res) => {
  try {
    const nombre = req.params.nombre.toUpperCase();

    const figurita = await Figurita.findOne({
      where: { nombre },
      include: [{ model: TipoFigurita, as: 'tipo' }]
    });

    if (!figurita) {
      return res.status(404).json({ error: 'Figurita no encontrada' });
    }

    figurita.cantidad += 1;
    figurita.obtenida = figurita.cantidad > 0;
    await figurita.save();

    res.status(200).json(figurita);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la figurita' });
  }
});

app.listen(port, () => {
  console.log(`Servidor de la API corriendo en http://localhost:${port}`);
});
