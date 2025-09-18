import { useState } from 'react';
import { sendDemoRequest, isEmailServiceConfigured } from '../services/emailService';
import './DemoContactCard.css';

const DemoContactCard = () => {
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [emailForm, setEmailForm] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const whatsappNumbers = [
        '+51925323337',
        '+51973504180',
        '+51993833737'
    ];

    const handleWhatsAppClick = () => {
        // Seleccionar número aleatorio
        const randomNumber = whatsappNumbers[Math.floor(Math.random() * whatsappNumbers.length)];
        const message = encodeURIComponent('Hola! Me interesa solicitar acceso al demo de AgendaTe. ¿Podrían proporcionarme las credenciales de acceso?');
        window.open(`https://wa.me/${randomNumber}?text=${message}`, '_blank');
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');

        // Validaciones específicas por campo
        const camposFaltantes = [];
        
        if (!emailForm.name.trim()) {
            camposFaltantes.push("Nombre");
        }
        if (!emailForm.email.trim()) {
            camposFaltantes.push("Email");
        }
        if (!emailForm.message.trim()) {
            camposFaltantes.push("Mensaje");
        }

        if (camposFaltantes.length > 0) {
            const mensaje = camposFaltantes.length === 1 
                ? `Falta completar el campo: ${camposFaltantes[0]}`
                : `Faltan completar los siguientes campos: ${camposFaltantes.join(", ")}`;
            setSubmitMessage(mensaje);
            setIsSubmitting(false);
            return;
        }

        try {
            // Verificar si EmailJS está configurado
            if (!isEmailServiceConfigured()) {
                throw new Error('Servicio de email no configurado');
            }

            // Enviar email usando EmailJS
            await sendDemoRequest({
                name: emailForm.name,
                email: emailForm.email,
                message: emailForm.message
            });
            
            setSubmitMessage('¡Mensaje enviado correctamente! Te contactaremos pronto.');
            setEmailForm({ name: '', email: '', message: '' });
            setTimeout(() => {
                setShowEmailForm(false);
                setSubmitMessage('');
            }, 2000);
        } catch (error: any) {
            console.error('Error enviando email:', error);
            setSubmitMessage(error.message || 'Error al enviar el mensaje. Intenta por WhatsApp.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="demo-contact-card">
            <div className="demo-contact-header">
                <h3>Solicita tu Demo</h3>
                <p>Obtén acceso completo al sistema</p>
            </div>

            <div className="demo-contact-content">
                {!showEmailForm ? (
                    <div className="contact-buttons">
                        <button
                            onClick={handleWhatsAppClick}
                            className="whatsapp-button"
                        >
                            WhatsApp
                        </button>
                        
                        <button
                            onClick={() => setShowEmailForm(true)}
                            className="email-button"
                        >
                            Correo
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleEmailSubmit} className="email-form" noValidate>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                value={emailForm.name}
                                onChange={(e) => setEmailForm({...emailForm, name: e.target.value})}
                                className={!emailForm.name.trim() && submitMessage.includes('Falta') ? "field-error" : ""}
                                disabled={isSubmitting}
                            />
                            {!emailForm.name.trim() && submitMessage.includes('Falta') && (
                                <span className="field-error-message">Ingrese su nombre</span>
                            )}
                        </div>
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="Tu email"
                                value={emailForm.email}
                                onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                                className={!emailForm.email.trim() && submitMessage.includes('Falta') ? "field-error" : ""}
                                disabled={isSubmitting}
                            />
                            {!emailForm.email.trim() && submitMessage.includes('Falta') && (
                                <span className="field-error-message">Ingrese su email</span>
                            )}
                        </div>
                        <div className="form-group">
                            <textarea
                                placeholder="Cuéntanos sobre tu academia..."
                                value={emailForm.message}
                                onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                                rows={3}
                                className={!emailForm.message.trim() && submitMessage.includes('Falta') ? "field-error" : ""}
                                disabled={isSubmitting}
                            />
                            {!emailForm.message.trim() && submitMessage.includes('Falta') && (
                                <span className="field-error-message">Ingrese su mensaje</span>
                            )}
                        </div>
                        
                        {submitMessage && (
                            <div className={`submit-message ${submitMessage.includes('Error') ? 'error' : 'success'}`}>
                                {submitMessage}
                            </div>
                        )}
                        
                        <div className="form-buttons">
                            <button
                                type="button"
                                onClick={() => setShowEmailForm(false)}
                                className="cancel-button"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="demo-contact-footer">
                <p><strong>No dudes en contactarnos!</strong></p>
            </div>
        </div>
    );
};

export default DemoContactCard;