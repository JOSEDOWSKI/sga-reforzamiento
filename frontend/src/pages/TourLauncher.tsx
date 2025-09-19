// components/TourLauncher.tsx
import React, { useState, useEffect, useRef } from "react";
import "../components/Tourlauncher.css";

type Phase = "dashboard" | "cursos" | "profesores" | "temas" | "estadisticas";
const CMD_KEY = "__tour_cmd_v1";
const MASTER_ONCE = "tour_master_once_v1";

type Props = {
  floating?: boolean;
  title?: string;
  phase?: Phase;
  forceReset?: boolean;
  showBadge?: boolean;
};


type Cmd = { phase: Phase; forceReset: boolean; nonce: number };
declare global {
  interface Window {
    __tourOrchestrator?: {
      start: (cmd: Cmd) => void;
      reset?: () => void;
    };
  }
}

const IconBase: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    role="img"
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  />
);

const HatIcon = () => (
  <IconBase>
    {/* ala del gorro */}
    <path d="M2 9l10-5 10 5-10 5-10-5z" />
    {/* copa y soporte */}
    <path d="M6 11v4.5c0 1.9 3.6 3.5 6 3.5s6-1.6 6-3.5V11" />
    {/* borla */}
    <path d="M20 9v4" />
  </IconBase>
);

const CheckIcon = () => (
  <IconBase>
    <path d="M4 12l5 5L20 6" />
  </IconBase>
);

export default function TourLauncher({
  floating = false,
  title = "Mostrar tutorial",
  phase = "dashboard",
  forceReset = true,
  showBadge = true,
}: Props) {
  const [done, setDone] = useState<boolean>(() => {
    try { return localStorage.getItem(MASTER_ONCE) === "done"; } catch { return false; }
  });
  const timersRef = useRef<number[]>([]);
  const mountedRef = useRef<boolean>(false);

  useEffect(() => {
    mountedRef.current = true;
    const onStorage = (e: StorageEvent) => {
      if (e.key === MASTER_ONCE) setDone(e.newValue === "done");
    };
    const syncNow = () => setDone(localStorage.getItem(MASTER_ONCE) === "done");
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncNow);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncNow);
      // Limpia reintentos pendientes
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  function tryStartNow(cmd: Cmd): boolean {
    if (window.__tourOrchestrator && typeof window.__tourOrchestrator.start === "function") {
      try {
        window.__tourOrchestrator.start(cmd);
        return true;
      } catch {
        // si el start falla, seguimos con fallback
      }
    }
    return false;
  }

  function dispatchFallback(cmd: Cmd) {
    try { localStorage.setItem(CMD_KEY, JSON.stringify(cmd)); } catch {}
    window.dispatchEvent(new CustomEvent("tour:relaunch", { detail: cmd }));
  }

  function scheduleRetries(cmd: Cmd, attempts = 12, delayMs = 150) {
    let i = 0;
    const tick = () => {
      if (!mountedRef.current) return;
      if (tryStartNow(cmd)) return; // en cuanto aparezca, lanzamos
      if (++i < attempts) {
        const t = window.setTimeout(tick, delayMs);
        timersRef.current.push(t);
      }
    };
    const t0 = window.setTimeout(tick, delayMs);
    timersRef.current.push(t0);
  }

  const onClick = () => {
    const cmd: Cmd = { phase, forceReset: !!forceReset, nonce: Date.now() };

    // 1) Intento inmediato (sin refrescar)
    const started = tryStartNow(cmd);

    // 2) Fallback robusto: persistencia + evento
    if (!started) {
      dispatchFallback(cmd);
      scheduleRetries(cmd); // reintenta por si el orquestador entra unos ms después
    }
  };

  const classes = [
    "tour-launcher__button",
    done && "tour-launcher__button--done",
    floating && "tour-launcher__button--floating",
  ].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      title={title}
      aria-label={done ? "Reiniciar tutorial" : "Mostrar tutorial"}
      aria-pressed="false"
      data-tour-done={done ? "1" : "0"}
    >
      {done ? <CheckIcon /> : <HatIcon />}
      {!done && showBadge && <span className="tour-launcher__badge" aria-hidden="true" />}
    </button>
  );
}
