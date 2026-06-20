(function () {
  if (document.getElementById('lesson-sidebar')) return;

  var LESSONS = [
    { file: '0001-your-blitz-leak-map.html', num: 1, title: 'Your Blitz Leak Map' },
    { file: '0002-pirc-classical-center-strike.html', num: 2, title: 'Pirc Classical' },
    { file: '0003-kid-samisch-dont-bite-g4.html', num: 3, title: "KID Samisch" },
    { file: '0004-owens-white-long-castle.html', num: 4, title: "Owen's Defense" },
    { file: '0005-philidor-exchange-kingside-storm.html', num: 5, title: 'Philidor Exchange' },
    { file: '0006-berlin-zukertort-centre-first.html', num: 6, title: 'Berlin / Zukertort' },
    { file: '0007-caro-tartakower-long-castle.html', num: 7, title: 'Caro-Kann Tartakower' },
    { file: '0008-pirc-geller-strike-c5.html', num: 8, title: 'Pirc Geller' }
  ];

  var EXTRA = [
    { file: 'chess-opening-explorer.html', label: 'Opening explorer' },
    { file: 'leak-map.html', label: 'Leak map' },
    { file: 'cct-checklist.html', label: 'CCT checklist' }
  ];

  var current = (location.pathname.split('/').pop() || location.href.split('/').pop() || '').toLowerCase();
  var zone = getZone();

  function getZone() {
    var path = (location.pathname || location.href || '').replace(/\\/g, '/').toLowerCase();
    if (path.indexOf('/lessons/') !== -1 || path.endsWith('/lessons')) return 'lessons';
    if (path.indexOf('/reference/') !== -1) return 'reference';
    return 'root';
  }

  function hrefLessonsIndex() {
    if (zone === 'lessons') return 'index.html';
    if (zone === 'reference') return '../lessons/index.html';
    return 'lessons/index.html';
  }

  function hrefLesson(file) {
    if (zone === 'lessons') return file;
    if (zone === 'reference') return '../lessons/' + file;
    return 'lessons/' + file;
  }

  function hrefExtra(file) {
    if (file === 'chess-opening-explorer.html') {
      if (zone === 'root') return file;
      return '../' + file;
    }
    if (zone === 'reference') return file;
    return 'reference/' + file;
  }

  var main = document.createElement('div');
  main.className = 'lesson-main';
  while (document.body.firstChild) {
    main.appendChild(document.body.firstChild);
  }
  document.body.appendChild(main);

  var backdrop = document.createElement('div');
  backdrop.className = 'lesson-nav-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'lesson-nav-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'lesson-sidebar');
  toggle.textContent = 'Lessons';

  var sidebar = document.createElement('nav');
  sidebar.className = 'lesson-sidebar';
  sidebar.id = 'lesson-sidebar';
  sidebar.setAttribute('aria-label', 'Lesson index');

  var header = document.createElement('div');
  header.className = 'lesson-sidebar-header';
  header.innerHTML =
    '<a href="' + hrefLessonsIndex() + '">Chess lessons</a>' +
    '<span class="lesson-sidebar-title">1700 → 2000 Blitz</span>';

  var list = document.createElement('ul');
  list.className = 'lesson-nav-list';

  LESSONS.forEach(function (lesson) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = hrefLesson(lesson.file);
    if (lesson.file.toLowerCase() === current) {
      a.className = 'is-active';
      a.setAttribute('aria-current', 'page');
    }
    a.innerHTML =
      '<span class="lesson-nav-num">Lesson ' + lesson.num + '</span>' +
      lesson.title;
    li.appendChild(a);
    list.appendChild(li);
  });

  var extra = document.createElement('div');
  extra.className = 'lesson-nav-extra';

  EXTRA.forEach(function (item) {
    var link = document.createElement('a');
    link.href = hrefExtra(item.file);
    link.textContent = item.label;
    if (item.file.toLowerCase() === current) {
      link.className = 'is-active';
      link.setAttribute('aria-current', 'page');
    }
    extra.appendChild(link);
  });

  sidebar.appendChild(header);
  sidebar.appendChild(list);
  sidebar.appendChild(extra);

  document.body.classList.add('has-lesson-nav');
  if (current === 'index.html' && zone === 'lessons') {
    document.body.classList.add('lesson-index');
  }
  if (current === 'chess-opening-explorer.html') {
    document.body.classList.add('lesson-nav-wide');
  }

  document.body.insertBefore(backdrop, main);
  document.body.insertBefore(toggle, main);
  document.body.insertBefore(sidebar, main);

  function setOpen(open) {
    document.body.classList.toggle('lesson-nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', function () {
    setOpen(!document.body.classList.contains('lesson-nav-open'));
  });

  backdrop.addEventListener('click', function () {
    setOpen(false);
  });

  sidebar.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setOpen(false);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();