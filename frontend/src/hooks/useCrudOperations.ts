import { useState, useCallback } from 'react';
import { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

interface CrudState<T> {
    items: T[];
    loading: boolean;
    error: string;
    success: string;
}

interface ModalState<T> {
    isOpen: boolean;
    editingItem: T | null;
}

interface ConfirmModalState {
    isOpen: boolean;
    itemId: number | null;
    itemName: string;
}

interface UseCrudOperationsOptions {
    client: AxiosInstance;
    endpoint: string;
    itemName: string; // 'Servicio', 'Staff', 'Cliente', etc.
    events?: string[]; // WebSocket events ['servicio-created', etc.]
    isDemoMode?: boolean;
}

export const useCrudOperations = <T extends { id: number; nombre?: string; [key: string]: any }>(
    options: UseCrudOperationsOptions
) => {
    const { client, endpoint, itemName, isDemoMode = false } = options;

    // Estados principales
    const [state, setState] = useState<CrudState<T>>({
        items: [],
        loading: true,
        error: '',
        success: ''
    });

    // Estado del modal de edición
    const [modalState, setModalState] = useState<ModalState<T>>({
        isOpen: false,
        editingItem: null
    });

    // Estado del modal de confirmación
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        itemId: null,
        itemName: ''
    });

    // Función genérica para obtener items
    const fetchItems = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: '' }));
            const response = await client.get(endpoint);
            setState(prev => ({
                ...prev,
                items: response.data.data || [],
                loading: false
            }));
        } catch (err: any) {
            logger.error(`Error al cargar ${itemName.toLowerCase()}s:`, err);
            setState(prev => ({
                ...prev,
                loading: false,
                error: `Error al cargar ${itemName.toLowerCase()}s. Por favor, intenta de nuevo.`
            }));
        }
    }, [client, endpoint, itemName]);

    // Función genérica para crear item
    const createItem = useCallback(async (itemData: Partial<T>) => {
        if (isDemoMode) {
            setState(prev => ({
                ...prev,
                error: `En modo demo no se pueden crear ${itemName.toLowerCase()}s. Esta es solo una demostración.`
            }));
            return { success: false };
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: '' }));
            await client.post(endpoint, itemData);
            setState(prev => ({
                ...prev,
                loading: false,
                success: `${itemName} creado exitosamente`,
                error: ''
            }));
            await fetchItems();
            return { success: true };
        } catch (err: any) {
            logger.error(`Error al crear ${itemName.toLowerCase()}:`, err);
            setState(prev => ({
                ...prev,
                loading: false,
                error: `Error al crear ${itemName.toLowerCase()}. Por favor, intenta de nuevo.`
            }));
            return { success: false };
        }
    }, [client, endpoint, itemName, isDemoMode, fetchItems]);

    // Función genérica para actualizar item
    const updateItem = useCallback(async (id: number, itemData: Partial<T>) => {
        if (isDemoMode) {
            setState(prev => ({
                ...prev,
                error: `En modo demo no se pueden editar ${itemName.toLowerCase()}s. Esta es solo una demostración.`
            }));
            return { success: false };
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: '' }));
            await client.put(`${endpoint}/${id}`, itemData);
            setState(prev => ({
                ...prev,
                loading: false,
                success: `${itemName} actualizado exitosamente`,
                error: ''
            }));
            await fetchItems();
            closeModal();
            return { success: true };
        } catch (err: any) {
            logger.error(`Error al actualizar ${itemName.toLowerCase()}:`, err);
            setState(prev => ({
                ...prev,
                loading: false,
                error: `Error al actualizar ${itemName.toLowerCase()}. Por favor, intenta de nuevo.`
            }));
            return { success: false };
        }
    }, [client, endpoint, itemName, isDemoMode, fetchItems]);

    // Función genérica para eliminar item
    const deleteItem = useCallback(async (id: number) => {
        if (isDemoMode) {
            setState(prev => ({
                ...prev,
                error: `En modo demo no se pueden eliminar ${itemName.toLowerCase()}s. Esta es solo una demostración.`
            }));
            closeConfirmModal();
            return { success: false };
        }

        try {
            setState(prev => ({ ...prev, loading: true, error: '' }));
            await client.delete(`${endpoint}/${id}`);
            setState(prev => ({
                ...prev,
                loading: false,
                success: `${itemName} eliminado exitosamente`,
                error: ''
            }));
            await fetchItems();
            closeConfirmModal();
            return { success: true };
        } catch (err: any) {
            logger.error(`Error al eliminar ${itemName.toLowerCase()}:`, err);
            setState(prev => ({
                ...prev,
                loading: false,
                error: `Error al eliminar ${itemName.toLowerCase()}. Por favor, intenta de nuevo.`
            }));
            return { success: false };
        }
    }, [client, endpoint, itemName, isDemoMode, fetchItems]);

    // Funciones para manejar modales
    const openModal = useCallback((item: T | null = null) => {
        setModalState({
            isOpen: true,
            editingItem: item
        });
    }, []);

    const closeModal = useCallback(() => {
        setModalState({
            isOpen: false,
            editingItem: null
        });
    }, []);

    const openConfirmModal = useCallback((item: T) => {
        const name = (item as any).nombre || (item as any).name || `Item #${item.id}`;
        setConfirmModal({
            isOpen: true,
            itemId: item.id,
            itemName: name
        });
    }, []);

    const closeConfirmModal = useCallback(() => {
        setConfirmModal({
            isOpen: false,
            itemId: null,
            itemName: ''
        });
    }, []);

    // Funciones para limpiar mensajes
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: '' }));
    }, []);

    const clearSuccess = useCallback(() => {
        setState(prev => ({ ...prev, success: '' }));
    }, []);

    return {
        // Estado
        items: state.items,
        loading: state.loading,
        error: state.error,
        success: state.success,
        modalState,
        confirmModal,

        // Acciones
        fetchItems,
        createItem,
        updateItem,
        deleteItem,

        // Modales
        openModal,
        closeModal,
        openConfirmModal,
        closeConfirmModal,

        // Utilidades
        clearError,
        clearSuccess,

        // Setters directos (para casos especiales)
        setItems: (items: T[]) => setState(prev => ({ ...prev, items })),
        setError: (error: string) => setState(prev => ({ ...prev, error })),
        setSuccess: (success: string) => setState(prev => ({ ...prev, success }))
    };
};

