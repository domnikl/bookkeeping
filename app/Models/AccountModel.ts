import { DateTime } from 'luxon';
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';

export default class AccountModel extends BaseModel {
  public static table = 'accounts';

  @column({ isPrimary: true })
  public iban: string;

  @column()
  public name: string;

  @column()
  public isActive: boolean = true;

  @column()
  public sort: number = 0;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
