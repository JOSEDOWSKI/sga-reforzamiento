import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@components/Header/Header';
import {
  obtenerAliadoPorId,
  obtenerColaboradoresPorAliado,
  obtenerSlotsDisponibles,
  crearReserva,
} from '@services/api';
import { Aliado, Colaborador, SlotDisponible, ReservaFormData } from '@types';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
// Usar locale por defecto (en) por ahora, o importar correctamente
// import { es } from 'date-fns/locale/es';
import styles from './ServiceBookingPage.module.css';

type Step = 1 | 2 | 3 | 4;

export const ServiceBookingPage: React.FC = () => {
  const { ciudad, aliadoId } = useParams<{
    ciudad: string;
    categoria: string;
    aliadoId: string;
  }>();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [aliado, setAliado] = useState<Aliado | null>(null);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotDisponible | null>(null);
  const [slotsDisponibles, setSlotsDisponibles] = useState<SlotDisponible[]>([]);
  const [formData, setFormData] = useState<ReservaFormData>({
    aliado_id: 0,
    establecimiento_id: 0,
    colaborador_id: 0,
    fecha_hora_inicio: '',
    fecha_hora_fin: '',
    cliente_nombre: '',
    cliente_email: '',
    cliente_telefono: '',
    notas: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!aliadoId) return;

      setLoading(true);
      try {
        const id = parseInt(aliadoId, 10);
        const [aliadoData, colaboradoresData] = await Promise.all([
          obtenerAliadoPorId(id),
          obtenerColaboradoresPorAliado(id),
        ]);

        setAliado(aliadoData);
        setColaboradores(colaboradoresData.filter((c) => c.activo));
        setFormData((prev) => ({ ...prev, aliado_id: id }));
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [aliadoId]);

  useEffect(() => {
    const cargarSlots = async () => {
      if (!selectedColaborador || !selectedDate || !aliadoId) return;

      try {
        const fechaInicio = format(selectedDate, 'yyyy-MM-dd');
        const fechaFin = format(addDays(selectedDate, 1), 'yyyy-MM-dd');
        const slots = await obtenerSlotsDisponibles(
          parseInt(aliadoId, 10),
          selectedColaborador.id,
          fechaInicio,
          fechaFin
        );
        setSlotsDisponibles(slots);
      } catch (error) {
        console.error('Error cargando slots:', error);
      }
    };

    cargarSlots();
  }, [selectedColaborador, selectedDate, aliadoId]);

  const handleColaboradorSelect = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setFormData((prev) => ({ ...prev, colaborador_id: colaborador.id }));
    setCurrentStep(2);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: SlotDisponible) => {
    if (!slot.disponible || !selectedDate) return;
    setSelectedSlot(slot);
    const fechaHoraInicio = `${format(selectedDate, 'yyyy-MM-dd')}T${slot.hora}`;
    // Calcular fecha_hora_fin sumando 30 minutos (duración por defecto)
    const [hora, minuto] = slot.hora.split(':').map(Number);
    const fechaInicio = new Date(selectedDate);
    fechaInicio.setHours(hora, minuto, 0, 0);
    const fechaFin = new Date(fechaInicio.getTime() + 30 * 60 * 1000); // +30 minutos
    const fechaHoraFin = format(fechaFin, "yyyy-MM-dd'T'HH:mm:ss");
    setFormData((prev) => ({
      ...prev,
      fecha_hora_inicio: fechaHoraInicio,
      fecha_hora_fin: fechaHoraFin,
    }));
  };

  const handleInputChange = (field: keyof ReservaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.cliente_nombre || !formData.cliente_email || !formData.cliente_telefono) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setSubmitting(true);
    try {
      await crearReserva(formData);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error creando reserva:', error);
      alert('Error al crear la reserva. Por favor intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const diasSemana = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: addDays(startOfWeek(new Date()), 13),
  });

  const slotsFiltrados = showOnlyAvailable
    ? slotsDisponibles.filter((slot) => slot.disponible)
    : slotsDisponibles;

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.container}>
        <div className={styles.progressBar}>
          <div className={styles.progressSteps}>
            <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepLabel}>Profesional</span>
            </div>
            <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepLabel}>Fecha y Hora</span>
            </div>
            <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepLabel}>Datos</span>
            </div>
            <div className={`${styles.step} ${currentStep >= 4 ? styles.active : ''}`}>
              <span className={styles.stepNumber}>4</span>
              <span className={styles.stepLabel}>Confirmación</span>
            </div>
          </div>
        </div>

        {/* Paso 1: Selección de Profesional */}
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Selecciona un profesional</h2>
            <div className={styles.colaboradoresGrid}>
              {colaboradores.map((colaborador) => (
                <div
                  key={colaborador.id}
                  className={styles.colaboradorCard}
                  onClick={() => handleColaboradorSelect(colaborador)}
                >
                  <div className={styles.colaboradorAvatar}>
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <h3>{colaborador.nombre}</h3>
                  {colaborador.tarifa_por_hora && (
                    <p className={styles.tarifa}>S/ {colaborador.tarifa_por_hora}/hora</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Selección de Fecha y Hora */}
        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <button className={styles.backButton} onClick={() => setCurrentStep(1)}>
              <span className="material-symbols-outlined">arrow_back</span>
              Volver
            </button>
            <h2 className={styles.stepTitle}>Selecciona fecha y hora</h2>

            <div className={styles.calendarSection}>
              <h3>Calendario</h3>
              <div className={styles.calendar}>
                {diasSemana.map((dia) => (
                  <button
                    key={dia.toISOString()}
                    className={`${styles.calendarDay} ${
                      selectedDate && isSameDay(dia, selectedDate) ? styles.selected : ''
                    }`}
                    onClick={() => handleDateSelect(dia)}
                  >
                    <span className={styles.dayName}>
                      {format(dia, 'EEE').substring(0, 3).toUpperCase()}
                    </span>
                    <span className={styles.dayNumber}>{format(dia, 'd')}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className={styles.slotsSection}>
                <div className={styles.slotsHeader}>
                  <h3>Horarios disponibles</h3>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={showOnlyAvailable}
                      onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                    />
                    <span>Solo disponibles</span>
                  </label>
                </div>
                <div className={styles.slotsGrid}>
                  {slotsFiltrados.length === 0 ? (
                    <p className={styles.noSlots}>No hay horarios disponibles para esta fecha</p>
                  ) : (
                    slotsFiltrados.map((slot, index) => (
                      <button
                        key={index}
                        className={`${styles.slotButton} ${
                          !slot.disponible ? styles.disabled : ''
                        } ${selectedSlot === slot ? styles.selected : ''}`}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.disponible}
                      >
                        {slot.hora}
                      </button>
                    ))
                  )}
                </div>
                {selectedSlot && (
                  <button
                    className={styles.continueButton}
                    onClick={() => setCurrentStep(3)}
                  >
                    Continuar
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Paso 3: Información del Cliente */}
        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <button className={styles.backButton} onClick={() => setCurrentStep(2)}>
              <span className="material-symbols-outlined">arrow_back</span>
              Volver
            </button>
            <h2 className={styles.stepTitle}>Información del cliente</h2>

            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGroup}>
                <label>Nombre completo *</label>
                <input
                  type="text"
                  value={formData.cliente_nombre}
                  onChange={(e) => handleInputChange('cliente_nombre', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.cliente_email}
                  onChange={(e) => handleInputChange('cliente_email', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Teléfono *</label>
                <input
                  type="tel"
                  value={formData.cliente_telefono}
                  onChange={(e) => handleInputChange('cliente_telefono', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Notas adicionales (opcional)</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => handleInputChange('notas', e.target.value)}
                  rows={4}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setCurrentStep(2)}
                >
                  Volver
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Procesando...' : 'Continuar al pago'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Paso 4: Confirmación */}
        {currentStep === 4 && (
          <div className={styles.stepContent}>
            <div className={styles.confirmation}>
              <span className="material-symbols-outlined">check_circle</span>
              <h2>¡Reserva confirmada!</h2>
              <p>Tu reserva ha sido creada exitosamente.</p>
              {aliado && (
                <div className={styles.reservationDetails}>
                  <p>
                    <strong>Negocio:</strong> {aliado.nombre}
                  </p>
                  {selectedColaborador && (
                    <p>
                      <strong>Profesional:</strong> {selectedColaborador.nombre}
                    </p>
                  )}
                  {selectedDate && selectedSlot && (
                    <>
                      <p>
                        <strong>Fecha:</strong> {format(selectedDate, 'dd/MM/yyyy')}
                      </p>
                      <p>
                        <strong>Hora:</strong> {selectedSlot.hora}
                      </p>
                    </>
                  )}
                </div>
              )}
              <button
                className={styles.primaryButton}
                onClick={() => navigate(`/${ciudad}`)}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

