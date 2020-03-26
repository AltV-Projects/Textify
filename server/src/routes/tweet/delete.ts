import { Router, Request, Response } from 'express';
// import { loggers } from 'winston';

const router: Router = Router();

router.delete('/delete', (req: Request, res: Response) => {
	// Import the basic & error logger
	/* const basicLogger = loggers.get('basic-logger');
	const errorLogger = loggers.get('error-logger'); */
});

export const TweetDeleteController: Router = router;
