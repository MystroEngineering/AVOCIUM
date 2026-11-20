import Templates from './Templates.jsx';
import { templateSeeds } from './templates.js';
import { Board, Calendar, Finance, InvoiceLines } from './OfficeViews.jsx';
import { addDays, archiveFile, courtSeeds, courtTypes, documentTypes, downloadAttachment, hearingTypes, invoiceStates, invoiceTotals, isOverdue, memoTypes, newLine, taskStates } from './office.js';
import Dossiers, { labels as caseLabels } from './Dossiers.jsx';
import { useEffect, useState } from 'react';
import Analytics from './Analytics.jsx';
import { downloadCsv, money } from './locale.js';
import { Scale, LayoutDashboard, FolderOpen, Users, CalendarDays, Files, Receipt, Settings, Search, Plus, Eye, Send, Landmark, ClipboardList, FileText, Menu, X, Trash2, Pencil, Save, Download } from 'lucide-react';

const initial={
  courts: courtSeeds, memos: [], tasks: [], expenses: [], templates: templateSeeds,
  clients:[{id:'CLI-001',nom:'شركة الأطلس',type:'Personne morale',telephone:'0522 45 67 89',email:'contact@atlas.example',ville:'الدار البيضاء',dateCreation:'2026-09-01'},{id:'CLI-002',nom:'أحمد المنصوري',type:'Personne physique',telephone:'0612 34 56 78',email:'ahmed@example.com',ville:'مكناس',dateCreation:'2026-08-01'},{id:'CLI-003',nom:'فاطمة بنعلي',type:'Personne physique',telephone:'0661 22 33 44',email:'fatima@example.com',ville:'الرباط',dateCreation:'2026-10-01'},{id:'CLI-004',nom:'شركة الأمل',type:'Personne morale',telephone:'0537 88 55 22',email:'admin@alamal.example',ville:'فاس',dateCreation:'2026-05-20'}],
  dossiers:[{id:'DOS-2026-001',objet:'نزاع تجاري – تحصيل مستحقات',client:'شركة الأطلس',type:'Commercial',tribunal:'المحكمة التجارية بالدار البيضاء',responsable:'الأستاذ كريم العلوي',statut:'En cours',ouverture:'2026-09-12',prochaine:'2026-11-24',reference:'2026/8201/1542'},{id:'DOS-2026-002',objet:'نزاع عقاري',client:'أحمد المنصوري',type:'Civil',tribunal:'المحكمة الابتدائية بمكناس',responsable:'الأستاذة سلمى الإدريسي',statut:'Audience prévue',ouverture:'2026-08-06',prochaine:'2026-11-26',reference:'2026/1101/329'},{id:'DOS-2026-003',objet:'طلاق ونفقة',client:'فاطمة بنعلي',type:'Famille',tribunal:'محكمة الأسرة بالرباط',responsable:'الأستاذ كريم العلوي',statut:'En cours',ouverture:'2026-10-01',prochaine:'2026-12-02',reference:'2026/1502/581'},{id:'DOS-2026-004',objet:'إنهاء عقد العمل',client:'شركة الأمل',type:'Social',tribunal:'المحكمة الابتدائية بفاس',responsable:'الأستاذة سلمى الإدريسي',statut:'Clôturé',ouverture:'2026-05-20',prochaine:'',reference:'2026/1301/218'}],
  audiences:[{id:'AUD-001',date:'2026-11-24',heure:'09:30',dossier:'DOS-2026-001',objet:'جلسة إعداد القضية',tribunal:'المحكمة التجارية بالدار البيضاء',statut:'Programmée'},{id:'AUD-002',date:'2026-11-26',heure:'11:00',dossier:'DOS-2026-002',objet:'جلسة المرافعة',tribunal:'المحكمة الابتدائية بمكناس',statut:'Programmée'},{id:'AUD-003',date:'2026-12-02',heure:'10:00',dossier:'DOS-2026-003',objet:'جلسة الصلح',tribunal:'محكمة الأسرة بالرباط',statut:'Programmée'}],
  documents:[{id:'DOC-001',nom:'دعوى أداء.pdf',dossier:'DOS-2026-001',categorie:'Acte juridique',date:'2026-10-10'},{id:'DOC-002',nom:'عقد بيع.pdf',dossier:'DOS-2026-002',categorie:'Pièce justificative',date:'2026-09-18'},{id:'DOC-003',nom:'مذكرة الدفاع.pdf',dossier:'DOS-2026-003',categorie:'Conclusions',date:'2026-11-06'}],
  factures:[{id:'FAC-2026-001',client:'شركة الأطلس',dossier:'DOS-2026-001',montant:8500,paye:5000,date:'2026-10-15',echeance:'2026-11-01'},{id:'FAC-2026-002',client:'أحمد المنصوري',dossier:'DOS-2026-002',montant:6000,paye:6000,date:'2026-10-22'},{id:'FAC-2026-003',client:'فاطمة بنعلي',dossier:'DOS-2026-003',montant:4500,paye:1000,date:'2026-11-05',echeance:'2026-12-05'}]
};
const nav=[['dashboard','Tableau de bord',LayoutDashboard],['dossiers','Dossiers judiciaires',FolderOpen],['clients','Clients & mandants',Users],['audiences','Audiences',CalendarDays],['documents','Documents',Files],['factures','Honoraires & factures',Receipt],['memos','',FileText],['courts','',Landmark],['tasks','',ClipboardList],['expenses','',Receipt],['templates','',Files],['settings','Paramètres',Settings]];
const fields={dossiers:[['objet','Intitulé du dossier'],['description','Description','textarea'],['client','Client','client'],['type','Type de dossier','select',['Civil','Pénal','Commercial','Social','Famille','Administratif','Autre']],['tribunal','Juridiction'],['responsable','Avocat responsable'],['reference','Référence tribunal'],['statut','Statut','select',['En cours','Audience prévue','En attente','Clôturé','Archivé']],['ouverture','Date d’ouverture','date'],['prochaine','Prochaine audience','date']],clients:[['nom','Nom / raison sociale'],['type','Type','select',['Personne physique','Personne morale']],['telephone','Téléphone'],['email','Adresse e-mail','email'],['ville','Ville']],audiences:[['dossier','Dossier','dossier'],['date','Date','date'],['heure','Heure','time'],['objet','Objet de l’audience'],['tribunal','Juridiction'],['statut','Statut','select',['Programmée','Reportée','Tenue','Annulée']]],documents:[['nom','Nom du document'],['dossier','Dossier','dossier'],['categorie','Catégorie','select',['Acte juridique','Pièce justificative','Conclusions','Correspondance','Autre']],['date','Date','date']],factures:[['client','Client','client'],['dossier','Dossier','dossier'],['montant','Montant (MAD)','number'],['paye','Montant réglé (MAD)','number'],['date','Date de facturation','date'],['echeance','Date d’échéance','date']]};
const columns={dossiers:[['id','Référence'],['objet','Objet'],['client','Client'],['type','Nature'],['statut','Statut'],['prochaine','Prochaine audience']],clients:[['id','Référence'],['nom','Client'],['type','Type'],['telephone','Téléphone'],['ville','Ville']],audiences:[['date','Date'],['heure','Heure'],['dossier','Dossier'],['objet','Objet'],['statut','Statut']],documents:[['nom','Document'],['dossier','Dossier'],['categorie','Catégorie'],['date','Date']],factures:[['id','Facture'],['client','Client'],['montant','Montant'],['paye','Réglé'],['reste','Solde']]};
const expenseCategories = ['رسوم التسجيل', 'أتعاب الخبير', 'الطابع القضائي', 'مصاريف التنقل', 'أخرى'];
Object.assign(fields, {
  expenses: [['dossier', '', 'dossier'], ['categorie', '', 'select', expenseCategories], ['description', '', 'textarea'], ['montant', '', 'number'], ['supplier'], ['date', '', 'date']],
  courts: [['nom'], ['type', '', 'select', courtTypes], ['ville'], ['adresse'], ['telephone', '', 'tel'], ['email', '', 'email']],
  memos: [['dossier', '', 'dossier'], ['nom'], ['type', '', 'select', memoTypes], ['date', '', 'date'], ['notes', '', 'textarea']],
  tasks: [['objet'], ['dossier', '', 'dossier'], ['date', '', 'date'], ['statut', '', 'select', taskStates], ['notes', '', 'textarea']],
});
fields.clients.push(['cin', '', 'text']);
fields.audiences = [['dossier', '', 'dossier'], ['tribunal', '', 'court'], ['date', '', 'date'], ['heure', '', 'time'], ['salle'], ['responsable'], ['hearingType', '', 'select', hearingTypes], ['statut', '', 'select', ['Programmée', 'Reportée', 'Tenue', 'Annulée']], ['objet'], ['resultat'], ['notes', '', 'textarea']];
fields.documents = [['dossier', '', 'dossier'], ['nom'], ['categorie', '', 'select', documentTypes], ['date', '', 'date'], ['tags'], ['prive', '', 'checkbox']];
fields.factures = [['numero'], ['invoiceStatus', '', 'select', invoiceStates], ['dossier', '', 'dossier'], ['client', '', 'client'], ['date', '', 'date'], ['echeance', '', 'date'], ['tva', '', 'number'], ['paye', '', 'number'], ['notes', '', 'textarea']];
for (const [key, keys] of Object.entries({
  expenses: ['categorie', 'dossier', 'client', 'montant', 'date'],
  courts: ['nom', 'type', 'ville', 'adresse', 'telephone', 'email'],
  memos: ['nom', 'type', 'dossier', 'date', 'notes'],
  tasks: ['objet', 'dossier', 'date', 'statut'],
  documents: ['nom', 'fileName', 'categorie', 'prive', 'dossier', 'date'],
  audiences: ['date', 'heure', 'dossier', 'tribunal', 'hearingType', 'objet', 'statut'],
  factures: ['numero', 'client', 'montant', 'paye', 'reste', 'echeance', 'invoiceStatus'],
})) columns[key] = keys.map(field => [field]);
const titles = { dashboard: 'لوحة التحليلات', dossiers: 'الملفات القضائية', clients: 'الموكلون', audiences: 'الجلسات', documents: 'الوثائق', factures: 'الأتعاب والفواتير', settings: 'الإعدادات', courts: 'سجل المحاكم', memos: 'المذكرات', tasks: 'متابعة المكتب', expenses: 'مصاريف الملفات', templates: 'قوالب المستندات' };
const fieldLabels = {
  cin: 'رقم الهوية', supplier: 'المورد', adresse: 'العنوان', notes: 'ملاحظات', salle: 'القاعة', hearingType: 'نوع الجلسة', resultat: 'النتيجة', tags: 'وسوم', prive: 'علامة السرية', fileName: 'اسم المرفق', numero: 'رقم الفاتورة', invoiceStatus: 'حالة الفاتورة', tva: 'نسبة الضريبة (%)', id: 'المرجع', objet: 'الموضوع', description: 'وصف الملف', client: 'الموكل', type: 'النوع',
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
const optional = new Set(['cin', 'description', 'ouverture', 'prochaine', 'reference', 'responsable', 'telephone', 'email', 'ville', 'heure', 'tribunal', 'categorie', 'paye', 'echeance']);
const addLabels = { clients: 'موكل جديد', audiences: 'جلسة جديدة', documents: 'وثيقة جديدة', factures: 'فاتورة جديدة', courts: 'محكمة جديدة', memos: 'مذكرة جديدة', tasks: 'مهمة جديدة', expenses: 'مصروف جديد' };
const starts = { dossiers: 'DOS', clients: 'CLI', audiences: 'AUD', documents: 'DOC', factures: 'FAC', courts: 'TRI', memos: 'MEM', tasks: 'TSK', expenses: 'EXP' };

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storage) ?? localStorage.getItem('lexcabinet-demo-v1'));
    if (saved && ['dossiers', 'clients', 'audiences', 'documents', 'factures'].every(key => Array.isArray(saved[key]))) return { ...initial, ...saved };
  } catch {}
  return initial;
}

function display(row, key) {
  const value = row[key];
  if (key === 'prive') return value ? 'سري' : '—';
  if (key === 'numero') return value || row.id;
  if (key === 'invoiceStatus') return value || 'صادرة';
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
  const [view, setView] = useState(() => ({ tasks: 'month', memos: 'cards', factures: 'grouped' })[page] || 'table');
  const [category, setCategory] = useState('');
  const [caseFilter, setCaseFilter] = useState('');
  const [source, setSource] = useState('all');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
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
    if (!modal && !preview) return;
    const close = event => { if (event.key === 'Escape' && !busy) { setModal(null); setPreview(null); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [modal, preview, busy]);

  function navigate(next, selectedFilter = '') {
    setPage(next);
    setView(next === 'tasks' ? 'month' : next === 'memos' ? 'cards' : next === 'factures' && !selectedFilter ? 'grouped' : 'table');
    setCategory('');
    setCaseFilter('');
    setSource('all');
    setQuery('');
    setFilter(selectedFilter);
    setMobile(false);
  }

  function start(section, row) {
    const today = dateToday();
    setModal(section);
    setFile(null);
    const defaults = { date: today, dateCreation: today, ouverture: today, paye: 0 };
    if (section === 'dossiers') defaults.statut = 'En cours';
    if (section === 'audiences') Object.assign(defaults, { statut: 'Programmée', heure: '09:00', hearingType: hearingTypes[0] });
    if (section === 'documents') defaults.categorie = documentTypes[0];
    if (section === 'courts') defaults.type = courtTypes[0];
    if (section === 'memos') defaults.type = memoTypes[0];
    if (section === 'expenses') defaults.categorie = expenseCategories[0];
    if (section === 'tasks') defaults.statut = taskStates[0];
    if (section === 'factures') Object.assign(defaults, { numero: `FAC-${today.slice(0, 4)}-${Date.now()}`, invoiceStatus: invoiceStates[0], echeance: addDays(today, 30), tva: 0, lines: [newLine()] });
    setForm(row ? { ...row, ...(section === 'factures' ? { numero: row.numero || row.id, invoiceStatus: row.invoiceStatus || 'صادرة' } : {}) } : defaults);
  }

  function required(key) {
    if (modal === 'expenses') return ['dossier', 'categorie', 'montant', 'date'].includes(key);
    if (modal === 'audiences') return ['dossier', 'tribunal', 'date', 'heure', 'hearingType', 'statut'].includes(key);
    if (modal === 'documents') return ['dossier', 'nom', 'categorie', 'date'].includes(key);
    if (modal === 'courts') return ['nom', 'type', 'ville'].includes(key);
    if (modal === 'memos') return ['dossier', 'nom'].includes(key);
    if (modal === 'tasks') return ['objet', 'date', 'statut'].includes(key);
    if (modal === 'factures') return ['numero', 'invoiceStatus', 'dossier', 'client', 'date'].includes(key);
    return !optional.has(key);
  }

  async function save(event) {
    event.preventDefault();
    if (busy) return;
    if (fields[modal].some(([key]) => required(key) && !String(form[key] ?? '').trim())) {
      setToast('يرجى ملء الحقول المطلوبة.');
      return;
    }
    if (modal === 'documents' && !form.id && !file) {
      setToast('يرجى اختيار ملف لإرفاقه.');
      return;
    }
    const record = { ...form, id: form.id || `${starts[modal]}-${crypto.randomUUID()}` };
    if (modal === 'expenses') {
      const dossier = data.dossiers.find(row => row.id === record.dossier);
      record.montant = Number(record.montant);
      if (!dossier || !Number.isFinite(record.montant) || record.montant <= 0) {
        setToast('اختر ملفاً وأدخل مبلغاً أكبر من الصفر.');
        return;
      }
      delete record.client;
    }
    if (modal === 'factures') {
      record.montant = form.lines ? invoiceTotals(form.lines, form.tva).total : Number(form.montant);
      if (!Number.isFinite(record.montant) || record.montant <= 0 || Number(form.paye || 0) > record.montant || (form.echeance && form.echeance < form.date)) {
        setToast('تحقق من المبلغ وتواريخ الفاتورة.');
        return;
      }
      if (data.factures.some(row => row.id !== record.id && (row.numero || row.id) === form.numero.trim())) {
        setToast('رقم الفاتورة مستخدم بالفعل.');
        return;
      }
      record.numero = form.numero.trim();
    }
    if (file) {
      setBusy(true);
      try {
        await archiveFile(record.id, file);
        record.fileName = file.name;
      } catch {
        setToast('تعذر حفظ المرفق في المتصفح.');
        return;
      } finally { setBusy(false); }
    }
    setData(previous => ({ ...previous, [modal]: form.id ? previous[modal].map(row => row.id === form.id ? record : row) : [record, ...previous[modal]] }));
    setModal(null);
    setToast('تم الحفظ.');
  }

  async function fetchAttachment(row) {
    try {
      if (!await downloadAttachment(row.id, row.fileName)) setToast('المرفق غير متاح في هذا المتصفح.');
    } catch { setToast('تعذر تنزيل المرفق.'); }
  }

  async function remove(section, row) {
    if (section === 'dossiers' && ['audiences', 'documents', 'factures', 'memos', 'tasks', 'expenses'].some(key => data[key].some(item => item.dossier === row.id))) {
      setToast('هذا الملف مرتبط بسجلات أخرى. يمكنك أرشفته.');
      return;
    }
    if (!window.confirm('هل تريد حذف هذا السجل نهائياً؟')) return;
    if (row.fileName) {
      try { await archiveFile(row.id, null); } catch { setToast('تعذر حذف المرفق.'); return; }
    }
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
  const today = dateToday();
  const entries = page === 'tasks'
    ? [...(source !== 'hearings' ? data.tasks : []), ...(source !== 'tasks' ? data.audiences.map(row => ({ ...row, hearing: true })) : [])]
    : page === 'expenses' ? data.expenses.map(row => ({ ...row, client: data.dossiers.find(dossier => dossier.id === row.dossier)?.client || '' }))
    : data[page] || [];
  const shown = entries.filter(row => {
    const relatedCase = data.dossiers.find(item => item.id === row.dossier);
    const client = data.clients.find(item => item.nom === row.client);
    const matches = !term || Object.entries(row).some(([key, value]) => String(value ?? '').toLowerCase().includes(term)
      || String(display(row, key)).toLowerCase().includes(term))
      || [relatedCase?.objet, relatedCase?.reference, client?.telephone, client?.cin].some(value => String(value ?? '').toLowerCase().includes(term));
    const selected = !filter || (filter === 'overdue'
      ? page === 'tasks' ? !row.hearing && row.statut !== 'مكتملة' && row.date < today : isOverdue(row, today)
      : filter === 'today' ? row.date === today : row.statut === filter);
    return matches && selected && (!category || (page === 'memos' ? row.type : row.categorie) === category)
      && (!caseFilter || row.dossier === caseFilter);
  });
  const open = row => start(row.hearing ? 'audiences' : page, row);
  const controls = {
    audiences: [['table', 'قائمة'], ['month', 'شهر'], ['week', 'أسبوع'], ['board', 'كانبان']],
    expenses: [['table', 'جدول'], ['cards', 'بطاقات']],
    documents: [['table', 'جدول'], ['cards', 'بطاقات']],
    courts: [['table', 'جدول'], ['cards', 'بطاقات']],
    tasks: [['month', 'تقويم'], ['board', 'كانبان'], ['table', 'قائمة']],
    factures: [['grouped', 'بالموكل'], ['table', 'بالفاتورة']],
  };
  const actions = row => <div className="row-actions">
    {['documents', 'memos', 'factures', 'expenses'].includes(page) && <button aria-label="عرض" onClick={() => setPreview(row)}><Eye size={16}/></button>}
    {row.fileName && <button aria-label="تنزيل المرفق" onClick={() => fetchAttachment(row)}><Download size={16}/></button>}
    {page === 'expenses' && <button aria-label="مشاركة المصروف" onClick={() => {
      const email = data.clients.find(client => client.nom === row.client)?.email || '';
      const body = [row.dossier, row.categorie, money(row.montant), row.date, row.description].filter(Boolean).join('\n');
      window.location.href = 'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent('مصروف الملف ' + row.dossier) + '&body=' + encodeURIComponent(body);
    }}><Send size={16}/></button>}
    <button aria-label="تعديل" onClick={() => open(row)}><Pencil size={16}/></button>
    <button aria-label="حذف" onClick={() => remove(row.hearing ? 'audiences' : page, row)}><Trash2 size={16}/></button>
  </div>;

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
        : page === 'templates' ? <Templates rows={data.templates} cases={data.dossiers} clients={data.clients}
          onChange={update => setData(previous => ({ ...previous, templates: update(previous.templates) }))}/>
        : page === 'dossiers' ? <Dossiers data={data} selectedIds={Array.isArray(filter) ? filter : null} onCreate={() => start('dossiers')} onOpen={row => start('dossiers', row)} onExport={() => exportRows('dossiers')}/>
        : <div className="content"><div className="page-heading"><h1>{titles[page]}</h1>
          {columns[page] && <button className="primary" onClick={() => start(page)}><Plus size={18}/>{addLabels[page]}</button>}
        </div>
        {page === 'expenses' && <div className="office-metrics">
          <article><span>إجمالي المصاريف</span><strong>{money(shown.reduce((total, row) => total + Math.round(Number(row.montant) * 100), 0) / 100)}</strong></article>
          <article><span>عدد المصاريف</span><strong>{shown.length}</strong></article>
        </div>}
        {page === 'factures' && <Finance invoices={data.factures} cases={data.dossiers}/>}
        {page === 'tasks' && <div className="office-metrics">
          <article><span>نشطة</span><strong>{data.tasks.filter(row => row.statut !== 'مكتملة').length}</strong></article>
          <article><span>متأخرة</span><strong>{data.tasks.filter(row => row.statut !== 'مكتملة' && row.date < today).length}</strong></article>
          <article><span>اليوم</span><strong>{data.tasks.filter(row => row.date === today).length}</strong></article>
          <article><span>جلسات مبرمجة</span><strong>{data.audiences.filter(row => row.statut === 'Programmée' && row.date >= today).length}</strong></article>
        </div>}
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
            <label className="search"><Search size={18}/><input type="search" aria-label="بحث" value={query} onChange={event => setQuery(event.target.value)} placeholder={page === "expenses" ? "رقم الملف، اسم الموكل، رقم الهوية أو الهاتف…" : "بحث…"}/></label>
            {page === 'audiences' && <select aria-label="حالة الجلسة" value={filter} onChange={event => setFilter(event.target.value)}>
              <option value="">كل الحالات</option>{['Programmée', 'Reportée', 'Tenue', 'Annulée'].map(value => <option key={value} value={value}>{translate(value)}</option>)}
            </select>}
            {page === 'factures' && <select aria-label="حالة الفاتورة" value={filter} onChange={event => setFilter(event.target.value)}>
              <option value="">كل الفواتير</option><option value="overdue">متأخرة</option>
            </select>}
            {['documents', 'memos', 'expenses'].includes(page) && <select aria-label="النوع" value={category} onChange={event => setCategory(event.target.value)}>
              <option value="">كل الأنواع</option>{[...new Set([...(page === 'documents' ? documentTypes : page === 'expenses' ? expenseCategories : memoTypes), ...data[page].map(row => page === 'memos' ? row.type : row.categorie).filter(Boolean)])].map(type => <option key={type} value={type}>{translate(type)}</option>)}
            </select>}
            {page === 'tasks' && <>
              <select aria-label="نوع السجل" value={source} onChange={event => { setSource(event.target.value); setFilter(''); }}><option value="all">الكل</option><option value="tasks">المهام</option><option value="hearings">الجلسات</option></select>
              <select aria-label="الملف" value={caseFilter} onChange={event => setCaseFilter(event.target.value)}><option value="">جميع الملفات</option>{data.dossiers.map(row => <option key={row.id} value={row.id}>{row.objet}</option>)}</select>
              <select aria-label="الحالة" value={filter} onChange={event => setFilter(event.target.value)}><option value="">كل الحالات</option><option value="today">اليوم</option><option value="overdue">متأخرة</option>{[...taskStates, 'Programmée', 'Tenue'].map(value => <option key={value} value={value}>{translate(value)}</option>)}</select>
            </>}
            {page === 'audiences' && <button className="outline" onClick={() => {
              const first = addDays(today, -new Date(today + 'T00:00:00Z').getUTCDay());
              exportRows(page, shown.filter(row => row.date >= first && row.date <= addDays(first, 6)));
            }}>قائمة الأسبوع</button>}
            <button className="outline" onClick={() => exportRows(page, shown)}><Download size={16}/> تصدير CSV</button>
          </div>
          {controls[page] && <div className="list-tools office-tools" role="group" aria-label="طريقة العرض">{controls[page].map(([key, label]) => <button className="outline" key={key} aria-pressed={view === key} onClick={() => setView(key)}>{label}</button>)}</div>}
          {view === 'grouped' ? <Finance invoices={shown} cases={data.dossiers} grouped/>
            : view === 'month' || view === 'week' ? <Calendar entries={shown} weekly={view === 'week'} onOpen={open}/>
            : view === 'board' ? <Board entries={shown} states={[...(page === 'tasks' ? taskStates : []), 'Programmée', 'Reportée', 'Tenue', 'Annulée'].map(key => [key, translate(key)])} onOpen={open}/>
            : view === 'cards' ? <div className="office-cards">
              {shown.map(row => <article key={row.id}><h3 dir="auto">{row.nom || row.categorie}</h3>
                {columns[page].filter(([key]) => key !== 'nom' && row[key]).map(([key]) => <p key={key}><b>{fieldLabels[key]}</b> · <bdi>{display(row, key)}</bdi></p>)}{actions(row)}</article>)}
              {!shown.length && <p>لا توجد نتائج مطابقة.</p>}
            </div> : <div className="table-wrap"><table><thead><tr>{columns[page].map(([key]) => <th key={key}>{fieldLabels[key]}</th>)}<th>الإجراءات</th></tr></thead>
              <tbody>{shown.map(row => <tr key={row.id}>{columns[page].map(([key]) => <td key={key}><bdi>{display(row, key)}</bdi></td>)}
                <td>{actions(row)}</td>
              </tr>)}{!shown.length && <tr><td className="empty" colSpan={columns[page].length + 1}>لا توجد نتائج مطابقة.</td></tr>}</tbody>
            </table></div>}
          <div className="table-footer">{shown.length} نتائج</div>
        </section>}</div>}
    </main>
    {modal && <div className="modal-backdrop" dir="rtl" onMouseDown={event => { if (!busy && event.target === event.currentTarget) setModal(null); }}>
      <div className="modal case-form" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-head"><h2 id="form-title">{form.id ? 'تعديل السجل' : modal === 'dossiers' ? 'ملف جديد' : addLabels[modal]}</h2>
          <button type="button" className="icon-button" aria-label="إغلاق" disabled={busy} onClick={() => setModal(null)}><X size={20}/></button></div>
        <form onSubmit={save}><div className="form-grid">{fields[modal].map(([key, , type, options]) => {
          const selection = type === 'client' ? data.clients.map(row => row.nom) : type === 'dossier' ? data.dossiers.map(row => row.id) : type === 'court' ? [...new Set([...data.courts.map(row => row.nom), ...data.dossiers.map(row => row.tribunal)].filter(Boolean))] : options;
          const value = form[key] ?? '';
          const update = event => {
            const next = event.target.value;
            const related = key === 'dossier' && data.dossiers.find(row => row.id === next);
            setForm(previous => ({
              ...previous,
              ...(related && modal === 'factures' ? { client: related.client } : {}),
              ...(related && modal === 'audiences' ? { tribunal: related.tribunal || '', responsable: related.responsable || '' } : {}),
              [key]: next,
            }));
          };
          return <label key={key} className={['objet', 'description', 'tribunal'].includes(key) ? 'wide' : ''}>
            <span>{modal === 'documents' && key === 'nom' ? 'اسم الوثيقة' : fieldLabels[key]}</span>
            {selection ? <select value={value} onChange={update} required={required(key)}>
              <option value="">اختر…</option>
              {value && !selection.includes(value) && <option value={value}>{value}</option>}
              {selection.map(option => <option key={option} value={option}>{type === 'dossier' ? `${option} — ${data.dossiers.find(row => row.id === option)?.objet || ''}` : type === 'select' ? translate(option) : option}</option>)}
            </select> : type === 'checkbox' ? <input type="checkbox" checked={Boolean(value)} onChange={event => setForm(previous => ({ ...previous, [key]: event.target.checked }))}/>
              : type === 'textarea' ? <textarea dir="auto" value={value} onChange={update}/>
              : <input dir="auto" type={type || 'text'} value={value} onChange={update} required={required(key)} min={type === 'number' ? modal === 'expenses' ? 0.01 : 0 : undefined} max={key === 'tva' ? 100 : undefined} step={type === 'number' ? '0.01' : undefined}/>}
          </label>;
        })}</div>
        {['documents', 'memos'].includes(modal) && <div className="office-tools office-actions">
          <label className="outline">اختيار مرفق<input type="file" hidden onChange={event => {
            const selected = event.target.files[0];
            if (selected?.size > 20 * 1024 * 1024) { event.target.value = ''; setToast('الحد الأقصى للمرفق 20 ميغابايت.'); return; }
            setFile(selected || null);
          }}/></label><bdi>{file?.name || form.fileName || 'لا يوجد مرفق'}</bdi>
        </div>}
        {modal === 'documents' && <p className="form-note">يُحفظ المرفق محلياً في هذا المتصفح. علامة السرية للتصنيف.</p>}
        {modal === 'factures' && (form.lines ? <InvoiceLines lines={form.lines} rate={form.tva} onChange={lines => setForm(previous => ({ ...previous, lines }))}/>
          : <label className="office-actions">المبلغ الإجمالي (د.م.) <input type="number" required min="0.01" step="0.01" value={form.montant ?? ''} onChange={event => setForm(previous => ({ ...previous, montant: event.target.value }))}/></label>)}
        <div className="modal-actions">
          {modal === 'dossiers' && form.id && <button type="button" className="danger" onClick={() => remove(modal, form)}>حذف الملف</button>}
          <button type="button" className="outline" disabled={busy} onClick={() => setModal(null)}>إلغاء</button>
          <button type="submit" disabled={busy} className="primary"><Save size={17}/> حفظ</button>
        </div></form>
      </div>
    </div>}
    {preview && <div className="modal-backdrop" dir="rtl"><article className="modal office-preview" role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <div className="modal-head"><h2 id="preview-title">{preview.nom || preview.numero || preview.categorie || preview.id}</h2><button className="icon-button" aria-label="إغلاق" onClick={() => setPreview(null)}><X size={18}/></button></div>
      {columns[page].filter(([key]) => key !== 'nom').map(([key]) => <p key={key}><b>{fieldLabels[key]}</b> · <bdi>{display(preview, key)}</bdi></p>)}
      {page === 'expenses' && <><p><b>المورد</b> · <bdi>{preview.supplier || '—'}</bdi></p><p dir="auto">{preview.description}</p></>}
      {preview.lines?.map(line => <p key={line.id}><bdi>{line.objet}</bdi> · {line.quantity} × {money(line.price)}</p>)}
      <div className="office-actions">{preview.fileName && <button className="outline" onClick={() => fetchAttachment(preview)}>تنزيل المرفق</button>}<button className="outline" onClick={() => window.print()}>طباعة / PDF</button></div>
    </article></div>}
    {toast && <div className="toast" dir="rtl" role="status">{toast}</div>}
  </div>;
}
