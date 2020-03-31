import { Table, Model, Column, HasMany, Default } from 'sequelize-typescript';
import { Tweet } from './tweet';

@Table
export class Account extends Model<Account> {
	@Column
	username!: string;

	@Column
	password!: string;

	@Default('')
	@Column
	imageUrl!: string;

	@Default('')
	@Column
	bio!: string;

	@HasMany(() => Tweet)
	tweetID!: number;
}
