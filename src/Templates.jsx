import { useEffect, useState } from 'react';
import { Download, Eye, Pencil, Plus, Send, Trash2, X } from 'lucide-react';
import { dateToday } from './office.js';
import { exportText, fillTemplate, knownVariables, languages, pricing, types, variables } from './templates.js';
import './templates.css';

export default function Templates({ rows, cases, clients, onChange }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [rate, setRate] = useState('');
  const [dialog, setDialog] = useState(null);
  const [lang, setLang] = useState('ar');
  const [caseId, setCaseId] = useState('');
  const [overrides, setOverrides] = useState({});
  const [error, setError] = useState('');
  useEffect(() => {
    if (!dialog) return;
    const close = event => { if (event.key === 'Escape') setDialog(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [dialog]);

  const term = query.trim().toLowerCase();
  const shown = rows.filter(row => (!category || row.type === category) && (!rate || row.pricing === rate)
    && [row.nom, ...Object.values(row.content)].some(value => value.toLowerCase().includes(term)));

  function open(mode, row = { nom: '', type: types[0], pricing: pricing[0], content: {} }) {
    setDialog({ mode, row });
    setLang(languages.find(([key]) => row.content[key])?.[0] || 'ar');
    setCaseId('');
    setOverrides({});
    setError('');
  }

  const record = dialog?.row;
  const editing = dialog?.mode === 'edit';
  const sharing = dialog?.mode === 'share';
  const text = record?.content[lang] || '';
  const tokens = variables(text);
  const dossier = cases.find(item => item.id === caseId);
  const client = clients.find(item => item.nom === dossier?.client);
  const defaults = {
    'client.name': dossier?.client, 'client.email': client?.email, 'case.reference': dossier?.reference || dossier?.id,
    'court.name': dossier?.tribunal, 'attorney.name': dossier?.responsable, date: dateToday(),
  };
  const values = { ...defaults, ...overrides };
  const rendered = fillTemplate(text, values);
  const complete = Boolean(text.trim() && tokens.every(key => typeof values[key] === 'string' && values[key].trim()));

  function update(key, value) { setDialog(current => ({ ...current, row: { ...current.row, [key]: value } })); }

  function save(event) {
    event.preventDefault();
    if (!record.nom.trim() || !Object.values(record.content).some(value => value.trim())) {
      setError('أدخل اسم القالب ومحتواه بلغة واحدة على الأقل.');
      return;
    }
    const next = { ...record, nom: record.nom.trim(), pricing: record.type === types[0] ? record.pricing || pricing[0] : '', id: record.id || crypto.randomUUID() };
    onChange(previous => record.id ? previous.map(row => row.id === record.id ? next : row) : [next, ...previous]);
    setDialog(null);
  }

  return <section className="content template-workspace">
    <div className="page-heading"><div><h1>قوالب المستندات</h1><p>قوالب العقود والأتعاب والمراسلات القانونية</p></div>
      <button className="primary" onClick={() => open('edit')}><Plus size={17}/> قالب جديد</button></div>
    <div className="template-tabs" role="group" aria-label="نوع القالب">
      {['', ...types].map(type => <button className="outline" key={type} aria-pressed={category === type} onClick={() => setCategory(type)}>
        {type || 'الكل'} ({type ? rows.filter(row => row.type === type).length : rows.length})
      </button>)}
    </div>
    <div className="list-tools template-filters">
      <label className="search"><input type="search" aria-label="البحث في القوالب" placeholder="ابحث بالاسم أو المحتوى…" value={query} onChange={event => setQuery(event.target.value)}/></label>
      <select aria-label="نموذج الأتعاب" value={rate} onChange={event => setRate(event.target.value)}><option value="">كل نماذج الأتعاب</option>{pricing.map(value => <option key={value}>{value}</option>)}</select>
    </div>
    {shown.map(row => {
      const [primaryLang, sample] = Object.entries(row.content).find(([, value]) => value.trim()) || ['ar', ''];
      return <article className="panel template-card" key={row.id}>
        <div className="template-header"><div><h2 dir="auto">{row.nom}</h2><p>{row.type}{row.pricing && ' · ' + row.pricing}</p></div>
          <div className="office-tools">
            <button className="outline" onClick={() => open('preview', row)}><Eye size={15}/> عرض</button>
            <button className="outline" onClick={() => open('share', row)}><Send size={15}/> إرسال</button>
            <button className="outline" onClick={() => exportText(row.nom, sample)}><Download size={15}/> تصدير</button>
            <button className="outline" aria-label="تعديل القالب" onClick={() => open('edit', row)}><Pencil size={15}/></button>
            <button className="outline" aria-label="حذف القالب" onClick={() => {
              if (window.confirm('هل تريد حذف هذا القالب؟')) onChange(previous => previous.filter(item => item.id !== row.id));
            }}><Trash2 size={15}/></button>
          </div></div>
        <pre lang={primaryLang} dir={primaryLang === 'ar' ? 'rtl' : 'ltr'}>{sample}</pre>
        <small>المتغيرات ({variables(sample).length}) <bdi>{variables(sample).join(' · ') || '—'}</bdi></small>
      </article>;
    })}
    {!shown.length && <p className="empty">لا توجد قوالب مطابقة.</p>}
    {dialog && <div className="modal-backdrop"><article className={`modal case-form ${editing ? '' : 'office-preview'}`} role="dialog" aria-modal="true" aria-labelledby="template-title">
      <div className="modal-head"><h2 id="template-title">{editing ? record.id ? 'تعديل القالب' : 'إنشاء قالب' : record.nom}</h2>
        <button className="icon-button" aria-label="إغلاق" onClick={() => setDialog(null)}><X size={18}/></button></div>
      {editing && <div className="form-grid">
        <label className="wide">اسم القالب<input value={record.nom} onChange={event => update('nom', event.target.value)}/></label>
        <label>النوع<select value={record.type} onChange={event => update('type', event.target.value)}>{types.map(value => <option key={value}>{value}</option>)}</select></label>
        {record.type === types[0] && <label>نموذج الأتعاب<select value={record.pricing || pricing[0]} onChange={event => update('pricing', event.target.value)}>{pricing.map(value => <option key={value}>{value}</option>)}</select></label>}
      </div>}
      <div className="office-tools template-tabs" role="group" aria-label="لغة المستند">
        {languages.map(([key, label]) => <button className="outline" key={key} lang={key} aria-pressed={lang === key} onClick={() => setLang(key)}>{label}</button>)}
      </div>
      {editing ? <>
        <label>محتوى القالب<textarea className="template-body" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} value={text} onChange={event => update('content', { ...record.content, [lang]: event.target.value })}/></label>
        <div className="office-tools" aria-label="المتغيرات المتاحة">{knownVariables.map(key => <button className="outline" key={key}
          onClick={() => update('content', { ...record.content, [lang]: text + '{{' + key + '}}' })}><bdi>{'{{' + key + '}}'}</bdi></button>)}</div>
        {error && <p role="alert">{error}</p>}
        <div className="modal-actions"><button className="primary" onClick={save}>حفظ القالب</button></div>
      </> : <>
        <div className="form-grid"><label className="wide">الملف<select value={caseId} onChange={event => { setCaseId(event.target.value); setOverrides({}); }}>
          <option value="">تعبئة يدوية</option>{cases.map(row => <option key={row.id} value={row.id}>{row.id} — {row.objet}</option>)}</select></label>
          {tokens.map(key => <label key={key}><bdi>{key}</bdi><input dir="auto" value={Object.hasOwn(values, key) ? values[key] || '' : ''} onChange={event => setOverrides(previous => ({ ...previous, [key]: event.target.value }))}/></label>)}
        </div>
        <pre lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>{rendered || 'لا يوجد محتوى بهذه اللغة.'}</pre>
        <div className="office-actions">
          <button className="outline" disabled={!text} onClick={() => exportText(record.nom, rendered)}>تنزيل النص</button>
          <button className="outline" disabled={!text} onClick={() => window.print()}>طباعة / PDF</button>
          {sharing && <button className="primary" disabled={!complete} onClick={() => {
            window.location.href = 'mailto:' + encodeURIComponent(client?.email || '') + '?subject=' + encodeURIComponent(record.nom) + '&body=' + encodeURIComponent(rendered);
          }}>فتح مسودة البريد</button>}
        </div>
      </>}
    </article></div>}
  </section>;
}
