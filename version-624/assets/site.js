
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var filterAreas = Array.prototype.slice.call(document.querySelectorAll('[data-filterable]'));
  var searchInput = document.querySelector('[data-search-input]');
  var categorySelect = document.querySelector('[data-filter-category]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var yearSelect = document.querySelector('[data-filter-year]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!filterAreas.length) {
      return;
    }

    var query = normalize(searchInput && searchInput.value);
    var category = normalize(categorySelect && categorySelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var year = normalize(yearSelect && yearSelect.value);

    filterAreas.forEach(function (area) {
      var cards = Array.prototype.slice.call(area.querySelectorAll('[data-card]'));
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        var cardCategory = normalize(card.dataset.category);
        var cardRegion = normalize(card.dataset.region);
        var cardYear = normalize(card.dataset.year);
        var visible = true;

        if (query && text.indexOf(query) === -1) {
          visible = false;
        }
        if (category && cardCategory !== category) {
          visible = false;
        }
        if (region && cardRegion.indexOf(region) === -1) {
          visible = false;
        }
        if (year && cardYear.indexOf(year) !== 0) {
          visible = false;
        }

        card.classList.toggle('is-hidden', !visible);
      });
    });
  }

  [searchInput, categorySelect, regionSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  var hlsLoading = false;
  var hlsCallbacks = [];

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsCallbacks.push(callback);
    if (hlsLoading) {
      return;
    }
    hlsLoading = true;
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.onload = function () {
      hlsLoading = false;
      var callbacks = hlsCallbacks.slice();
      hlsCallbacks.length = 0;
      callbacks.forEach(function (fn) {
        fn();
      });
    };
    document.head.appendChild(script);
  }

  function beginPlayback(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var stream = player.getAttribute('data-v');

    if (!video || !stream) {
      return;
    }

    function playVideo() {
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {});
      }
    }

    function useSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }
      video.src = stream;
      playVideo();
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (video.dataset.ready === '1') {
      playVideo();
      return;
    }

    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl') || window.Hls) {
      useSource();
    } else {
      loadHls(useSource);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player')).forEach(function (player) {
    var overlay = player.querySelector('.player-overlay');
    var video = player.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        beginPlayback(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          beginPlayback(player);
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }
  });
})();
