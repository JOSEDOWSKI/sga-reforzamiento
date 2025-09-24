import GuidedTourIsland from "./GuidedTourIsland";

export default function DashboardTour() {
  return (
    <GuidedTourIsland
      onceKey="tour_v1_dashboard"
      steps={[
        {
          selector: "#sidebar-dashboard",
          title: "¡Bienvenido al Dashboard!",
          content: (
            <div>
              Este tour te muestra los filtros, la navegación del calendario y cómo crear <b>una reserva de ejemplo</b> sin escribir.
            </div>
          ),
          placement: "right",
        },
        {
          selector: "#filter-curso-btn",
          title: "Filtra por curso",
          content: "Abre el filtro de cursos para acotar la vista.",
          placement: "bottom",
          onEnter: (el) => el.dispatchEvent(new MouseEvent("click", { bubbles: true })),
        },
        {
          selector: "#filter-profesor-btn",
          title: "Filtra por profesor",
          content: "Y también por profesor.",
          placement: "bottom",
          onEnter: (el) => el.dispatchEvent(new MouseEvent("click", { bubbles: true })),
        },
        { selector: "#calendar-today", title: "Ir a Hoy", content: "Vuelve rápidamente a la fecha actual.", placement: "bottom" },
        { selector: "#view-week", title: "Cambiar de vista", content: "Usa Mes/Semana/Día/Agenda según necesites.", placement: "bottom" },
        {
          selector: "#tour-open-reserva",
          title: "Crear una reserva (demo)",
          content: <div>Abriremos el formulario con <b>datos de ejemplo</b> ya cargados. No se guardará nada en la base de datos.</div>,
          placement: "bottom",
          onEnter: (el) => el.dispatchEvent(new MouseEvent("click", { bubbles: true })),
        },
        { selector: "#modal-curso", title: "Curso", content: "Selecciona el curso desde aquí.", placement: "right" },
        { selector: "#modal-tema", title: "Tema", content: "Elige un tema del curso.", placement: "right" },
        { selector: "#modal-profesor", title: "Profesor", content: "Asigna un profesor.", placement: "right" },
        { selector: "#modal-fecha-hora", title: "Fecha y hora", content: "Viene prellenado para la demo.", placement: "left" },
        { selector: "#modal-estado-pago", title: "Estado de Pago", content: "Marca el estado.", placement: "left" },
        { selector: "#modal-submit", title: "Finalizar demo", content: "En modo demo, este botón no guardará nada.", placement: "bottom" },
      ]}
    />
  );
}
