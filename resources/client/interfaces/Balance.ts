export default interface Balance {
  iban: string;
  account: null | string;
  bookingDate: Date;
  amount: number;
}

export interface BalancesMap {
  [key: string]: Balance[];
}

export interface BalancesForGraph {
  label: string;
  prediction: boolean;
  data: Array<number | null>;
}
