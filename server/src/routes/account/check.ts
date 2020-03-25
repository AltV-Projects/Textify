import { Router, Request, Response } from 'express';
// import { loggers } from 'winston';

const router: Router = Router();

router.get('/check', (req: Request, res: Response) => {
	// Import the basic & error logger
	/* const basicLogger = loggers.get('basic-logger');
	const errorLogger = loggers.get('error-logger'); */
});

export const AccountCheckController: Router = router;
