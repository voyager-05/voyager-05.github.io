export function getDeviceInfo() {
    return {
        touch: matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window,
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio || 1
    };
}

export function getRect(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
}
