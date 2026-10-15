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

    const record: any = {
      id: transactionId,
      ...submission,
      createdAt: timestamp,
      syncedToSheets: false,
      syncError: null,
    };

    const targetUrl = (
      process.env.APPS_SCRIPT_URL ||
      process.env.APPS_SCRIPT_KEY ||
      process.env.GOOGLE_APPS_SCRIPT_URL ||
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      req.body.appsScriptUrl ||
      req.body.webhookUrl ||
      ''
    ).trim();

    const sheetName = (
      req.body.sheetName ||
      req.body.sheetNamePengambilan ||
      'Pengambilan'
    ).trim();

    let message = '';

    if (targetUrl) {
      try {
        const payload = {
          action: 'submit',
          transactionId,
          timestamp,
          type: submission.type || 'pengambilan',
          sheetName,
          tanggal: submission.tanggal,
          mesin: submission.mesin || '-',
          namaPengambil: submission.namaPengambil || '-',
          items: submission.items,
        };

        const sheetResponse = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const respText = await sheetResponse.text();
        let parsedResp = null;
        try {
          parsedResp = JSON.parse(respText);
        } catch {
          parsedResp = { raw: respText };
        }

        if (sheetResponse.ok) {
          record.syncedToSheets = true;
          message = 'Data berhasil disimpan dan otomatis terisi ke Google Spreadsheet!';
        } else {
          record.syncedToSheets = false;
          record.syncError = `HTTP ${sheetResponse.status}: ${respText}`;
          message = `Data tersimpan lokal, pengiriman ke Spreadsheet gagal (${record.syncError}).`;
        }
      } catch (err: any) {
        record.syncedToSheets = false;
        record.syncError = err.message || 'Koneksi ke Spreadsheet gagal';
        message = `Data tersimpan lokal, pengiriman ke Spreadsheet gagal (${record.syncError}).`;
      }
    } else {
      record.syncedToSheets = false;
      record.syncError = 'Key APPS_SCRIPT_URL belum diatur';
      message = 'Data disimpan lokal. Masukkan Key APPS_SCRIPT_URL di Environment Variables Vercel untuk sinkronisasi otomatis.';
    }

    return res.status(200).json({
      success: true,
      transactionId,
      record,
      synced: record.syncedToSheets,
      message,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: `Terjadi error di server: ${error.message || error}`,
    });
  }
}
