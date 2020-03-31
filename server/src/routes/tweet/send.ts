import { Router, Request, Response } from 'express';
import { loggers } from 'winston';
import { body, validationResult } from 'express-validator';
import { isUndefined } from 'util';
import { Helper } from '../../helper';
import { Tweet } from '../../models/tweet';
import { Token } from '../../models/token';

const router: Router = Router();
const helper: Helper = new Helper();

router.post(
	'/send',
	[
		body('message')
			.not()
			.isEmpty()
			.withMessage("The message can't be empty"),
	],
	async (req: Request, res: Response) => {
		// Import the error logger
		const errorLogger = loggers.get('error-logger');

		// Get the validation result, set errors to an object to check
		const errors = validationResult(req);

		// Check if there are errors
		if (!errors.isEmpty())
			return res.status(400).json({
				Error: {
					Code: 400,
					Messages: errors.array(),
				},
			});

		// Get token outside header
		const token: string | undefined = req.header('token');

		// Check if the token is set
		if (isUndefined(token))
			return res.status(400).json({
				Error: {
					Messages: [{ msg: 'Missing "token" in header information' }],
				},
			});

		// If token is set, check if valid
		const tokenCheck = (await helper.isTokenValid(token, true)) as Token;
		// If it's not, send a 403 error
		if (!tokenCheck)
			return res.status(403).json({
				Error: {
					Messages: [{ msg: "The given token isn't authorized" }],
				},
			});

		try {
			// Create the tweet
			const userTweet: Tweet = await Tweet.create({
				message: req.body.message,
				createdByID: tokenCheck.createdBy.id,
			});

			// Send back the success message
			return res.status(200).json({ data: userTweet });
		} catch (err) {
			// If something went wrong, we need to inform the user and ofc. ourself
			errorLogger.error(err.stack);
			return res.status(500).json({
				Error: { Code: 500, Messages: [{ msg: 'Internal server error' }] },
			});
		}
	},
);

export const TweetSendController: Router = router;
