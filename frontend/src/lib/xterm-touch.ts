// Mobile touch-scroll for xterm.js instances.
//
// xterm renders into a canvas, so the browser has no native overflow scroll
// to apply to touch drags — users get single-line stutter scrolling or
// nothing at all. This attaches a custom touch handler with 1:1 finger-to-
// scroll mapping plus momentum-decay on touch end. Taps (no drag) pass
// through untouched so xterm.focus()/keyboard-open still work.
//
// Usage:
//   const detach = attachTouchScroll(xterm, hostElement);
//   // ...
//   detach();   // remove handlers on unmount

import type { Terminal } from "@xterm/xterm";

const DRAG_THRESHOLD_PX = 6;        // finger must move this far before we claim the drag
const MOMENTUM_DECAY = 0.95;        // per-frame velocity multiplier (higher = longer glide)
const MOMENTUM_MIN_VELOCITY = 0.2;  // px/ms — even a gentle lift gets a small glide
const MOMENTUM_STOP = 0.04;         // px/ms below which the momentum loop exits

export function attachTouchScroll(xterm: Terminal, host: HTMLElement): () => void {
  void xterm;
  const getViewport = (): HTMLElement | null =>
    host.querySelector<HTMLElement>(".xterm-viewport");

  let touchStartY = 0;
  let lastMoveY = 0;
  let lastMoveTime = 0;
  let velocity = 0;        // px / ms, positive = finger moving UP (content scrolls DOWN)
  let isDragging = false;
  let momentumRaf: number | null = null;
  let origHostTouchAction = "";
  let origViewportTouchAction = "";

  const cancelMomentum = (): void => {
    if (momentumRaf !== null) {
      cancelAnimationFrame(momentumRaf);
      momentumRaf = null;
    }
  };

  // Drive xterm's own viewport.scrollTop directly so the finger-to-content
  // ratio is a clean 1:1 in pixels — xterm has a scroll listener that
  // reconciles the canvas to wherever scrollTop lands.
  const scrollByPixels = (px: number): void => {
    const vp = getViewport();
    if (!vp) return;
    const next = Math.max(0, Math.min(vp.scrollHeight - vp.clientHeight, vp.scrollTop + px));
    vp.scrollTop = next;
  };

  const onTouchStart = (e: TouchEvent): void => {
    if (e.touches.length !== 1) return;
    cancelMomentum();
    touchStartY = e.touches[0].clientY;
    lastMoveY = touchStartY;
    lastMoveTime = performance.now();
    velocity = 0;
    isDragging = false;
  };

  const onTouchMove = (e: TouchEvent): void => {
    if (e.touches.length !== 1) return;
    const currentY = e.touches[0].clientY;

    // Wait until the finger has moved past the tap/drag threshold before
    // claiming the gesture — keeps tap-to-focus working (so mobile keyboards
    // still open on intentional taps).
    if (!isDragging) {
      if (Math.abs(currentY - touchStartY) < DRAG_THRESHOLD_PX) return;
      isDragging = true;
    }

    // Once we're dragging, preventDefault so the page doesn't scroll and the
    // browser doesn't fire a synthetic click on touchend. stopPropagation
    // keeps xterm's built-in touch handler on the viewport from ALSO
    // scrolling, which was causing every drag tick to double-scroll.
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();

    const deltaY = lastMoveY - currentY;  // +ve finger up → scroll content down
    scrollByPixels(deltaY);

    // Velocity tracked over a short window so a slow drag that ends with a
    // small final nudge doesn't register as "fast flick" for momentum.
    const now = performance.now();
    const dt = now - lastMoveTime;
    if (dt > 0 && dt < 80) {
      velocity = deltaY / dt;
    } else {
      velocity = 0;
    }

    lastMoveY = currentY;
    lastMoveTime = now;
  };

  const onTouchEnd = (): void => {
    if (!isDragging) return;
    if (Math.abs(velocity) < MOMENTUM_MIN_VELOCITY) return;

    let v = velocity;
    const frame = (): void => {
      // Apply this frame's delta (assume ~16ms per frame; we don't need
      // timestamp-accurate physics for a scroll momentum effect).
      scrollByPixels(v * 16);
      v *= MOMENTUM_DECAY;
      if (Math.abs(v) > MOMENTUM_STOP) {
        momentumRaf = requestAnimationFrame(frame);
      } else {
        momentumRaf = null;
      }
    };
    momentumRaf = requestAnimationFrame(frame);
  };

  // Attach on the host in the CAPTURE phase so our handler runs before
  // xterm's bubble-phase handlers on the viewport. Pairing this with
  // stopPropagation in onTouchMove keeps xterm's native touch scroll from
  // running alongside ours.
  // touch-action: none on both host and viewport prevents iOS/Android from
  // claiming the gesture for their own native scroll.
  origHostTouchAction = host.style.touchAction;
  host.style.touchAction = "none";
  host.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  host.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  host.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
  host.addEventListener("touchcancel", cancelMomentum, { passive: true, capture: true });

  // Viewport touch-action is set once xterm mounts it. Retry for a few frames
  // in case xterm.open() hasn't finished yet when attachTouchScroll runs.
  const tagViewport = () => {
    const vp = getViewport();
    if (vp && !vp.dataset.touchTagged) {
      origViewportTouchAction = vp.style.touchAction;
      vp.style.touchAction = "none";
      vp.dataset.touchTagged = "1";
    }
  };
  tagViewport();
  requestAnimationFrame(tagViewport);
  setTimeout(tagViewport, 200);

  return () => {
    cancelMomentum();
    host.style.touchAction = origHostTouchAction;
    const vp = getViewport();
    if (vp) {
      vp.style.touchAction = origViewportTouchAction;
      delete vp.dataset.touchTagged;
    }
    host.removeEventListener("touchstart", onTouchStart, { capture: true });
    host.removeEventListener("touchmove", onTouchMove, { capture: true });
    host.removeEventListener("touchend", onTouchEnd, { capture: true });
    host.removeEventListener("touchcancel", cancelMomentum, { capture: true });
  };
}
