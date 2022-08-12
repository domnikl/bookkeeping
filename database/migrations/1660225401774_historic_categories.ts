import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class HistoricCategories extends BaseSchema {
  protected tableName = 'historic_categories'

  // stores historic data for categories, eg. "in 2022-01 the car budget was 5€"
  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary;
      table.uuid('category_id').notNullable();
      table.string('summary', 100).notNullable();
      table.integer('expected_amount').notNullable();
      table.timestamp('due_date', { useTz: true }).nullable();
      table.string('parent', 100).nullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
