import Dossiers, { labels as caseLabels } from './Dossiers.jsx';
import { useEffect, useState } from 'react';
import Analytics from './Analytics.jsx';
import { downloadCsv, money } from './locale.js';
import { Scale, LayoutDashboard, FolderOpen, Users, CalendarDays, Files, Receipt, Settings, Search, Plus, Menu, X, Trash2, Pencil, Save, Download } from 'lucide-react';

const initial={
  clients:[{id:'CLI-001',nom:'شركة الأطلس',type:'Personne morale',telephone:'0522 45 67 89',email:'contact@atlas.example',ville:'الدار البيضاء',dateCreation:'2026-09-01'},{id:'CLI-002',nom:'أحمد المنصوري',type:'Personne physique',telephone:'0612 34 56 78',email:'ahmed@example.com',ville:'مكناس',dateCreation:'2026-08-01'},{id:'CLI-003',nom:'فاطمة بنعلي',type:'Personne physique',telephone:'0661 22 33 44',email:'fatima@example.com',ville:'الرباط',dateCreation:'2026-10-01'},{id:'CLI-004',nom:'شركة الأمل',type:'Personne morale',telephone:'0537 88 55 22',email:'admin@alamal.example',ville:'فاس',dateCreation:'2026-05-20'}],
  dossiers:[{id:'DOS-2026-001',objet:'نزاع تجاري – تحصيل مستحقات',client:'شركة الأطلس',type:'Commercial',tribunal:'المحكمة التجارية بالدار البيضاء',responsable:'الأستاذ كريم العلوي',statut:'En cours',ouverture:'2026-09-12',prochaine:'2026-11-24',reference:'2026/8201/1542'},{id:'DOS-2026-002',objet:'نزاع عقاري',client:'أحمد المنصوري',type:'Civil',tribunal:'المحكمة الابتدائية بمكناس',responsable:'الأستاذة سلمى الإدريسي',statut:'Audience prévue',ouverture:'2026-08-06',prochaine:'2026-11-26',reference:'2026/1101/329'},{id:'DOS-2026-003',objet:'طلاق ونفقة',client:'فاطمة بنعلي',type:'Famille',tribunal:'محكمة الأسرة بالرباط',responsable:'الأستاذ كريم العلوي',statut:'En cours',ouverture:'2026-10-01',prochaine:'2026-12-02',reference:'2026/1502/581'},{id:'DOS-2026-004',objet:'إنهاء عقد العمل',client:'شركة الأمل',type:'Social',tribunal:'المحكمة الابتدائية بفاس',responsable:'الأستاذة سلمى الإدريسي',statut:'Clôturé',ouverture:'2026-05-20',prochaine:'',reference:'2026/1301/218'}],
  audiences:[{id:'AUD-001',date:'2026-11-24',heure:'09:30',dossier:'DOS-2026-001',objet:'جلسة إعداد القضية',tribunal:'المحكمة التجارية بالدار البيضاء',statut:'Programmée'},{id:'AUD-002',date:'2026-11-26',heure:'11:00',dossier:'DOS-2026-002',objet:'جلسة المرافعة',tribunal:'المحكمة الابتدائية بمكناس',statut:'Programmée'},{id:'AUD-003',date:'2026-12-02',heure:'10:00',dossier:'DOS-2026-003',objet:'جلسة الصلح',tribunal:'محكمة الأسرة بالرباط',statut:'Programmée'}],
  documents:[{id:'DOC-001',nom:'دعوى أداء.pdf',dossier:'DOS-2026-001',categorie:'Acte juridique',date:'2026-10-10'},{id:'DOC-002',nom:'عقد بيع.pdf',dossier:'DOS-2026-002',categorie:'Pièce justificative',date:'2026-09-18'},{id:'DOC-003',nom:'مذكرة الدفاع.pdf',dossier:'DOS-2026-003',categorie:'Conclusions',date:'2026-11-06'}],
  factures:[{id:'FAC-2026-001',client:'شركة الأطلس',dossier:'DOS-2026-001',montant:8500,paye:5000,date:'2026-10-15',echeance:'2026-11-01'},{id:'FAC-2026-002',client:'أحمد المنصوري',dossier:'DOS-2026-002',montant:6000,paye:6000,date:'2026-10-22'},{id:'FAC-2026-003',client:'فاطمة بنعلي',dossier:'DOS-2026-003',montant:4500,paye:1000,date:'2026-11-05',echeance:'2026-12-05'}]
};
const nav=[['dashboard','Tableau de bord',LayoutDashboard],['dossiers','Dossiers judiciaires',FolderOpen],['clients','Clients & mandants',Users],['audiences','Audiences',CalendarDays],['documents','Documents',Files],['factures','Honoraires & factures',Receipt],['settings','Paramètres',Settings]];
const fields={dossiers:[['objet','Intitulé du dossier'],['description','Description','textarea'],['client','Client','client'],['type','Type de dossier','select',['Civil','Pénal','Commercial','Social','Famille','Administratif','Autre']],['tribunal','Juridiction'],['responsable','Avocat responsable'],['reference','Référence tribunal'],['statut','Statut','select',['En cours','Audience prévue','En attente','Clôturé','Archivé']],['ouverture','Date d’ouverture','date'],['prochaine','Prochaine audience','date']],clients:[['nom','Nom / raison sociale'],['type','Type','select',['Personne physique','Personne morale']],['telephone','Téléphone'],['email','Adresse e-mail','email'],['ville','Ville']],audiences:[['dossier','Dossier','dossier'],['date','Date','date'],['heure','Heure','time'],['objet','Objet de l’audience'],['tribunal','Juridiction'],['statut','Statut','select',['Programmée','Reportée','Tenue','Annulée']]],documents:[['nom','Nom du document'],['dossier','Dossier','dossier'],['categorie','Catégorie','select',['Acte juridique','Pièce justificative','Conclusions','Correspondance','Autre']],['date','Date','date']],factures:[['client','Client','client'],['dossier','Dossier','dossier'],['montant','Montant (MAD)','number'],['paye','Montant réglé (MAD)','number'],['date','Date de facturation','date'],['echeance','Date d’échéance','date']]};
const columns={dossiers:[['id','Référence'],['objet','Objet'],['client','Client'],['type','Nature'],['statut','Statut'],['prochaine','Prochaine audience']],clients:[['id','Référence'],['nom','Client'],['type','Type'],['telephone','Téléphone'],['ville','Ville']],audiences:[['date','Date'],['heure','Heure'],['dossier','Dossier'],['objet','Objet'],['statut','Statut']],documents:[['nom','Document'],['dossier','Dossier'],['categorie','Catégorie'],['date','Date']],factures:[['id','Facture'],['client','Client'],['montant','Montant'],['paye','Réglé'],['reste','Solde']]};
const titles = { dashboard: 'لوحة التحليلات', dossiers: 'الملفات القضائية', clients: 'الموكلون', audiences: 'الجلسات', documents: 'الوثائق', factures: 'الأتعاب والفواتير', settings: 'الإعدادات' };
const fieldLabels = {
  id: 'المرجع', objet: 'الموضوع', description: 'وصف الملف', client: 'الموكل', type: 'النوع',
  tribunal: 'المحكمة', responsable: 'المحامي المسؤول', reference: 'مرجع المحكمة', statut: 'الحالة',
  ouverture: 'تاريخ فتح الملف', prochaine: 'الجلسة المقبلة', nom: 'الاسم', telephone: 'الهاتف',
  email: 'البريد الإلكتروني', ville: 'المدينة', dossier: 'الملف', date: 'التاريخ', heure: 'الساعة',
  categorie: 'الفئة', montant: 'المبلغ (د.م.)', paye: 'المبلغ المسدد (د.م.)', reste: 'المبلغ المتبقي', echeance: 'تاريخ الاستحقاق',
};
const optionLabels = {
  ...caseLabels, 'Personne physique': 'شخص ذاتي', 'Personne morale': 'شخص اعتباري',
  'Programmée': 'مبرمجة', 'Reportée': 'مؤجلة', Tenue: 'منعقدة', 'Annulée': 'ملغاة',
  'Acte juridique': 'محرر قانوني', 'Pièce justificative': 'وثيقة إثبات', Conclusions: 'مذكرة', Correspondance: 'مراسلة',
};
const translate = value => optionLabels[value] || value;
const dateToday = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Africa/Casablanca' }).format(new Date());
const remaining = row => Number(row.montant || 0) - Number(row.paye || 0);
const dateKeys = ['date', 'prochaine', 'echeance', 'ouverture'];
const storage = 'avocium-demo-v1';
const optional = new Set(['description', 'ouverture', 'prochaine', 'reference', 'responsable', 'telephone', 'email', 'ville', 'heure', 'tribunal', 'categorie', 'paye', 'echeance']);
const addLabels = { clients: 'موكل جديد', audiences: 'جلسة جديدة', documents: 'وثيقة جديدة', factures: 'فاتورة جديدة' };
const starts = { dossiers: 'DOS', clients: 'CLI', audiences: 'AUD', documents: 'DOC', factures: 'FAC' };

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storage) ?? localStorage.getItem('lexcabinet-demo-v1'));
    if (saved && Object.keys(initial).every(key => Array.isArray(saved[key]))) return saved;
  } catch {}
  return initial;
}

function display(row, key) {
  const value = row[key];
  if (key === 'reste') return money(remaining(row));
  if (key === 'montant' || key === 'paye') return money(value);
  if (dateKeys.includes(key)) return value ? value.split('-').reverse().join('/') : '—';
  return (['statut', 'type', 'categorie'].includes(key) ? translate(value) : value) || '—';
}

export default function App() {
  const [data, setData] = useState(load);
  const [page, setPage] = useState(() => {
    const path = window.location.pathname.slice(1);
    return Object.hasOwn(titles, path) ? path : 'dashboard';
  });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [mobile, setMobile] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    try { localStorage.setItem(storage, JSON.stringify(data)); }
    catch { setToast('تعذر حفظ البيانات في المتصفح.'); }
  }, [data]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3800);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!modal) return;
    const close = event => { if (event.key === 'Escape') setModal(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [modal]);

  function navigate(next, selectedFilter = '') {
    setPage(next);
    setQuery('');
    setFilter(selectedFilter);
    setMobile(false);
  }

  function start(section, row) {
    const today = dateToday();
    setModal(section);
    setForm(row ? { ...row } : { date: today, dateCreation: today, ouverture: today, paye: 0,
      statut: section === 'dossiers' ? 'En cours' : section === 'audiences' ? 'Programmée' : undefined });
  }

  function save(event) {
    event.preventDefault();
    if (fields[modal].some(([key]) => !optional.has(key) && !String(form[key] ?? '').trim())) {
      setToast('يرجى ملء الحقول المطلوبة.');
      return;
    }
    if (modal === 'factures' && (Number(form.montant) <= 0 || Number(form.paye) > Number(form.montant))) {
      setToast('تحقق من مبلغ الفاتورة والمبلغ المسدد.');
      return;
    }
    const record = { ...form, id: form.id || `${starts[modal]}-${Date.now()}` };
    setData(previous => ({ ...previous, [modal]: form.id ? previous[modal].map(row => row.id === form.id ? record : row) : [record, ...previous[modal]] }));
    setModal(null);
    setToast('تم الحفظ.');
  }

  function remove(section, row) {
    if (section === 'dossiers' && ['audiences', 'documents', 'factures'].some(key => data[key].some(item => item.dossier === row.id))) {
      setToast('هذا الملف مرتبط بسجلات أخرى. يمكنك أرشفته.');
      return;
    }
    if (!window.confirm('هل تريد حذف هذا السجل نهائياً؟')) return;
    setData(previous => ({ ...previous, [section]: previous[section].filter(item => item.id !== row.id) }));
    setModal(null);
    setToast('تم الحذف.');
  }

  function exportRows(section, rows = data[section]) {
    const keys = columns[section].map(([key]) => key);
    downloadCsv('avocium-' + section, [keys.map(key => fieldLabels[key]),
      ...rows.map(row => keys.map(key => key === 'reste' ? remaining(row) : key === 'paye' || key === 'montant' ? Number(row[key] || 0) : display(row, key)))]);
  }

  const term = query.trim().toLowerCase();
  const shown = columns[page] ? data[page].filter(row => {
    const matches = Object.entries(row).some(([key, value]) => String(value ?? '').toLowerCase().includes(term)
      || String(display(row, key)).toLowerCase().includes(term));
    const selected = !filter || (filter === 'overdue' ? row.echeance && row.echeance < dateToday() && remaining(row) > 0 : row.statut === filter);
    return matches && selected;
  }) : [];

  return <div className="shell arabic-shell">
    <aside className={`sidebar ${mobile ? 'open' : ''}`} dir="rtl" aria-label="القائمة الرئيسية">
      <div className="brand"><div className="brand-icon"><Scale size={26}/></div>
        <div><strong>AVOCIUM</strong><small>إدارة المكتب القانوني</small></div>
        <button className="mobile-close" aria-label="إغلاق القائمة" onClick={() => setMobile(false)}><X size={18}/></button>
      </div>
      <nav>{nav.map(([id, , Icon]) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} aria-current={page === id ? 'page' : undefined} onClick={() => navigate(id)}>
        <Icon size={19}/><span>{id === 'dashboard' ? 'لوحة التحكم' : titles[id]}</span>
      </button>)}</nav>
      <div className="side-bottom"><div className="profile"><div className="avatar">م</div><div><b>إدارة المكتب</b><small>وضع تجريبي</small></div></div></div>
    </aside>
    <main className="main" dir="rtl">
      <header className="topbar">
        <div className="breadcrumb"><button className="hamburger" aria-label="فتح القائمة" onClick={() => setMobile(true)}><Menu size={22}/></button><strong>{titles[page]}</strong></div>
        <span className="demo-label">وضع تجريبي</span>
      </header>
      {page === 'dashboard' ? <Analytics data={data} navigate={navigate}/>
        : page === 'dossiers' ? <Dossiers data={data} selectedIds={Array.isArray(filter) ? filter : null} onCreate={() => start('dossiers')} onOpen={row => start('dossiers', row)} onExport={() => exportRows('dossiers')}/>
        : <div className="content"><div className="page-heading"><h1>{titles[page]}</h1>
          {columns[page] && <button className="primary" onClick={() => start(page)}><Plus size={18}/>{addLabels[page]}</button>}
        </div>
        {page === 'settings' ? <section className="panel settings-panel">
          <h2>إعدادات المكتب</h2>
          <div className="setting-line"><b>العملة</b><span>الدرهم المغربي</span></div>
          <div className="setting-line"><b>التخزين</b><span>محلي في المتصفح</span></div>
          <button className="danger" onClick={() => {
            if (window.confirm('هل تريد استعادة بيانات العرض التجريبي؟ ستُحذف تعديلاتك المحلية.')) {
              setData(initial);
              setToast('تمت استعادة بيانات العرض.');
            }
          }}>استعادة بيانات العرض</button>
        </section> : <section className="panel list-panel">
          <div className="list-tools">
            <label className="search"><Search size={18}/><input type="search" aria-label="بحث" value={query} onChange={event => setQuery(event.target.value)} placeholder="بحث…"/></label>
            {page === 'audiences' && <select aria-label="حالة الجلسة" value={filter} onChange={event => setFilter(event.target.value)}>
              <option value="">كل الحالات</option>{['Programmée', 'Reportée', 'Tenue', 'Annulée'].map(value => <option key={value} value={value}>{translate(value)}</option>)}
            </select>}
            {page === 'factures' && <select aria-label="حالة الفاتورة" value={filter} onChange={event => setFilter(event.target.value)}>
              <option value="">كل الفواتير</option><option value="overdue">متأخرة</option>
            </select>}
            <button className="outline" onClick={() => exportRows(page, shown)}><Download size={16}/> تصدير CSV</button>
          </div>
          <div className="table-wrap"><table><thead><tr>{columns[page].map(([key]) => <th key={key}>{fieldLabels[key]}</th>)}<th>الإجراءات</th></tr></thead>
            <tbody>{shown.map(row => <tr key={row.id}>{columns[page].map(([key]) => <td key={key}><bdi>{display(row, key)}</bdi></td>)}
              <td><div className="row-actions"><button aria-label="تعديل" onClick={() => start(page, row)}><Pencil size={16}/></button><button aria-label="حذف" onClick={() => remove(page, row)}><Trash2 size={16}/></button></div></td>
            </tr>)}{!shown.length && <tr><td className="empty" colSpan={columns[page].length + 1}>لا توجد نتائج مطابقة.</td></tr>}</tbody>
          </table></div>
          <div className="table-footer">{shown.length} نتائج</div>
        </section>}</div>}
    </main>
    {modal && <div className="modal-backdrop" dir="rtl" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null); }}>
      <div className="modal case-form" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-head"><h2 id="form-title">{form.id ? 'تعديل السجل' : modal === 'dossiers' ? 'ملف جديد' : addLabels[modal]}</h2>
          <button type="button" className="icon-button" aria-label="إغلاق" onClick={() => setModal(null)}><X size={20}/></button></div>
        <form onSubmit={save}><div className="form-grid">{fields[modal].map(([key, , type, options]) => {
          const selection = type === 'client' ? data.clients.map(row => row.nom) : type === 'dossier' ? data.dossiers.map(row => row.id) : options;
          const value = form[key] ?? '';
          const update = event => setForm(previous => ({ ...previous, [key]: event.target.value }));
          return <label key={key} className={['objet', 'description', 'tribunal'].includes(key) ? 'wide' : ''}>
            <span>{modal === 'documents' && key === 'nom' ? 'اسم الوثيقة' : fieldLabels[key]}</span>
            {selection ? <select value={value} onChange={update} required={!optional.has(key)}>
              <option value="">اختر…</option>
              {value && !selection.includes(value) && <option value={value}>{value}</option>}
              {selection.map(option => <option key={option} value={option}>{type === 'select' ? translate(option) : option}</option>)}
            </select> : type === 'textarea' ? <textarea dir="auto" value={value} onChange={update}/>
              : <input dir="auto" type={type || 'text'} value={value} onChange={update} required={!optional.has(key)} min={type === 'number' ? 0 : undefined} step={type === 'number' ? '0.01' : undefined}/>}
          </label>;
        })}</div>
        {modal === 'documents' && <p className="form-note">يحفظ هذا النموذج معلومات الوثيقة فقط.</p>}
        <div className="modal-actions">
          {modal === 'dossiers' && form.id && <button type="button" className="danger" onClick={() => remove(modal, form)}>حذف الملف</button>}
          <button type="button" className="outline" onClick={() => setModal(null)}>إلغاء</button>
          <button type="submit" className="primary"><Save size={17}/> حفظ</button>
        </div></form>
      </div>
    </div>}
    {toast && <div className="toast" dir="rtl" role="status">{toast}</div>}
  </div>;
}
