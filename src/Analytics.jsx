import { useState } from 'react';
import { AlertTriangle, CalendarDays, Download, FileText, FolderOpen, Gavel, Printer, Receipt, Users, Wallet } from 'lucide-react';
import { labels } from './Dossiers.jsx';
import { downloadCsv, money } from './locale.js';
import './analytics.css';

const periods = [[30, '30 يوماً'], [90, '90 يوماً'], [180, '6 أشهر'], [365, '12 شهراً'], [0, 'الكل']];
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Africa/Casablanca' }).format(new Date());
const sum = (rows, field) => rows.reduce((total, row) => total + Number(row[field] || 0), 0);
const balance = row => Math.max(0, Number(row.montant || 0) - Number(row.paye || 0));
const monthName = key => new Intl.DateTimeFormat('ar-MA', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(new Date(key + '-01T00:00:00Z'));
const series = [['cases', 'الملفات'], ['hearings', 'الجلسات'], ['billed', 'المفوتر'], ['paid', 'المحصل']];
const outstanding = [
  ['paid', 'مسددة'],
  ['partial', 'مسددة جزئياً'],
  ['unpaid', 'غير مسددة'],
];
const invoiceState = row => !balance(row) ? 'paid' : Number(row.paye) > 0 ? 'partial' : 'unpaid';

function monthKeys(start, end) {
  const [year, month] = start.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  const keys = [];
  while (date.toISOString().slice(0, 7) <= end.slice(0, 7)) {
    keys.push(date.toISOString().slice(0, 7));
    date.setUTCMonth(date.getUTCMonth() + 1);
  }
  return keys;
}

function Breakdown({ title, rows }) {
  const max = Math.max(1, ...rows.map(([, value]) => value));
  return <section className="analytics-panel">
    <h2>{title}</h2>
    {rows.length ? rows.map(([label, value]) => <div className="breakdown-row" key={label}>
      <span dir="auto">{label}</span><meter min="0" max={max} value={value} aria-label={label}/><b>{value}</b>
    </div>) : <p>لا توجد بيانات في هذه الفترة.</p>}
  </section>;
}

export default function Analytics({ data, navigate }) {
  const [days, setDays] = useState(180);
  const end = today();
  const firstDay = new Date(end + 'T00:00:00Z');
  if (days) firstDay.setUTCDate(firstDay.getUTCDate() - days + 1);
  const start = days ? firstDay.toISOString().slice(0, 10) : '';
  const inRange = date => !days || Boolean(date && date >= start && date <= end);
  const cases = data.dossiers.filter(row => inRange(row.ouverture));
  const hearings = data.audiences.filter(row => inRange(row.date));
  const clients = data.clients.filter(row => inRange(row.dateCreation));
  const docs = data.documents.filter(row => inRange(row.date));
  const invoices = data.factures.filter(row => inRange(row.date));
  const billed = sum(invoices, 'montant');
  const paid = sum(invoices, 'paye');
  const overdue = data.factures.filter(row => row.echeance && row.echeance < end && balance(row));
  const upcoming = new Set(data.audiences.filter(row => row.date >= end && row.statut === 'Programmée').map(row => row.dossier));
  const withoutHearing = data.dossiers.filter(row => !['Archivé', 'Clôturé'].includes(row.statut) && !upcoming.has(row.id) && !(row.prochaine && row.prochaine >= end));
  const metrics = [
    [FolderOpen, 'ملفات مفتوحة في الفترة', cases.length, data.dossiers.length],
    [Users, 'موكلون جدد في الفترة', clients.length, data.clients.length],
    [CalendarDays, 'جلسات الفترة', hearings.length, data.audiences.length],
    [FileText, 'وثائق الفترة', docs.length, data.documents.length],
    [Receipt, 'فواتير الفترة', invoices.length, data.factures.length],
    [Wallet, 'محصل على فواتير الفترة', money(paid), money(sum(data.factures, 'paye'))],
    [Receipt, 'مفوتر في الفترة', money(billed), money(sum(data.factures, 'montant'))],
  ];
  const dates = [...cases.map(row => row.ouverture), ...hearings.map(row => row.date), ...invoices.map(row => row.date)].filter(Boolean).sort();
  const months = monthKeys(start || dates[0] || end, days ? end : dates.at(-1) || end);
  const monthly = months.map(month => {
    const matches = date => date?.startsWith(month);
    const batch = invoices.filter(row => matches(row.date));
    return { month, cases: cases.filter(row => matches(row.ouverture)).length, hearings: hearings.filter(row => matches(row.date)).length,
      billed: sum(batch, 'montant'), paid: sum(batch, 'paye') };
  });
  const countMax = Math.max(1, ...monthly.flatMap(row => [row.cases, row.hearings]));
  const moneyMax = Math.max(1, ...monthly.flatMap(row => [row.billed, row.paid]));
  const customerTotals = new Map();
  for (const invoice of invoices) {
    const key = invoice.client || 'غير محدد';
    const totals = customerTotals.get(key) || [0, 0];
    customerTotals.set(key, [totals[0] + Number(invoice.montant || 0), totals[1] + balance(invoice)]);
  }
  const top = [...customerTotals].sort((a, b) => b[1][0] - a[1][0]).slice(0, 5);
  const topMax = Math.max(1, ...top.map(([, [value]]) => value));
  const frequencies = new Map();
  for (const row of hearings) {
    const key = row.objet || 'غير محدد';
    frequencies.set(key, (frequencies.get(key) || 0) + 1);
  }
  const exportData = () => downloadCsv('avocium-analytics', [
    ['الفترة', periods.find(([value]) => value === days)[1]], ['من', start || '—'], ['إلى', days ? end : '—'],
    ['المؤشر', 'الفترة', 'الإجمالي'], ...metrics.map(([, title, value, total]) => [title, value, total]),
    [], ['الشهر', ...series.map(([, label]) => label)],
    ...monthly.map(row => [row.month, ...series.map(([key]) => row[key])]),
    [], ['الموكل', 'المفوتر', 'المبلغ المتبقي'], ...top.map(([name, totals]) => [name, ...totals]),
  ]);

  return <section className="analytics" dir="rtl" aria-labelledby="analytics-title">
    <header className="analytics-heading">
      <div><h1 id="analytics-title">لوحة التحليلات</h1><p>النشاط القضائي والفوترة والتحصيل</p></div>
      <div className="analytics-controls">
        <div role="group" aria-label="الفترة">{periods.map(([value, name]) => <button key={value} aria-pressed={days === value} onClick={() => setDays(value)}>{name}</button>)}</div>
        <button onClick={exportData}><Download size={16}/> Excel (CSV)</button>
        <button onClick={() => window.print()}><Printer size={16}/> PDF</button>
      </div>
    </header>
    <p className="analytics-range">{days ? <bdi>{start} — {end}</bdi> : 'جميع الفترات'} · نسبة التحصيل {billed ? Math.round(paid / billed * 100) : 0}٪</p>
    <div className="analytics-metrics">{metrics.map(([Icon, title, value, total]) => <article key={title}>
      <Icon size={21}/><div><span>{title}</span><strong>{value}</strong><small>الإجمالي {total}</small></div>
    </article>)}</div>
    <div className="analytics-alerts">
      <button className="analytics-alert red" onClick={() => navigate('factures', 'overdue')}><AlertTriangle size={22}/><span><b>فواتير متأخرة</b><small>{overdue.length} · {money(overdue.reduce((total, row) => total + balance(row), 0))}</small></span></button>
      <button className="analytics-alert amber" onClick={() => navigate('dossiers', withoutHearing.map(row => row.id))}><Gavel size={22}/><span><b>ملفات دون جلسة قادمة</b><small>{withoutHearing.length} ملفات</small></span></button>
    </div>
    <div className="analytics-charts">
      <section className="analytics-panel"><h2>النشاط الشهري</h2><p>الفوترة والتحصيل حسب شهر الفاتورة، والملفات والجلسات حسب تاريخها.</p>
        <div className="month-scroll"><div className="month-chart" dir="ltr">
          {monthly.map(row => <div key={row.month} className="month-group">
            <div className="month-bars">{series.map(([key, label]) => <div key={key} className="month-track"
              title={`${monthName(row.month)} · ${label}: ${key === 'billed' || key === 'paid' ? money(row[key]) : row[key]}`}>
              <span data-series={key} style={{ height: `${row[key] / (key === 'billed' || key === 'paid' ? moneyMax : countMax) * 100}%` }}/>
            </div>)}</div><span>{monthName(row.month)}</span>
          </div>)}
        </div></div>
        <div className="analytics-legend">{series.map(([key, label]) => <span key={key}><i data-series={key}/>{label}</span>)}</div>
        <details><summary>بيانات الرسم الشهري</summary><div className="table-wrap"><table><thead><tr><th>الشهر</th>{series.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead>
          <tbody>{monthly.map(row => <tr key={row.month}><td>{monthName(row.month)}</td>{series.map(([key]) => <td key={key}>{row[key]}</td>)}</tr>)}</tbody></table></div></details>
      </section>
      <section className="analytics-panel"><h2>أهم الموكلين حسب الفوترة</h2><p>المفوتر والمبلغ المتبقي لكل موكل.</p>
        {top.length ? top.map(([name, [total, remaining]]) => <div className="analytics-client" key={name}>
          <strong dir="auto">{name}</strong>
          <div><meter min="0" max={topMax} value={total} aria-label="المفوتر"/><span>{money(total)}</span></div>
          <div><meter className="remaining" min="0" max={topMax} value={remaining} aria-label="المتبقي"/><span>{money(remaining)}</span></div>
        </div>) : <p>لا توجد فواتير في هذه الفترة.</p>}
      </section>
    </div>
    <div className="analytics-breakdowns">
      <Breakdown title="توزيع حالات الملفات" rows={Object.entries(labels).slice(0, 5).map(([key, label]) => [label, cases.filter(row => row.statut === key).length])}/>
      <Breakdown title="توزيع حالات الفواتير" rows={outstanding.map(([key, label]) => [label, invoices.filter(row => invoiceState(row) === key).length])}/>
      <Breakdown title="الجلسات الأكثر تكراراً" rows={[...frequencies].sort((a, b) => b[1] - a[1]).slice(0, 5)}/>
    </div>
  </section>;
}
