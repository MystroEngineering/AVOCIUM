import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { addDays, billable, dateToday, invoiceTotals, isOverdue, lineAmount, newLine } from './office.js';
import { money } from './locale.js';
import './office.css';

export function InvoiceLines({ lines, rate, onChange }) {
  const totals = invoiceTotals(lines, rate);
  const edit = (id, key, value) => onChange(lines.map(line => line.id === id ? { ...line, [key]: value } : line));
  return <fieldset className="office-lines">
    <legend>بنود الفاتورة</legend>
    {lines.map(line => <div className="office-line" key={line.id}>
      <label>الوصف<input required value={line.objet} onChange={e => edit(line.id, 'objet', e.target.value)}/></label>
      <label>الفئة<select value={line.category} onChange={e => edit(line.id, 'category', e.target.value)}><option>أتعاب</option><option>مصاريف</option></select></label>
      <label>الكمية<input required type="number" min="0.01" step="0.01" value={line.quantity} onChange={e => edit(line.id, 'quantity', e.target.value)}/></label>
      <label>سعر الوحدة<input required type="number" min="0" step="0.01" value={line.price} onChange={e => edit(line.id, 'price', e.target.value)}/></label>
      <output>{money(lineAmount(line))}</output>
      <button className="outline" type="button" disabled={lines.length === 1} aria-label="حذف البند" onClick={() => onChange(lines.filter(item => item.id !== line.id))}><Trash2 size={15}/></button>
    </div>)}
    <button className="outline" type="button" onClick={() => onChange([...lines, newLine()])}><Plus size={15}/> إضافة بند</button>
    <dl><dt>المجموع قبل الضريبة</dt><dd>{money(totals.subtotal)}</dd><dt>الضريبة</dt><dd>{money(totals.tax)}</dd><dt>الإجمالي</dt><dd>{money(totals.total)}</dd></dl>
  </fieldset>;
}

export function Finance({ invoices, cases, grouped }) {
  const rows = invoices.filter(billable);
  const totals = rows.reduce((total, row) => {
    const billed = Number(row.montant || 0), paid = Number(row.paye || 0);
    return [total[0] + billed, total[1] + paid, total[2] + billed - paid, total[3] + (isOverdue(row, dateToday()) ? billed - paid : 0)];
  }, [0, 0, 0, 0]);
  const groups = new Map();
  for (const row of invoices) {
    if (!groups.has(row.client)) groups.set(row.client, { count: 0, billed: 0, paid: 0, overdue: false });
    const entry = groups.get(row.client);
    entry.count++;
    if (billable(row)) {
      entry.billed += Number(row.montant || 0);
      entry.paid += Number(row.paye || 0);
      entry.overdue ||= isOverdue(row, dateToday());
    }
  }
  if (!grouped) return <div className="office-metrics">{['إجمالي الفوترة', 'إجمالي المدفوع', 'الرصيد المتبقي', 'متأخر السداد'].map((label, index) =>
    <article key={label}><span>{label}</span><strong>{money(totals[index])}</strong></article>)}</div>;
  return <div className="table-wrap"><table><thead><tr>{['الموكل', 'الملفات', 'الفواتير', 'المفوتر', 'المدفوع', 'المتبقي', 'نسبة الأداء', 'الحالة'].map(text => <th key={text}>{text}</th>)}</tr></thead>
    <tbody>{[...groups].map(([client, row]) => <tr key={client}><td dir="auto">{client}</td><td>{cases.filter(item => item.client === client).length}</td><td>{row.count}</td>
      <td>{money(row.billed)}</td><td>{money(row.paid)}</td><td>{money(row.billed - row.paid)}</td><td>{row.billed ? Math.round(row.paid / row.billed * 100) : 0}٪</td>
      <td>{row.overdue ? 'متأخر' : row.paid < row.billed ? 'معلق' : row.billed ? 'مسدد' : '—'}</td></tr>)}
      {!groups.size && <tr><td colSpan="8">لا توجد فواتير مطابقة.</td></tr>}</tbody>
  </table></div>;
}

export function Calendar({ entries, weekly, onOpen }) {
  const [anchor, setAnchor] = useState(dateToday);
  const today = dateToday();
  const monthStart = anchor.slice(0, 7) + '-01';
  const origin = weekly ? anchor : monthStart;
  const start = addDays(origin, -new Date(origin + 'T00:00:00Z').getUTCDay());
  const dates = Array.from({ length: weekly ? 7 : 42 }, (_, index) => addDays(start, index));
  function move(step) {
    if (weekly) return setAnchor(addDays(anchor, 7 * step));
    const date = new Date(monthStart + 'T00:00:00Z');
    date.setUTCMonth(date.getUTCMonth() + step);
    setAnchor(date.toISOString().slice(0, 10));
  }
  const title = new Intl.DateTimeFormat('ar-MA', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(anchor + 'T00:00:00Z'));
  return <section className="office-calendar">
    <div className="office-calendar-head"><button className="outline" aria-label="الفترة السابقة" onClick={() => move(-1)}><ChevronRight size={16}/></button>
      <b>{weekly ? <bdi>{start} — {dates.at(-1)}</bdi> : title}</b>
      <button className="outline" aria-label="الفترة التالية" onClick={() => move(1)}><ChevronLeft size={16}/></button></div>
    <div className="office-calendar-scroll"><div className="office-calendar-grid">
      {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => <b key={day}>{day}</b>)}
      {dates.map(date => <div key={date} data-today={date === today}>
        <span>{Number(date.slice(-2))}</span>
        {entries.filter(row => row.date === date).map(row => <button key={row.id} onClick={() => onOpen(row)}>{row.heure && `${row.heure} · `}{row.objet || row.dossier}</button>)}
      </div>)}
    </div></div>
  </section>;
}

export function Board({ entries, states, onOpen }) {
  return <div className="office-board">{states.map(([key, label]) => <section key={key}><h3>{label}</h3>
    {entries.filter(row => row.statut === key || (!row.statut && key === states[0][0])).map(row => <button key={row.id} className="outline" onClick={() => onOpen(row)}>{row.objet || row.dossier}</button>)}
  </section>)}</div>;
}
