import { Router, Request, Response } from 'express';
import { loggers } from 'winston';
import { body, validationResult } from 'express-validator';
import { Account } from '../../models/account';
import { compareSync } from 'bcryptjs';
import { Token } from '../../models/token';

const router: Router = Router();

router.post(
	'/login',
	[
		body('username')
			.not()
			.isEmpty()
			.withMessage("The username can't be empty")

			.isLength({ min: 4 })
			.withMessage('The username must be at least 4 characters'),

		body('password')
			.not()
			.isEmpty()
			.withMessage("The password can't be empty")

			.isLength({ min: 8 })
			.withMessage('The password needs at least 8 characters'),
	],
	async (req: Request, res: Response) => {
		// Import the basic & error logger
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

		try {
			// Query database, try to find a user with the given username
			const userAccount: Account | null = await Account.findOne({
				where: {
					username: req.body.username,
				},
			});

			// If a user account exists with the given username, send an error
			if (!userAccount)
				// Send back status 403 and an error object
				return res.status(403).json({
					Error: {
						Messages: [
							{
								location: 'body',
								msg: "There's no account with given username",
							},
						],
					},
				});

			// Check if the passwords match
			if (!compareSync(req.body.password, userAccount.password))
				// Send back status 403 and an error object
				return res.status(403).json({
					Error: {
						Messages: [
							{
								location: 'body',
								msg: 'The given password is wrong',
							},
						],
					},
				});

			// Everything is okay, now set a session timeout
			const timeout: Date = new Date(Date.now());
			timeout.setMinutes(timeout.getMinutes() + 15);

			// Check if a session exist, if not create one
			const [token, created] = await Token.findOrCreate({
				where: {
					createdByID: userAccount.id,
				},
				defaults: {
					token: Math.random()
						.toString(36)
						.substring(7),
					validUntil: timeout,
					createdByID: userAccount.id,
				},
			});

			// If there allready is a session for the given user, update his timeout
			if (!created) await token.update({ validUntil: timeout });

			// Send back success message
			return res.status(200).send({
				data: {
					token: token.token,
					validUntil: token.validUntil,
				},
			});
		} catch (err) {
			// If something went wrong, we need to inform the user and ofc. ourself
			errorLogger.error(err.stack);
			return res.status(500).json({
				Error: { Code: 500, Messages: [{ msg: 'Internal server error' }] },
			});
		}
	},
);

export const AccountLoginController: Router = router;
