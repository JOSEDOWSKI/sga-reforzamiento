// tour/TourOrchestrator.tsx
import React from "react";
import GuidedTourIsland from "./GuidedTourIsland";

type Phase = "dashboard" | "cursos" | "profesores" | "temas" | "estadisticas" | "done" | null;

const PHASE_KEY   = "tour_phase_v1";
const MASTER_ONCE = "tour_master_once_v1";

function navigateTo(path: string) {
  const map: Record<string, string> = {
    "/": "#nav-dashboard",
    "/cursos": "#nav-cursos",
    "/profesores": "#nav-profesores",
    "/temas": "#nav-temas",
    "/estadisticas": "#nav-estadisticas",
  };
  const sel = map[path];
  const a = sel ? document.querySelector<HTMLAnchorElement>(sel) : null;
  if (a) a.click(); else window.location.href = path;
}

export default function TourOrchestrator() {
  const [phase, setPhase] = React.useState<Phase>(null);
  const path = typeof window !== "undefined" ? window.location.pathname : "/";

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

  // DASHBOARD
  const dashSteps = React.useMemo(() => ([
    {
      selector: "#filter-curso-btn",
      title: "¡Bienvenid@!",
      content: <>Aquí puedes <b>filtrar las citas</b> por <b>curso</b> o <b>profesor</b>.</>,
      placement: "bottom" as const,
      onEnter: (el: HTMLElement) => el.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    },
    {
      selector: "#filter-profesor-btn",
      title: "Filtro por profesor",
      content: "También puedes filtrar por docente.",
      placement: "bottom" as const,
      onEnter: (el: HTMLElement) => el.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    },
    {
      selector: "#nav-cursos",
      title: "Ahora, Cursos",
      content: "Iremos a crear un curso.",
      placement: "right" as const,
      onEnter: () => { localStorage.setItem(PHASE_KEY, "cursos"); navigateTo("/cursos"); },
    },
  ]), []);

  // CURSOS
  const cursosSteps = React.useMemo(() => ([
    {
      selector: "#curso-add-form",
      title: "Agregar curso",
      content: <>Aquí puedes <b>agregar el curso en general</b>. Los <b>temas</b> se crean más adelante.</>,
      placement: "right" as const,
    },
    {
      selector: "#nav-profesores",
      title: "Vamos a Profesores",
      content: "Registremos profesores y su especialidad.",
      placement: "right" as const,
      onEnter: () => { localStorage.setItem(PHASE_KEY, "profesores"); navigateTo("/profesores"); },
    },
  ]), []);

  // PROFESORES
  const profesoresSteps = React.useMemo(() => ([
    {
      selector: "#profesor-add-form",
      title: "Profesores",
      content: <>Registra a los <b>profesores</b> y su <b>especialidad</b> para asignar clases.</>,
      placement: "right" as const,
    },
    {
      selector: "#nav-temas",
      title: "Ahora, Temas",
      content: "Creemos y asociemos temas a un curso.",
      placement: "right" as const,
      onEnter: () => { localStorage.setItem(PHASE_KEY, "temas"); navigateTo("/temas"); },
    },
  ]), []);

  // TEMAS
  const temasSteps = React.useMemo(() => ([
    {
      selector: "#tema-add-form",
      title: "Crear/editar temas",
      content: <>Aquí puedes <b>crear</b> o <b>editar</b> tus temas.</>,
      placement: "right" as const,
    },
    {
      selector: "#curso-tema",
      title: "Asignar curso",
      content: "Este selector define a qué curso pertenece el tema.",
      placement: "right" as const,
    },
    {
      selector: "#temas-list",
      title: "Lista de temas",
      content: "Aquí ves todos los temas y puedes editarlos cuando lo necesites.",
      placement: "right" as const,
    },
    {
      selector: "#nav-estadisticas",
      title: "Vamos a Estadísticas",
      content: "Terminemos con un vistazo general del sistema.",
      placement: "right" as const,
      onEnter: () => { localStorage.setItem(PHASE_KEY, "estadisticas"); navigateTo("/estadisticas"); },
    },
  ]), []);

  // ESTADÍSTICAS
  const statsSteps = React.useMemo(() => ([
    {
      selector: "#stats-overview",
      title: "Vista general",
      content: "Panel informativo: reservas, horas, ingresos, alumnos únicos.",
      placement: "right" as const,
    },
    {
      selector: "#stats-top-cursos",
      title: "Top Cursos",
      content: "Aquí ves qué cursos tienen más reservas/horas.",
      placement: "right" as const,
    },
    {
      selector: "#stats-top-profesores",
      title: "Top Profesores",
      content: "Profesores con más horas y reservas.",
      placement: "right" as const,
    },
    {
      selector: "body",
      title: "¡Listo!",
      content: "Tour completado. Puedes reiniciarlo cuando quieras.",
      placement: "bottom" as const,
      onEnter: () => { localStorage.setItem(MASTER_ONCE, "done"); localStorage.removeItem(PHASE_KEY); },
    },
  ]), []);

  if (!phase) return null;
  if (phase === "dashboard"    && path === "/")              return <GuidedTourIsland onceKey="tour_dashboard_v1"    steps={dashSteps} />;
  if (phase === "cursos"       && path === "/cursos")        return <GuidedTourIsland onceKey="tour_cursos_v1"       steps={cursosSteps} />;
  if (phase === "profesores"   && path === "/profesores")    return <GuidedTourIsland onceKey="tour_profesores_v1"   steps={profesoresSteps} />;
  if (phase === "temas"        && path === "/temas")         return <GuidedTourIsland onceKey="tour_temas_v1"        steps={temasSteps} />;
  if (phase === "estadisticas" && path === "/estadisticas")  return <GuidedTourIsland onceKey="tour_estadisticas_v1" steps={statsSteps} />;
  return null;
}
