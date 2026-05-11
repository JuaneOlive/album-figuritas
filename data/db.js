import {Sequelize} from 'sequelize';
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'data/datos-album.sqlite',
    logging: false
});

export default sequelize;
