(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var jumpSelect = document.querySelector('[data-category-jump]');
  if (jumpSelect) {
    jumpSelect.addEventListener('change', function () {
      if (jumpSelect.value) {
        window.location.href = './category-' + jumpSelect.value + '.html';
      }
    });
  }

  var queryInput = document.querySelector('[data-url-query]');
  if (queryInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    queryInput.value = q;
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  var extraFilter = document.querySelector('[data-extra-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applyFilter() {
    var text = filterInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).join(' ');
    var extra = extraFilter ? extraFilter.value.trim().toLowerCase() : '';

    cards.forEach(function (card) {
      var search = (card.getAttribute('data-search') || '').toLowerCase();
      var textMatch = !text || text.split(/\s+/).every(function (part) {
        return !part || search.indexOf(part) !== -1;
      });
      var extraMatch = !extra || search.indexOf(extra) !== -1;
      card.classList.toggle('is-hidden', !(textMatch && extraMatch));
    });
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });

  if (extraFilter) {
    extraFilter.addEventListener('change', applyFilter);
  }

  if (filterInputs.length || extraFilter) {
    applyFilter();
  }
})();
