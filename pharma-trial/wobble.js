export function randomWobble(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.transformOrigin = "center bottom";
    setInterval(() => {
        const deg = (Math.random() * 5) - 2.5; // -10° to +10°
        el.animate([{ transform: `rotate(${deg}deg)` }], {
            duration: 800,
            easing: "ease-in-out",
            fill: "forwards"
        });
    }, 900);
}
