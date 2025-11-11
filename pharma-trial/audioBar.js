// wwwroot/audioBar.js
window.audioBar = (function () {
    let audio = new Audio();
    let els = {};

    function fmtTime(sec) {
        if (!sec || !isFinite(sec)) return "0:00";
        sec = Math.floor(sec);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return m + ":" + (s < 10 ? "0" + s : s);
    }

    // Wire DOM elements *every time* we call init
    function init(ids) {
        els.play = document.getElementById(ids.play);
        els.pause = document.getElementById(ids.pause);
        els.seek = document.getElementById(ids.seek);
        els.cur = document.getElementById(ids.cur);
        els.dur = document.getElementById(ids.dur);

        if (!els.play || !els.pause || !els.seek || !els.cur || !els.dur) {
            console.warn("audioBar: missing one or more elements");
            return;
        }

        // Use .onclick / .oninput so re-init overwrites old handlers
        els.play.onclick = () => audio.play();
        els.pause.onclick = () => audio.pause();

        // Slider → audio
        els.seek.oninput = () => {
            if (!audio.duration || !isFinite(audio.duration)) return;
            const max = parseFloat(els.seek.max || "1000");
            const val = parseFloat(els.seek.value || "0");
            const frac = Math.min(Math.max(val / max, 0), 1);
            audio.currentTime = frac * audio.duration;
        };
    }

    // Audio → slider + labels (these stay on the Audio object forever)
    audio.addEventListener("timeupdate", () => {
        if (!audio.duration || !isFinite(audio.duration)) return;
        if (!els.seek || !els.cur || !els.dur) return; // elements might not exist yet

        const max = parseFloat(els.seek.max || "1000");
        const frac = audio.currentTime / audio.duration;
        els.seek.value = Math.round(frac * max);
        els.cur.textContent = fmtTime(audio.currentTime);
        els.dur.textContent = fmtTime(audio.duration);
    });

    audio.addEventListener("loadedmetadata", () => {
        if (!els.dur) return;
        els.dur.textContent = fmtTime(audio.duration);
    });

    function playUrl(url) {
        // Always re-bind to the *current* controls
        init({ play: "abPlay", pause: "abPause", seek: "abSeek", cur: "abCur", dur: "abDur" });

        if (!url) return;

        if (audio.src !== url) {
            audio.src = url;
        }

    //    audio.play().catch(err => {
    //        console.warn("audioBar.playUrl error:", err);
    //    });
    }

    function stop() {
        audio.pause();
        audio.currentTime = 0;
    }

    return { init, playUrl, stop };
})();
