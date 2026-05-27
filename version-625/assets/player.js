(function () {
  function startPlayer(panel) {
    var video = panel.querySelector('video');
    var cover = panel.querySelector('[data-play]');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-video');
    if (!url) {
      return;
    }
    if (cover) {
      cover.classList.add('hidden');
    }
    if (video.dataset.ready !== '1') {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video.dataset.ready = '1';
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.dataset.ready = '1';
      } else {
        video.src = url;
        video.dataset.ready = '1';
      }
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  panels.forEach(function (panel) {
    var cover = panel.querySelector('[data-play]');
    var video = panel.querySelector('video');
    if (cover) {
      cover.addEventListener('click', function () {
        startPlayer(panel);
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        startPlayer(panel);
      }, { once: true });
    }
  });
})();
