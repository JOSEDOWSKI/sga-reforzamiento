import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const EMAILJS_CONFIG = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_demo_contact',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_demo_request',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key_here'
};

// Inicializar EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

export interface EmailData {
    name: string;
    email: string;
    message: string;
}

export const sendDemoRequest = async (data: EmailData): Promise<void> => {
    try {
        // Preparar los datos del template
        const templateParams = {
            from_name: data.name,
            from_email: data.email,
            message: data.message,
            to_email: 'promesa23aqp@gmail.com',
            subject: 'Solicitud de Demo - AgendaTe',
            reply_to: data.email
        };

        // Enviar email usando EmailJS
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );

        if (response.status !== 200) {
            throw new Error('Error al enviar el email');
        }

        console.log('Email enviado exitosamente:', response);
    } catch (error) {
        console.error('Error enviando email:', error);
        throw new Error('No se pudo enviar el mensaje. Por favor intenta por WhatsApp.');
    }
};

// Función para validar la configuración
export const isEmailServiceConfigured = (): boolean => {
    return EMAILJS_CONFIG.publicKey !== 'your_public_key_here' && 
           EMAILJS_CONFIG.serviceId !== 'service_demo_contact' &&
           EMAILJS_CONFIG.templateId !== 'template_demo_request';
};