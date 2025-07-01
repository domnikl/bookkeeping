import Account from './interfaces/Account';
import { formatDate } from './Utils';
import CategoryBudget from './interfaces/CategoryBudget';
import Category from './interfaces/Category';
import Payment, { AppliedPayment } from './interfaces/Payment';
import Balance, { BalancesForGraph } from './interfaces/Balance';
import { format } from 'date-fns';
import Transaction from './interfaces/Transaction';

async function useFetch<T>(url: string, options: any = {}): Promise<T> {
  const response = await fetch(url, options);
  return await response.json();
}

function usePostFetch<T>(url: string, data: any, options: any = {}): Promise<T> {
  let method = options.method ?? 'POST';

  return useFetch(url, {
    ...options,
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export const loadBudgets = async (account: Account, from: Date, to: Date) => {
  const data = await useFetch<CategoryBudget[]>(
    '/reports/' + account.iban + '/' + formatDate(from) + '/' + formatDate(to)
  );
  return data.map((x) => ({
    ...x,
    dueDate: x.dueDate !== null ? new Date(x.dueDate) : null,
  }));
};

export const loadCategory = async (id: string) => {
  const data = await useFetch<Category>('/categories/' + id);
  data.payments = data.payments?.map((x) => ({
    ...x,
    category: data,
    bookingDate: new Date(x.bookingDate),
  }));

  return {
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
  };
};

export const loadHistoricCategory = async (categoryId: string, from: Date, to: Date) => {
  const fromStr = format(from, 'yyyy-MM-dd');
  const toStr = format(to, 'yyyy-MM-dd');
  const data = await useFetch<any[]>(
    `/categories/${categoryId}/historic?from=${fromStr}&to=${toStr}`
  );
  return data.map((item) => ({
    ...item,
    dueDate: item.dueDate ? new Date(item.dueDate) : null,
    createdAt: new Date(item.createdAt),
  }));
};

export const loadCategories = async () => {
  const data = await useFetch<Category[]>('/categories');
  return data.map((x) => ({
    ...x,
    dueDate: x.dueDate ? new Date(x.dueDate) : null,
  }));
};

export const loadAccounts = async () => {
  return useFetch<Account[]>('/accounts');
};

export const updateAccount = async (account: Account) => {
  return usePostFetch(`/accounts/${account.iban}`, account, { method: 'PUT' });
};

export const createAccount = async (account: Omit<Account, 'iban'> & { iban: string }) => {
  return usePostFetch('/accounts', account);
};

export const deleteAccount = async (iban: string) => {
  return useFetch(`/accounts/${iban}`, { method: 'DELETE' });
};

export const loadPayments = async () => {
  const data = await useFetch<AppliedPayment[]>('/payments');
  return data.map((x) => ({ ...x, bookingDate: new Date(x.bookingDate) }));
};

export const loadPaymentsByDateRange = async (from: Date, to: Date) => {
  const data = await useFetch<AppliedPayment[]>(
    `/payments/${format(from, 'yyyy-MM-dd')}/${format(to, 'yyyy-MM-dd')}`
  );
  return data.map((x) => ({ ...x, bookingDate: new Date(x.bookingDate) }));
};

export const loadBalances = async (iban: string, from: Date, to: Date) => {
  return useFetch<BalancesForGraph[]>(
    `/balances/${iban}/${format(from, 'yyyy-MM-dd')}/${format(to, 'yyyy-MM-dd')}`
  );
};

export const loadReport = async () => {
  const data = await useFetch<Balance[]>('/reports/balances');
  return data.map((x) => ({
    ...x,
    bookingDate: new Date(x.bookingDate),
  }));
};

export const loadGroups = async () => {
  return useFetch<Array<Category>>('/categories/groups');
};

export const loadParents = async () => {
  return useFetch<Array<Category>>('/categories/parents');
};

export const loadTransaction = async (id: string) => {
  const data = await useFetch<Transaction>('/transactions/' + id);
  return { ...data, bookingDate: new Date(data.bookingDate) };
};

export const loadTransactions = async () => {
  let data = await useFetch<Transaction[]>('/transactions');
  return data.map((x) => ({ ...x, bookingDate: new Date(x.bookingDate) }));
};

export const applyCategory = async (category: Category) => {
  return usePostFetch('/categories', category);
};

export const applyPayment = async (payment: Payment) => {
  return usePostFetch('/payments', payment);
};

export const closeMonth = async (date: Date) => {
  return usePostFetch<null>(`/close-month/${format(date, 'yyyy-MM')}`, {});
};
