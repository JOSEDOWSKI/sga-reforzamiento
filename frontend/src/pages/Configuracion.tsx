import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { demoApiClient } from '../utils/demoApiClient';
import { useTenantConfig } from '../hooks/useTenantConfig';
import '../styles/GestionPage.css';
import '../styles/Modal.css';

const Configuracion: React.FC = () => {
  const hostname = window.location.hostname;
  const isDemoMode = hostname === 'demo.weekly.pe' || hostname.split('.')[0] === 'demo';
  const client = isDemoMode ? demoApiClient : apiClient;
  
  const { config: currentConfig, isLoading: loadingConfig, personalizationConfig } = useTenantConfig();
  
  // Estados
  const [displayName, setDisplayName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [colorTheme, setColorTheme] = useState('violet');
  
  // Información de contacto y ubicación
  const [businessInfo, setBusinessInfo] = useState({
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    descripcion: ''
  });
  
  // Zona horaria e idioma
  const [timezone, setTimezone] = useState('America/Lima');
  const [locale, setLocale] = useState('es-ES');
  
  const [features, setFeatures] = useState({
    servicios: true,
    categorias: true,
    recursos_fisicos: false,
    colaboradores: true
  });
  const [uiLabels, setUiLabels] = useState({
    colaborador: 'Colaborador',
    colaboradores: 'Colaboradores',
    establecimiento: 'Establecimiento',
    establecimientos: 'Establecimientos',
    cliente: 'Cliente',
    clientes: 'Clientes',
    reserva: 'Reserva',
    reservas: 'Reservas',
    recurso: 'Recurso',
    recursos: 'Recursos'
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const COLOR_THEMES = [
    { name: 'violet', label: 'Violeta', color: 'hsl(262.1 83.3% 57.8%)' },
    { name: 'blue', label: 'Azul', color: 'hsl(217.2 91.2% 59.8%)' },
    { name: 'green', label: 'Verde', color: 'hsl(142.1 76.2% 36.3%)' },
    { name: 'orange', label: 'Naranja', color: 'hsl(24.6 95% 53.1%)' },
    { name: 'rose', label: 'Rosa', color: 'hsl(346.8 77.2% 49.8%)' }
  ];

  // Cargar configuración
  useEffect(() => {
    if (loadingConfig) return;
    
    // Cargar color theme (verde por defecto para coincidir con app móvil)
    const savedColorTheme = localStorage.getItem('color-theme') || 'green';
    setColorTheme(savedColorTheme);
    document.documentElement.setAttribute('data-color-theme', savedColorTheme);
    
    if (isDemoMode) {
      const saved = localStorage.getItem('demo_tenant_config');
      const savedLogo = localStorage.getItem('demo_tenant_logo');
      
      if (savedLogo) setLogoUrl(savedLogo);
      
      if (saved) {
        try {
          const configData = JSON.parse(saved);
          setDisplayName(configData.displayName || '');
          setFeatures(configData.features || { servicios: true, categorias: true, recursos_fisicos: false, colaboradores: true });
          if (configData.uiLabels) {
            setUiLabels({
              colaborador: configData.uiLabels.colaborador || 'Colaborador',
              colaboradores: configData.uiLabels.colaboradores || 'Colaboradores',
              establecimiento: configData.uiLabels.establecimiento || 'Establecimiento',
              establecimientos: configData.uiLabels.establecimientos || 'Establecimientos',
              cliente: configData.uiLabels.cliente || 'Cliente',
              clientes: configData.uiLabels.clientes || 'Clientes',
              reserva: configData.uiLabels.reserva || 'Reserva',
              reservas: configData.uiLabels.reservas || 'Reservas',
              recurso: configData.uiLabels.recurso || 'Recurso',
              recursos: configData.uiLabels.recursos || 'Recursos'
            });
          }
          if (configData.colorTheme) {
            setColorTheme(configData.colorTheme);
            localStorage.setItem('color-theme', configData.colorTheme);
            document.documentElement.setAttribute('data-color-theme', configData.colorTheme);
          }
        } catch (e) {
          console.error('Error cargando config demo:', e);
        }
      } else if (currentConfig) {
        setDisplayName(currentConfig.display_name || 'Demo Weekly');
      }
    } else {
      if (currentConfig) {
        setDisplayName(currentConfig.display_name || '');
        const configWithLogo = currentConfig as typeof currentConfig & { logo_url?: string };
        setLogoUrl(configWithLogo.logo_url || '');
      }
      if (currentConfig?.config) {
        setFeatures(currentConfig.config.features || features);
        if (currentConfig.config.uiLabels) {
          setUiLabels({
            colaborador: currentConfig.config.uiLabels.colaborador || 'Colaborador',
            colaboradores: currentConfig.config.uiLabels.colaboradores || 'Colaboradores',
            establecimiento: currentConfig.config.uiLabels.establecimiento || 'Establecimiento',
            establecimientos: currentConfig.config.uiLabels.establecimientos || 'Establecimientos',
            cliente: currentConfig.config.uiLabels.cliente || 'Cliente',
            clientes: currentConfig.config.uiLabels.clientes || 'Clientes',
            reserva: currentConfig.config.uiLabels.reserva || 'Reserva',
            reservas: currentConfig.config.uiLabels.reservas || 'Reservas',
            recurso: currentConfig.config.uiLabels.recurso || 'Recurso',
            recursos: currentConfig.config.uiLabels.recursos || 'Recursos'
          });
        }
      }
    }
  }, [currentConfig, loadingConfig, isDemoMode]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setError('El logo no puede ser mayor a 2MB');
      return;
    }
    
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Guardar color theme
      localStorage.setItem('color-theme', colorTheme);
      document.documentElement.setAttribute('data-color-theme', colorTheme);
      
      // Procesar logo
      let finalLogoUrl = logoUrl;
      if (logoFile) {
        if (isDemoMode) {
          const reader = new FileReader();
          finalLogoUrl = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const base64 = reader.result as string;
              localStorage.setItem('demo_tenant_logo', base64);
              resolve(base64);
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsDataURL(logoFile);
          });
          setLogoUrl(finalLogoUrl);
        } else {
          const formData = new FormData();
          formData.append('logo', logoFile);
          const response = await client.post('/configuracion/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (response.data.success && response.data.url) {
            finalLogoUrl = response.data.url;
            setLogoUrl(finalLogoUrl);
          }
        }
      }
      
      const configData = {
        features,
        uiLabels,
        entityNames: {
          colaboradores: uiLabels.colaboradores.toLowerCase(),
          establecimientos: uiLabels.establecimientos.toLowerCase(),
          clientes: uiLabels.clientes.toLowerCase(),
          reservas: uiLabels.reservas.toLowerCase(),
          recursos: uiLabels.recursos.toLowerCase()
        },
        reservationMode: personalizationConfig?.reservationMode || 'servicio',
        displayName,
        logoUrl: finalLogoUrl,
        colorTheme,
        businessInfo,
        timezone,
        locale
      };

      if (isDemoMode) {
        localStorage.setItem('demo_tenant_config', JSON.stringify(configData));
        window.dispatchEvent(new Event('tenant-config-updated'));
        setSuccess('Configuration saved! (Demo mode)');
      } else {
        await client.put('/admin/tenant/config', { 
          config: configData,
          display_name: displayName,
          logo_url: finalLogoUrl,
          cliente_telefono: businessInfo.telefono,
          cliente_email: businessInfo.email,
          cliente_direccion: businessInfo.direccion,
          city: businessInfo.ciudad,
          timezone: timezone,
          locale: locale
        });
        setSuccess('Configuration saved successfully!');
      }
      
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Could not save configuration.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="page-container">
        <h1>Configuration</h1>
        <div className="loading-container">
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-and-list-container">
        <div className="form-section">
          <h2>Información del Negocio</h2>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="displayName">Nombre del Negocio *</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej: Peluquería Bella Vista"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="logo">Logo del Negocio</label>
              {(logoPreview || logoUrl) && (
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  <img
                    src={logoPreview || logoUrl}
                    alt="Logo preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '2px solid var(--border)'
                    }}
                  />
                </div>
              )}
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ marginBottom: '0.5rem' }}
              />
              <p className="help-text" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                Formatos: JPG, PNG, SVG. Tamaño máximo: 2MB
              </p>
            </div>

            <div className="form-group">
              <label>Color Principal</label>
              <p className="help-text" style={{ marginBottom: '1rem' }}>
                Selecciona el color principal de tu aplicación
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setColorTheme(theme.name)}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: colorTheme === theme.name ? '3px solid var(--foreground)' : '2px solid var(--border)',
                      backgroundColor: theme.color,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s'
                    }}
                    aria-label={`Seleccionar color ${theme.label}`}
                    title={theme.label}
                  >
                    {colorTheme === theme.name && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                Color seleccionado: <strong>{COLOR_THEMES.find(t => t.name === colorTheme)?.label}</strong>
              </p>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '1rem' }}>Información de Contacto</h3>
              
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  value={businessInfo.telefono}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="Ej: +51 987 654 321"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email de Contacto</label>
                <input
                  type="email"
                  id="email"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ej: contacto@negocio.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="direccion">Dirección</label>
                <input
                  type="text"
                  id="direccion"
                  value={businessInfo.direccion}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Ej: Av. Principal 123, Lima"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ciudad">Ciudad</label>
                <input
                  type="text"
                  id="ciudad"
                  value={businessInfo.ciudad}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, ciudad: e.target.value }))}
                  placeholder="Ej: Lima, Arequipa, Cusco"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción del Negocio</label>
                <textarea
                  id="descripcion"
                  value={businessInfo.descripcion}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe tu negocio, servicios, especialidades..."
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '1rem' }}>Configuración Regional</h3>
              
              <div className="form-group">
                <label htmlFor="timezone">Zona Horaria</label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="America/Lima">Lima (GMT-5)</option>
                  <option value="America/Bogota">Bogotá (GMT-5)</option>
                  <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                  <option value="America/Santiago">Santiago (GMT-3)</option>
                  <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="locale">Idioma</label>
                <select
                  id="locale"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                >
                  <option value="es-ES">Español (España)</option>
                  <option value="es-MX">Español (México)</option>
                  <option value="es-AR">Español (Argentina)</option>
                  <option value="es-CO">Español (Colombia)</option>
                  <option value="es-PE">Español (Perú)</option>
                  <option value="es-CL">Español (Chile)</option>
                  <option value="en-US">English (US)</option>
                  <option value="pt-BR">Português (Brasil)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '1rem' }}>Funcionalidades</h3>
              
              <div className="form-group">
                <label>Establecimientos / Servicios</label>
                <div className="form-control-inline">
                  <p className="help-text">Permite gestionar establecimientos o servicios que ofreces</p>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={features.servicios}
                      onChange={() => setFeatures(prev => ({ ...prev, servicios: !prev.servicios }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Categorías</label>
                <div className="form-control-inline">
                  <p className="help-text">Permite organizar tus servicios en categorías</p>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={features.categorias}
                      onChange={() => setFeatures(prev => ({ ...prev, categorias: !prev.categorias }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Recursos Físicos</label>
                <div className="form-control-inline">
                  <p className="help-text">Permite gestionar recursos físicos como canchas, sillones, etc.</p>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={features.recursos_fisicos}
                      onChange={() => setFeatures(prev => ({ ...prev, recursos_fisicos: !prev.recursos_fisicos }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Colaboradores / Staff</label>
                <div className="form-control-inline">
                  <p className="help-text">Permite gestionar colaboradores, staff o recursos que trabajan (ej: canchas, empleados)</p>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={features.colaboradores}
                      onChange={() => setFeatures(prev => ({ ...prev, colaboradores: !prev.colaboradores }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </form>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>

        <div className="list-section">
          <h2>Nombres Personalizados</h2>
          <div className="list-container">
            {[
              { key: 'colaborador', title: 'Colaboradores', fields: [
                { name: 'colaborador', label: 'Singular' },
                { name: 'colaboradores', label: 'Plural' }
              ]},
              { key: 'establecimiento', title: 'Establecimientos / Servicios', fields: [
                { name: 'establecimiento', label: 'Singular' },
                { name: 'establecimientos', label: 'Plural' }
              ]},
              { key: 'cliente', title: 'Clientes', fields: [
                { name: 'cliente', label: 'Singular' },
                { name: 'clientes', label: 'Plural' }
              ]},
              { key: 'reserva', title: 'Reservas', fields: [
                { name: 'reserva', label: 'Singular' },
                { name: 'reservas', label: 'Plural' }
              ]},
              { key: 'recurso', title: 'Recursos', fields: [
                { name: 'recurso', label: 'Singular' },
                { name: 'recursos', label: 'Plural' }
              ]}
            ].map((group) => (
              <div key={group.key} className="list-item">
                <div className="item-content">
                  <h3 className="item-title">{group.title}</h3>
                  <div className="label-inputs">
                    {group.fields.map((f) => (
                      <div className="form-group" key={f.name}>
                        <label htmlFor={f.name}>{f.label}:</label>
                        <input
                          id={f.name}
                          type="text"
                          value={uiLabels[f.name as keyof typeof uiLabels] ?? ''}
                          onChange={(e) => setUiLabels(prev => ({ ...prev, [f.name]: e.target.value }))}
                          placeholder={f.label === 'Singular' ? 'Ej: Cliente' : 'Ej: Clientes'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="item-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      const defaults: Record<string, string> = {
                        colaborador: 'Colaborador',
                        colaboradores: 'Colaboradores',
                        establecimiento: 'Establecimiento',
                        establecimientos: 'Establecimientos',
                        cliente: 'Cliente',
                        clientes: 'Clientes',
                        reserva: 'Reserva',
                        reservas: 'Reservas',
                        recurso: 'Recurso',
                        recursos: 'Recursos'
                      };
                      const newLabels = { ...uiLabels };
                      group.fields.forEach(f => {
                        newLabels[f.name as keyof typeof uiLabels] = defaults[f.name] || '';
                      });
                      setUiLabels(newLabels);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
          }}
          className="btn-primary"
          disabled={loading}
          style={{ minWidth: '200px' }}
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default Configuracion;

