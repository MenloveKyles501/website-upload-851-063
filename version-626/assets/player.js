(function () {
  const video = document.getElementById('movie-player');
  const overlay = document.querySelector('.play-overlay');
  const configElement = document.getElementById('video-config');
  if (!video || !configElement) return;

  let config = {};
  try {
    config = JSON.parse(configElement.textContent || '{}');
  } catch (error) {
    config = {};
  }

  const stream = config.src || '';
  let ready = false;
  let hlsInstance = null;

  function attachStream() {
    if (ready || !stream) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      ready = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      ready = true;
      return;
    }
    video.src = stream;
    ready = true;
  }

  function startPlayback() {
    attachStream();
    if (overlay) overlay.classList.add('is-hidden');
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (!ready && video.paused) startPlayback();
  });

  video.addEventListener('play', function () {
    if (overlay) overlay.classList.add('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) hlsInstance.destroy();
  });
})();
