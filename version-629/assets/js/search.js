(function () {
  var form = document.querySelector('[data-search-form]');
  var results = document.querySelector('[data-search-results]');
  var note = document.querySelector('[data-result-note]');
  if (!form || !results || !Array.isArray(movieCatalog)) {
    return;
  }

  var params = new URLSearchParams(location.search);
  ['q', 'type', 'region', 'year', 'genre'].forEach(function (key) {
    var field = form.elements[key];
    if (field && params.has(key)) {
      field.value = params.get(key);
    }
  });

  function text(value) {
    return String(value || '').toLowerCase();
  }

  function matches(item, query) {
    var words = [item.title, item.regionText, item.typeText, item.genre, item.oneLine].concat(item.tags || []).concat(item.genres || []);
    return words.join(' ').toLowerCase().indexOf(query) !== -1;
  }

  function createTagRow(tags) {
    var row = document.createElement('div');
    row.className = 'tag-row';
    (tags || []).slice(0, 4).forEach(function (tag) {
      var span = document.createElement('span');
      span.textContent = tag;
      row.appendChild(span);
    });
    return row;
  }

  function createCard(item) {
    var article = document.createElement('article');
    article.className = 'movie-card';

    var cover = document.createElement('a');
    cover.className = 'movie-card__cover';
    cover.href = item.url;

    var image = document.createElement('img');
    image.className = 'poster-img';
    image.src = item.poster;
    image.alt = item.title;
    image.loading = 'lazy';
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
      image.removeAttribute('src');
    }, { once: true });
    cover.appendChild(image);

    var play = document.createElement('span');
    play.className = 'movie-card__play';
    cover.appendChild(play);

    var body = document.createElement('div');
    body.className = 'movie-card__body';

    var heading = document.createElement('h2');
    var link = document.createElement('a');
    link.href = item.url;
    link.textContent = item.title;
    heading.appendChild(link);

    var meta = document.createElement('p');
    meta.className = 'movie-card__meta';
    meta.textContent = [item.yearText, item.regionText, item.typeText].filter(Boolean).join(' · ');

    var desc = document.createElement('p');
    desc.className = 'movie-card__desc';
    desc.textContent = item.oneLine || item.genre || '';

    body.appendChild(heading);
    body.appendChild(meta);
    body.appendChild(desc);
    body.appendChild(createTagRow(item.tags && item.tags.length ? item.tags : item.genres));

    article.appendChild(cover);
    article.appendChild(body);
    return article;
  }

  function render() {
    var q = text(form.elements.q.value).trim();
    var type = form.elements.type.value;
    var region = form.elements.region.value;
    var year = form.elements.year.value;
    var genre = form.elements.genre.value;

    var filtered = movieCatalog.filter(function (item) {
      if (q && !matches(item, q)) {
        return false;
      }
      if (type && item.type !== type) {
        return false;
      }
      if (region && item.region !== region) {
        return false;
      }
      if (year && item.year !== year) {
        return false;
      }
      if (genre && (item.genres || []).indexOf(genre) === -1) {
        return false;
      }
      return true;
    }).slice(0, 120);

    results.innerHTML = '';
    filtered.forEach(function (item) {
      results.appendChild(createCard(item));
    });
    note.textContent = filtered.length ? '已匹配到相关影片，点击卡片进入详情页。' : '暂无匹配内容，可调整关键词或筛选条件。';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render();
  });
  form.addEventListener('input', render);
  render();
})();
