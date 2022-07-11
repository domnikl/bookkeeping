import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddIsactiveAndSortToAccounts extends BaseSchema {
  protected tableName = 'accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('isActive').nullable();
      table.integer('sort').defaultTo('0');
    });
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumns('isActive', 'sort');
    });
  }
}
