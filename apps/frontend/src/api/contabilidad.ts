import apiClient from './index';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  isControl: boolean;
  parentId?: string;
  children?: Account[];
}

export interface JournalEntryLine {
  id?: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
  account?: Account;
}

export interface JournalEntry {
  id: string;
  entryDate: string;
  number: number;
  concept: string;
  isPosted: boolean;
  lines: JournalEntryLine[];
}

export const contabilidadApi = {
  getAccounts: async (): Promise<Account[]> => {
    const { data } = await apiClient.get<Account[]>('/contabilidad/cuentas');
    return data;
  },

  getJournalEntries: async (params?: { from?: string; to?: string }): Promise<JournalEntry[]> => {
    const { data } = await apiClient.get<JournalEntry[]>('/contabilidad/asientos', { params });
    return data;
  },

  createJournalEntry: async (entry: {
    entryDate: string;
    concept: string;
    lines: JournalEntryLine[];
  }): Promise<JournalEntry> => {
    const { data } = await apiClient.post<JournalEntry>('/contabilidad/asientos', entry);
    return data;
  },

  postJournalEntry: async (id: string): Promise<JournalEntry> => {
    const { data } = await apiClient.patch<JournalEntry>(`/contabilidad/asientos/${id}/contabilizar`);
    return data;
  },

  getTrialBalance: async (from: string, to: string): Promise<any[]> => {
    const { data } = await apiClient.get<any[]>('/contabilidad/balance-comprobacion', { params: { from, to } });
    return data;
  },
};
