import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddGroupToCategories extends BaseSchema {
  protected tableName = 'categories';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('group').nullable().defaultTo(null);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('group');
    });
  }
}
