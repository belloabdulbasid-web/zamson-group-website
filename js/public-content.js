
function renderNews(rows) {
  const target = document.querySelector('[data-cms-news]');
  if (!target) return;

  if (!rows || !rows.length) {
    target.innerHTML =
      '<p class="muted">No published news or announcements yet.</p>';
    return;
  }

  const fallbackImages = ['Proj2.jpeg', 'proj1.jpeg'];

  target.innerHTML = `
    <div class="news-carousel">
      <button class="news-arrow news-prev" type="button"
        aria-label="Previous news">&#8249;</button>

      <div class="news-viewport">
        <div class="news-track">
          ${rows.map((r, i) => {
            const fallback = fallbackImages[i % fallbackImages.length];
            const img = safeUrl(r.image_url) || fallback;

            return `
              <article class="card news-card">
                <img
                  src="${esc(img)}"
                  alt="${esc(r.title || 'Zamson Group news')}"
                  loading="lazy"
                  onerror="this.onerror=null;this.src='${fallback}'">

                <div class="card-body">
                  <div class="kicker">
                    ${esc(formatDate(r.created_at))}
                  </div>
                  <h3>${esc(r.title || 'News update')}</h3>
                  <p>${esc(r.content || '')}</p>
                </div>
              </article>`;
          }).join('')}
        </div>
      </div>

      <button class="news-arrow news-next" type="button"
        aria-label="Next news">&#8250;</button>
    </div>

    <div class="news-dots" aria-label="News slide navigation"></div>
  `;

  const track = target.querySelector('.news-track');
  const cards = [...target.querySelectorAll('.news-card')];
  const dots = target.querySelector('.news-dots');
  const prev = target.querySelector('.news-prev');
  const next = target.querySelector('.news-next');

  if (!track || !cards.length || !dots || !prev || !next) return;

  let index = 0;
  let timer;
  let resizeTimer;

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
    const total = getTotal();

    dots.innerHTML = Array.from({ length: total }, (_, i) => `
      <button
        type="button"
        class="news-dot ${i === index ? 'active' : ''}"
        aria-label="Go to news slide ${i + 1}"
        aria-current="${i === index ? 'true' : 'false'}"
        data-index="${i}">
      </button>
    `).join('');
  }

  function moveTo(newIndex) {
    const total = getTotal();
    index = ((newIndex % total) + total) % total;

    const cardWidth = cards[0].getBoundingClientRect().width;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;

    track.style.transform =
      `translateX(-${index * (cardWidth + gap)}px)`;

    dots.querySelectorAll('.news-dot').forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
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
