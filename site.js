```javascript
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.setAttribute(
        'aria-expanded',
        nav.classList.contains('open') ? 'true' : 'false'
      );
    });
  }

  const current = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('nav a').forEach(a => {
    if (a.getAttribute('href') === current) {
      a.classList.add('active');
    }
  });

  const form = document.querySelector('#enquiry-form');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const d = new FormData(form);

      const subject = encodeURIComponent(
        'Website enquiry - ' + d.get('name')
      );

      const body = encodeURIComponent(
        'Name: ' + d.get('name') +
        '\nEmail: ' + d.get('email') +
        '\nCompany: ' + (d.get('company') || 'Not provided') +
        '\n\nMessage:\n' + d.get('message')
      );

      location.href =
        'mailto:zamsonglo1970@gmail.com?subject=' +
        subject + '&body=' + body;
    });
  }
});
```


/* Zamson Group mobile navigation fix */
document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector("header");
  if (!header) return;

  const menuButton = header.querySelector(".menu-toggle");
  const nav = header.querySelector("nav");

  if (!menuButton || !nav) return;

  function closeMenu() {
    nav.classList.remove("mobile-nav-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
  }

  menuButton.setAttribute("aria-controls", "zamson-mobile-navigation");
  nav.id = "zamson-mobile-navigation";

  menuButton.addEventListener("click", function (event) {
    event.preventDefault();

    const isOpen = nav.classList.toggle("mobile-nav-open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });
});

