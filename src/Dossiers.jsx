import { useState } from 'react';
import { Archive, CalendarDays, FileText, FolderOpen, Gavel, LayoutGrid, List, Plus, Receipt, Search, Users } from 'lucide-react';
import './dossiers.css';

export const labels = {
  'En cours': 'نشط', 'Audience prévue': 'جلسة مبرمجة', 'En attente': 'معلق',
  'Clôturé': 'مغلق', 'Archivé': 'مؤرشف', Civil: 'مدني', Pénal: 'جنائي',
  Commercial: 'تجاري', Social: 'اجتماعي', Famille: 'أسري', Administratif: 'إداري', Autre: 'أخرى',
};

function group(status) {
  if (status === 'En attente') return 'pending';
  if (status === 'Clôturé') return 'closed';
  if (status === 'Archivé') return 'archived';
  return 'active';
}

const categories = [
  ['all', 'جميع الملفات'], ['active', 'نشط'], ['pending', 'معلق'],
  ['closed', 'مغلق'], ['archived', 'مؤرشف'],
];
const formatDate = date => date ? date.split('-').reverse().join('/') : '—';

export default function Dossiers({ data, onOpen, onCreate, onExport, selectedIds }) {
  const [filter, setFilter] = useState(selectedIds ? 'no-hearing' : 'all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('cards');
  const totals = { all: data.dossiers.length, active: 0, pending: 0, closed: 0, archived: 0 };
  for (const dossier of data.dossiers) totals[group(dossier.statut)]++;
  const available = selectedIds ? [...categories, ['no-hearing', 'دون جلسة قادمة']] : categories;
  const term = query.trim().toLocaleLowerCase();
  const rows = data.dossiers.filter(dossier => (filter === 'all' || group(dossier.statut) === filter || (filter === 'no-hearing' && selectedIds?.includes(dossier.id)))
    && [...Object.values(dossier), labels[dossier.type], labels[dossier.statut]]
      .some(value => String(value ?? '').toLocaleLowerCase().includes(term)));
  const open = dossier => <button className="case-open" onClick={() => onOpen(dossier)}><FolderOpen size={16}/> فتح الملف</button>;

  return <section className="case-workspace" lang="ar" dir="rtl">
    <div className="case-heading">
      <div><h1>الملفات القضائية</h1><p>متابعة القضايا والجلسات والوثائق</p></div>
      <button className="case-primary" onClick={onCreate}><Plus size={19}/> ملف جديد</button>
    </div>

    <div className="case-metrics">
      {categories.slice(0, 4).map(([id, label]) => <button key={id} className="case-metric"
        data-tone={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>
        <span>{label}</span><strong>{totals[id]}</strong>
      </button>)}
    </div>

    <div className="case-toolbar">
      <label className="case-search"><Search size={18}/><input type="search" aria-label="بحث في الملفات"
        placeholder="ابحث بالمرجع أو اسم الموكل أو المحكمة" value={query} onChange={event => setQuery(event.target.value)}/></label>
      <div className="case-filters" role="group" aria-label="حالة الملف">
        {available.map(([id, label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>
          {id === 'archived' && <Archive size={15}/>}
          {id === 'all' ? 'الكل' : label}{id === 'archived' && ` (${totals[id]})`}
        </button>)}
      </div>
      <div className="case-view" role="group" aria-label="طريقة العرض">
        <button aria-pressed={view === 'cards'} onClick={() => setView('cards')}><LayoutGrid size={16}/> بطاقات</button>
        <button aria-pressed={view === 'table'} onClick={() => setView('table')}><List size={16}/> جدول</button>
      </div>
    </div>

    {rows.length === 0 ? <p className="case-empty" role="status">لا توجد ملفات مطابقة.</p>
      : view === 'table' ? <div className="case-table"><table>
        <thead><tr>{['المرجع', 'موضوع الملف', 'الموكل', 'المحكمة', 'الحالة', 'الجلسة المقبلة', 'الإجراء'].map(label => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>{rows.map(d => <tr key={d.id}><td><bdi>{d.id}</bdi></td><td dir="auto">{d.objet}</td><td dir="auto">{d.client}</td>
          <td dir="auto">{d.tribunal || '—'}</td><td>{labels[d.statut] || d.statut}</td><td><bdi>{formatDate(d.prochaine)}</bdi></td><td>{open(d)}</td></tr>)}</tbody>
      </table></div>
      : <div className="case-grid">{rows.map(d => <article className="case-card" data-tone={group(d.statut)} key={d.id}>
        <div className="case-card-meta"><bdi>{d.id}</bdi><span>{labels[d.statut] || d.statut}</span></div>
        <h2 dir="auto">{d.objet}</h2>
        {d.description && <p className="case-description" dir="auto">{d.description}</p>}
        <span className="case-type">{labels[d.type] || d.type}</span>
        <div className="case-details">
          <div><Users size={16}/><bdi>{d.client || '—'}</bdi></div>
          <div><Gavel size={16}/><bdi>{d.tribunal || '—'}</bdi></div>
          <div><CalendarDays size={16}/><bdi>{formatDate(d.prochaine)}</bdi></div>
        </div>
        <footer>
          <div className="case-counts">
            {[[CalendarDays, 'audiences', 'الجلسات'], [FileText, 'documents', 'الوثائق'], [Receipt, 'factures', 'الفواتير']].map(([Icon, key, label]) => {
              const count = data[key].filter(item => item.dossier === d.id).length;
              return <span key={key} title={label} aria-label={`${label}: ${count}`}><Icon size={14}/> {count}</span>;
            })}
          </div>
          {open(d)}
        </footer>
      </article>)}</div>}
    <div className="case-bottom"><span role="status">{rows.length} من {totals.all} ملفات</span><button onClick={onExport}>تصدير CSV</button></div>
  </section>;
}
