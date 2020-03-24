//#region Imports
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
	level: 'info',
	transports: [
		new transports.Console(),
		new transports.File({ filename: './logs/debug.log' }),
	],
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

const app: Application = express();
const port: number = Number(process.env.PORT) || 8181;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.all('*', (req: Request, res: Response, next: NextFunction) => {
	basicLogger.info(`[${req.method} - ${req.ip}] ${req.originalUrl}`);
	next();
});

app.all('*', (req: Request, res: Response) => {
	return res.status(404).send({
		Error: { Messages: [{ location: 'url', msg: 'File not found' }] },
	});
});

// Start listening for connections on the given port
app.listen(port, () => {
	basicLogger.info(`Listening at http://localhost:${port}/`);
});
