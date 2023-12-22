export default interface CategoryBudget {
  summary: string;
  account: string;
  expectedAmount: number;
  actualAmount: number;
  every: null | number;
  dueDate: null | Date;
  remainingAmount: null | number;
  percentage: null | number;
}
