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
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false,   
    },
    grupo: {
        type: DataTypes.STRING,
        allowNull: true,   
    },
}, {
    sequelize: databaseConnection,
    modelName: 'Figurita',
    tableName: 'figuritas',
    timestamps: false,
    indexes: [
        {
            fields: ['codigo'],
            name: 'idx_figurita_codigo'
        },
        {
            fields: ['obtenida'],
            name: 'idx_figurita_obtenida'
        },
        {
            fields: ['tipoId'],
            name: 'idx_figurita_tipoId'
        },
        {
            fields: ['codigo', 'obtenida'],
            name: 'idx_figurita_codigo_obtenida'
        }
    ]
});

Sticker.belongsTo(StickerType,{as: 'tipo', foreignKey: 'tipoId', field: 'tipoId'});

StickerType.hasMany(Sticker,{foreignKey: 'tipoId', as: 'figuritas'});

export default Sticker;
