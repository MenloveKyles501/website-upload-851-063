(function () {
  var mobileToggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var searchInput = panel.querySelector("[data-filter-search]");
    var categoryInput = panel.querySelector("[data-filter-category]");
    var yearInput = panel.querySelector("[data-filter-year]");
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-card"));

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-category"),
        card.textContent
      ].join(" "));
    }

    function applyFilter() {
      var keyword = normalize(searchInput && searchInput.value);
      var category = normalize(categoryInput && categoryInput.value);
      var year = normalize(yearInput && yearInput.value);

      cards.forEach(function (card) {
        var haystack = cardText(card);
        var cardCategory = normalize(card.getAttribute("data-category"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        if (year && cardYear.indexOf(year) === -1) {
          matched = false;
        }

        card.classList.toggle("hidden-by-filter", !matched);
      });
    }

    [searchInput, categoryInput, yearInput].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });

  function attachSource(video, source) {
    if (!video || !source || video.getAttribute("data-ready") === source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }

      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else {
      video.src = source;
    }

    video.setAttribute("data-ready", source);
  }

  window.setupPlayer = function (videoId, source, buttonId, layerId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var layer = document.getElementById(layerId);

    if (!video || !source) {
      return;
    }

    function start() {
      attachSource(video, source);

      if (layer) {
        layer.classList.add("hidden");
      }

      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    if (layer) {
      layer.addEventListener("click", start);
    }

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("hidden");
      }
    });
  };
})();
