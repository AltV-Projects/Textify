//#region Enviroment
import * as dotenv from 'dotenv';
dotenv.config();
//endregion
//#region Import Basics
import { loggers, transports, format } from 'winston';
import moment from 'moment';
import { Request, Response, NextFunction, Application } from 'express';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
//#endregion
//#region Logger setup
loggers.add('basic-logger', {
	level: 'info',
	transports: [
		new transports.Console(),
		new transports.File({ filename: './logs/combined.log' }),
	],
	format: format.printf(({ level, message }) => {
		return `<${moment().format('DD.MM.YY HH:mm:ss')}> [${level}]: ${message}`;
	}),
});

loggers.add('debug-logger', {
	level: 'debug',
	transports: [new transports.File({ filename: './logs/debug.log' })],
	format: format.printf(({ level, message }) => {
		return `<${moment().format('DD.MM.YY HH:mm:ss')}> [${level}]: ${message}`;
	}),
});

loggers.add('error-logger', {
	transports: [new transports.File({ filename: './logs/error.log' })],
	format: format.printf(({ level, message }) => {
		return `<${moment().format('DD.MM.YY HH:mm:ss')}> [${level}]: ${message}`;
	}),
});
const basicLogger = loggers.get('basic-logger');
const errorLogger = loggers.get('error-logger');
//#endregion

//#region Setting up database import
import * as db from './models';
//#endregion

// Initialize express server
const app: Application = express();
// Set the port to the given env or 8181
const port: number = Number(process.env.PORT) || 8181;

// Do some configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
db.sequelize
	.authenticate()
	.then(() => {
		// Logging that it was successfull
		basicLogger.info('Database connection successfull');

		// Sync database models
		db.sequelize.sync().then(() => {
			// Set up all routes to be monitored
			app.all('*', (req: Request, res: Response, next: NextFunction) => {
				basicLogger.info(`[${req.method} - ${req.ip}] ${req.originalUrl}`);
				next();
			});

			// If no previous route matched, return an error page
			app.all('*', (req: Request, res: Response) => {
				return res.status(404).send({
					Error: {
						Messages: [{ location: 'url', msg: 'File or resource not found' }],
					},
				});
			});

			// Start listening for connections on the given port
			app.listen(port, () => {
				basicLogger.info(`Listening at http://localhost:${port}/`);
			});
		});
	})
	.catch((err: any) => {
		errorLogger.error(err.stack);
	});
