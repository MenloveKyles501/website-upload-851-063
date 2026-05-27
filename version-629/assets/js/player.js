(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('[data-movie-player]');
    var button = shell.querySelector('[data-player-start]');
    if (!video) {
      return;
    }

    var source = video.querySelector('source');
    var stream = source ? source.getAttribute('src') : video.getAttribute('src');
    if (stream && window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else if (stream && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    }

    function start() {
      var playPromise = video.play();
      shell.classList.add('is-playing');
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });
  }

  document.querySelectorAll('[data-player-shell]').forEach(setupPlayer);
})();
