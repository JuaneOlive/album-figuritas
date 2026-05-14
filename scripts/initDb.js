import databaseConnection from '../data/db.js';
import '../models/Figurita.js';
import { initializeStickerTypes } from './tiposSeeder.js';
import { initializeStickers } from './figuritasSeeder.js';

async function initializeDatabase() {
    try {
        await databaseConnection.authenticate();
        console.log('Conexión a la base de datos establecida.');

        await databaseConnection.sync();
        console.log('Tablas sincronizadas (creadas si no existían).');

        await initializeStickerTypes();
        await initializeStickers();

        console.log('Base de datos creada e inicializada.');
        process.exit(0);
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        process.exit(1);
    }
}

initializeDatabase();
