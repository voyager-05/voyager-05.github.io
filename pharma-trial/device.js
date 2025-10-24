export function getDeviceInfo() {
    return {
        touch: matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window,
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio || 1
    };
}
