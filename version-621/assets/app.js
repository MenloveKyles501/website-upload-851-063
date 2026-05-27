(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function() {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function() {
        mobilePanel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function(form) {
      form.addEventListener("submit", function(event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }

        var value = input.value.trim();
        if (!value) {
          return;
        }

        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(value);
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var title = hero.querySelector("[data-hero-title]");
      var desc = hero.querySelector("[data-hero-desc]");
      var cta = hero.querySelector("[data-hero-link]");
      var sideImage = hero.querySelector("[data-hero-side-image]");
      var sideTitle = hero.querySelector("[data-hero-side-title]");
      var sideDesc = hero.querySelector("[data-hero-side-desc]");
      var tagBox = hero.querySelector("[data-hero-tags]");
      var active = 0;
      var timer = null;

      function setTags(tags) {
        if (!tagBox) {
          return;
        }

        tagBox.innerHTML = "";
        tags.split("|").filter(Boolean).slice(0, 5).forEach(function(tag) {
          var span = document.createElement("span");
          span.textContent = tag;
          tagBox.appendChild(span);
        });
      }

      function show(index) {
        if (!slides.length) {
          return;
        }

        active = (index + slides.length) % slides.length;

        slides.forEach(function(slide, i) {
          slide.classList.toggle("is-active", i === active);
        });

        dots.forEach(function(dot, i) {
          dot.classList.toggle("is-active", i === active);
        });

        var slide = slides[active];

        if (title) {
          title.textContent = slide.getAttribute("data-title") || "";
        }

        if (desc) {
          desc.textContent = slide.getAttribute("data-desc") || "";
        }

        if (cta) {
          cta.href = slide.getAttribute("data-url") || "./search.html";
        }

        if (sideImage) {
          sideImage.src = slide.getAttribute("data-image") || "";
          sideImage.alt = slide.getAttribute("data-title") || "";
        }

        if (sideTitle) {
          sideTitle.textContent = slide.getAttribute("data-title") || "";
        }

        if (sideDesc) {
          sideDesc.textContent = slide.getAttribute("data-desc") || "";
        }

        setTags(slide.getAttribute("data-tags") || "");
      }

      function start() {
        stop();
        timer = window.setInterval(function() {
          show(active + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
          show(index);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-movie-card]"));
      var keywordInput = filterRoot.querySelector("[data-filter-keyword]");
      var genreSelect = filterRoot.querySelector("[data-filter-genre]");
      var regionSelect = filterRoot.querySelector("[data-filter-region]");
      var resetButton = filterRoot.querySelector("[data-filter-reset]");
      var emptyState = filterRoot.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");

      if (initialQuery && keywordInput) {
        keywordInput.value = initialQuery;
      }

      function matchCard(card) {
        var keyword = normalize(keywordInput ? keywordInput.value : "");
        var genre = normalize(genreSelect ? genreSelect.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category")
        ].join(" "));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var cardRegion = normalize(card.getAttribute("data-region"));

        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }

        if (genre && cardGenre.indexOf(genre) === -1) {
          return false;
        }

        if (region && cardRegion.indexOf(region) === -1) {
          return false;
        }

        return true;
      }

      function applyFilter() {
        var visible = 0;

        cards.forEach(function(card) {
          var matched = matchCard(card);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      [keywordInput, genreSelect, regionSelect].forEach(function(input) {
        if (input) {
          input.addEventListener("input", applyFilter);
          input.addEventListener("change", applyFilter);
        }
      });

      if (resetButton) {
        resetButton.addEventListener("click", function() {
          if (keywordInput) {
            keywordInput.value = "";
          }

          if (genreSelect) {
            genreSelect.value = "";
          }

          if (regionSelect) {
            regionSelect.value = "";
          }

          applyFilter();
        });
      }

      applyFilter();
    }
  });
})();
