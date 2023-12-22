export default interface CategoryBudget {
  id: string;
  summary: string;
  account: string;
  expectedAmount: number;
  amount: null | number;
  every: null | number;
  dueDate: null | Date;
  remaining: null | number;
  percentage: null | number;
}
