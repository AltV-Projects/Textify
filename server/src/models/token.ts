import {
	Table,
	Column,
	Default,
	Model,
	ForeignKey,
	BelongsTo,
} from 'sequelize-typescript';
import { literal } from 'sequelize';
import { Account } from './account';

@Table
export class Token extends Model<Token> {
	@Column
	token!: string;

	@Default(literal('CURRENT_TIMESTAMP'))
	@Column
	validUntil!: Date;

	@ForeignKey(() => Account)
	@Column
	createdByID!: number;

	@BelongsTo(() => Account)
	createdBy!: Account;
}
