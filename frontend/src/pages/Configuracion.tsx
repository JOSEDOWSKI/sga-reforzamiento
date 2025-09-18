import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';

const Configuracion: React.FC = () => {
  const [colorPrimario, setColorPrimario] = useState('#667eea');
  const [colorSecundario, setColorSecundario] = useState('#764ba2');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [precioHora, setPrecioHora] = useState('0');
  const [nombreInstitucion, setNombreInstitucion] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Cargar configuración actual del cliente
    apiClient.get('/configuracion')
      .then(res => {
        const cfg = res.data.data;
        setColorPrimario(cfg.color_primario || '#667eea');
        setColorSecundario(cfg.color_secundario || '#764ba2');
        setLogo(cfg.logo_url || null);
        setLogoPreview(cfg.logo_url || null);
        setPrecioHora(cfg.precio_hora ? String(cfg.precio_hora) : '0');
        setNombreInstitucion(cfg.nombre || '');
      })
      .catch(() => setError('No se pudo cargar la configuración.'));
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
      setLogo(file as any);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validaciones específicas por campo
    const camposFaltantes = [];
    
    if (!nombreInstitucion.trim()) {
      camposFaltantes.push("Nombre de la institución");
    }
    if (!precioHora || parseFloat(precioHora) < 0) {
      camposFaltantes.push("Precio por hora válido");
    }

    if (camposFaltantes.length > 0) {
      const mensaje = camposFaltantes.length === 1 
        ? `Falta completar el campo: ${camposFaltantes[0]}`
        : `Faltan completar los siguientes campos: ${camposFaltantes.join(", ")}`;
      setError(mensaje);
      return;
    }
    
    try {
      let logoUrl = logo;
      if (logo && typeof logo !== 'string') {
        // Subir logo al backend
        const formData = new FormData();
        formData.append('logo', logo);
        const res = await apiClient.post('/configuracion/logo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        logoUrl = res.data.url;
      }
      await apiClient.put('/configuracion', {
        color_primario: colorPrimario,
        color_secundario: colorSecundario,
        logo_url: logoUrl,
        precio_hora: parseFloat(precioHora),
        nombre: nombreInstitucion
      });
      setSuccess('¡Configuración guardada!');
    } catch (err: any) {
      setError('No se pudo guardar la configuración.');
    }
  };

  return (
    <div className="configuracion-page" style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(102,126,234,0.08)' }}>
      <h2 style={{ color: colorPrimario }}>⚙️ Configuración de la Institución</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }} noValidate>
        <label>Color Primario:
          <input type="color" value={colorPrimario} onChange={e => setColorPrimario(e.target.value)} style={{ marginLeft: 12 }} />
        </label>
        <label>Color Secundario:
          <input type="color" value={colorSecundario} onChange={e => setColorSecundario(e.target.value)} style={{ marginLeft: 12 }} />
        </label>
        <label>Logo:
          <input type="file" accept="image/*" onChange={handleLogoChange} style={{ marginLeft: 12 }} />
        </label>
        {logoPreview && <img src={logoPreview} alt="Logo" style={{ maxWidth: 120, margin: '12px 0', borderRadius: 8, border: `2px solid ${colorPrimario}` }} />}
        <div>
          <label>Precio por hora:
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              value={precioHora} 
              onChange={e => setPrecioHora(e.target.value)} 
              style={{ 
                marginLeft: 12, 
                width: 120,
                ...((!precioHora || parseFloat(precioHora) < 0) && error ? { border: '2px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' } : {})
              }} 
            />
          </label>
          {(!precioHora || parseFloat(precioHora) < 0) && error && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 500 }}>
              Ingrese un precio válido
            </div>
          )}
        </div>
        <div>
          <label>Nombre de la institución:
            <input 
              type="text" 
              value={nombreInstitucion} 
              onChange={e => setNombreInstitucion(e.target.value)} 
              style={{ 
                marginLeft: 12, 
                width: '100%',
                ...(!nombreInstitucion.trim() && error ? { border: '2px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' } : {})
              }} 
            />
          </label>
          {!nombreInstitucion.trim() && error && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 500 }}>
              Ingrese el nombre de la institución
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary" style={{ background: colorPrimario, borderColor: colorSecundario }}>Guardar cambios</button>
      </form>
      <div style={{ marginTop: 32 }}>
        <h3 style={{ color: colorSecundario }}>Vista previa</h3>
        <div style={{ background: colorPrimario, color: '#fff', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          {logoPreview && <img src={logoPreview} alt="Logo" style={{ width: 48, height: 48, borderRadius: 8, background: '#fff' }} />}
          <span style={{ fontWeight: 700, fontSize: 20 }}>{nombreInstitucion || 'Nombre de la institución'}</span>
        </div>
      </div>
    </div>
  );
};

export default Configuracion; 