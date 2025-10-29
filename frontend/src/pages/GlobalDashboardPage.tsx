import React, { useState, useEffect } from 'react';
import apiClient from '../config/api';
import './DashboardPage.css';

interface TenantStats {
    total_tenants: number;
    active_tenants: number;
    suspended_tenants: number;
    cancelled_tenants: number;
    basic_plan: number;
    premium_plan: number;
    enterprise_plan: number;
}

interface RecentTenant {
    id: number;
    tenant_name: string;
    display_name: string;
    cliente_nombre: string;
    estado: string;
    plan: string;
    created_at: string;
}

const GlobalDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<TenantStats | null>(null);
    const [recentTenants, setRecentTenants] = useState<RecentTenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, tenantsResponse] = await Promise.all([
                apiClient.get('/super-admin/tenants/stats'),
                apiClient.get('/super-admin/tenants?limit=5')
            ]);
            
            setStats(statsResponse.data.data);
            setRecentTenants(tenantsResponse.data.data);
        } catch (error: any) {
            setError('Error al cargar datos: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading">Cargando dashboard...</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Dashboard Global - WEEKLY</h1>
                <p>Panel de Super Administración</p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Estadísticas Principales */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card primary">
                        <div className="stat-icon">🏢</div>
                        <div className="stat-content">
                            <h3>Total Tenants</h3>
                            <div className="stat-number">{stats.total_tenants}</div>
                        </div>
                    </div>
                    
                    <div className="stat-card success">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>Activos</h3>
                            <div className="stat-number">{stats.active_tenants}</div>
                        </div>
                    </div>
                    
                    <div className="stat-card warning">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <h3>Suspendidos</h3>
                            <div className="stat-number">{stats.suspended_tenants}</div>
                        </div>
                    </div>
                    
                    <div className="stat-card danger">
                        <div className="stat-icon">❌</div>
                        <div className="stat-content">
                            <h3>Cancelados</h3>
                            <div className="stat-number">{stats.cancelled_tenants}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Estadísticas de Planes */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <h3>Plan Básico</h3>
                            <div className="stat-number">{stats.basic_plan}</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-content">
                            <h3>Plan Premium</h3>
                            <div className="stat-number">{stats.premium_plan}</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">💎</div>
                        <div className="stat-content">
                            <h3>Plan Enterprise</h3>
                            <div className="stat-number">{stats.enterprise_plan}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tenants Recientes */}
            <div className="dashboard-section">
                <h2>Tenants Recientes</h2>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Cliente</th>
                                <th>Plan</th>
                                <th>Estado</th>
                                <th>Creado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTenants.map((tenant) => (
                                <tr key={tenant.id}>
                                    <td>
                                        <div>
                                            <strong>{tenant.display_name}</strong>
                                            <br />
                                            <small>{tenant.tenant_name}.weekly</small>
                                        </div>
                                    </td>
                                    <td>{tenant.cliente_nombre}</td>
                                    <td>
                                        <span 
                                            className="badge" 
                                            style={{ backgroundColor: getPlanColor(tenant.plan) }}
                                        >
                                            {tenant.plan}
                                        </span>
                                    </td>
                                    <td>
                                        <span 
                                            className="badge" 
                                            style={{ backgroundColor: getStatusColor(tenant.estado) }}
                                        >
                                            {tenant.estado}
                                        </span>
                                    </td>
                                    <td>{new Date(tenant.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <a 
                                            href={`https://${tenant.tenant_name}.weekly`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-primary"
                                        >
                                            Ver Panel
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="dashboard-section">
                <h2>Acciones Rápidas</h2>
                <div className="quick-actions">
                    <a href="/super-admin/tenants" className="action-card">
                        <div className="action-icon">🏢</div>
                        <h3>Gestionar Tenants</h3>
                        <p>Crear, editar y administrar todos los tenants</p>
                    </a>
                    
                    <a href="/super-admin/users" className="action-card">
                        <div className="action-icon">👥</div>
                        <h3>Usuarios Globales</h3>
                        <p>Administrar usuarios del sistema global</p>
                    </a>
                    
                    <a href="/super-admin/billing" className="action-card">
                        <div className="action-icon">💳</div>
                        <h3>Facturación</h3>
                        <p>Gestionar pagos y facturación</p>
                    </a>
                    
                    <a href="/super-admin/support" className="action-card">
                        <div className="action-icon">🎧</div>
                        <h3>Soporte</h3>
                        <p>Tickets de soporte y ayuda</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default GlobalDashboardPage;
