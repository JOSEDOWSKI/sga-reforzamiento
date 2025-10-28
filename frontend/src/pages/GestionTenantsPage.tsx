import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import '../styles/GestionPage.css';

interface Tenant {
    id: number;
    tenant_name: string;
    display_name: string;
    cliente_nombre: string;
    cliente_email: string;
    cliente_telefono: string;
    cliente_direccion: string;
    estado: 'activo' | 'suspendido' | 'cancelado';
    plan: 'basico' | 'premium' | 'enterprise';
    created_at: string;
    updated_at: string;
    ultimo_acceso?: string;
    fecha_vencimiento?: string;
    monto_mensual?: number;
    pagado_hasta?: string;
    dias_vencido?: number;
}

interface TenantStats {
    total_tenants: number;
    active_tenants: number;
    suspended_tenants: number;
    cancelled_tenants: number;
    basic_plan: number;
    premium_plan: number;
    enterprise_plan: number;
}

const GestionTenantsPage: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [stats, setStats] = useState<TenantStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [formData, setFormData] = useState({
        tenant_name: '',
        display_name: '',
        cliente_nombre: '',
        cliente_email: '',
        cliente_telefono: '',
        cliente_direccion: '',
        plan: 'basico' as const,
        estado: 'activo' as const
    });

    useEffect(() => {
        fetchTenants();
        fetchStats();
    }, []);

    const fetchTenants = async () => {
        try {
            const response = await apiClient.get('/super-admin/tenants');
            setTenants(response.data.data);
        } catch (error: any) {
            setError('Error al cargar tenants: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/super-admin/tenants/stats');
            setStats(response.data.data);
        } catch (error: any) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const handleCreateTenant = () => {
        setEditingTenant(null);
        setFormData({
            tenant_name: '',
            display_name: '',
            cliente_nombre: '',
            cliente_email: '',
            cliente_telefono: '',
            cliente_direccion: '',
            plan: 'basico',
            estado: 'activo'
        });
        setShowModal(true);
    };

    const handleEditTenant = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setFormData({
            tenant_name: tenant.tenant_name,
            display_name: tenant.display_name,
            cliente_nombre: tenant.cliente_nombre,
            cliente_email: tenant.cliente_email,
            cliente_telefono: tenant.cliente_telefono,
            cliente_direccion: tenant.cliente_direccion,
            plan: tenant.plan,
            estado: tenant.estado
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTenant) {
                await apiClient.put(`/super-admin/tenants/${editingTenant.id}`, formData);
            } else {
                await apiClient.post('/super-admin/tenants', formData);
            }
            setShowModal(false);
            fetchTenants();
            fetchStats();
        } catch (error: any) {
            setError('Error al guardar tenant: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteTenant = async (id: number) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este tenant?')) {
            return;
        }
        try {
            await apiClient.delete(`/super-admin/tenants/${id}`);
            fetchTenants();
            fetchStats();
        } catch (error: any) {
            setError('Error al eliminar tenant: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleToggleStatus = async (tenant: Tenant) => {
        const newStatus = tenant.estado === 'activo' ? 'suspendido' : 'activo';
        const action = newStatus === 'suspendido' ? 'suspender' : 'activar';
        
        if (!confirm(`¿Estás seguro de que quieres ${action} la plataforma de ${tenant.cliente_nombre}?`)) {
            return;
        }
        
        try {
            await apiClient.put(`/super-admin/tenants/${tenant.id}`, {
                ...tenant,
                estado: newStatus
            });
            fetchTenants();
            fetchStats();
        } catch (error: any) {
            setError(`Error al ${action} tenant: ` + (error.response?.data?.message || error.message));
        }
    };

    const handleMarkAsPaid = async (tenant: Tenant) => {
        const fechaPago = new Date();
        const fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
        
        try {
            await apiClient.put(`/super-admin/tenants/${tenant.id}`, {
                ...tenant,
                pagado_hasta: fechaVencimiento.toISOString().split('T')[0],
                estado: 'activo'
            });
            fetchTenants();
            fetchStats();
        } catch (error: any) {
            setError('Error al marcar como pagado: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'activo': return '#28a745';
            case 'suspendido': return '#ffc107';
            case 'cancelado': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'basico': return '#6c757d';
            case 'premium': return '#007bff';
            case 'enterprise': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getPaymentStatus = (tenant: Tenant) => {
        if (!tenant.pagado_hasta) return { status: 'sin_pago', color: '#dc3545', text: 'Sin pago' };
        
        const fechaVencimiento = new Date(tenant.pagado_hasta);
        const hoy = new Date();
        const diasDiferencia = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasDiferencia < 0) {
            return { status: 'vencido', color: '#dc3545', text: `Vencido ${Math.abs(diasDiferencia)} días` };
        } else if (diasDiferencia <= 7) {
            return { status: 'por_vencer', color: '#ffc107', text: `Vence en ${diasDiferencia} días` };
        } else {
            return { status: 'al_dia', color: '#28a745', text: 'Al día' };
        }
    };

    const getPlanPrice = (plan: string) => {
        switch (plan) {
            case 'basico': return 29.99;
            case 'premium': return 59.99;
            case 'enterprise': return 99.99;
            default: return 0;
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading">Cargando tenants...</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Panel de Administración - Clientes</h1>
                <button className="btn btn-primary" onClick={handleCreateTenant}>
                    + Nuevo Cliente
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Estadísticas */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Clientes</h3>
                        <div className="stat-number">{stats.total_tenants}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Plataformas Activas</h3>
                        <div className="stat-number" style={{ color: '#28a745' }}>{stats.active_tenants}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Suspendidas</h3>
                        <div className="stat-number" style={{ color: '#ffc107' }}>{stats.suspended_tenants}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Canceladas</h3>
                        <div className="stat-number" style={{ color: '#dc3545' }}>{stats.cancelled_tenants}</div>
                    </div>
                </div>
            )}

            {/* Lista de Tenants */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Plataforma</th>
                            <th>Plan</th>
                            <th>Estado</th>
                            <th>Pago</th>
                            <th>Monto</th>
                            <th>Último Acceso</th>
                            <th>Control</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((tenant) => {
                            const paymentStatus = getPaymentStatus(tenant);
                            const planPrice = getPlanPrice(tenant.plan);
                            
                            return (
                                <tr key={tenant.id}>
                                    <td>
                                        <div>
                                            <strong>{tenant.cliente_nombre}</strong>
                                            <br />
                                            <small>{tenant.cliente_email}</small>
                                            <br />
                                            <small>{tenant.cliente_telefono}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <strong>{tenant.display_name}</strong>
                                            <br />
                                            <small className="platform-url">{tenant.tenant_name}.weekly</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span 
                                            className="badge" 
                                            style={{ backgroundColor: getPlanColor(tenant.plan) }}
                                        >
                                            {tenant.plan.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span 
                                            className="badge" 
                                            style={{ backgroundColor: getStatusColor(tenant.estado) }}
                                        >
                                            {tenant.estado.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span 
                                            className="badge" 
                                            style={{ backgroundColor: paymentStatus.color }}
                                        >
                                            {paymentStatus.text}
                                        </span>
                                        {tenant.pagado_hasta && (
                                            <>
                                                <br />
                                                <small>Hasta: {new Date(tenant.pagado_hasta).toLocaleDateString()}</small>
                                            </>
                                        )}
                                    </td>
                                    <td>
                                        <strong>${planPrice}</strong>
                                        <br />
                                        <small>/mes</small>
                                    </td>
                                    <td>
                                        {tenant.ultimo_acceso ? (
                                            <div>
                                                {new Date(tenant.ultimo_acceso).toLocaleDateString()}
                                                <br />
                                                <small>{new Date(tenant.ultimo_acceso).toLocaleTimeString()}</small>
                                            </div>
                                        ) : (
                                            <span className="text-muted">Nunca</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className={`btn btn-sm ${tenant.estado === 'activo' ? 'btn-warning' : 'btn-success'}`}
                                                onClick={() => handleToggleStatus(tenant)}
                                                title={tenant.estado === 'activo' ? 'Suspender plataforma' : 'Activar plataforma'}
                                            >
                                                {tenant.estado === 'activo' ? '⏸️ Suspender' : '▶️ Activar'}
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleMarkAsPaid(tenant)}
                                                title="Marcar como pagado"
                                            >
                                                💰 Pagado
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleEditTenant(tenant)}
                                                title="Editar información"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDeleteTenant(tenant.id)}
                                                title="Eliminar cliente"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal de Crear/Editar Tenant */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingTenant ? 'Editar Tenant' : 'Nuevo Tenant'}</h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre del Tenant</label>
                                    <input
                                        type="text"
                                        value={formData.tenant_name}
                                        onChange={(e) => setFormData({...formData, tenant_name: e.target.value})}
                                        required
                                        disabled={!!editingTenant}
                                        placeholder="cliente"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nombre para Mostrar</label>
                                    <input
                                        type="text"
                                        value={formData.display_name}
                                        onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                                        required
                                        placeholder="Mi Empresa"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre del Cliente</label>
                                    <input
                                        type="text"
                                        value={formData.cliente_nombre}
                                        onChange={(e) => setFormData({...formData, cliente_nombre: e.target.value})}
                                        required
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email del Cliente</label>
                                    <input
                                        type="email"
                                        value={formData.cliente_email}
                                        onChange={(e) => setFormData({...formData, cliente_email: e.target.value})}
                                        required
                                        placeholder="cliente@email.com"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.cliente_telefono}
                                        onChange={(e) => setFormData({...formData, cliente_telefono: e.target.value})}
                                        placeholder="+51 987 654 321"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Dirección</label>
                                    <input
                                        type="text"
                                        value={formData.cliente_direccion}
                                        onChange={(e) => setFormData({...formData, cliente_direccion: e.target.value})}
                                        placeholder="Lima, Perú"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Plan</label>
                                    <select
                                        value={formData.plan}
                                        onChange={(e) => setFormData({...formData, plan: e.target.value as any})}
                                    >
                                        <option value="basico">Básico</option>
                                        <option value="premium">Premium</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Estado</label>
                                    <select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({...formData, estado: e.target.value as any})}
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="suspendido">Suspendido</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingTenant ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionTenantsPage;
