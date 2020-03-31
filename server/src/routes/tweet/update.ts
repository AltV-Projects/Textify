import { Router, Request, Response } from 'express';
import { loggers } from 'winston';
import { Helper } from '../../helper';
import { body, validationResult } from 'express-validator';
import { isUndefined } from 'util';
import { Token } from '../../models/token';
import { Tweet } from '../../models/tweet';

const router: Router = Router();
const helper: Helper = new Helper();

router.put(
	'/update/:id?',
	[
		body('message')
			.not()
			.isEmpty()
			.withMessage("The message can't be empty"),
	],
	async (req: Request, res: Response) => {
		// Import the error logger
		const errorLogger = loggers.get('error-logger');

		if (!req.params.id)
			return res.status(412).json({
				Error: {
					Messages: [{ msg: 'Missing tweet id' }],
				},
			});

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
		// If it's not, json a 403 error
		if (!tokenCheck)
			return res.status(403).json({
				Error: {
					Messages: [{ msg: "The given token isn't authorized" }],
				},
			});

		try {
			// Query database to find the given tweet
			const tweetToUpdate = await Tweet.findOne({
				where: {
					id: req.params.id,
				},
			});

			// If not found, send 404 and "tweet not found"
			if (!tweetToUpdate)
				return res.status(404).json({
					Error: {
						Messages: [{ msg: "There's no tweet with the given id" }],
					},
				});

			// Check if authors match
			if (tweetToUpdate.createdByID != tokenCheck.createdBy.id)
				return res.status(404).json({
					Error: {
						Messages: [{ msg: "You can't update tweets from other people" }],
					},
				});

			tweetToUpdate.message = req.body.message;
			await tweetToUpdate.save();

			return res.status(200).json({ data: tweetToUpdate });
		} catch (err) {
			// If something went wrong, we need to inform the user and ofc. ourself
			errorLogger.error(err.stack);
			return res.status(500).json({
				Error: { Code: 500, Messages: [{ msg: 'Internal server error' }] },
			});
		}
	},
);

export const TweetUpdateController: Router = router;
