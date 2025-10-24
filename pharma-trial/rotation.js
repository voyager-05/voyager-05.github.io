export function attachTwoFingerRotate(svgEl, dotNetRef) {
    const pointers = new Map();
    let prevAngle = null;

    const angleBetween = (a, b) =>
        Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI;

    function onPointerDown(e) {
        svgEl.setPointerCapture?.(e.pointerId);
        pointers.set(e.pointerId, e);
        if (pointers.size === 2) {
            const [p1, p2] = [...pointers.values()];
            prevAngle = angleBetween(p1, p2);
        }
    }

    function onPointerMove(e) {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, e);
        if (pointers.size === 2) {
            const [p1, p2] = [...pointers.values()];
            const angle = angleBetween(p1, p2);
            if (prevAngle != null) {
                let delta = angle - prevAngle;
                if (delta > 180) delta -= 360;
                if (delta < -180) delta += 360;

                //This is the call to your .NET method:
                dotNetRef.invokeMethodAsync('RotateBy', delta);
            }
            prevAngle = angle;
        }
    }

    function onPointerUp(e) {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) prevAngle = null;
    }

    svgEl.addEventListener('pointerdown', onPointerDown);
    svgEl.addEventListener('pointermove', onPointerMove);
    svgEl.addEventListener('pointerup', onPointerUp);
    svgEl.addEventListener('pointercancel', onPointerUp);
}
