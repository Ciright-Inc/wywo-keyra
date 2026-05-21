import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import type { TelcoCatalogRow } from "./telcoCatalogTypes";

export type { TelcoCatalogRow as TelcoXlsxRow } from "./telcoCatalogTypes";

const PARSE_PY = `
import json, sys, zipfile, xml.etree.ElementTree as ET

path = sys.argv[1]
with zipfile.ZipFile(path) as z:
    shared = []
    root = ET.fromstring(z.read('xl/sharedStrings.xml'))
    ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    for si in root.findall('m:si', ns):
        texts = [t.text or '' for t in si.findall('.//m:t', ns)]
        shared.append(''.join(texts))
    sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    rows = []
    for row in sheet.findall('m:sheetData/m:row', ns):
        vals = [''] * 8
        for c in row.findall('m:c', ns):
            ref = c.get('r', '')
            col = ''.join(ch for ch in ref if ch.isalpha())
            idx = ord(col) - 65
            t = c.get('t')
            v = c.find('m:v', ns)
            if v is None:
                continue
            val = shared[int(v.text)] if t == 's' else v.text
            if 0 <= idx < len(vals):
                vals[idx] = val
        rows.append(vals)

out = []
seen = set()
for r in rows[1:]:
    name = (r[2] or '').strip()
    iso2 = (r[1] or '').strip().upper()
    slug = (r[3] or '').strip().lower()
    if not name or not iso2 or not slug:
        continue
    key = (iso2, slug)
    if key in seen:
        continue
    seen.add(key)
    sub_raw = r[5] if len(r) > 5 else ''
    subs = None
    if (r[6] or '').strip():
        try:
            subs = int(round(float(r[6])))
        except ValueError:
            subs = None
    out.append({
        'countryName': (r[0] or '').strip(),
        'countryIso2': iso2,
        'name': name,
        'slug': slug,
        'telcoSubdomain': (r[4] or '').strip().lower(),
        'officialDomain': sub_raw.strip() or None,
        'subscribers': subs,
        'subscribersDisplay': (r[7] or '').strip() or None,
    })
print(json.dumps(out))
`;

export function defaultTelcoXlsxPath(): string {
  const candidates = [
    join(process.cwd(), "Telco details for Keyra.xlsx"),
    join(process.cwd(), "prisma", "data", "Telco details for Keyra.xlsx"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return candidates[0]!;
}

export function parseKeyraTelcoXlsx(xlsxPath: string): TelcoCatalogRow[] {
  const raw = execFileSync("python3", ["-c", PARSE_PY, xlsxPath], { encoding: "utf8" });
  return JSON.parse(raw) as TelcoCatalogRow[];
}
