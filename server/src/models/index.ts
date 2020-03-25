import { Sequelize } from 'sequelize-typescript';
import { loggers } from 'winston';

const debugLogger = loggers.get('debug-logger');

export const sequelize = new Sequelize({
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DB,
	host: process.env.DB_HOST,
	dialect: 'mysql',
	models: [],
	logging: (msg) => debugLogger.debug(msg),
});
