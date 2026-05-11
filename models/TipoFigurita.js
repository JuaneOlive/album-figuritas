import { DataTypes, Model } from "sequelize";
import sequelize from "../data/db.js";

class TipoFigurita extends Model {}

TipoFigurita.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize,
    modelName: 'TipoFigurita',
    tableName: 'tipos_figuritas',
    timestamps: false
});

export default TipoFigurita;
