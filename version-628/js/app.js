(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) {
      return;
    }
    var onScroll = function() {
      if (window.scrollY > 20) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
    menu.querySelectorAll("a").forEach(function(link) {
      link.addEventListener("click", function() {
        menu.classList.remove("is-open");
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        start();
      });
    }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
      var input = scope.querySelector("[data-filter-input]");
      var typeSelect = scope.querySelector("[data-type-filter]");
      var sortSelect = scope.querySelector("[data-sort-select]");
      var list = scope.querySelector("[data-card-list]");
      var empty = scope.querySelector("[data-no-results]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function applySort() {
        var value = sortSelect ? sortSelect.value : "year-desc";
        var sorted = cards.slice().sort(function(a, b) {
          if (value === "title") {
            return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
          }
          var yearA = parseInt(a.dataset.year, 10) || 0;
          var yearB = parseInt(b.dataset.year, 10) || 0;
          if (value === "year-asc") {
            return yearA - yearB;
          }
          return yearB - yearA;
        });
        sorted.forEach(function(card) {
          list.appendChild(card);
        });
      }

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;
        cards.forEach(function(card) {
          var text = (card.dataset.search || "").toLowerCase();
          var cardType = card.dataset.type || "";
          var matchedText = !query || text.indexOf(query) !== -1;
          var matchedType = !type || cardType.indexOf(type) !== -1;
          var shown = matchedText && matchedType;
          card.style.display = shown ? "" : "none";
          if (shown) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      function update() {
        applySort();
        applyFilter();
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", applyFilter);
      }
      if (sortSelect) {
        sortSelect.addEventListener("change", update);
      }
      update();
    });
  }

  ready(function() {
    initHeader();
    initMobileMenu();
    initHero();
    initFilters();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-video-player]");
  var button = document.querySelector("[data-play-button]");
  var cover = document.querySelector("[data-player-cover]");
  if (!video || !streamUrl) {
    return;
  }

  var prepared = false;
  var hls = null;

  function reveal() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
  }

  function playVideo() {
    reveal();
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function() {});
    }
  }

  function attach() {
    if (prepared) {
      playVideo();
      return;
    }
    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      hls.on(window.Hls.Events.ERROR, function(event, data) {
        if (!data || !data.fatal || !hls) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      return;
    }

    video.src = streamUrl;
    video.addEventListener("loadedmetadata", playVideo, { once: true });
    video.load();
  }

  if (button) {
    button.addEventListener("click", attach);
  }
  video.addEventListener("click", function() {
    if (!prepared || video.paused) {
      attach();
    }
  });
}
