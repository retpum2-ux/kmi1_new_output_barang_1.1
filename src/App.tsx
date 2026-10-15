/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PengambilanPage } from './components/PengambilanPage';
import { PengambilanFormData } from './types';
import { submitFormData } from './services/api';

export default function App() {
  const handleSubmitForm = async (
    formData: PengambilanFormData
  ): Promise<{ success: boolean; synced: boolean; message: string }> => {
    return await submitFormData(formData);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Main Form Directly Displayed */}
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        <PengambilanPage onSubmit={handleSubmitForm} />
      </main>
    </div>
  );
}
