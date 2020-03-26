import { Router, Request, Response } from 'express';
// import { loggers } from 'winston';

const router: Router = Router();

router.post('/login', (req: Request, res: Response) => {
	// Import the basic & error logger
	// const errorLogger = loggers.get('error-logger');
});

export const AccountLoginController: Router = router;
