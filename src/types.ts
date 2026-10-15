export interface MasterItem {
  id: string;
  code: string;
  name: string;
  category: string;
  defaultUnit: string;
  description?: string;
}

export interface MasterUnit {
  id: string;
  code: string;
  name: string;
  symbol?: string;
}

export interface ItemEntryPengambilan {
  id: string;
  barang: string;
  qty: string | number;
  unit: string;
  keterangan: string;
}

export interface PengambilanFormData {
  id?: string;
  type: 'pengambilan';
  tanggal: string;
  mesin: string;
  namaPengambil: string;
  items: ItemEntryPengambilan[];
  createdAt?: string;
  syncedToSheets?: boolean;
}

export interface SubmissionRecord extends PengambilanFormData {
  id: string;
  createdAt: string;
  syncedToSheets: boolean;
  syncSummary?: string;
  syncError?: string;
}

export interface AppSettings {
  appsScriptUrl: string;
  webhookUrl?: string; // backwards compatibility alias
  sheetNamePengambilan: string;
  spreadsheetId?: string;
  companyName: string;
}
