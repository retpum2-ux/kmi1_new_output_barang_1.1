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
  syncedToSheets2?: boolean;
  syncSummary?: string;
  syncError?: string;
}

export interface AppSettings {
  webhookUrl: string;
  webhookUrl2?: string;
  sheetNamePengambilan: string;
  sheetNamePengambilan2?: string;
  spreadsheetId?: string;
  companyName: string;
}
