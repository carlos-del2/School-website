/* ---------- Router with role-based access control ---------- */
const routes = {home:{v:home}, login:{v:login}, apply:{v:apply, after:loadDraft}, dash:{r:1, v:dash}, results:{r:['student','parent'], v:results}, timetable:{r:1, v:timetable}, scores:{r:['teacher'], v:scores}, admin:{r:['admin'], v:admin}};
function draw(skel) {
  const u = user(), rt = routes[cur];
  const show = () => { app.innerHTML = '<div class="page">' + rt.v(u) + '</div>'; if (rt.after) rt.after(); counters(); menu(); };
  if (skel) { app.innerHTML = '<div class="page"><div class="sk"></div><div class="sk"></div><div class="sk"></div></div>'; setTimeout(show, 350); } else show();
}
function go() {
  cur = location.hash.slice(2) || 'home'; if (!routes[cur]) cur = 'home';
  const rt = routes[cur], u = user();
  if (rt.r && !u) { toast('Please log in first', 'err'); location.hash = '#/login'; return; }
  if (Array.isArray(rt.r) && !rt.r.includes(u.role)) { toast('Access denied for your role', 'err'); location.hash = '#/dash'; return; }
  draw(true); scrollTo(0, 0);
}
function menu() {
  const u = user(), r = u ? u.role : '';
  const L = u ? [['dash','Dashboard'], ...(['student','parent'].includes(r) ? [['results','Results']] : []), ['timetable','Timetable'], ...(r === 'teacher' ? [['scores','Scores']] : []), ...(r === 'admin' ? [['admin','Admin']] : [])] : [['home','Home'],['apply','Admission'],['login','Login']];
  $('#menu').innerHTML = L.map(([h, t]) => `<a href="#/${h}" class="${cur === h ? 'on' : ''}">${t}</a>`).join('') + (u ? '<button class="btn alt sm" data-act="logout">Log out</button>' : '');
}
function counters() {
  document.querySelectorAll('[data-count]').forEach(e => { const n = +e.dataset.count, t0 = performance.now();
    (function f(t) { const p = Math.min((t - t0) / 900, 1); e.textContent = Math.round(n * p); if (p < 1) requestAnimationFrame(f); })(t0); });
}

/* ---------- Draft save/load for the admission form ---------- */
function loadDraft() {
  const d = JSON.parse(localStorage.getItem('sms-draft') || '{}'); const f = $('#af');
  Object.entries(d).forEach(([k, v]) => { if (f[k] && f[k].type !== 'file') f[k].value = v; });
}

/* ---------- Click actions ---------- */
const A = {
  burger: () => $('#menu').classList.toggle('open'),
  logout: () => { sessionStorage.removeItem('sms-me'); localStorage.removeItem('sms-me'); toast('You have been logged out'); location.hash = '#/home'; menu(); },
  pw: (_, el) => { const p = $('[name=pass]'); p.type = el.checked ? 'text' : 'password'; },
  fill: m => { $('[name=login]').value = m; $('[name=pass]').value = 'demo123'; },
  forgot: () => toast('Demo only: password reset needs a real backend (e.g. Supabase Auth)'),
  print: () => window.print(),
  rm: (_, b) => { const d = b.closest('.doc'); $('input', d).value = ''; $('.bar i', d).style.width = 0; $('.m', d).textContent = ''; $('.pv', d).innerHTML = ''; },
  draft: () => { const d = {}; new FormData($('#af')).forEach((v, k) => { if (typeof v === 'string') d[k] = v; }); localStorage.setItem('sms-draft', JSON.stringify(d)); toast('Progress saved in this browser (files are not saved)'); },
  st: a => { const [r, s] = a.split('|'); db.apps.find(x => x.ref === r).status = s; save(); draw(); toast('Application ' + r + ': ' + s); },
  pub: id => { db.published[id] = !db.published[id]; save(); draw(); toast(db.published[id] ? 'Results published' : 'Results unpublished'); },
  kid: a => { const [k, r] = a.split('|'); rs.child = k; rs.tt = db.users.find(x => x.id === k).cls; location.hash = '#/' + r; },
};
const CH = { child: v => { rs.child = v; draw(); }, ses: v => { rs.ses = v; draw(); }, term: v => { rs.term = v; draw(); }, tt: v => { rs.tt = v; draw(); } };

/* ---------- Form submits ---------- */
const F = {
  login: f => {
    const l = f.login.value.trim(), p = f.pass.value;
    if (!l || !p) return toast('Enter your email/phone and password', 'err');
    const b = $('[type=submit]', f); b.classList.add('load');
    setTimeout(() => { b.classList.remove('load');
      const u = db.users.find(x => (x.login === l || x.phone === l) && x.pass === p);
      if (!u) return toast('Incorrect login details', 'err');
      (f.rem.checked ? localStorage : sessionStorage).setItem('sms-me', u.id);
      toast('Welcome, ' + u.name); location.hash = '#/dash'; }, 800);
  },
  contact: f => { location.href = `mailto:${MAIL}?subject=${encodeURIComponent('School enquiry from ' + f.n.value)}&body=${encodeURIComponent(f.m.value)}`; toast('Opening your email app...'); },
  apply: f => {
    if (new Date(f.dob.value) > new Date()) return toast('Date of birth cannot be in the future', 'err');
    const ref = 'APP-' + Date.now().toString(36).toUpperCase().slice(-6);
    db.apps.unshift({ref, name: [f.first.value, f.sur.value].join(' '), cls: f.cls.value, status: 'Submitted'}); save(); localStorage.removeItem('sms-draft');
    app.innerHTML = `<div class="page"><div class="card" style="text-align:center"><h1 class="g">Application submitted</h1><p>Your reference number</p><h2>${ref}</h2><p>Status: Submitted. Use "Track an application" on the admission page to check it.</p><div class="row" style="justify-content:center"><a class="btn" href="#/home">Back home</a></div></div></div>`;
  },
  track: f => {
    const a = db.apps.find(x => x.ref === f.ref.value.trim().toUpperCase());
    $('#trk').innerHTML = a ? `${esc(a.name)}: <span class="badge ${a.status.split(' ')[0]}">${a.status}</span>` : 'No application found with that reference.';
  },
  news: f => { const u = user(); db.news.unshift({t: f.t.value, d: f.d.value, cls: u.role === 'teacher' ? u.cls : 'All', by: u.name}); save(); f.reset(); toast('Announcement published'); },
  score: f => {
    const u = user(); let bad = false;
    new FormData(f).forEach((v, k) => { const [id, j, i] = k.split('|'); const n = +v, max = i === '0' ? 30 : 70;
      if (!u.subj.includes(j) || isNaN(n) || n < 0 || n > max) { bad = true; return; }
      db.scores[id] = db.scores[id] || {}; db.scores[id][j] = db.scores[id][j] || [0, 0];
      if (db.scores[id][j][+i] !== n) { db.scores[id][j][+i] = n; db.published[id] = false; } });
    if (bad) return toast('Scores must be within range (test 0-30, exam 0-70)', 'err');
    save(); toast('Scores saved. Admin must publish them.');
  }
};

/* ---------- Global listeners ---------- */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (a && a.type !== 'checkbox') { if (a.tagName === 'A') e.preventDefault(); A[a.dataset.act](a.dataset.arg, a); }
  if (e.target.closest('#menu a')) $('#menu').classList.remove('open');
});
document.addEventListener('submit', e => { const n = e.target.dataset.form; if (n) { e.preventDefault(); F[n](e.target); } });
document.addEventListener('change', e => {
  const i = e.target;
  if (i.dataset.act === 'pw') return A.pw(null, i);
  if (i.dataset.chg) return CH[i.dataset.chg](i.value);
  if (!i.matches('.doc input')) return;
  /* File check: type, size, real read progress, image preview */
  const box = i.closest('.doc'), msg = $('.m', box), bar = $('.bar i', box), f = i.files[0];
  bar.style.width = 0; $('.pv', box).innerHTML = ''; if (!f) return;
  const bad = t => { msg.textContent = t; i.value = ''; toast(t, 'err'); };
  if (!/^(application\/pdf|image\/(jpeg|png))$/.test(f.type)) return bad('Only PDF, JPG or PNG files are allowed');
  if (f.size > 2 * 1048576) return bad('File is too large (max 2 MB)');
  const r = new FileReader();
  r.onprogress = ev => bar.style.width = (ev.loaded / ev.total * 100) + '%';
  r.onload = () => { bar.style.width = '100%'; msg.textContent = '\u2713 ' + f.name + ' (' + Math.round(f.size / 1024) + ' KB), checked in browser';
    if (f.type !== 'application/pdf') $('.pv', box).innerHTML = `<img src="${r.result}" alt="Preview">`; };
  r.readAsDataURL(f);
});
addEventListener('hashchange', go);
go();


