export const money = value => `${Number(value || 0).toLocaleString('ar-MA')} د.م.`;

export function downloadCsv(filename, rows) {
  const quote = value => {
    const text = String(value ?? '');
    const safe = typeof value === 'string' && /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  const csv = '\uFEFF' + rows.map(row => row.map(quote).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename + '.csv';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
