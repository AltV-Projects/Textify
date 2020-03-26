import {
	Table,
	Model,
	Column,
	ForeignKey,
	BelongsTo,
} from 'sequelize-typescript';
import { Account } from './account';

@Table
export class Tweet extends Model<Tweet> {
	@Column
	message!: string;

	@ForeignKey(() => Account)
	@Column
	account!: number;

	@BelongsTo(() => Account)
	accountID!: number;
}
