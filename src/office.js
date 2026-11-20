export const courtTypes = ['المحكمة الابتدائية', 'محكمة الاستئناف', 'المحكمة التجارية', 'المحكمة الإدارية', 'محكمة النقض'];
export const memoTypes = ['جوابية', 'افتتاحية', 'تعقيبية', 'تكميلية'];
export const taskStates = ['نشطة', 'قيد الإنجاز', 'مكتملة'];
export const hearingTypes = ['جلسة', 'مرافعة', 'صلح', 'خبرة', 'نطق بالحكم'];
export const documentTypes = ['مرفق', 'شكاية', 'حكم', 'عقد', 'وثيقة إثبات', 'مراسلة'];
export const invoiceStates = ['مسودة', 'صادرة', 'ملغاة'];
export const amount = value => Math.round(Number(value || 0) * 100) / 100;
export const lineAmount = line => amount(Number(line.quantity) * Number(line.price));
export function invoiceTotals(lines, rate) {
  const subtotal = amount(lines.reduce((total, line) => total + lineAmount(line), 0));
  const tax = amount(subtotal * Number(rate || 0) / 100);
  return { subtotal, tax, total: amount(subtotal + tax) };
}
export const newLine = () => ({ id: crypto.randomUUID(), objet: '', category: 'أتعاب', quantity: 1, price: 0 });
export const billable = row => !['مسودة', 'ملغاة'].includes(row.invoiceStatus);
export const isOverdue = (row, today) => billable(row) && Boolean(row.echeance && row.echeance < today && Number(row.montant) > Number(row.paye || 0));
export const dateToday = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Africa/Casablanca' }).format(new Date());
export const dateKey = date => date.toISOString().slice(0, 10);
export const addDays = (key, days) => {
  const date = new Date(key + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return dateKey(date);
};
export const courtSeeds = [
  ['CAS', 'المحكمة التجارية بالدار البيضاء', courtTypes[2], 'الدار البيضاء'],
  ['MEK', 'المحكمة الابتدائية بمكناس', courtTypes[0], 'مكناس'],
  ['FES', 'المحكمة الابتدائية بفاس', courtTypes[0], 'فاس'],
].map(([id, nom, type, ville]) => ({ id: 'TRI-' + id, nom, type, ville }));

export async function archiveFile(id, file) {
  const db = await openFiles();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('attachments', 'readwrite');
      transaction.oncomplete = resolve;
      transaction.onabort = () => reject(transaction.error);
      const store = transaction.objectStore('attachments');
      if (file) store.put(file, id);
      else store.delete(id);
    });
  } finally { db.close(); }
}

function openFiles() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('avocium-files', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('attachments');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function downloadAttachment(id, name) {
  const db = await openFiles();
  try {
    const blob = await new Promise((resolve, reject) => {
      const request = db.transaction('attachments').objectStore('attachments').get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } finally { db.close(); }
}
