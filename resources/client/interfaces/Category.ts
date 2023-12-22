export default interface Category {
  id: string;
  summary: string;
  dueDate: null | Date;
  expectedAmount: number;
  isActive: boolean;
  every: null | number;
  parent: null | string;
  group: null | string;
  account: null | string;
}
