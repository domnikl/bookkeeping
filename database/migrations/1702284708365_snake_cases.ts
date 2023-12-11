import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'snake_cases';

  public async up() {
    this.schema.alterTable('accounts', (table) => {
      table.renameColumn('isActive', 'is_active');
    });
    this.schema.alterTable('balances', (table) => {
      table.renameColumn('bookingDate', 'booking_date');
    });
    this.schema.alterTable('categories', (table) => {
      table.renameColumn('expectedAmount', 'expected_amount');
      table.renameColumn('dueDate', 'due_date');
      table.renameColumn('isActive', 'is_active');
    });
    this.schema.alterTable('payments', (table) => {
      table.renameColumn('bookingDate', 'booking_date');
      table.renameColumn('categoryId', 'category_id');
      table.renameColumn('incomingPaymentId', 'transaction_id');
    });
    this.schema.alterTable('transactions', (table) => {
      table.renameColumn('bookingDate', 'booking_date');
    });
  }

  public async down() {
    this.schema.alterTable('accounts', (table) => {
      table.renameColumn('is_active', 'isActive');
    });
    this.schema.alterTable('balances', (table) => {
      table.renameColumn('booking_date', 'bookingDate');
    });
    this.schema.alterTable('categories', (table) => {
      table.renameColumn('expected_amount', 'expectedAmount');
      table.renameColumn('due_date', 'dueDate');
      table.renameColumn('is_active', 'isActive');
    });
    this.schema.alterTable('payments', (table) => {
      table.renameColumn('booking_date', 'bookingDate');
      table.renameColumn('category_id', 'categoryId');
      table.renameColumn('transaction_id', 'incomingPaymentId');
    });
    this.schema.alterTable('transactions', (table) => {
      table.renameColumn('booking_date', 'bookingDate');
    });
  }
}
