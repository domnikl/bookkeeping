import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  public async up() {
    this.schema.alterTable('categories', (table) => {
      table.string('account', 33);
    });

    this.schema.alterTable('historic_categories', (table) => {
      table.string('account', 33);
    });
  }

  public async down() {
    this.schema.alterTable('categories', (table) => {
      table.dropColumn('account');
    });

    this.schema.alterTable('historic_categories', (table) => {
      table.dropColumn('account');
    });
  }
}
