/**
 * Google Apps Script Template untuk Google Spreadsheet
 * PT KMI Wire and Cable Tbk - Form Pengambilan & Pemakaian Barang
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - WEBHOOK GOOGLE SPREADSHEET
 * PT KMI WIRE AND CABLE TBK
 * FORM PENGAMBILAN & PEMAKAIAN BARANG
 * =========================================================================
 * 
 * 7 KOLOM DATA YANG DICATAT:
 * 1. Tanggal Form
 * 2. Mesin
 * 3. Nama Pengambil
 * 4. Nama Barang
 * 5. Kuantitas (Qty)
 * 6. Satuan (U/M)
 * 7. Keterangan Pemakaian
 * =========================================================================
 */

// OPTIONAL: Jika Anda membuat skrip ini dari luar (standalone di Google Drive),
// tempel ID Spreadsheet Anda di bawah ini (dari URL spreadsheet: /d/[ID_SPREADSHEET]/edit).
// Jika Anda membuka skrip dari menu "Ekstensi > Apps Script", biarkan kosong.
var SPREADSHEET_ID = '';

// Nama tab default untuk data pengambilan
var DEFAULT_SHEET_NAME = 'Pengambilan';

// Header 7 kolom tabel
var HEADERS = [
  'Tanggal Form',
  'Mesin',
  'Nama Pengambil',
  'Nama Barang',
  'Kuantitas (Qty)',
  'Satuan (U/M)',
  'Keterangan Pemakaian'
];

/**
 * Fungsi helper untuk mendeteksi Spreadsheet secara aman
 */
function getSpreadsheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (err) {}

  try {
    var ssActive = SpreadsheetApp.getActive();
    if (ssActive) return ssActive;
  } catch (err) {}

  if (typeof SPREADSHEET_ID === 'string' && SPREADSHEET_ID.trim().length > 10) {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (err) {}
  }

  return null;
}

/**
 * Menyiapkan sheet dan header jika belum ada (Aman dipanggil langsung tanpa parameter)
 */
function getOrCreateSheet(sheetNameOrSs, maybeSheetName) {
  var ss;
  var targetName;

  // Mendukung pemanggilan getOrCreateSheet(ss, 'Pengambilan') ATAU getOrCreateSheet('Pengambilan') ATAU getOrCreateSheet()
  if (sheetNameOrSs && typeof sheetNameOrSs.getSheetByName === 'function') {
    ss = sheetNameOrSs;
    targetName = maybeSheetName || DEFAULT_SHEET_NAME;
  } else {
    targetName = (typeof sheetNameOrSs === 'string' && sheetNameOrSs.trim()) 
      ? sheetNameOrSs.trim() 
      : (typeof maybeSheetName === 'string' && maybeSheetName.trim() ? maybeSheetName.trim() : DEFAULT_SHEET_NAME);
    ss = getSpreadsheet();
  }

  if (!ss) {
    throw new Error(
      "Spreadsheet tidak ditemukan! Pastikan skrip ini dibuka langsung dari menu 'Ekstensi > Apps Script' pada Google Spreadsheet Anda, atau masukkan SPREADSHEET_ID di bagian atas skrip."
    );
  }

  var sheet = ss.getSheetByName(targetName);
  if (!sheet) {
    sheet = ss.insertSheet(targetName);
  }

  // Jika sheet masih kosong (baris = 0), buat header 7 kolom otomatis
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);

    // Format baris header (tebal, warna biru muda elegan, rata tengah)
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#e8f0fe');
    headerRange.setFontColor('#1a73e8');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    // Auto-fit kolom
    for (var col = 1; col <= HEADERS.length; col++) {
      sheet.autoResizeColumn(col);
    }
  }

  return sheet;
}

/**
 * FUNGSI UJI COBA MANUAL (Klik tombol 'Jalankan / Run' di editor dengan memilih fungsi ini)
 */
function testKoneksiManual() {
  Logger.log("Memulai uji coba koneksi...");
  var ss = getSpreadsheet();
  if (!ss) {
    Logger.log("GAGAL: Spreadsheet tidak terdeteksi. Silakan buka menu 'Ekstensi > Apps Script' dari file Spreadsheet Anda.");
    return;
  }
  var sheet = getOrCreateSheet(DEFAULT_SHEET_NAME);
  Logger.log("BERHASIL! Terhubung ke Spreadsheet: " + ss.getName());
  Logger.log("Sheet aktif: " + sheet.getName() + " (Jumlah baris saat ini: " + sheet.getLastRow() + ")");
}

/**
 * Menangani permintaan POST (Pengiriman data dari formulir web)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();

  // Cegah benturan data (concurrency)
  try {
    lock.waitLock(30000);
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: 'Server spreadsheet sedang sibuk, silakan coba beberapa detik lagi.'
    });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        status: 'error',
        message: 'Payload data kosong atau tidak valid.'
      });
    }

    var payload = JSON.parse(e.postData.contents);
    var ss = getSpreadsheet();

    if (!ss) {
      return createJsonResponse({
        status: 'error',
        message: 'Spreadsheet tidak terhubung. Buka skrip via menu Ekstensi > Apps Script di Spreadsheet Anda.'
      });
    }

    // 1. Fitur Uji Koneksi / Ping dari Web
    if (payload.action === 'ping' || payload.type === 'test') {
      return createJsonResponse({
        status: 'success',
        message: 'Koneksi ke Google Apps Script berhasil terhubung!',
        spreadsheetTitle: ss.getName(),
        timestamp: new Date().toISOString()
      });
    }

    // 2. Simpan Data Formulir Pengambilan
    var sheet = getOrCreateSheet(ss, payload.sheetName);
    var items = payload.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return createJsonResponse({
        status: 'error',
        message: 'Tidak ada data barang yang dikirim.'
      });
    }

    var tanggal = payload.tanggal || '';
    var mesin = payload.mesin || '-';
    var namaPengambil = payload.namaPengambil || '-';

    var rowsToAdd = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var qtyVal = it.qty !== undefined && it.qty !== null ? it.qty : '';

      rowsToAdd.push([
        tanggal,
        mesin,
        namaPengambil,
        it.barang || it.name || '',
        qtyVal,
        it.unit || 'PCS',
        it.keterangan || '-'
      ]);
    }

    // Tulis baris baru sekaligus ke spreadsheet (Batch insert)
    if (rowsToAdd.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      var range = sheet.getRange(startRow, 1, rowsToAdd.length, HEADERS.length);
      range.setValues(rowsToAdd);

      // Format kolom kuantitas rata kanan & satuan rata tengah
      sheet.getRange(startRow, 5, rowsToAdd.length, 1).setHorizontalAlignment('right');
      sheet.getRange(startRow, 6, rowsToAdd.length, 1).setHorizontalAlignment('center');
    }

    return createJsonResponse({
      status: 'success',
      message: 'Berhasil mencatat ' + rowsToAdd.length + ' baris barang ke sheet "' + sheet.getName() + '".',
      rowsAdded: rowsToAdd.length,
      transactionId: payload.transactionId || ''
    });

  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: 'Gagal memproses data: ' + error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Menangani permintaan GET (Untuk pengecekan status webhook via browser)
 */
function doGet(e) {
  var ss = getSpreadsheet();
  return createJsonResponse({
    status: 'online',
    message: 'Webhook Google Apps Script untuk Form Pengambilan PT KMI Wire and Cable Tbk aktif dan siap menerima data.',
    spreadsheetName: ss ? ss.getName() : 'Google Spreadsheet',
    timestamp: new Date().toISOString()
  });
}

/**
 * Helper untuk output JSON dengan MIME Type yang tepat
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
