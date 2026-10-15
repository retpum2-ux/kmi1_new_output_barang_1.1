/**
 * Google Apps Script Template untuk Google Spreadsheet
 * PT KMI Wire and Cable Tbk - Form Pengambilan & Pemakaian Barang
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - WEBHOOK GOOGLE SPREADSHEET (PT KMI WIRE AND CABLE TBK)
 * SISTEM FORM PENGAMBILAN & PEMAKAIAN BARANG
 * =========================================================================
 * 
 * URUTAN KOLOM RESMI (7 KOLOM):
 * Kolom A (1) : Tanggal Form
 * Kolom B (2) : Mesin
 * Kolom C (3) : Nama Pengambil
 * Kolom D (4) : Nama Barang
 * Kolom E (5) : Kuantitas (Qty)
 * Kolom F (6) : Satuan (U/M)
 * Kolom G (7) : Keterangan Pemakaian
 * =========================================================================
 */

// OPSIONAL: Jika skrip dibuat terpisah di Google Drive, isi ID Spreadsheet di sini.
// Jika dibuka dari menu "Ekstensi > Apps Script", biarkan kosong "".
var SPREADSHEET_ID = '';

// Nama tab tujuan
var DEFAULT_SHEET_NAME = 'Pengambilan';

// 7 Header Resmi
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
 * Mendeteksi Spreadsheet secara aman
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
 * Menyiapkan sheet dan header jika belum ada
 */
function getOrCreateSheet(sheetNameOrSs, maybeSheetName) {
  var ss;
  var targetName;

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
    throw new Error("Spreadsheet tidak ditemukan! Pastikan skrip ini dibuka dari menu 'Ekstensi > Apps Script'.");
  }

  var sheet = ss.getSheetByName(targetName);
  if (!sheet) {
    sheet = ss.insertSheet(targetName);
  }

  // Jika sheet masih baru/kosong, buat header 7 kolom otomatis
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#e8f0fe');
    headerRange.setFontColor('#1a73e8');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    for (var col = 1; col <= HEADERS.length; col++) {
      sheet.autoResizeColumn(col);
    }
  }

  return sheet;
}

/**
 * Menangani pengiriman data dari formulir web (doPost)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: 'Spreadsheet sedang sibuk, silakan coba lagi beberapa saat.'
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

    // Uji Koneksi / Ping
    if (payload.action === 'ping' || payload.type === 'test') {
      return createJsonResponse({
        status: 'success',
        message: 'Koneksi ke Google Apps Script berhasil terhubung!',
        spreadsheetTitle: ss.getName(),
        timestamp: new Date().toISOString()
      });
    }

    // Ambil sheet target
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

    // Deteksi posisi kolom berdasarkan Header di Baris 1 (Pencocokan Cerdas)
    var lastCol = Math.max(sheet.getLastColumn(), 7);
    var headerValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // Default urutan kolom (1-based index)
    var colMap = {
      tanggal: 1,        // Kolom A
      mesin: 2,          // Kolom B
      namaPengambil: 3,  // Kolom C
      barang: 4,         // Kolom D
      qty: 5,            // Kolom E
      satuan: 6,         // Kolom F
      keterangan: 7      // Kolom G
    };

    // Sesuaikan posisi jika header di spreadsheet memiliki susunan tertentu
    for (var c = 0; c < headerValues.length; c++) {
      var h = String(headerValues[c] || '').toLowerCase().trim();
      if (h.indexOf('tanggal') !== -1) {
        colMap.tanggal = c + 1;
      } else if (h.indexOf('mesin') !== -1) {
        colMap.mesin = c + 1;
      } else if (h.indexOf('pengambil') !== -1) {
        colMap.namaPengambil = c + 1;
      } else if (h.indexOf('barang') !== -1) {
        colMap.barang = c + 1;
      } else if (h.indexOf('kuantitas') !== -1 || h.indexOf('qty') !== -1 || h.indexOf('jumlah') !== -1) {
        colMap.qty = c + 1;
      } else if (h.indexOf('satuan') !== -1 || h.indexOf('u/m') !== -1 || h.indexOf('unit') !== -1) {
        colMap.satuan = c + 1;
      } else if (h.indexOf('keterangan') !== -1 || h.indexOf('pemakaian') !== -1) {
        colMap.keterangan = c + 1;
      }
    }

    // Tentukan jumlah kolom yang ditulis (tepat sesuai 7 header resmi)
    var maxCol = 7;
    for (var key in colMap) {
      if (colMap[key] > maxCol) maxCol = colMap[key];
    }

    var rowsToAdd = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var qtyVal = (it.qty !== undefined && it.qty !== null && String(it.qty).trim() !== '') ? Number(it.qty) || it.qty : '';

      // Buat array baris dengan panjang sesuai kolom
      var row = new Array(maxCol);
      for (var r = 0; r < maxCol; r++) row[r] = '';

      row[colMap.tanggal - 1] = tanggal;
      row[colMap.mesin - 1] = mesin;
      row[colMap.namaPengambil - 1] = namaPengambil;
      row[colMap.barang - 1] = it.barang || it.name || '';
      row[colMap.qty - 1] = qtyVal;
      row[colMap.satuan - 1] = it.unit || it.satuan || 'PCS';
      row[colMap.keterangan - 1] = it.keterangan || '-';

      rowsToAdd.push(row);
    }

    // Tulis baris baru sekaligus ke spreadsheet
    if (rowsToAdd.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      var writeRange = sheet.getRange(startRow, 1, rowsToAdd.length, maxCol);
      writeRange.setValues(rowsToAdd);

      // Format rata kanan untuk kolom kuantitas dan rata tengah untuk satuan
      if (colMap.qty <= maxCol) {
        sheet.getRange(startRow, colMap.qty, rowsToAdd.length, 1).setHorizontalAlignment('right');
      }
      if (colMap.satuan <= maxCol) {
        sheet.getRange(startRow, colMap.satuan, rowsToAdd.length, 1).setHorizontalAlignment('center');
      }
    }

    return createJsonResponse({
      status: 'success',
      message: 'Berhasil mencatat ' + rowsToAdd.length + ' baris ke sheet "' + sheet.getName() + '".',
      rowsAdded: rowsToAdd.length
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
    message: 'Webhook Google Apps Script untuk Form Pengambilan PT KMI Wire and Cable Tbk aktif.',
    spreadsheetName: ss ? ss.getName() : 'Google Spreadsheet',
    timestamp: new Date().toISOString()
  });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
