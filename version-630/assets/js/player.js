(function() {
  window.initMoviePlayer = function(source) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("moviePlayButton");
    var hlsInstance = null;

    if (!video || !button || !source) {
      return;
    }

    function bindSource() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute("data-ready", "1");
    }

    function startPlayback() {
      bindSource();
      button.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function() {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", startPlayback);

    video.addEventListener("click", function() {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function() {
      button.classList.add("is-hidden");
    });

    video.addEventListener("pause", function() {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
