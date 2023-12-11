import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import CategoryModel from './CategoryModel';
import TransactionModel from './TransactionModel';

export default class PaymentModel extends BaseModel {
  public static table = 'payments';

  @column({ isPrimary: true })
  public id: string;

  @column.dateTime({ serializeAs: 'bookingDate' })
  public bookingDate: DateTime;

  @column()
  public summary: string;

  @column()
  public amount: number;

  @column({ serializeAs: 'categoryId' })
  public categoryId: string;

  @belongsTo(() => CategoryModel, { foreignKey: 'categoryId' })
  public category: BelongsTo<typeof CategoryModel>;

  @column({ columnName: 'transaction_id', serializeAs: 'transactionId' })
  public transactionId: string;

  @belongsTo(() => TransactionModel, { foreignKey: 'transactionId' })
  public transaction: BelongsTo<typeof TransactionModel>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
