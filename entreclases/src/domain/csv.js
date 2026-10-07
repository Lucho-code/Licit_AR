// CSV que Excel en español abre bien: separador ';', BOM UTF-8 y coma decimal.

export function toCSV(rows, columns, sep = ';') {
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /["\n\r]/.test(s) || s.includes(sep) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  const head = columns.map((c) => esc(c.label)).join(sep);
  const body = rows.map((r) => columns.map((c) => esc(typeof c.value === 'function' ? c.value(r) : r[c.key])).join(sep));
  return '﻿' + [head, ...body].join('\r\n');
}

export function decimal(x, digits = 1) {
  if (x === null || x === undefined || Number.isNaN(x)) return '';
  return Number(x).toFixed(digits).replace('.', ',');
}
