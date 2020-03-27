import { Router, Request, Response } from 'express';
import { loggers } from 'winston';
import { body, validationResult } from 'express-validator';
import { Account } from '../../models/account';
import { hashSync } from 'bcryptjs';

const router: Router = Router();

router.post(
	'/register',
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

		body('password-confirmation')
			.not()
			.isEmpty()
			.withMessage("Thr password confirmation can't be empty")

			.isLength({ min: 8 })
			.withMessage('The password confirmation needs at least 8 characters')

			.custom((value, { req }) => {
				if (value !== req.body.password) {
					// trow error if passwords do not match
					throw new Error("The given passwords don't match");
				} else {
					return value;
				}
			}),
	],
	async (req: Request, res: Response) => {
		// Define the basic & error logger
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
			const userCheck: Account | null = await Account.findOne({
				where: {
					username: req.body.username,
				},
			});

			// If a user account exists with the given username, send an error
			if (userCheck)
				// Send back status 412 (weil iSeven es so wollte!) and an error object
				return res.status(412).send({
					Error: {
						Messages: [
							{
								location: 'body',
								msg: "There's allready an account with the given username",
							},
						],
					},
				});

			// Hash the given password
			const hash: string = hashSync(
				req.body.password,
				Number(process.env.ROUNDS),
			);

			const userResult = Account.create({
				username: req.body.username,
				password: hash,
			});

			return res.status(200).json({ data: userResult });
		} catch (err) {
			// If something went wrong, we need to inform the user and ofc. ourself
			errorLogger.error(err.stack);
			return res.status(500).json({
				Error: { Code: 500, Messages: [{ msg: 'Internal server error' }] },
			});
		}
	},
);

export const AccountRegisterController: Router = router;
