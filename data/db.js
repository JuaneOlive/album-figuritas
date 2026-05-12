import {Sequelize} from 'sequelize';
const databaseConnection = new Sequelize({
    dialect: 'sqlite',
    storage: 'data/datos-album.sqlite',
    logging: false
});

export default databaseConnection;
