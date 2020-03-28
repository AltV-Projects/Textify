import { Router, Request, Response } from 'express';
import { isUndefined } from 'util';
import { Helper } from '../../helper';

const router: Router = Router();
const helper: Helper = new Helper();

router.get('/check', async (req: Request, res: Response) => {
	// Get token outside header
	const token: string | undefined = req.header('token');

	// Check if the token is set
	if (isUndefined(token))
		return res.status(400).send({
			Error: {
				Messages: [{ msg: 'Missing "token" in header information' }],
			},
		});

	// If token is set, check if valid
	const tokenInfo = await helper.isTokenValid(token, true);

	// If it's not, send a 403 error
	if (!tokenInfo)
		return res.status(403).send({
			Error: {
				Messages: [{ msg: "The given token isn't authorized" }],
			},
		});

	// Send back token information
	return res.status(200).send({
		data: tokenInfo,
	});
});

export const AccountCheckController: Router = router;
