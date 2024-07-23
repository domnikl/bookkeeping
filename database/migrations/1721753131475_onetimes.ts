import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'categories';

  public async up() {
    this.schema.alterTable('categories', (table) => {
      table.boolean('onetime').notNullable().defaultTo(false);
    });

    this.schema.alterTable('historic_categories', (table) => {
      table.boolean('onetime').notNullable().defaultTo(false);
    });
  }

  public async down() {
    this.schema.alterTable('categories', (table) => {
      table.dropColumn('onetime');
    });

    this.schema.alterTable('historic_categories', (table) => {
      table.dropColumn('onetime');
    });
  }
}
