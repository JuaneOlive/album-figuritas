import { DataTypes, Model } from "sequelize";
import databaseConnection from "../data/db.js";

class StickerType extends Model {}

StickerType.init({
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
    sequelize: databaseConnection,
    modelName: 'TipoFigurita',
    tableName: 'tipos_figuritas',
    timestamps: false
});

export default StickerType;
