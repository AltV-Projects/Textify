import { Router, Request, Response } from 'express';
import { loggers } from 'winston';
// import { Account } from '../../models/account';
import { hashSync, compareSync } from 'bcryptjs';
import { isUndefined } from 'util';
import { Token } from '../../models/token';
import { Helper } from '../../helper';

const router: Router = Router();
const helper: Helper = new Helper();

router.put('/update', async (req: Request, res: Response) => {
	// Import the error logger
	const errorLogger = loggers.get('error-logger');

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
		// Create an empty update array
		const updateParams: any = {};

		// Check if a new password has been requested
		if (req.body.newpassword) {
			if (isUndefined(req.body.password))
				// Send back http 412 due missing information
				return res.status(412).json({
					Error: {
						Messages: [
							{
								location: 'body',
								msg:
									'To change the password, the old password needs to be provided',
							},
						],
					},
				});

			// Check if new passwords match, if not, send an error
			if (req.body.newpassword != req.body['newpassword-confirmation'])
				return res.status(412).json({
					Error: {
						Messages: [
							{
								location: 'body',
								msg: "The new passwords don't match",
							},
						],
					},
				});

			// Check if the old password is correct
			// if (hashSync(req.body.password) !== tokenCheck.createdBy.password)
			if (!compareSync(req.body.password, tokenCheck.createdBy.password))
				return res.status(403).json({
					Error: {
						Messages: [
							{
								location: 'body',
								msg: 'The given old password is incorrect',
							},
						],
					},
				});

			updateParams['password'] = hashSync(req.body.newpassword);
		}

		updateParams['imageUrl'] = req.body.imageUrl
			? req.body.imageUrl
			: undefined;

		updateParams['bio'] = req.body ? req.body.bio : undefined;

		if (Object.keys(updateParams).length === 0)
			return res.status(400).json({
				Error: {
					Messages: [{ msg: 'No changes were provided' }],
				},
			});

		await tokenCheck.createdBy.update(updateParams);

		if (updateParams.password) updateParams.password = '*** secret ***';

		return res.status(200).json({ data: updateParams });
	} catch (err) {
		// If something went wrong, we need to inform the user and ofc. ourself
		errorLogger.error(err.stack);
		return res.status(500).json({
			Error: { Code: 500, Messages: [{ msg: 'Internal server error' }] },
		});
	}
});

export const AccountUpdateController: Router = router;
