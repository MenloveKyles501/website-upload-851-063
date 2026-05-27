(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('nav-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let active = 0;

  function showSlide(index) {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    showSlide(0);
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  function applyFilters(scope) {
    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const keywordInput = scope.querySelector('[data-search-input]');
    const yearSelect = scope.querySelector('[data-year-filter]');
    const typeSelect = scope.querySelector('[data-type-filter]');
    const empty = scope.querySelector('.empty-state');
    const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
    const year = yearSelect ? yearSelect.value : '';
    const type = typeSelect ? typeSelect.value : '';
    let shown = 0;

    cards.forEach(function (card) {
      const haystack = (card.getAttribute('data-search') || '').toLowerCase();
      const cardYear = card.getAttribute('data-year') || '';
      const cardType = card.getAttribute('data-type') || '';
      const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchedYear = !year || cardYear === year;
      const matchedType = !type || cardType === type;
      const visible = matchedKeyword && matchedYear && matchedType;
      card.style.display = visible ? '' : 'none';
      if (visible) shown += 1;
    });

    if (empty) {
      empty.style.display = shown ? 'none' : 'block';
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    scope.querySelectorAll('input, select').forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(scope);
      });
      control.addEventListener('change', function () {
        applyFilters(scope);
      });
    });
    applyFilters(scope);
  });

  document.querySelectorAll('[data-hero-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input');
      const value = input ? input.value.trim() : '';
      const url = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
      window.location.href = url;
    });
  });

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    document.querySelectorAll('[data-search-input]').forEach(function (input) {
      input.value = q;
      const scope = input.closest('[data-filter-scope]');
      if (scope) applyFilters(scope);
    });
  }
})();
