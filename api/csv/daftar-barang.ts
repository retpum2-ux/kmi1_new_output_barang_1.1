import fs from 'fs';
import path from 'path';

const FALLBACK_ITEMS = [
  { name: 'Copper Wire Rod Cu 8.00 mm (Grade A)', code: 'CU-ROD-08', category: 'Bahan Baku', defaultUnit: 'KG' },
  { name: 'Bare Copper Wire BCW 1.20 mm', code: 'CU-WIRE-12', category: 'Kawat Konduktor', defaultUnit: 'KG' },
  { name: 'Tembaga Halus Finewire 0.40 mm', code: 'CU-WIRE-04', category: 'Kawat Konduktor', defaultUnit: 'KG' },
  { name: 'Aluminum Wire Rod EC Grade 9.5 mm', code: 'AL-ROD-95', category: 'Bahan Baku', defaultUnit: 'KG' },
  { name: 'PVC Compound Insulation Black (Type TI1)', code: 'PVC-INS-BK', category: 'Isolasi & Selubung', defaultUnit: 'KG' },
  { name: 'PVC Sheathing Compound Grey (Type TM1)', code: 'PVC-SHT-GY', category: 'Isolasi & Selubung', defaultUnit: 'KG' },
  { name: 'XLPE Compound Natural Insulation (Medium Voltage)', code: 'XLPE-INS-NT', category: 'Isolasi & Selubung', defaultUnit: 'KG' },
  { name: 'Galvanized Steel Tape 0.50 x 30 mm', code: 'ST-TAPE-05', category: 'Armouring / Pelindung', defaultUnit: 'ROLL' },
  { name: 'Copper Tape Screen 0.10 x 25 mm', code: 'CU-TAPE-01', category: 'Screening', defaultUnit: 'ROLL' },
  { name: 'Wooden Drum Flange D-1800 (Drum Kayu)', code: 'DRUM-KD-18', category: 'Packaging', defaultUnit: 'DRUM' },
  { name: 'Drawing Lubricant Sintetis (Minyak Pelumas Tarik)', code: 'LUB-DRAW-SYN', category: 'Penunjang Produksi', defaultUnit: 'LTR' },
  { name: 'Tungsten Carbide Dies 1.15 mm', code: 'DIE-TC-115', category: 'Sparepart Mesin', defaultUnit: 'PCS' },
  { name: 'Water Blocking Semi-Conductive Tape', code: 'WB-TAPE-02', category: 'Material Penunjang', defaultUnit: 'MTR' },
  { name: 'Plastic Stretch Film 500 mm x 300 m', code: 'FILM-STRETCH', category: 'Packaging', defaultUnit: 'ROLL' },
];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const possiblePaths = [
    path.join(process.cwd(), 'code', 'daftar-barang.csv'),
    path.join(process.cwd(), 'src', 'code', 'daftar-barang.csv'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf-8');
        const lines = content
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0 && !l.startsWith('#'));

        if (lines.length > 0) {
          const firstLine = lines[0].toLowerCase();
          const hasHeader =
            firstLine.includes('name') || firstLine.includes('nama') || firstLine.includes('barang');
          const start = hasHeader ? 1 : 0;
          const items = [];

          for (let i = start; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
            if (cols[0] && cols[0].length > 0) {
              items.push({
                name: cols[0],
                code: cols[1] || undefined,
                category: cols[2] || undefined,
                defaultUnit: cols[3] || undefined,
              });
            }
          }
          if (items.length > 0) {
            return res.status(200).json(items);
          }
        }
      } catch (e) {
        console.error('Error reading CSV in serverless function:', e);
      }
    }
  }

  // Fallback defaults if file not accessible in serverless environment
  return res.status(200).json(FALLBACK_ITEMS);
}
