// tour/TourOrchestrator.tsx
import React from "react";
import GuidedTourIsland, { TourStep } from "./GuidedTourIsland";

type Phase =
  | "dashboard"
  | "servicios"
  | "staff"
  | "categorias"
  | "estadisticas"
  | "done"
  | null;

const PHASE_KEY   = "tour_phase_v1";
const MASTER_ONCE = "tour_master_once_v1";

// onceKeys por sección
const ONCE_KEYS = [
  "tour_dashboard_v1",
  "tour_servicios_v1",
  "tour_staff_v1",
  "tour_categorias_v1",
  "tour_estadisticas_v1",
];

// comando persistente para relanzar sin refrescar
const CMD_KEY = "__tour_cmd_v1";
type Cmd = { phase?: Phase; forceReset?: boolean; nonce?: number | string };

function navigateTo(path: string) {
  const map: Record<string, string> = {
    "/": "#nav-dashboard",
    "/servicios": "#nav-servicios",
    "/staff": "#nav-staff",
    "/categorias": "#nav-categorias",
    "/estadisticas": "#nav-estadisticas",
  };
  const sel = map[path];
  const a = sel ? document.querySelector<HTMLAnchorElement>(sel) : null;
  if (a) a.click(); else window.location.href = path;
}

function phaseToPath(phase: Phase) {
  if (phase === "dashboard") return "/";
  if (phase === "servicios") return "/servicios";
  if (phase === "staff") return "/staff";
  if (phase === "categorias") return "/categorias";
  if (phase === "estadisticas") return "/estadisticas";
  return "/";
}

function focusAndPulse(el?: HTMLElement | null) {
  if (!el) return;
  try { el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" }); } catch {}
  el.classList.add("tour-pulse");
  (el as HTMLElement).focus?.({ preventScroll: true });
  setTimeout(() => el.classList.remove("tour-pulse"), 1000);
}

function setSelectFirst(id: string) {
  const el = document.getElementById(id) as HTMLSelectElement | null;
  if (!el) return;
  el.selectedIndex = Math.min(1, el.options.length - 1);
  el.dispatchEvent(new Event("change", { bubbles: true }));
  focusAndPulse(el);
}

function setInputValue(id: string, value: string) {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (!el) return;
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  focusAndPulse(el);
}

// espera hasta que una condición sea true o se cumpla el timeout
function waitUntil(cond: () => boolean, cb: () => void, timeout = 2000, poll = 100) {
  const t0 = Date.now();
  const tick = () => {
    if (cond()) return cb();
    if (Date.now() - t0 > timeout) return;
    setTimeout(tick, poll);
  };
  tick();
}

export default function TourOrchestrator() {
  const [phase, setPhase] = React.useState<Phase>(null);
  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  // Arranque normal: auto-lanza en "/" solo si nunca se completó y no hay fase guardada
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const once  = localStorage.getItem(MASTER_ONCE) === "done";
    const saved = (localStorage.getItem(PHASE_KEY) as Phase) || null;

    if (!once && path === "/" && !saved) {
      localStorage.setItem(PHASE_KEY, "dashboard");
      setPhase("dashboard");
      return;
    }
    setPhase(saved);
  }, [path]);

  // Factoriza el procesamiento del comando (evento o localStorage)
  const processCommand = React.useCallback((detail: Cmd) => {
    const nextPhase: Phase = detail.phase ?? "dashboard";
    const forceReset = detail.forceReset !== false; // default: true

    if (forceReset) {
      try {
        localStorage.removeItem(MASTER_ONCE);
        ONCE_KEYS.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }

    localStorage.setItem(PHASE_KEY, nextPhase);
    setPhase(nextPhase);

    const nextPath = phaseToPath(nextPhase);
    if (window.location.pathname !== nextPath) navigateTo(nextPath);
  }, []);

  // Listener de evento inmediato
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent<Cmd>).detail || {};
      processCommand(detail);
    };
    window.addEventListener("tour:relaunch", handler as EventListener);
    return () => window.removeEventListener("tour:relaunch", handler as EventListener);
  }, [processCommand]);

  // Marca ready + consume comando pendiente + escucha cambios cross-tab
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    (window as any).__tourReady = true;
    window.dispatchEvent(new Event("tour:ready"));

    // consume comando si fue escrito antes de montar
    try {
      const raw = localStorage.getItem(CMD_KEY);
      if (raw) {
        const cmd = JSON.parse(raw) as Cmd;
        processCommand(cmd);
        localStorage.removeItem(CMD_KEY);
      }
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === CMD_KEY && e.newValue) {
        try {
          const cmd = JSON.parse(e.newValue) as Cmd;
          processCommand(cmd);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [processCommand]);

  // ---------------- STEPS: DASHBOARD ----------------
  const dashSteps: TourStep[] = React.useMemo(
    () => [
      {
        selector: "#filter-curso-btn",
        title: "¡Bienvenid@!",
        content: <>Primero, abre el filtro de <b>cursos</b>. Te mostraré cómo elegir uno.</>,
        placement: "bottom",
        onEnter: (btn: HTMLElement) => {
          btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          setTimeout(() => {
            const options = Array.from(
              document.querySelectorAll<HTMLButtonElement>(
                "#filter-curso-btn + .dropdown-menu .dropdown-item"
              )
            );
            const pick =
              options.find((o) => o.textContent?.trim() !== "Todos los cursos") || options[0];
            focusAndPulse(pick);
            setTimeout(() => pick?.click(), 650);
          }, 250);
        },
      },
      {
        selector: "#filter-profesor-btn",
        title: "Filtro por profesor",
        content: <>Ahora abrimos el filtro de <b>profesor</b> y elegimos uno.</>,
        placement: "bottom",
        onEnter: (btn: HTMLElement) => {
          btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          setTimeout(() => {
            const options = Array.from(
              document.querySelectorAll<HTMLButtonElement>(
                "#filter-profesor-btn + .dropdown-menu .dropdown-item"
              )
            );
            const pick =
              options.find((o) => o.textContent?.trim() !== "Todos los profesores") || options[0];
            focusAndPulse(pick);
            setTimeout(() => pick?.click(), 650);
          }, 250);
        },
      },
      {
        selector: "#dashboard-calendar",
        title: "Calendario",
        content: "Este es tu calendario. Creemos una reserva de prueba para mostrar el flujo.",
        placement: "right",
        onEnter: () => {
          const cell = document.querySelector<HTMLElement>(
            ".fc-daygrid-day.fc-day-today, .fc-daygrid-day, .fc-timegrid-slot"
          );
          focusAndPulse(cell);
          const start = new Date(Date.now() + 2 * 60 * 60 * 1000);
          window.dispatchEvent(
            new CustomEvent("tour:open-reserva", { detail: { start, durationHours: 1 } })
          );
        },
      },
      {
        selector: "#modal-content",
        title: "Reserva de prueba",
        content: <>El modal se abre con <b>datos de ejemplo</b>. Puedes editar y guardar o simplemente cerrar.</>,
        placement: "right",
        onEnter: (el: HTMLElement) => focusAndPulse(el),
      },
      {
        selector: "#modal-curso",
        title: "Curso",
        content: "Selecciona el curso desde aquí.",
        placement: "right",
        onEnter: () => setSelectFirst("modal-curso"),
      },
      {
        selector: "#modal-tema",
        title: "Tema",
        content: "Elige un tema del curso.",
        placement: "right",
        onEnter: () =>
          waitUntil(
            () => {
              const el = document.getElementById("modal-tema") as HTMLSelectElement | null;
              return !!el && !el.disabled && el.options.length > 1;
            },
            () => setSelectFirst("modal-tema")
          ),
      },
      {
        selector: "#modal-profesor",
        title: "Profesor",
        content: "Asigna un profesor.",
        placement: "right",
        onEnter: () => setSelectFirst("modal-profesor"),
      },
      {
        selector: "#modal-fecha-hora",
        title: "Fecha y hora",
        content: "Viene prellenado para la demo; lo puedes ajustar.",
        placement: "left",
        onEnter: () => {
          const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
          d.setMinutes(0, 0, 0);
          const pad = (n: number) => String(n).padStart(2, "0");
          const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
            d.getHours()
          )}:${pad(d.getMinutes())}`;
          setInputValue("modal-fecha-hora", local);
        },
      },
      {
        selector: "#modal-precio",
        title: "Precio",
        content: "Asignamos un precio de práctica.",
        placement: "left",
        onEnter: () => setInputValue("modal-precio", "50"),
      },
      {
        selector: "#modal-nombre-alumno",
        title: "Nombre del Alumno",
        content: "Rellenamos con un alumno de ejemplo.",
        placement: "right",
        onEnter: () => setInputValue("modal-nombre-alumno", "Alumno Demo"),
      },
      {
        selector: "#modal-estado-pago",
        title: "Estado de Pago",
        content: "Marca el estado.",
        placement: "right",
        onEnter: () => setSelectFirst("modal-estado-pago"),
      },
      {
        selector: "#nav-servicios",
        title: "Ahora, Servicios",
        content: "Conozcamos cómo crear un servicio. (Puedes reiniciar el tutorial cuando quieras.)",
        placement: "right",
        onEnter: () => {
          localStorage.setItem(PHASE_KEY, "servicios");
          navigateTo("/servicios");
        },
      },
    ],
    []
  );

  // ---------------- STEPS: CURSOS ----------------
  const cursosSteps: TourStep[] = React.useMemo(
    () => [
      {
        selector: "#curso-add-form",
        title: "Agregar curso",
        content: <>Aquí puedes <b>agregar el curso</b>. Completemos un ejemplo.</>,
        placement: "right",
        onEnter: () => {
          setInputValue("nombre-curso", "Cálculo I (Demo)");
          const desc = document.getElementById("descripcion-curso") as HTMLTextAreaElement | null;
          if (desc) {
            desc.value = "Límites, derivadas y aplicaciones. Curso demo.";
            desc.dispatchEvent(new Event("input", { bubbles: true }));
            focusAndPulse(desc);
          }
          const submit = document.getElementById("curso-submit");
          focusAndPulse(submit as HTMLElement | null);
        },
      },
      {
        selector: "#cursos-list",
        title: "Editar un curso",
        content: "Abriremos el modal de edición del primer curso listado.",
        placement: "right",
        onEnter: () => {
          waitUntil(
            () => !!document.querySelector("#cursos-list .btn-edit"),
            () => {
              const editBtn =
                document.querySelector<HTMLButtonElement>("#cursos-list .btn-edit");
              if (editBtn) {
                focusAndPulse(editBtn);
                setTimeout(() => editBtn.click(), 500);
              }
            },
            2500
          );
        },
      },
      {
        selector: "#curso-edit-modal",
        title: "Modal de edición",
        content: "Aquí puedes actualizar nombre y descripción. Completemos datos de ejemplo.",
        placement: "right",
        onEnter: () => {
          setInputValue("modal-nombre-curso", "Cálculo I (Edición Demo)");
          const t = document.getElementById("modal-descripcion-curso") as HTMLTextAreaElement | null;
          if (t) {
            t.value = "Contenido: límites, derivadas, reglas y problemas típicos.";
            t.dispatchEvent(new Event("input", { bubbles: true }));
            focusAndPulse(t);
          }
          const submit = document.getElementById("modal-curso-submit");
          focusAndPulse(submit as HTMLElement | null);
        },
      },
      {
        selector: "#cursos-list",
        title: "Eliminar (solo veremos la confirmación)",
        content: "Mostraremos el diálogo de confirmación. No eliminaremos nada.",
        placement: "right",
        onEnter: () => {
          const editOpen = document.getElementById("curso-edit-modal");
          if (editOpen) {
            const overlay = editOpen.closest(".modal-overlay") as HTMLElement | null;
            overlay?.click();
          }
          setTimeout(() => {
            waitUntil(
              () => !!document.querySelector("#cursos-list .btn-delete"),
              () => {
                const delBtn =
                  document.querySelector<HTMLButtonElement>("#cursos-list .btn-delete");
                if (delBtn) {
                  focusAndPulse(delBtn);
                  setTimeout(() => delBtn.click(), 500);
                }
              },
              2500
            );
          }, 250);
        },
      },
      {
        selector: "#curso-confirm-modal",
        title: "Confirmar eliminación",
        content: "Así luce la confirmación. Usaremos “Cancelar” para mantener el registro.",
        placement: "right",
        onEnter: () => {
          const cancel = document.getElementById("confirm-cancel-btn");
          focusAndPulse(cancel as HTMLElement | null);
          setTimeout(() => (cancel as HTMLButtonElement | null)?.click(), 900);
        },
      },
      {
        selector: "#nav-staff",
        title: "Vamos a Staff",
        content: "Registremos personal y su especialidad.",
        placement: "right",
        onEnter: () => {
          localStorage.setItem(PHASE_KEY, "staff");
          navigateTo("/staff");
        },
      },
    ],
    []
  );

  // ---------------- STEPS: PROFESORES ----------------
  const profesoresSteps: TourStep[] = React.useMemo(
    () => [
      {
        selector: "#profesor-add-form",
        title: "Profesores",
        content: <>Registra a los <b>profesores</b> y su <b>especialidad</b>. Completaremos un ejemplo.</>,
        placement: "right",
        onEnter: () => {
          setInputValue("nombre-profesor", "Dra. Ana Gómez (Demo)");
          setInputValue("email-profesor", "ana.gomez@demo.edu");
          setInputValue("especialidad-profesor", "Matemáticas Aplicadas");
          const submit = document.getElementById("profesor-submit");
          focusAndPulse(submit as HTMLElement | null);
        },
      },
      {
        selector: "#profesores-list",
        title: "Editar un profesor",
        content: "Abriremos el modal de edición de la primera fila disponible.",
        placement: "right",
        onEnter: () => {
          waitUntil(
            () => !!document.querySelector("#profesores-table .btn-edit"),
            () => {
              const editBtn =
                document.querySelector<HTMLButtonElement>("#profesores-table .btn-edit");
              focusAndPulse(editBtn);
              setTimeout(() => editBtn?.click(), 500);
            },
            1500
          );
        },
      },
      {
        selector: "#profesor-edit-modal",
        title: "Modal de edición",
        content: "Actualiza nombre, email y especialidad. Rellenaremos un ejemplo.",
        placement: "right",
        onEnter: () => {
          setInputValue("modal-nombre-profesor", "Dra. Ana Gómez (Edición Demo)");
          setInputValue("modal-email-profesor", "ana.gomez+edit@demo.edu");
          setInputValue("modal-especialidad-profesor", "Álgebra Lineal");
          const submit = document.getElementById("modal-profesor-submit");
          focusAndPulse(submit as HTMLElement | null);
        },
      },
      {
        selector: "#profesores-list",
        title: "Eliminar (confirmación)",
        content: "Mostraremos el diálogo de confirmación. No eliminaremos nada.",
        placement: "right",
        onEnter: () => {
          const editOpen = document.getElementById("profesor-edit-modal");
          if (editOpen) {
            const overlay = editOpen.closest(".modal-overlay") as HTMLElement | null;
            overlay?.click();
          }
          setTimeout(() => {
            const delBtn = document.querySelector<HTMLButtonElement>(
              "#profesores-table .btn-delete"
            );
            if (delBtn) {
              focusAndPulse(delBtn);
              setTimeout(() => delBtn.click(), 500);
            }
          }, 250);
        },
      },
      {
        selector: "#profesor-confirm-modal",
        title: "Confirmar eliminación",
        content: "Así luce la confirmación. Usaremos “Cancelar” para mantener el registro.",
        placement: "right",
        onEnter: () => {
          const cancel = document.getElementById("confirm-cancel-prof");
          focusAndPulse(cancel as HTMLElement | null);
          setTimeout(() => (cancel as HTMLButtonElement | null)?.click(), 900);
        },
      },
      {
        selector: "#nav-categorias",
        title: "Ahora, Categorías",
        content: "Creemos y asociemos categorías a un servicio.",
        placement: "right",
        onEnter: () => {
          localStorage.setItem(PHASE_KEY, "categorias");
          navigateTo("/categorias");
        },
      },
    ],
    []
  );

  // ---------------- STEPS: TEMAS ----------------
  const temasSteps: TourStep[] = React.useMemo(
    () => [
      {
        selector: "#tema-add-form",
        title: "Crear tema",
        content: <>Completemos un <b>tema de ejemplo</b> y revisemos el flujo.</>,
        placement: "right",
        onEnter: () => {
          setInputValue("nombre-tema", "Derivadas (Demo)");
          setSelectFirst("curso-tema");
          const submit = document.getElementById("tema-submit");
          focusAndPulse(submit as HTMLElement | null);
        },
      },
      {
        selector: "#temas-list",
        title: "Editar un tema",
        content: "Abriremos el modal del primer tema listado.",
        placement: "right",
        onEnter: () => {
          waitUntil(
            () => !!document.querySelector("#temas-list .btn-edit"),
            () => {
              const btn = document.querySelector<HTMLButtonElement>("#temas-list .btn-edit");
              if (btn) {
                focusAndPulse(btn);
                setTimeout(() => btn.click(), 500);
              }
            },
            2500
          );
        },
      },
      {
        selector: "#tema-edit-modal",
        title: "Modal de edición",
        content: "Ajustamos los datos de ejemplo del tema.",
        placement: "right",
        onEnter: () => {
          setInputValue("modal-nombre-tema", "Derivadas y Aplicaciones (Demo)");
          setSelectFirst("modal-curso-tema");
          const submit = document.getElementById("modal-tema-submit");
          focusAndPulse(submit as HTMLElement | null);
        },
      },
      {
        selector: "#temas-list",
        title: "Eliminar (solo ver confirmación)",
        content: "Mostraremos el diálogo de confirmación. Luego lo cancelamos.",
        placement: "right",
        onEnter: () => {
          const editOpen = document.getElementById("tema-edit-modal");
          if (editOpen) {
            const overlay = editOpen.closest(".modal-overlay") as HTMLElement | null;
            overlay?.click();
          }
          setTimeout(() => {
            waitUntil(
              () => !!document.querySelector("#temas-list .btn-delete"),
              () => {
                const delBtn = document.querySelector<HTMLButtonElement>("#temas-list .btn-delete");
                if (delBtn) {
                  focusAndPulse(delBtn);
                  setTimeout(() => delBtn.click(), 500);
                }
              },
              2500
            );
          }, 250);
        },
      },
      {
        selector: "#tema-confirm-modal",
        title: "Confirmar eliminación",
        content: "Así luce la confirmación. Usaremos “Cancelar” para mantener el registro.",
        placement: "right",
        onEnter: () => {
          const cancel = document.getElementById("tema-confirm-cancel-btn");
          focusAndPulse(cancel as HTMLElement | null);
          setTimeout(() => (cancel as HTMLButtonElement | null)?.click(), 900);
        },
      },
      {
        selector: "#nav-estadisticas",
        title: "Vamos a Estadísticas",
        content: "Terminemos con un vistazo general del sistema.",
        placement: "right",
        onEnter: () => {
          localStorage.setItem(PHASE_KEY, "estadisticas");
          navigateTo("/estadisticas");
        },
      },
    ],
    []
  );

  // ---------------- STEPS: ESTADÍSTICAS ----------------
  const statsSteps: TourStep[] = React.useMemo(
    () => [
      {
        selector: "#stats-overview",
        title: "Vista general",
        content: "Panel informativo: reservas, horas, ingresos, alumnos únicos.",
        placement: "right",
      },
      {
        selector: "#stats-top-cursos",
        title: "Top Cursos",
        content: "Aquí ves qué cursos tienen más reservas/horas.",
        placement: "right",
      },
      {
        selector: "#stats-top-profesores",
        title: "Top Profesores",
        content: "Profesores con más horas y reservas.",
        placement: "right",
      },
      {
        selector: "body",
        title: "¡Listo!",
        content: "Tour completado. Puedes reiniciarlo cuando quieras.",
        placement: "bottom",
        onEnter: () => {
          localStorage.setItem(MASTER_ONCE, "done");
          localStorage.removeItem(PHASE_KEY);
        },
      },
    ],
    []
  );

  // Render según fase + ruta actual
  if (!phase) return null;
  if (phase === "dashboard" && path === "/")
    return <GuidedTourIsland onceKey="tour_dashboard_v1" steps={dashSteps} />;
  if (phase === "cursos" && path === "/cursos")
    return <GuidedTourIsland onceKey="tour_cursos_v1" steps={cursosSteps} />;
  if (phase === "profesores" && path === "/profesores")
    return <GuidedTourIsland onceKey="tour_profesores_v1" steps={profesoresSteps} />;
  if (phase === "temas" && path === "/temas")
    return <GuidedTourIsland onceKey="tour_temas_v1" steps={temasSteps} />;
  if (phase === "estadisticas" && path === "/estadisticas")
    return <GuidedTourIsland onceKey="tour_estadisticas_v1" steps={statsSteps} />;

  return null;
}
