import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";

export type TourPlacement = "top" | "right" | "bottom" | "left" | "auto";

export interface TourStep {
  selector: string;
  title?: string;
  content: React.ReactNode;
  placement?: TourPlacement;
  highlightPadding?: number;
  onEnter?: (target: HTMLElement) => void;
  onExit?: (target: HTMLElement) => void;
}

interface GuidedTourProps {
  steps: TourStep[];
  onceKey?: string;
  startImmediately?: boolean; // default: true (auto-lanza si no está en cache)
}

// ✨ handle público que podrá usar el botón lanzador
export type GuidedTourHandle = {
  start: (fromIndex?: number) => void;
  stop: () => void;
  reset: () => void;
};

const useIsoLayout =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  handler: (ev: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    window.addEventListener(type, handler, options);
    return () => window.removeEventListener(type, handler, options);
  }, [type, handler, options]);
}

function positionTooltip(target: DOMRect, tip: DOMRect, placement: TourPlacement) {
  const m = 12;
  let top = 0, left = 0;
  const p = placement === "auto" || !placement ? "bottom" : placement;

  if (p === "bottom") {
    top = target.bottom + m;
    left = target.left + Math.max(0, target.width / 2 - tip.width / 2);
  } else if (p === "top") {
    top = target.top - tip.height - m;
    left = target.left + Math.max(0, target.width / 2 - tip.width / 2);
  } else if (p === "left") {
    top = target.top + Math.max(0, target.height / 2 - tip.height / 2);
    left = target.left - tip.width - m;
  } else if (p === "right") {
    top = target.top + Math.max(0, target.height / 2 - tip.height / 2);
    left = target.right + m;
  }
  top = Math.max(8, Math.min(top, window.innerHeight - tip.height - 8));
  left = Math.max(8, Math.min(left, window.innerWidth - tip.width - 8));
  return { top, left };
}

const STYLE_ID = "guided-tour-styles";
function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
@keyframes tourPulse { 
  0%{ box-shadow:0 0 0 0 rgba(17,17,17,.35) } 
  70%{ box-shadow:0 0 0 12px rgba(17,17,17,0) } 
  100%{ box-shadow:0 0 0 0 rgba(17,17,17,0) } 
}
.tour-pulse { animation: tourPulse 1.2s ease-in-out infinite; outline: 2px solid #111; border-radius: 8px; }
.tour-focus-ring { outline: 2px solid #111 !important; border-radius: 8px; }
@keyframes tourTipPop { 
  from{ opacity:0; transform: scale(.98) } 
  to{ opacity:1; transform: scale(1) } 
}
.tour-tip { animation: tourTipPop .18s ease-out; }
.tour-focus-ring { outline: 2px solid #111 !important; border-radius: 8px; }
`;
  document.head.appendChild(style);
}

function scrollIntoViewIfNeeded(el: HTMLElement) {
  try { el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" }); } catch {}
}

// 👇 IMPLEMENTACIÓN correcta con forwardRef
function GuidedTourIslandImpl(
  { steps, onceKey, startImmediately = true }: GuidedTourProps,
  ref: React.Ref<GuidedTourHandle>
) {
  ensureStyles();

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [tipPos, setTipPos] = useState<{ top: number; left: number } | null>(null);

  const current = steps[index];
  const targetElRef = useRef<HTMLElement | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      start: (fromIndex = 0) => { setIndex(fromIndex); setActive(true); },
      stop: () => { setActive(false); },
      reset: () => {
        try { if (onceKey) localStorage.removeItem(onceKey); } catch {}
        setIndex(0);
      },
    }),
    [onceKey]
  );

  // Auto-lanzar solo si no está en cache
  useIsoLayout(() => {
    if (!startImmediately) return;
    if (!steps.length) return;
    if (onceKey && localStorage.getItem(onceKey) === "done") return;

    let cancelled = false;
    const sel = steps[0]?.selector;
    if (!sel) return;

    const waitForFirst = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(sel);
      if (el) setActive(true);
      else setTimeout(waitForFirst, 100);
    };

    waitForFirst();
    return () => { cancelled = true; };
  }, [startImmediately, steps, onceKey]);

  useIsoLayout(() => {
    if (!active || !current) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const tryAttach = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(current.selector);
      if (!el) { setTimeout(tryAttach, 100); return; }

      targetElRef.current = el;
      scrollIntoViewIfNeeded(el);
      current.onEnter?.(el);

      const update = () => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        if (tipRef.current) {
          const tipRect = tipRef.current.getBoundingClientRect();
          setTipPos(positionTooltip(rect, tipRect, current.placement || "auto"));
        }
      };

      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      const t = setTimeout(update, 0);

      cleanup = () => {
        clearTimeout(t);
        ro.disconnect();
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
        current.onExit?.(el);
      };
    };

    tryAttach();
    return () => { cancelled = true; cleanup?.(); };
  }, [active, index, current]);

  useIsoLayout(() => {
    if (!active || !current || !targetRect || !tipRef.current) return;
    const tipRect = tipRef.current.getBoundingClientRect();
    setTipPos(positionTooltip(targetRect, tipRect, current.placement || "auto"));
  }, [active, current, targetRect]);

  useWindowEvent("keydown", (e) => {
    if (!active) return;
    if (e.key === "Escape") endTour();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  const endTour = () => {
    setActive(false);
    if (onceKey) localStorage.setItem(onceKey, "done");
  };
  const next = () =>
    setIndex((i) => {
      if (i >= steps.length - 1) { endTour(); return i; }
      return i + 1;
    });
  const prev = () => setIndex((i) => Math.max(0, i - 1));

  if (typeof document === "undefined") return null;
  if (!active || !current) return null;

  const pad = current.highlightPadding ?? 8;
  const holeStyle =
    targetRect && active
      ? {
          position: "fixed" as const,
          top: Math.max(0, targetRect.top - pad),
          left: Math.max(0, targetRect.left - pad),
          width: Math.min(targetRect.width + pad * 2, window.innerWidth - Math.max(0, targetRect.left - pad)),
          height: Math.min(targetRect.height + pad * 2, window.innerHeight - Math.max(0, targetRect.top - pad)),
          borderRadius: 8,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.9)",
          pointerEvents: "none" as const,
          zIndex: 100000,
        }
      : { display: "none" };

  const tooltipStyle = tipPos
    ? {
        position: "fixed" as const,
        top: tipPos.top,
        left: tipPos.left,
        maxWidth: "360px",
        background: "white",
        color: "#111",
        borderRadius: 10,
        padding: "14px 14px 10px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.5) inset",
        zIndex: 100001,
      }
    : { display: "none" };

  const scrimStyle = { position: "fixed" as const, inset: 0, zIndex: 99999, background: "transparent" };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#f7f7f7", cursor: "pointer",
  };
  const primaryBtn: React.CSSProperties = { ...buttonStyle, background: "#111", color: "#fff", border: "1px solid #111" };

  const tourUI = (
    <div aria-live="polite" aria-label="Tutorial">
      <div style={scrimStyle} onClick={endTour} />
      <div style={holeStyle} aria-hidden="true" />
      <div ref={tipRef} role="dialog" aria-modal="true" style={tooltipStyle} className="tour-tip">
        {current.title && <div style={{ fontWeight: 700, marginBottom: 8 }}>{current.title}</div>}
        <div style={{ marginBottom: 10, lineHeight: 1.4 }}>{current.content}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Paso {index + 1} de {steps.length}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={buttonStyle} onClick={endTour}>Omitir</button>
            <button style={buttonStyle} onClick={prev} disabled={index === 0}>Anterior</button>
            <button style={primaryBtn} onClick={next}>{index === steps.length - 1 ? "Finalizar" : "Siguiente"}</button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(tourUI, document.body);
}

export default forwardRef<GuidedTourHandle, GuidedTourProps>(GuidedTourIslandImpl);