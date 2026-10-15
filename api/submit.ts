// Vercel Serverless Function Handler for /api/submit
export default async function handler(req: any, res: any) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const submission = req.body;
    if (!submission || !submission.type || !submission.tanggal || !Array.isArray(submission.items)) {
      return res.status(400).json({
        success: false,
        message: 'Format data tidak valid: type, tanggal, dan items wajib diisi.',
      });
    }

    const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();

    const record = {
      id: transactionId,
      ...submission,
      createdAt: timestamp,
      syncedToSheets: false,
      syncedToSheets2: false,
      syncError: null,
    };

    const webhookUrl1 = (process.env.GOOGLE_SHEETS_WEBHOOK_URL || req.body.webhookUrl || '').trim();
    const webhookUrl2 = (process.env.GOOGLE_SHEETS_WEBHOOK_URL_2 || req.body.webhookUrl2 || '').trim();
    const sheetName1 = (req.body.sheetName || 'Pengambilan').trim();
    const sheetName2 = (req.body.sheetName2 || 'Pengambilan').trim();

    const forwardPromises: Promise<{ target: number; success: boolean; status?: number; data?: any; error?: string }>[] = [];

    if (webhookUrl1) {
      forwardPromises.push(
        (async () => {
          try {
            const payload = {
              action: 'submit',
              transactionId,
              timestamp,
              type: submission.type || 'pengambilan',
              sheetName: sheetName1,
              tanggal: submission.tanggal,
              mesin: submission.mesin || '-',
              namaPengambil: submission.namaPengambil || '-',
              items: submission.items,
              targetSpreadsheet: 1,
            };

            const sheetResponse = await fetch(webhookUrl1, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            const respText = await sheetResponse.text();
            let parsedResp = null;
            try { parsedResp = JSON.parse(respText); } catch { parsedResp = { raw: respText }; }

            return {
              target: 1,
              success: sheetResponse.ok,
              status: sheetResponse.status,
              data: parsedResp,
              error: sheetResponse.ok ? undefined : `HTTP ${sheetResponse.status}: ${respText}`,
            };
          } catch (err: any) {
            return { target: 1, success: false, error: err.message || 'Koneksi ke Spreadsheet 1 gagal' };
          }
        })()
      );
    }

    if (webhookUrl2) {
      forwardPromises.push(
        (async () => {
          try {
            const payload = {
              action: 'submit',
              transactionId,
              timestamp,
              type: submission.type || 'pengambilan',
              sheetName: sheetName2,
              tanggal: submission.tanggal,
              mesin: submission.mesin || '-',
              namaPengambil: submission.namaPengambil || '-',
              items: submission.items,
              targetSpreadsheet: 2,
            };

            const sheetResponse = await fetch(webhookUrl2, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            const respText = await sheetResponse.text();
            let parsedResp = null;
            try { parsedResp = JSON.parse(respText); } catch { parsedResp = { raw: respText }; }

            return {
              target: 2,
              success: sheetResponse.ok,
              status: sheetResponse.status,
              data: parsedResp,
              error: sheetResponse.ok ? undefined : `HTTP ${sheetResponse.status}: ${respText}`,
            };
          } catch (err: any) {
            return { target: 2, success: false, error: err.message || 'Koneksi ke Spreadsheet 2 gagal' };
          }
        })()
      );
    }

    const results = await Promise.all(forwardPromises);
    const res1 = results.find((r) => r.target === 1);
    const res2 = results.find((r) => r.target === 2);

    record.syncedToSheets = Boolean(res1?.success);
    record.syncedToSheets2 = Boolean(res2?.success);

    let message = '';
    const hasSheet1 = Boolean(webhookUrl1);
    const hasSheet2 = Boolean(webhookUrl2);

    if (hasSheet1 && hasSheet2) {
      if (res1?.success && res2?.success) {
        message = 'Data berhasil disimpan dan otomatis terisi ke KEDUA Google Spreadsheet (Spreadsheet 1 & Spreadsheet 2)!';
      } else if (res1?.success && !res2?.success) {
        message = `Data terkirim ke Spreadsheet 1, namun gagal ke Spreadsheet 2 (${res2?.error || 'gagal sync'}).`;
        record.syncError = `Spreadsheet 2 gagal: ${res2?.error}`;
      } else if (!res1?.success && res2?.success) {
        message = `Data terkirim ke Spreadsheet 2, namun gagal ke Spreadsheet 1 (${res1?.error || 'gagal sync'}).`;
        record.syncError = `Spreadsheet 1 gagal: ${res1?.error}`;
      } else {
        message = 'Data tersimpan lokal, namun pengiriman ke kedua Spreadsheet gagal.';
        record.syncError = `Sheet 1: ${res1?.error} | Sheet 2: ${res2?.error}`;
      }
    } else if (hasSheet1) {
      if (res1?.success) {
        message = 'Data berhasil disimpan dan otomatis terisi ke Google Spreadsheet!';
      } else {
        message = `Data tersimpan lokal, pengiriman ke Spreadsheet 1 gagal (${res1?.error}).`;
        record.syncError = res1?.error;
      }
    } else if (hasSheet2) {
      if (res2?.success) {
        message = 'Data berhasil disimpan dan otomatis terisi ke Google Spreadsheet 2!';
      } else {
        message = `Data tersimpan lokal, pengiriman ke Spreadsheet 2 gagal (${res2?.error}).`;
        record.syncError = res2?.error;
      }
    } else {
      message = 'Data disimpan lokal. Masukkan URL Webhook Google Apps Script di Pengaturan untuk sync otomatis.';
      record.syncError = 'Webhook belum diatur';
    }

    return res.status(200).json({
      success: true,
      transactionId,
      record,
      synced: record.syncedToSheets || record.syncedToSheets2,
      syncedBoth: record.syncedToSheets && record.syncedToSheets2,
      sheet1Result: res1,
      sheet2Result: res2,
      message,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: `Terjadi error di server: ${error.message || error}`,
    });
  }
}
