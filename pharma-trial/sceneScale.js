// wwwroot/sceneScale.js
window.setSceneScale = v => document.documentElement.style.setProperty("--scene-scale", String(v));
window.setSceneOffsetY = v => document.documentElement.style.setProperty("--scene-offset-y", `${v}px`);

// Auto-hide controls after 3s idle; show on activity
(function () {
    const el = document.querySelector(".scale-controls");
    if (!el) return;
    let t; const show = () => { el.classList.remove("is-idle"); clearTimeout(t); t = setTimeout(() => el.classList.add("is-idle"), 3000); };
    ["mousemove", "touchstart", "keydown", "focusin"].forEach(ev => addEventListener(ev, show, { passive: true }));
    show();
})();

