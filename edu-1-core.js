/* Bright Future Academy: DEMO school portal.
   All data lives in THIS browser (localStorage). Nothing is sent to a server.
   To go live, replace load()/save() and the login check with Supabase calls. */
/* Safety net 1: some phone previews block localStorage. Use in-memory storage instead of crashing. */
['localStorage', 'sessionStorage'].forEach(n => {
  try { window[n].getItem('x'); } catch (e) {
    const m = {};
    Object.defineProperty(window, n, {configurable: true, value: {getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; }}});
  }
});
/* Safety net 2: show any script error on the page instead of a blank screen. */
addEventListener('error', e => { const a = document.getElementById('app'); if (a) a.innerHTML = '<div style="padding:20px;color:#ffc857">Script error: ' + e.message + ' (line ' + e.lineno + ')</div>'; });

const SCHOOL = 'Bright Future Academy', MAIL = 'info@yourschool.example';
const GRADES = [[70,'A','Excellent'],[60,'B','Very good'],[50,'C','Good'],[45,'D','Fair'],[40,'E','Pass'],[0,'F','Needs improvement']]; // edit grading rules here
const SUBJECTS = ['Mathematics','English','Basic Science','Civic Education'];
const CLASSES = ['JSS 1A','JSS 2A'], DAYS = ['Mon','Tue','Wed','Thu','Fri'];
const TIMES = ['08:00-08:40','08:40-09:20','09:20-10:00','10:00-10:30 Break','10:30-11:10','11:10-11:50'];
const SHOW_POSITION = true;

const $ = (s, e = document) => e.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grade = t => GRADES.find(g => t >= g[0]);

/* ---------- Demo data ---------- */
const seed = () => ({
  users: [
    {id:'s1',role:'student',name:'Amina Yusuf',login:'student@demo.school',pass:'demo123',cls:'JSS 2A',adm:'BFA/2025/014'},
    {id:'s2',role:'student',name:'Chidi Eze',login:'chidi@demo.school',pass:'demo123',cls:'JSS 2A',adm:'BFA/2025/021'},
    {id:'t1',role:'teacher',name:'Mr. Okoro',login:'teacher@demo.school',pass:'demo123',cls:'JSS 2A',subj:['Mathematics','Basic Science']},
    {id:'t2',role:'teacher',name:'Mrs. Adeyemi',login:'teacher2@demo.school',pass:'demo123',cls:'JSS 2A',subj:['English','Civic Education']},
    {id:'a1',role:'admin',name:'Mrs. Bello (Admin)',login:'admin@demo.school',pass:'demo123'},
    {id:'p1',role:'parent',name:'Mr. Yusuf',login:'parent@demo.school',pass:'demo123',kids:['s1']}],
  scores: {s1:{Mathematics:[26,55],English:[24,50],'Basic Science':[22,46],'Civic Education':[27,58]},
           s2:{Mathematics:[20,41],English:[22,45],'Basic Science':[18,40],'Civic Education':[21,44]}},
  published: {s1:true, s2:false},
  apps: [{ref:'APP-DEMO-001',name:'Sample Applicant',cls:'JSS 1A',status:'Under review'}],
  news: [{t:'Welcome to the new term',d:'Sample announcement: classes resume on Monday.',cls:'All',by:'Admin'}]
});
let db = JSON.parse(localStorage.getItem('sms-demo') || 'null') || seed();
const save = () => localStorage.setItem('sms-demo', JSON.stringify(db));
const sess = () => sessionStorage.getItem('sms-me') || localStorage.getItem('sms-me');
const user = () => db.users.find(u => u.id === sess());
const students = () => db.users.filter(u => u.role === 'student');
const teacherOf = s => (db.users.find(u => u.subj && u.subj.includes(s)) || {}).name || '';
const app = $('#app'); let cur = 'home';
const rs = {child:null, ses:'2025/2026', term:'First Term'};

function toast(m, t = 'ok') {
  const e = $('#toast'); e.textContent = m; e.className = 'toast show ' + t;
  clearTimeout(toast.t); toast.t = setTimeout(() => e.className = 'toast', 3200);
}

/* END OF FILE 1 */
