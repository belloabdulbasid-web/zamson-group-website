
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const toggle = header?.querySelector('.menu-toggle');
  const nav = header?.querySelector('nav');

  // MOBILE NAVIGATION
  if (toggle && nav) {
    function closeMenu() {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
    }

    toggle.setAttribute('aria-controls', 'zamson-mobile-navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    nav.id = 'zamson-mobile-navigation';

    // Prevent duplicate handlers if this script is initialized again.
    if (toggle.dataset.menuInitialized !== 'true') {
      toggle.dataset.menuInitialized = 'true';

      toggle.addEventListener('click', event => {
        event.preventDefault();

        const isOpen = nav.classList.toggle('open');

        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute(
          'aria-label',
          isOpen ? 'Close navigation menu' : 'Open navigation menu'
        );
      });

      nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
      });

      document.addEventListener('click', event => {
        if (
          window.innerWidth <= 760 &&
          nav.classList.contains('open') &&
          !header.contains(event.target)
        ) {
          closeMenu();
        }
      });

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          closeMenu();
        }
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 760) {
          closeMenu();
        }
      });
    }
  }

  // HIGHLIGHT THE CURRENT PAGE
  const current = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');

    if (href === current) {
      link.classList.add('active');
    }
  });

  // ENQUIRY FORM
  const form = document.querySelector('#enquiry-form');

  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();

      const data = new FormData(form);

      const subject = encodeURIComponent(
        'Website enquiry - ' + (data.get('name') || '')
      );

      const body = encodeURIComponent(
        'Name: ' + (data.get('name') || '') +
        '\nEmail: ' + (data.get('email') || '') +
        '\nCompany: ' + (data.get('company') || 'Not provided') +
        '\n\nMessage:\n' + (data.get('message') || '')
      );

      location.href =
        'mailto:zamsonglo1970@gmail.com?subject=' +
        subject + '&body=' + body;
    });
  }
});
