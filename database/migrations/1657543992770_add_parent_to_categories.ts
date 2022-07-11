import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddParentToCategories extends BaseSchema {
  protected tableName = 'categories';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('parent').nullable().defaultTo(null);
    });
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumns('parent');
    });
  }
}
