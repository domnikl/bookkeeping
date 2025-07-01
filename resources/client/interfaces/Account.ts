export default interface Account {
  iban: string;
  name: string;
  isActive?: boolean;
  sort?: number;
}
