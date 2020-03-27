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
	createdBy!: number;

	@BelongsTo(() => Account)
	createdByID!: number;
}
