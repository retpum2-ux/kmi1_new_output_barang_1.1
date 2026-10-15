/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PengambilanPage } from './components/PengambilanPage';
import { SpreadsheetSettingsModal } from './components/SpreadsheetSettingsModal';
import { MasterDataManager } from './components/MasterDataManager';
import { RecordsHistoryModal } from './components/RecordsHistoryModal';
import { VercelGuideModal } from './components/VercelGuideModal';
import {
  PengambilanFormData,
  AppSettings,
  MasterItem,
  MasterUnit,
  SubmissionRecord,
} from './types';
import {
  submitFormData,
  getAppSettings,
  saveAppSettings,
  getMasterItems,
  saveMasterItems,
  getMasterUnits,
  saveMasterUnits,
  getLocalRecords,
  clearLocalRecords,
} from './services/api';
import { DEFAULT_SETTINGS } from './data/initialMasterData';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<MasterItem[]>([]);
  const [units, setUnits] = useState<MasterUnit[]>([]);
  const [records, setRecords] = useState<SubmissionRecord[]>([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    getAppSettings().then(setSettings);
    getMasterItems().then(setItems);
    getMasterUnits().then(setUnits);
    setRecords(getLocalRecords());
  }, []);

  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveAppSettings(newSettings);
  };

  const handleSaveItems = async (newItems: MasterItem[]) => {
    setItems(newItems);
    await saveMasterItems(newItems);
  };

  const handleSaveUnits = async (newUnits: MasterUnit[]) => {
    setUnits(newUnits);
    await saveMasterUnits(newUnits);
  };

  const handleClearRecords = () => {
    clearLocalRecords();
    setRecords([]);
  };

  const handleSubmitForm = async (
    formData: PengambilanFormData
  ): Promise<{ success: boolean; synced: boolean; message: string }> => {
    const res = await submitFormData(formData);
    // Refresh local records
    setRecords(getLocalRecords());
    return res;
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Main Form Directly Displayed */}
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        <PengambilanPage
          onSubmit={handleSubmitForm}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMaster={() => setIsMasterOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          settings={settings}
        />
      </main>

      {/* Spreadsheet Integration Modal (Single Spreadsheet & Key: APPS_SCRIPT_URL) */}
      <SpreadsheetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Master Data Manager Modal */}
      <MasterDataManager
        isOpen={isMasterOpen}
        onClose={() => setIsMasterOpen(false)}
        items={items}
        units={units}
        onSaveItems={handleSaveItems}
        onSaveUnits={handleSaveUnits}
      />

      {/* Records History Modal */}
      <RecordsHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={records}
        onClearRecords={handleClearRecords}
      />

      {/* Vercel & GitHub Guide Modal */}
      <VercelGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenMaster={() => setIsMasterOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
    </div>
  );
}
