import Category from './Category';
import Transaction from './Transaction';

export default interface Payment {
  id: string;
  bookingDate: Date;
  summary: string;
  amount: number;
  transactionId: string;
  categoryId: null | string;
  transaction: null | Transaction;
}

export interface AppliedPayment extends Payment {
  category: Category;
}
