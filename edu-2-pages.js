/* ---------- Views ---------- */
const newsFor = u => db.news.filter(n => n.cls === 'All' || !u || n.cls === u.cls || (u.kids && u.kids.some(k => db.users.find(x => x.id === k).cls === n.cls)));
const newsList = u => newsFor(u).map(n => `<div class="card"><h3>${esc(n.t)}</h3><p>${esc(n.d)}</p><small>By ${esc(n.by)} &bull; ${esc(n.cls)}</small></div>`).join('');

const home = () => `
<section class="glass hero"><span class="tag">DEMO SCHOOL &bull; SAMPLE CONTENT</span>
<h1>Welcome to <span class="g">${SCHOOL}</span></h1><p>Nurturing curious minds and building confident leaders.</p>
<div class="row"><a class="btn" href="#/apply">Apply for Admission</a><a class="btn alt" href="#/login">Student Portal Login</a></div></section>
<div class="grid"><div class="card"><h3>About us</h3><p>A friendly school focused on strong foundations in learning, character and creativity.</p></div>
<div class="card"><h3>Mission</h3><p>To give every child the skills and confidence to thrive.</p></div>
<div class="card"><h3>Vision</h3><p>A community of lifelong learners who lead with kindness.</p></div>
<div class="card"><h3>Principal's welcome</h3><p>Sample message: welcome to our school family. Replace with your principal's words.</p></div></div>
<h2>Academic programs</h2><div class="grid"><div class="card hov"><h3>Junior Secondary</h3><p>JSS 1 to JSS 3</p></div><div class="card hov"><h3>Senior Secondary</h3><p>SSS 1 to SSS 3</p></div></div>
<h2>News &amp; announcements</h2><div class="grid">${newsList(null)}</div>
<h2>Upcoming events</h2><div class="grid"><div class="card"><h3>Sample: Inter-house Sports</h3><p>Date to be announced</p></div><div class="card"><h3>Sample: Open Day</h3><p>Date to be announced</p></div></div>
<h2>Admission</h2><div class="card"><p>Applications are open online. Upload your documents, submit, then track your application with its reference number.</p><div class="row"><a class="btn" href="#/apply">Start application</a></div></div>
<h2>Contact</h2><div class="grid"><div class="card"><h3>Address</h3><p>1 School Road, Your City (sample)<br>Phone: +000 000 0000 (sample)<br>${MAIL}</p></div>
<form class="card" data-form="contact"><label>Name<input name="n" required></label><label>Message<textarea name="m" rows="3" required></textarea></label><button class="btn" type="submit">Send message</button></form></div>
<footer>&copy; ${new Date().getFullYear()} ${SCHOOL} &bull; Demo site</footer>`;

const login = () => `<div class="card" style="max-width:460px;margin:0 auto"><h2 style="margin-top:0">Portal login</h2>
<div class="note">DEMO: sample accounts only. Real security needs a backend such as Supabase Auth.</div>
<form data-form="login" novalidate><label>Email or phone<input name="login" autocomplete="username"></label>
<label>Password<input name="pass" type="password" autocomplete="current-password"></label>
<label><input type="checkbox" data-act="pw"> Show password &nbsp; <input type="checkbox" name="rem"> Remember me</label>
<button class="btn" type="submit" style="width:100%">Log in</button></form>
<p style="margin-top:12px"><a href="#" data-act="forgot" style="color:var(--soft)">Forgot password?</a></p>
<h3 style="margin-top:18px">Demo accounts (tap to fill, password demo123)</h3>
<div class="row">${['student','teacher','admin','parent'].map(r => `<button class="btn alt sm" data-act="fill" data-arg="${r}@demo.school">${r}</button>`).join('')}</div></div>`;

const FIELDS = [['first','First name'],['middle','Middle name','text',0],['sur','Surname'],['dob','Date of birth','date'],['nat','Nationality'],['state','State of origin'],['lga','Local government area'],['addr','Residential address'],
  ['gname','Parent/guardian full name'],['gphone','Guardian phone','tel'],['gmail','Guardian email','email'],['rel','Relationship to student'],['emer','Emergency contact phone','tel'],['prev','Previous school'],['pcls','Previous class']];
const DOCS = [['birth','Birth certificate',1],['photo','Passport photograph',1],['result','Previous school result / transcript',1],['transfer','Transfer / leaving certificate',0],['medical','Medical information',0],['other','Other supporting document',0]];
const sel = (n, l, o) => `<label>${l}<select name="${n}" required><option value="">Select</option>${o.map(x => `<option>${x}</option>`).join('')}</select></label>`;
const apply = () => `<h2 style="margin-top:0">Online admission</h2><div class="note">DEMO: documents are checked and previewed in your browser only. They are not uploaded anywhere.</div>
<form class="card" data-form="apply" id="af"><div class="two">${FIELDS.map(([n,l,t='text',r=1]) => `<label>${l}${r ? ' <span class="req">*</span>' : ''}<input name="${n}" type="${t}" ${r ? 'required' : ''}></label>`).join('')}
${sel('gender','Gender',['Female','Male'])}${sel('cls','Applying for class',CLASSES.concat(['JSS 3A','SSS 1A']))}${sel('ses','Preferred session',['2026/2027'])}</div>
<h3>Documents (PDF, JPG, PNG, max 2 MB)</h3>${DOCS.map(([n,l,r]) => `<div class="doc"><label>${l} ${r ? '<span class="req">*</span>' : '(optional)'}<input type="file" name="${n}" accept=".pdf,.jpg,.jpeg,.png" ${r ? 'required' : ''}></label>
<div class="bar"><i></i></div><div class="m"></div><div class="pv"></div><button type="button" class="btn alt sm" data-act="rm" style="margin-top:6px">Remove</button></div>`).join('')}
<div class="row"><button class="btn alt" type="button" data-act="draft">Save progress</button><button class="btn" type="submit">Submit application</button></div></form>
<h2>Track an application</h2><form class="card" data-form="track"><label>Reference number<input name="ref" placeholder="e.g. APP-DEMO-001" required></label><button class="btn" type="submit">Check status</button><div id="trk" style="margin-top:12px"></div></form>`;

/* END OF FILE 2 */


