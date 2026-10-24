
document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = header ? header.querySelector('nav') : null;

  // MOBILE NAVIGATION
  if (header && menuButton && nav) {
    nav.id = 'zamson-mobile-navigation';
    menuButton.type = 'button';
    menuButton.setAttribute('aria-controls', nav.id);
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');

    function setMenuOpen(open) {
      nav.classList.toggle('open', open);
      nav.classList.remove('mobile-nav-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute(
        'aria-label',
        open ? 'Close navigation menu' : 'Open navigation menu'
      );
    }

    menuButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = nav.classList.contains('open');
      setMenuOpen(!isOpen);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener('click', function (event) {
      if (
        window.innerWidth <= 760 &&
        nav.classList.contains('open') &&
        !header.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) {
        setMenuOpen(false);
      }
    });
  } else {
    console.warn('Zamson navigation: menu button or nav element not found.');
  }

  // HIGHLIGHT CURRENT PAGE
  const currentPage = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('header nav a').forEach(function (link) {
    const linkPage = link.getAttribute('href');

    if (linkPage === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // ENQUIRY FORM
  const form = document.querySelector('#enquiry-form');

  if (form) {
    form.addEventListener('submit', function (event) {
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
