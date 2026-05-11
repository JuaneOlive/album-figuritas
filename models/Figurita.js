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
        allowNull: false
    },
    obtenida:{
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
        allowNull: false
    },

}, {
    sequelize,
    modelName: 'Figurita',
    tableName: 'figuritas',
    timestamps: false
});

Figurita.belongsTo(TipoFigurita,{as: 'tipo', foreignKey: 'tipoId', field: 'tipoId'});

TipoFigurita.hasMany(Figurita,{foreignKey: 'tipoId', as: 'figuritas'});

export default Figurita;