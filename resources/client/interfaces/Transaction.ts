export default interface Transaction {
  id: number;
  name: string;
  summary: string;
  accountIban: null | string;
  amount: number;
  ack: boolean;
  bookingDate: Date;
}
