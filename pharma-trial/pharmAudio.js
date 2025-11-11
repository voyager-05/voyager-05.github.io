// wwwroot/pharmAudio.js
window.pharmAudio = {
    setSource: function (url) {
        console.warn("XXXXXXXXXXXXXXXXXXXXX");
        const audio = document.getElementById("pharmAudio");
        if (!audio) {
            console.warn("pharmAudio element not found");
            return;
        }

        console.warn("XXXXXXXXXXXXXXXXXXXXX===" + url);
        if (!url) {
            // Clear and stop
            audio.removeAttribute("src");
            audio.load();
            return;
        }

        // Avoid pointless reloads
        if (audio.src === url) return;

        audio.src = url;
        audio.load();

        // Try to autoplay; user can always click play
        audio.play().catch(err => {
            console.warn("pharmAudio autoplay blocked:", err);
        });
    }
};
