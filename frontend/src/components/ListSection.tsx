import { ReactNode } from 'react';
import SkeletonLoader from './SkeletonLoader';
import '../styles/GestionPage.css';

interface ListSectionProps<T> {
    title: string;
    items: T[];
    loading?: boolean;
    emptyMessage?: string;
    renderItem: (item: T, index: number) => ReactNode;
    skeletonCount?: number;
}

const ListSection = <T,>({
    title,
    items,
    loading = false,
    emptyMessage = 'No hay elementos registrados',
    renderItem,
    skeletonCount = 3
}: ListSectionProps<T>) => {
    return (
        <div className="list-section">
            <h2>{title}</h2>
            {loading ? (
                <SkeletonLoader variant="list" count={skeletonCount} />
            ) : items.length === 0 ? (
                <div className="empty-message">{emptyMessage}</div>
            ) : (
                <div className="list-container">
                    {items.map((item, index) => renderItem(item, index))}
                </div>
            )}
        </div>
    );
};

export default ListSection;

