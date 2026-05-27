(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function(character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function openSearch() {
    var panel = document.querySelector("[data-search-panel]");
    if (!panel) {
      return;
    }
    panel.classList.add("is-open");
    var input = panel.querySelector("[data-global-search]");
    if (input) {
      input.focus();
    }
  }

  function closeSearch() {
    var panel = document.querySelector("[data-search-panel]");
    if (panel) {
      panel.classList.remove("is-open");
    }
  }

  function renderSearchResults(query) {
    var results = document.querySelector("[data-search-results]");
    if (!results) {
      return;
    }
    var q = normalize(query);
    if (!q) {
      results.innerHTML = "";
      return;
    }
    var data = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
    var matches = data.filter(function(item) {
      return normalize(item.text).indexOf(q) !== -1;
    }).slice(0, 14);

    if (!matches.length) {
      results.innerHTML = '<p class="empty-search">没有找到相关影片</p>';
      return;
    }

    results.innerHTML = matches.map(function(item) {
      return [
        '<a class="search-result-item" href="' + escapeHtml(item.url) + '">',
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">',
        '<span>',
        '<strong>' + escapeHtml(item.title) + '</strong>',
        '<span>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</span>',
        '</span>',
        '</a>'
      ].join("");
    }).join("");
  }

  function setupHero() {
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

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var select = document.querySelector("[data-local-sort]");
    var grid = document.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function applyFilter() {
      var q = normalize(input ? input.value : "");
      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre")
        ].join(" "));
        card.classList.toggle("is-filtered-out", q && haystack.indexOf(q) === -1);
      });
    }

    function applySort() {
      if (!select) {
        return;
      }
      var value = select.value;
      var sorted = cards.slice();
      if (value === "year-desc") {
        sorted.sort(function(a, b) {
          var ay = parseInt(a.getAttribute("data-year"), 10) || 0;
          var by = parseInt(b.getAttribute("data-year"), 10) || 0;
          return by - ay;
        });
      }
      if (value === "title-asc") {
        sorted.sort(function(a, b) {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        });
      }
      if (value === "default") {
        sorted = cards.slice();
      }
      sorted.forEach(function(card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (select) {
      select.addEventListener("change", applySort);
    }
  }

  function setupQuickSearch() {
    var form = document.querySelector("[data-quick-search]");
    if (!form) {
      return;
    }
    var input = form.querySelector("[data-page-search-input]");
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      openSearch();
      var globalInput = document.querySelector("[data-global-search]");
      if (globalInput && input) {
        globalInput.value = input.value;
        renderSearchResults(input.value);
      }
    });
    if (input) {
      input.addEventListener("focus", function() {
        openSearch();
      });
      input.addEventListener("input", function() {
        var globalInput = document.querySelector("[data-global-search]");
        if (globalInput) {
          globalInput.value = input.value;
          renderSearchResults(input.value);
        }
      });
    }
  }

  function setupHeader() {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function() {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-open]").forEach(function(button) {
      button.addEventListener("click", openSearch);
    });

    document.querySelectorAll("[data-search-close]").forEach(function(button) {
      button.addEventListener("click", closeSearch);
    });

    var panel = document.querySelector("[data-search-panel]");
    if (panel) {
      panel.addEventListener("click", function(event) {
        if (event.target === panel) {
          closeSearch();
        }
      });
    }

    var input = document.querySelector("[data-global-search]");
    if (input) {
      input.addEventListener("input", function() {
        renderSearchResults(input.value);
      });
    }

    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape") {
        closeSearch();
      }
    });
  }

  ready(function() {
    setupHeader();
    setupHero();
    setupLocalFilter();
    setupQuickSearch();
  });
})();
