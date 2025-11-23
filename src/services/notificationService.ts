import { supabase } from './supabase';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
    created_at: string;
    related_entity_type?: string;
    related_entity_id?: string;
}

export const notificationService = {
    async getAll() {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Notification[];
    },

    async getUnreadCount() {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('read', false);

        if (error) throw error;
        return count || 0;
    },

    async markAsRead(id: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (error) throw error;
    },

    async markAllAsRead() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false);

        if (error) throw error;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async create(notification: Omit<Notification, 'id' | 'created_at' | 'user_id' | 'read'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('notifications')
            .insert([
                {
                    ...notification,
                    user_id: user.id,
                    read: false
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data as Notification;
    }
};
