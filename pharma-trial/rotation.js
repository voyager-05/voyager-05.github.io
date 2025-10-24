// wwwroot/rotation.js
export function attachTwoFingerRotate(svgEl, dotNetRef){
  const pointers = new Map();

  let prevAngle = null;

  function angleBetween(p1, p2){
    const dx = p2.clientX - p1.clientX;
    const dy = p2.clientY - p1.clientY;
    return Math.atan2(dy, dx) * 180 / Math.PI; // degrees
  }

  function onPointerDown(e){
    svgEl.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, e);
    if(pointers.size === 2){
      const [a,b] = [...pointers.values()];
      prevAngle = angleBetween(a,b);
    }
  }

  function onPointerMove(e){
    if(!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, e);

    if(pointers.size === 2){
      const [a,b] = [...pointers.values()];
      const ang = angleBetween(a,b);
      if(prevAngle != null){
        let delta = ang - prevAngle;
        // normalize to (-180,180] to avoid big jumps
        if (delta > 180) delta -= 360;
        if (delta <= -180) delta += 360;
        // call into .NET
        dotNetRef.invokeMethodAsync('RotateBy', delta);
      }
      prevAngle = ang;
    }
  }

  function onPointerUpOrCancel(e){
    pointers.delete(e.pointerId);
    if(pointers.size < 2) prevAngle = null;
  }

  // Use pointer events (works for touch + pen + mouse)
  svgEl.addEventListener('pointerdown', onPointerDown);
  svgEl.addEventListener('pointermove', onPointerMove);
  svgEl.addEventListener('pointerup', onPointerUpOrCancel);
  svgEl.addEventListener('pointercancel', onPointerUpOrCancel);
}
