import { Sequelize } from 'sequelize-typescript';
import { loggers } from 'winston';
import { Account } from './account';
import { Tweet } from './tweet';

const debugLogger = loggers.get('debug-logger');

export const sequelize = new Sequelize({
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DB,
	host: process.env.DB_HOST,
	dialect: 'mysql',
	models: [Account, Tweet],
	logging: (msg) => debugLogger.debug(msg),
});
