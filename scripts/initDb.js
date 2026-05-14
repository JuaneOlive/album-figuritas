import databaseConnection from '../data/db.js';
import '../models/Figurita.js';
import { initializeStickerTypes } from './tiposSeeder.js';
import { initializeStickers } from './figuritasSeeder.js';

async function initializeDatabase() {
    try {
        await databaseConnection.authenticate();
        await databaseConnection.sync();
        await initializeStickerTypes();
        await initializeStickers();
        console.log("Base de datos creada e inicializada");
    }
    catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }
    finally {
        process.exit();
    }
}

initializeDatabase();
