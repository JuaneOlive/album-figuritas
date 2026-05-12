import { DataTypes, Model } from "sequelize";
import databaseConnection from "../data/db.js";
import StickerType from "./TipoFigurita.js";


class Sticker extends Model {}

Sticker.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },  
    numero: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombre:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    obtenida:{
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
        allowNull: false,
    },
    cantidad: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
            min: 0
        }
    }

}, {
    sequelize: databaseConnection,
    modelName: 'Figurita',
    tableName: 'figuritas',
    timestamps: false
});

Sticker.belongsTo(StickerType,{as: 'tipo', foreignKey: 'tipoId', field: 'tipoId'});

StickerType.hasMany(Sticker,{foreignKey: 'tipoId', as: 'figuritas'});

export default Sticker;
