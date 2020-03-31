import { isNull } from 'util';
import { loggers } from 'winston';
import { Token } from './models/token';
import { Account } from './models/account';

const errorLogger = loggers.get('error-logger');

export class Helper {
	/**
	 * Checks if the given token exists and updates the validation time if needed
	 * @param  {string} token The token to check against the database
	 * @param  {boolean} refresh?Update validation time, default: false
	 * @returns Promise<boolean|Token>
	 */
	async isTokenValid(
		token: string,
		refresh?: boolean,
	): Promise<boolean | Token> {
		try {
			const tokenData: Token | null = await Token.findOne({
				where: {
					token: token,
				},
				include: [
					{
						model: Account,
						attributes: [
							'id',
							'username',
							'password',
							'imageUrl',
							'bio',
							'createdAt',
						],
					},
				],
				attributes: ['id', 'token', 'validUntil', 'createdAt'],
			});
			if (isNull(tokenData)) return false;

			if (!refresh) return tokenData;

			const timeout: Date = new Date(Date.now());
			timeout.setMinutes(timeout.getMinutes() + 15);
			tokenData.validUntil = timeout;

			return await tokenData.save();
		} catch (err) {
			// If something went wrong, we need to inform the user and ofc. ourself
			errorLogger.error(err.stack);
			return false;
		}
	}
}
