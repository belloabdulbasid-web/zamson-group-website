
(() => {
  const db = window.supabase.createClient(
    window.ZAMSON_SUPABASE_URL,
    window.ZAMSON_SUPABASE_PUBLISHABLE_KEY
  );

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const safeUrl = (s) => {
    if (!s) return '';
    try {
      const u = new URL(s, location.href);
      return ['http:', 'https:'].includes(u.protocol) ? u.href : '';
    } catch {
      return '';
    }
  };

  const formatDate = (s) => {
    if (!s) return '';
    const d = new Date(s);
    return Number.isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('en-NG', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
  };

  const depotImages = ['Proj2.jpeg', 'proj1.jpeg'];

  function imageHtml(url, alt, fallback = '') {
    const imageUrl = safeUrl(url) || fallback;
    if (!imageUrl) return '';

    return `<img src="${esc(imageUrl)}"
      alt="${esc(alt)}"
      loading="lazy"
      onerror="if(this.dataset.fallbackTried!=='yes' && '${esc(fallback)}'){this.dataset.fallbackTried='yes';this.src='${esc(fallback)}'}else{this.style.display='none'}"
      data-fallback-tried="no">`;
  }

  async function get(table, options = {}) {
    let q = db.from(table).select('*');

    if (options.published) q = q.eq('published', true);

    if (options.order) {
      q = q.order(options.order, {
        ascending: options.ascending ?? false
      });
    }

    if (options.limit) q = q.limit(options.limit);

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  function renderProjects(rows) {
    const list = document.querySelector('[data-cms-projects]');
    if (!list || !rows.length) return;

    list.innerHTML = rows.map((r, i) => `
      <article class="card project-card">
        ${imageHtml(r.image_url, r.title, depotImages[i % 2])}
        <div class="card-body">
          <div class="kicker">${esc(r.status || 'Project')}</div>
          <h3>${esc(r.title)}</h3>
          ${r.location ? `<p><strong>Location:</strong> ${esc(r.location)}</p>` : ''}
          <p>${esc(r.description || '')}</p>
        </div>
      </article>
    `).join('');
  }

  function renderProjectTeaser(rows) {
    const target = document.querySelector('[data-cms-project-teaser]');
    if (!target || !rows.length) return;

    const r = rows[0];

    target.innerHTML = `
      <div class="two-col project-teaser">
        ${imageHtml(r.image_url, r.title, 'Proj2.jpeg')}
        <div class="copy">
          <div class="kicker">${esc(r.status || 'Project')}</div>
          <h2>${esc(r.title)}</h2>
          <p>${esc(r.description || '')}</p>
          ${r.location ? `<p><strong>Location:</strong> ${esc(r.location)}</p>` : ''}
          <span class="status-pill">${esc(r.status || '')}</span>
          <p><a class="btn" href="projects.html">View project details</a></p>
        </div>
      </div>`;
  }

  function renderProjectDetail(rows) {
    const target = document.querySelector('[data-cms-project-detail]');
    if (!target || !rows.length) return;

    const r = rows[0];

    target.innerHTML = `
      <div class="project-detail">
        ${imageHtml(r.image_url, r.title, 'Proj2.jpeg')}
        <div class="copy">
          <div class="kicker">${esc(r.status || 'Project')}</div>
          <h2>${esc(r.title)}</h2>
          <span class="status-pill">${esc(r.status || '')}</span>
          <p>${esc(r.description || '')}</p>
          ${r.location ? `<h3>Project location</h3><p>${esc(r.location)}</p>` : ''}
          <p>Further information will be added as plans are confirmed and the project progresses.</p>
          <a class="btn" href="contact.html">Make an enquiry</a>
        </div>
      </div>`;
  }

  function renderLeadership(rows) {
    const target = document.querySelector('[data-cms-leadership]');
    if (!target || !rows.length) return;

    target.innerHTML = rows.map(r => `
      <div class="leader">
        ${r.photo_url ? imageHtml(r.photo_url, r.full_name) : ''}
        <div class="copy">
          <div class="kicker">Group Leadership</div>
          <h2>${esc(r.full_name)}</h2>
          <p class="leader-role">${esc(r.position || '')}</p>
          <p>${esc(r.biography || '')}</p>
        </div>
      </div>
    `).join('');
  }

  
function renderNews(rows) {
  const target = document.querySelector('[data-cms-news]');
  if (!target) return;

  if (!rows || !rows.length) {
    target.innerHTML =
      '<p class="muted">No published news or announcements yet.</p>';
    return;
  }

  target.innerHTML = `
    <div class="news-carousel">
      <button class="news-arrow news-prev" type="button"
        aria-label="Previous news">&#8249;</button>
      <div class="news-viewport">
        <div class="news-track">
          ${rows.map((r, i) => `
            <article class="card news-card">
              ${imageHtml(
                r.image_url,
                r.title || 'Zamson Group news',
                depotImages[i % depotImages.length]
              )}
              <div class="card-body">
                <div class="kicker">${esc(formatDate(r.created_at))}</div>
                <h3>${esc(r.title || 'News update')}</h3>
                <p>${esc(r.content || '')}</p>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
      <button class="news-arrow news-next" type="button"
        aria-label="Next news">&#8250;</button>
    </div>
    <div class="news-dots" aria-label="News slide navigation"></div>
  `;

  const viewport = target.querySelector('.news-viewport');
  const track = target.querySelector('.news-track');
  const cards = [...target.querySelectorAll('.news-card')];
  const dots = target.querySelector('.news-dots');
  const prev = target.querySelector('.news-prev');
  const next = target.querySelector('.news-next');

  if (!viewport || !track || !cards.length || !dots) return;

  let index = 0;
  let timer;
  let resizeTimer;

  // One news item per slide on every screen size.
  function drawDots() {
    dots.innerHTML = cards.map((_, i) => `
      <button type="button"
        class="news-dot ${i === index ? 'active' : ''}"
        aria-label="Go to news slide ${i + 1}"
        aria-current="${i === index ? 'true' : 'false'}"
        data-index="${i}"></button>
    `).join('');
  }

  function moveTo(newIndex) {
    index = ((newIndex % cards.length) + cards.length) % cards.length;

    const viewportWidth = viewport.getBoundingClientRect().width;

    // Each slide occupies one viewport width.
    track.style.transform =
      `translate3d(-${index * viewportWidth}px, 0, 0)`;

    dots.querySelectorAll('.news-dot').forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function startTimer() {
    stopTimer();

    if (cards.length > 1) {
      timer = setInterval(() => moveTo(index + 1), 5000);
    }
  }

  prev.addEventListener('click', () => {
    moveTo(index - 1);
    startTimer();
  });

  next.addEventListener('click', () => {
    moveTo(index + 1);
    startTimer();
  });

  dots.addEventListener('click', event => {
    const dot = event.target.closest('.news-dot');
    if (!dot) return;

    moveTo(Number(dot.dataset.index));
    startTimer();
  });

  target.addEventListener('mouseenter', stopTimer);
  target.addEventListener('mouseleave', startTimer);

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => moveTo(index), 150);
  });

  drawDots();
  moveTo(0);
  startTimer();
}

    function getPerView() {
      if (window.innerWidth >= 900) return 3;
      if (window.innerWidth >= 600) return 2;
      return 1;
    }

    let perView = getPerView();

    function getTotal() {
      return Math.max(1, cards.length - perView + 1);
    }

    function drawDots() {
      dots.innerHTML = Array.from({ length: getTotal() }, (_, i) => `
        <button type="button"
          class="news-dot ${i === index ? 'active' : ''}"
          aria-label="Go to news slide ${i + 1}"
          aria-current="${i === index ? 'true' : 'false'}"
          data-index="${i}"></button>
      `).join('');
    }

    function moveTo(newIndex) {
      const total = getTotal();
      index = ((newIndex % total) + total) % total;

      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = parseFloat(
        getComputedStyle(track).columnGap ||
        getComputedStyle(track).gap
      ) || 0;

      track.style.transform =
        `translateX(-${index * (cardWidth + gap)}px)`;

      dots.querySelectorAll('.news-dot').forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    function stopTimer() {
      clearInterval(timer);
      timer = undefined;
    }

    function startTimer() {
      stopTimer();

      if (cards.length > perView) {
        timer = setInterval(() => moveTo(index + 1), 5000);
      }
    }

    prev.addEventListener('click', () => {
      moveTo(index - 1);
      startTimer();
    });

    next.addEventListener('click', () => {
      moveTo(index + 1);
      startTimer();
    });

    dots.addEventListener('click', (event) => {
      const dot = event.target.closest('.news-dot');
      if (!dot) return;

      moveTo(Number(dot.dataset.index));
      startTimer();
    });

    target.addEventListener('mouseenter', stopTimer);
    target.addEventListener('mouseleave', startTimer);
    target.addEventListener('focusin', stopTimer);
    target.addEventListener('focusout', (event) => {
      if (!target.contains(event.relatedTarget)) startTimer();
    });

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        const newPerView = getPerView();

        if (newPerView !== perView) {
          perView = newPerView;
          index = Math.min(index, getTotal() - 1);
          drawDots();
        }

        moveTo(index);
        startTimer();
      }, 150);
    });

    drawDots();
    moveTo(0);
    startTimer();
  }

  function showLoadError(section, message) {
    const target = document.querySelector(section);
    if (!target) return;

    target.innerHTML = `
      <p class="muted">
        Content could not be loaded. Please refresh the page later.
      </p>`;

    console.error('Zamson CMS error:', message);
  }

  async function init() {
    const results = await Promise.allSettled([
      get('projects', { order: 'created_at' }),
      get('news', { published: true, order: 'created_at', limit: 6 }),
      get('leadership', { order: 'created_at' })
    ]);

    const [projectsResult, newsResult, leadershipResult] = results;

    if (projectsResult.status === 'fulfilled') {
      const projects = projectsResult.value;
      renderProjects(projects);
      renderProjectTeaser(projects);
      renderProjectDetail(projects);
    } else {
      console.error('Projects failed to load:', projectsResult.reason);
    }

    if (newsResult.status === 'fulfilled') {
      renderNews(newsResult.value);
    } else {
      showLoadError(
        '[data-cms-news]',
        newsResult.reason?.message || newsResult.reason
      );
    }

    if (leadershipResult.status === 'fulfilled') {
      renderLeadership(leadershipResult.value);
    } else {
      console.error('Leadership failed to load:', leadershipResult.reason);
    }
  }

  init().catch(error => {
    console.error('Zamson CMS initialization failed:', error);

    showLoadError(
      '[data-cms-news]',
      error?.message || error
    );
  });
})();
