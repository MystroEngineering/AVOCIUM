export const languages = [['ar', 'العربية'], ['fr', 'Français'], ['en', 'English']];
export const types = ['اتفاق أتعاب', 'عقد', 'مراسلة'];
export const pricing = ['بالساعة', 'مبلغ ثابت', 'نسبة نجاح'];
export const knownVariables = ['client.name', 'client.email', 'case.reference', 'court.name', 'attorney.name', 'date', 'hourly_rate', 'scope'];
const variablePattern = /\{\{\s*([\w.]+)\s*\}\}/g;
export const variables = text => [...new Set(Array.from(text.matchAll(variablePattern), match => match[1]))];
export const fillTemplate = (text, values) => text.replace(variablePattern, (token, key) => Object.hasOwn(values, key) && values[key] ? values[key] : token);

export const templateSeeds = [
  { id: 'tpl-fees', nom: 'اتفاق أتعاب بالساعة', type: types[0], pricing: pricing[0], content: {
    ar: 'مشروع اتفاق أتعاب\nالتاريخ: {{date}}\nالموكل: {{client.name}}\nالملف: {{case.reference}}\nالأتعاب بالساعة: {{hourly_rate}} د.م.\nنطاق العمل: {{scope}}',
    fr: 'Projet de convention d’honoraires\nDate : {{date}}\nClient : {{client.name}}\nDossier : {{case.reference}}\nTaux horaire : {{hourly_rate}} MAD\nPérimètre : {{scope}}',
    en: 'Draft fee agreement\nDate: {{date}}\nClient: {{client.name}}\nCase: {{case.reference}}\nHourly rate: {{hourly_rate}} MAD\nScope: {{scope}}',
  } },
  { id: 'tpl-contract', nom: 'مشروع عقد خدمات', type: types[1], pricing: '', content: {
    ar: 'مشروع عقد خدمات\nبتاريخ {{date}}\nالطرف الأول: {{client.name}}\nموضوع العقد: {{scope}}',
  } },
  { id: 'tpl-letter', nom: 'مراسلة لتحديث ملف', type: types[2], pricing: '', content: {
    ar: 'إلى {{client.name}}\nالموضوع: متابعة الملف {{case.reference}}\nالمحكمة: {{court.name}}\n{{scope}}\nالمحامي: {{attorney.name}}',
  } },
];

export function exportText(name, contents) {
  const url = URL.createObjectURL(new Blob([contents], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name.replace(/[<>:"/\\|?*]/g, '-') + '.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
