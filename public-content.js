(() => {
  const db = window.supabase.createClient(window.ZAMSON_SUPABASE_URL, window.ZAMSON_SUPABASE_PUBLISHABLE_KEY);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = (s) => {
    try { const u = new URL(s, location.href); return ['http:','https:'].includes(u.protocol) ? u.href : ''; }
    catch { return ''; }
  };
  const formatDate = (s) => { if (!s) return ''; const d = new Date(s); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'}); };

  async function get(table, options={}) {
    let q = db.from(table).select('*');
    if (options.published) q = q.eq('published', true);
    if (options.order) q = q.order(options.order, {ascending: options.ascending ?? false});
    if (options.limit) q = q.limit(options.limit);
    const {data,error} = await q;
    if (error) throw error;
    return data || [];
  }

  function renderProjects(rows) {
    const list = document.querySelector('[data-cms-projects]');
    if (!list) return;
    if (!rows.length) return;
    list.innerHTML = rows.map((r) => {
      const img = safeUrl(r.image_url);
      return `<article class="card project-card">${img ? `<img src="${esc(img)}" alt="${esc(r.title)}">` : ''}<div class="card-body"><div class="kicker">${esc(r.status || 'Project')}</div><h3>${esc(r.title)}</h3>${r.location ? `<p><strong>Location:</strong> ${esc(r.location)}</p>` : ''}<p>${esc(r.description || '')}</p></div></article>`;
    }).join('');
  }

  function renderProjectTeaser(rows) {
    const target = document.querySelector('[data-cms-project-teaser]');
    if (!target || !rows.length) return;
    const r = rows[0];
    target.innerHTML = `<div class="two-col project-teaser">${r.image_url ? `<img src="${esc(safeUrl(r.image_url))}" alt="${esc(r.title)}">` : ''}<div class="copy"><div class="kicker">${esc(r.status || 'Project')}</div><h2>${esc(r.title)}</h2><p>${esc(r.description || '')}</p>${r.location ? `<p><strong>Location:</strong> ${esc(r.location)}</p>` : ''}<span class="status-pill">${esc(r.status || '')}</span><p><a class="btn" href="projects.html">View project details</a></p></div></div>`;
  }

  function renderProjectDetail(rows) {
    const target = document.querySelector('[data-cms-project-detail]');
    if (!target || !rows.length) return;
    const r = rows[0], img = safeUrl(r.image_url);
    target.innerHTML = `<div class="project-detail">${img ? `<img src="${esc(img)}" alt="${esc(r.title)}">` : ''}<div class="copy"><div class="kicker">${esc(r.status || 'Project')}</div><h2>${esc(r.title)}</h2><span class="status-pill">${esc(r.status || '')}</span><p>${esc(r.description || '')}</p>${r.location ? `<h3>Project location</h3><p>${esc(r.location)}</p>` : ''}<p>Further information will be added as plans are confirmed and the project progresses.</p><a class="btn" href="contact.html">Make an enquiry</a></div></div>`;
  }

  function renderLeadership(rows) {
    const target = document.querySelector('[data-cms-leadership]');
    if (!target || !rows.length) return;
    target.innerHTML = rows.map(r => {
      const img = safeUrl(r.photo_url);
      return `<div class="leader">${img ? `<img src="${esc(img)}" alt="${esc(r.full_name)}">` : ''}<div class="copy"><div class="kicker">Group Leadership</div><h2>${esc(r.full_name)}</h2><p class="leader-role">${esc(r.position || '')}</p><p>${esc(r.biography || '')}</p></div></div>`;
    }).join('');
  }

  function renderNews(rows) {
    const target = document.querySelector('[data-cms-news]');
    if (!target) return;
    if (!rows.length) { target.innerHTML = '<p class="muted">No published news or announcements yet.</p>'; return; }
    target.innerHTML = rows.map(r => {
      const img = safeUrl(r.image_url);
      return `<article class="card news-card">${img ? `<img src="${esc(img)}" alt="${esc(r.title)}">` : ''}<div class="card-body"><div class="kicker">${formatDate(r.created_at)}</div><h3>${esc(r.title)}</h3><p>${esc(r.content || '')}</p></div></article>`;
    }).join('');
  }

  async function init() {
    try {
      const [projects, news, leadership] = await Promise.all([
        get('projects', {order:'created_at'}),
        get('news', {published:true, order:'created_at', limit:6}),
        get('leadership', {order:'created_at'})
      ]);
      renderProjects(projects);
      renderProjectTeaser(projects);
      renderProjectDetail(projects);
      renderLeadership(leadership);
      renderNews(news);
    } catch (e) {
      console.warn('Zamson CMS content could not be loaded:', e.message || e);
    }
  }
  init();
})();
