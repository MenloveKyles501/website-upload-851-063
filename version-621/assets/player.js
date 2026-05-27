(function() {
  function startPlayer(frame) {
    var video = frame.querySelector("video");
    var cover = frame.querySelector(".play-cover");
    var streamUrl = frame.getAttribute("data-stream");
    var started = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function play() {
      if (started) {
        video.play().catch(function() {});
        return;
      }

      started = true;

      if (cover) {
        cover.hidden = true;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.play().catch(function() {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          maxBufferLength: 30
        });

        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
        return;
      }

      video.src = streamUrl;
      video.play().catch(function() {});
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function() {
      if (!started) {
        play();
      }
    });

    video.addEventListener("error", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    document.querySelectorAll(".player-frame[data-stream]").forEach(startPlayer);
  });
})();
