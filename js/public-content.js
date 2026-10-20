
function renderNews(rows) {
  const target = document.querySelector('[data-cms-news]');
  if (!target) return;

  if (!rows.length) {
    target.innerHTML =
      '<p class="muted">No published news or announcements yet.</p>';
    return;
  }

  target.innerHTML = `
    <div class="news-carousel">
      <button class="news-arrow news-prev" type="button"
        aria-label="Previous news">‹</button>
      <div class="news-viewport">
        <div class="news-track">
          ${rows.map((r, i) => {
            const fallback = ['Proj2.jpeg', 'proj1.jpeg'][i % 2];
            const img = safeUrl(r.image_url) || fallback;

            return `
              <article class="card news-card">
                <img src="${esc(img)}"
                  alt="${esc(r.title)}"
                  loading="lazy"
                  onerror="this.onerror=null;this.src='${fallback}'">
                <div class="card-body">
                  <div class="kicker">${formatDate(r.created_at)}</div>
                  <h3>${esc(r.title)}</h3>
                  <p>${esc(r.content || '')}</p>
                </div>
              </article>`;
          }).join('')}
        </div>
      </div>
      <button class="news-arrow news-next" type="button"
        aria-label="Next news">›</button>
    </div>
    <div class="news-dots" aria-label="News slide navigation"></div>
  `;

  const viewport = target.querySelector('.news-viewport');
  const track = target.querySelector('.news-track');
  const cards = [...target.querySelectorAll('.news-card')];
  const dots = target.querySelector('.news-dots');
  const prev = target.querySelector('.news-prev');
  const next = target.querySelector('.news-next');

  let index = 0;
  let timer;
  let perView = window.innerWidth >= 900 ? 3 :
                window.innerWidth >= 600 ? 2 : 1;

  function drawDots() {
    const total = Math.max(1, cards.length - perView + 1);
    dots.innerHTML = Array.from({ length: total }, (_, i) =>
      `<button type="button" class="news-dot ${i === index ? 'active' : ''}"
        aria-label="Go to news slide ${i + 1}" data-index="${i}"></button>`
    ).join('');
  }

  function moveTo(newIndex) {
    const total = Math.max(1, cards.length - perView + 1);
    index = (newIndex + total) % total;

    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;

    track.style.transform =
      `translateX(-${index * (cardWidth + gap)}px)`;

    dots.querySelectorAll('.news-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function restartTimer() {
    clearInterval(timer);
    if (cards.length > perView) {
      timer = setInterval(() => moveTo(index + 1), 5000);
    }
  }

  prev.addEventListener('click', () => {
    moveTo(index - 1);
    restartTimer();
  });

  next.addEventListener('click', () => {
    moveTo(index + 1);
    restartTimer();
  });

  dots.addEventListener('click', (event) => {
    const dot = event.target.closest('.news-dot');
    if (!dot) return;
    moveTo(Number(dot.dataset.index));
    restartTimer();
  });

  target.addEventListener('mouseenter', () => clearInterval(timer));
  target.addEventListener('mouseleave', restartTimer);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      perView = window.innerWidth >= 900 ? 3 :
                window.innerWidth >= 600 ? 2 : 1;
      index = Math.min(index, Math.max(0, cards.length - perView));
      track.style.transition = 'none';
      drawDots();
      moveTo(index);
      requestAnimationFrame(() => {
        track.style.transition = '';
      });
      restartTimer();
    }, 150);
  });

  drawDots();
  moveTo(0);
  restartTimer();
}
