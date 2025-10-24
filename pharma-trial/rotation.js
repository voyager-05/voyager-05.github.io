// Lightweight two-finger rotate. Preserves native pinch-zoom except while rotating.
let active = new WeakMap();


export function attachTwoFingerRotate(svgEl, dotnetRef) {
    if (!svgEl) return;


    const state = { pointers: new Map(), rotating: false, lastAngle: 0 };
    const opts = { passive: false };


    function center() {
        const vb = svgEl.viewBox.baseVal; // 0 0 420 420
        return { x: vb.x + vb.width / 2, y: vb.y + vb.height / 2 };
    }


    function angle(p1, p2) {
        const ctr = center();
        const a1 = Math.atan2(p1.clientY - ctr.y, p1.clientX - ctr.x);
        const a2 = Math.atan2(p2.clientY - ctr.y, p2.clientX - ctr.x);
        return (a2 - a1) * 180 / Math.PI;
    }


    function onPointerDown(e) {
        if (!(e.pointerType === 'touch')) return;
        state.pointers.set(e.pointerId, e);
        if (state.pointers.size === 2) { state.rotating = true; state.lastAngle = getAngle(); svgEl.style.touchAction = 'none'; }
    }


    function onPointerMove(e) {
        if (!(e.pointerType === 'touch')) return;
        if (!state.pointers.has(e.pointerId)) return;
        state.pointers.set(e.pointerId, e);
        if (state.rotating && state.pointers.size === 2) {
            e.preventDefault();
            const a = getAngle();
            const delta = a - state.lastAngle;
            state.lastAngle = a;
            try { dotnetRef.invokeMethodAsync('RotateBy', delta); } catch { }
        }
    }


    function onPointerUp(e) {
        if (!(e.pointerType === 'touch')) return;
        state.pointers.delete(e.pointerId);
        if (state.pointers.size < 2 && state.rotating) {
            state.rotating = false; svgEl.style.touchAction = '';
        }
    }


    function getAngle() {
        const it = state.pointers.values();
        const p1 = it.next().value; const p2 = it.next().value;
        if (!p1 || !p2) return 0;
        return angle(p1, p2);
    }


    svgEl.addEventListener('pointerdown', onPointerDown, opts);
    svgEl.addEventListener('pointermove', onPointerMove, opts);
    window.addEventListener('pointerup', onPointerUp, opts);
    window.addEventListener('pointercancel', onPointerUp, opts);


    active.set(svgEl, { onPointerDown, onPointerMove, onPointerUp });
}