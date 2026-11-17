const statBox = (n, l) => `<div class="card stat"><b data-count="${n}">0</b>${l}</div>`;
const dash = u => {
  const q = (h, t, d) => `<a class="card hov" href="#/${h}"><h3>${t}</h3><p>${d}</p></a>`;
  let b = '';
  if (u.role === 'student') b = `<div class="grid">${statBox(1,'Class: ' + u.cls)}<div class="card"><p>Admission no.</p><h3>${u.adm}</h3></div></div><h2>Quick access</h2><div class="grid">${q('results','Results','View published results')}${q('timetable','Timetable','Your weekly classes')}</div>`;
  if (u.role === 'parent') b = `<h2>Your children</h2><div class="grid">${u.kids.map(k => { const s = db.users.find(x => x.id === k); return `<div class="card"><h3>${esc(s.name)}</h3><p>${s.cls} &bull; ${s.adm}</p><div class="row"><button class="btn sm" data-act="kid" data-arg="${k}|results">Results</button><button class="btn alt sm" data-act="kid" data-arg="${k}|timetable">Timetable</button></div></div>`; }).join('')}</div>`;
  if (u.role === 'teacher') b = `<div class="grid"><div class="card"><p>Assigned class</p><h3>${u.cls}</h3></div><div class="card"><p>Subjects</p><h3>${u.subj.join(', ')}</h3></div></div><h2>Quick access</h2><div class="grid">${q('scores','Enter scores','For your subjects only')}${q('timetable','My timetable','Your periods are highlighted')}</div>${newsForm('Post a class announcement')}`;
  if (u.role === 'admin') b = `<div class="grid">${statBox(students().length,'Students')}${statBox(db.users.filter(x => x.role === 'teacher').length,'Teachers')}${statBox(CLASSES.length,'Classes')}${statBox(db.apps.filter(a => /Submitted|review/.test(a.status)).length,'Pending applications')}${statBox(Object.values(db.published).filter(Boolean).length,'Published results')}</div><h2>Manage</h2><div class="grid">${q('admin','Admin panel','Applications, results, announcements')}${q('timetable','Timetables','View class timetables')}</div>`;
  return `<h2 style="margin-top:0">Hello, <span class="g">${esc(u.name)}</span></h2><span class="badge">${u.role}</span>${b}<h2>Announcements</h2><div class="grid">${newsList(u)}</div>`;
};
const newsForm = t => `<h2>${t}</h2><form class="card" data-form="news"><label>Title<input name="t" required></label><label>Message<textarea name="d" rows="3" required></textarea></label><button class="btn" type="submit">Publish</button></form>`;

const results = u => {
  const ids = u.role === 'parent' ? u.kids : [u.id];
  const sid = ids.includes(rs.child) ? rs.child : ids[0], s = db.users.find(x => x.id === sid);
  const pick = `<div class="two"><label>Child<select data-chg="child">${ids.map(i => `<option value="${i}" ${i === sid ? 'selected' : ''}>${esc(db.users.find(x => x.id === i).name)}</option>`).join('')}</select></label>
<label>Session<select data-chg="ses">${['2025/2026','2024/2025'].map(x => `<option ${x === rs.ses ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
<label>Term<select data-chg="term">${['First Term','Second Term','Third Term'].map(x => `<option ${x === rs.term ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div>`;
  let body;
  if (rs.ses !== '2025/2026' || rs.term !== 'First Term' || !db.published[sid]) body = `<div class="card">No published results for this selection yet.</div>`;
  else {
    const tot = id => SUBJECTS.reduce((a, j) => a + ((db.scores[id] || {})[j] || [0,0]).reduce((x, y) => x + y, 0), 0);
    const rows = SUBJECTS.map(j => { const [c,x] = (db.scores[sid] || {})[j] || [0,0], t = c + x, g = grade(t); return {j,c,x,t,g}; });
    const total = tot(sid), avg = (total / SUBJECTS.length).toFixed(1);
    const pos = students().filter(x => x.cls === s.cls && db.published[x.id]).map(x => tot(x.id)).sort((a, b) => b - a).indexOf(total) + 1;
    body = `<div class="card" id="sheet"><h3>${esc(s.name)}</h3><p>${s.adm} &bull; ${s.cls} &bull; ${rs.ses} ${rs.term}</p><div class="wrap"><table><tr><th>Subject</th><th>Test /30</th><th>Exam /70</th><th>Total</th><th>Grade</th><th>Teacher's remark</th></tr>
${rows.map(r => `<tr><td>${r.j}</td><td>${r.c}</td><td>${r.x}</td><td>${r.t}</td><td><b>${r.g[1]}</b></td><td>${r.g[2]}</td></tr>`).join('')}</table></div>
<p>Total: <b>${total}</b> &bull; Average: <b>${avg}</b>${SHOW_POSITION ? ' &bull; Position in class: <b>' + pos + '</b>' : ''}</p>
<p>Principal's remark (auto): ${grade(avg)[2]} performance.</p><div class="bars">${rows.map(r => `<div><i style="height:${r.t}%"></i>${r.j.slice(0,5)}</div>`).join('')}</div>
<div class="row"><button class="btn" data-act="print">Print / Save as PDF</button></div></div>`;
  }
  return `<h2 style="margin-top:0">Results</h2>${pick}${body}`;
};

const timetable = u => {
  const cls = rs.tt || u.cls || (u.kids && db.users.find(x => x.id === u.kids[0]).cls) || CLASSES[0], off = CLASSES.indexOf(cls);
  const lock = u.role === 'student';
  const cell = (d, p) => { if (p === 3) return '<td>Break</td>'; const j = SUBJECTS[(d + p + off) % 4], mine = u.subj && u.subj.includes(j) && cls === u.cls;
    return `<td class="${mine ? 'mine' : ''}">${j}<br><small>${teacherOf(j)}</small></td>`; };
  return `<h2 style="margin-top:0">Timetable</h2><div class="note">Sample timetable generated for the demo.</div><label>Class<select data-chg="tt" ${lock ? 'disabled' : ''}>${CLASSES.map(c => `<option ${c === cls ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
<div class="card wrap"><table><tr><th>Day</th>${TIMES.map((t, i) => `<th>P${i + 1}<br>${t}</th>`).join('')}</tr>${DAYS.map((d, di) => `<tr><td><b>${d}</b></td>${TIMES.map((_, p) => cell(di, p)).join('')}</tr>`).join('')}</table></div>
<div class="row"><button class="btn" data-act="print">Print / Save as PDF</button></div>`;
};

const scores = u => `<h2 style="margin-top:0">Enter scores: ${u.cls}</h2><p>You can only edit your subjects: ${u.subj.join(', ')}. Edited results go back to the admin for publishing.</p>
<form class="card" data-form="score"><div class="wrap"><table><tr><th>Student</th>${u.subj.map(j => `<th>${j}<br>Test/30 &bull; Exam/70</th>`).join('')}</tr>
${students().filter(s => s.cls === u.cls).map(s => `<tr><td>${esc(s.name)}</td>${u.subj.map(j => { const v = (db.scores[s.id] || {})[j] || ['','']; return `<td><input type="number" min="0" max="30" name="${s.id}|${j}|0" value="${v[0]}" required> <input type="number" min="0" max="70" name="${s.id}|${j}|1" value="${v[1]}" required></td>`; }).join('')}</tr>`).join('')}</table></div>
<div class="row"><button class="btn" type="submit">Save scores</button></div></form>`;

const admin = () => `<h2 style="margin-top:0">Admission applications</h2><div class="card wrap"><table><tr><th>Ref</th><th>Name</th><th>Class</th><th>Status</th><th>Action</th></tr>
${db.apps.map(a => `<tr><td>${a.ref}</td><td>${esc(a.name)}</td><td>${esc(a.cls)}</td><td><span class="badge ${a.status.split(' ')[0]}">${a.status}</span></td><td>${['Under review','Accepted','Rejected'].map(s => `<button class="btn alt sm" data-act="st" data-arg="${a.ref}|${s}">${s}</button>`).join(' ')}</td></tr>`).join('')}</table></div>
<h2>Results publishing</h2><div class="card wrap"><table><tr><th>Student</th><th>Class</th><th>Status</th><th>Action</th></tr>${students().map(s => `<tr><td>${esc(s.name)}</td><td>${s.cls}</td><td><span class="badge ${db.published[s.id] ? 'Published' : ''}">${db.published[s.id] ? 'Published' : 'Not published'}</span></td><td><button class="btn alt sm" data-act="pub" data-arg="${s.id}">${db.published[s.id] ? 'Unpublish' : 'Approve & publish'}</button></td></tr>`).join('')}</table></div>${newsForm('Publish an announcement')}`;

/* END OF FILE 3 */


