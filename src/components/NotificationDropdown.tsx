import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { notificationService, type Notification } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NotificationDropdown: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadNotifications();
        // Poll para novas notificações a cada minuto
        const interval = setInterval(loadNotifications, 60000);

        // Listener para recarregar imediatamente quando uma notificação é criada
        const handleNotificationCreated = () => {
            console.log('Nova notificação detectada, recarregando...');
            loadNotifications();
        };
        window.addEventListener('notification-created', handleNotificationCreated);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notification-created', handleNotificationCreated);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadNotifications = async () => {
        try {
            const [data, count] = await Promise.all([
                notificationService.getAll(),
                notificationService.getUnreadCount()
            ]);
            setNotifications(data);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await notificationService.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (notifications.find(n => n.id === id && !n.read)) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-5 h-5 text-warning" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-success" />;
            case 'error': return <XCircle className="w-5 h-5 text-danger" />;
            default: return <Info className="w-5 h-5 text-primary" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="relative p-2 text-text-muted hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-surface">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-surface border border-slate-800 rounded-xl shadow-xl z-50 max-h-[80vh] flex flex-col">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-white">Notificações</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-primary hover:text-primary-hover font-medium"
                            >
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-text-muted">
                                <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p>Nenhuma notificação</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-slate-800/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium text-white ${!notification.read ? 'font-bold' : ''}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-text-muted mt-1 break-words">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-text-muted mt-2">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="p-1 text-text-muted hover:text-primary transition-colors"
                                                        title="Marcar como lida"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="p-1 text-text-muted hover:text-danger transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
