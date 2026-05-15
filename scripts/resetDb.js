import databaseConnection from '../data/db.js';
import '../models/Figurita.js';
import { initializeStickerTypes } from './tiposSeeder.js';
import { initializeStickers } from './figuritasSeeder.js';

async function resetDatabase() {
    try {
        await databaseConnection.authenticate();
        console.log('Conexión a la base de datos establecida.');

        await databaseConnection.sync({ force: true });
        console.log('Tablas recreadas desde cero.');

        await initializeStickerTypes();
        await initializeStickers();

        console.log('Base de datos reinicializada correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error al reinicializar la base de datos:', error);
        process.exit(1);
    }
}

resetDatabase();
