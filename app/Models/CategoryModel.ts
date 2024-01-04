import { DateTime } from 'luxon';
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm';
import PaymentModel from './PaymentModel';

export default class CategoryModel extends BaseModel {
  public static table = 'categories';

  @column({ isPrimary: true })
  public id: string;

  @column()
  public summary: string;

  @column({ columnName: 'expected_amount', serializeAs: 'expectedAmount' })
  public expectedAmount: number;

  @column.dateTime({ columnName: 'due_date', serializeAs: 'dueDate' })
  public dueDate: null | DateTime;

  @column()
  public every: null | number;

  @column({ serializeAs: 'isActive' })
  public isActive: boolean = true;

  @column()
  public parent: null | string;

  @column()
  public group: null | string;

  @column()
  public account: null | string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasMany(() => PaymentModel, { foreignKey: 'categoryId' })
  public payments: HasMany<typeof PaymentModel>;
}
