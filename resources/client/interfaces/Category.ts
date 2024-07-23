import { AppliedPayment } from './Payment';

export default interface Category {
  id: string;
  summary: string;
  dueDate: null | Date;
  expectedAmount: number;
  oneTime: boolean;
  isActive: boolean;
  every: null | number;
  parent: null | string;
  group: null | string;
  account: null | string;
  payments?: AppliedPayment[] | undefined;
}
