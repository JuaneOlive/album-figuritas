import sequelize from '../data/db.js';
import '../models/Figurita.js';
import { inicializarTipos} from './tiposSeeder.js';
import { inicializarFiguritas } from './figuritasSeeder.js';

async function main() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({force:true});
        await inicializarTipos();
        await inicializarFiguritas();
        console.log("Base de datos creada e inicializada");
    }
    catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }    
    finally {
        process.exit();
    }   
}

main();
