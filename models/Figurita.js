import { DataTypes, Model } from "sequelize";
import sequelize from "../data/db.js";
import TipoFigurita from "./TipoFigurita.js";


class Figurita extends Model {}

Figurita.init({
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
    sequelize,
    modelName: 'Figurita',
    tableName: 'figuritas',
    timestamps: false
});

Figurita.belongsTo(TipoFigurita,{as: 'tipo', foreignKey: 'tipoId', field: 'tipoId'});

TipoFigurita.hasMany(Figurita,{foreignKey: 'tipoId', as: 'figuritas'});

export default Figurita;
