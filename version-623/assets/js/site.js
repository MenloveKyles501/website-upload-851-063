(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(dotIndex);
                play();
            });
        });

        show(0);
        play();
    }

    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        var controls = document.querySelector('[data-filter-controls]') || filterRoot;
        var search = controls.querySelector('[data-search]');
        var selects = Array.prototype.slice.call(controls.querySelectorAll('[data-select]'));
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
        var empty = filterRoot.querySelector('[data-empty]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var query = normalize(search ? search.value : '');
            var values = {};

            selects.forEach(function (select) {
                values[select.getAttribute('data-select')] = normalize(select.value);
            });

            var visible = 0;

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var region = normalize(card.getAttribute('data-region'));
                var type = normalize(card.getAttribute('data-type'));
                var year = normalize(card.getAttribute('data-year'));
                var genre = normalize(card.getAttribute('data-genre'));
                var text = [title, region, type, year, genre].join(' ');
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (values.region && region !== values.region) {
                    matched = false;
                }

                if (values.type && type !== values.type) {
                    matched = false;
                }

                if (values.year && year !== values.year) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        if (search) {
            search.addEventListener('input', applyFilters);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });

        applyFilters();
    }

    var frame = document.querySelector('[data-player-frame]');

    if (frame) {
        var video = frame.querySelector('video');
        var overlay = frame.querySelector('[data-player-overlay]');
        var button = frame.querySelector('[data-player-button]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var started = false;
        var hls = null;

        function startVideo() {
            if (!video || !stream) {
                return;
            }

            if (overlay) {
                overlay.classList.add('hide');
            }

            if (started) {
                video.play();
                return;
            }

            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.addEventListener('loadedmetadata', function () {
                    video.play();
                }, { once: true });
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                return;
            }

            video.src = stream;
            video.play();
        }

        if (button) {
            button.addEventListener('click', startVideo);
        }

        if (overlay) {
            overlay.addEventListener('click', startVideo);
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hide');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
})();
