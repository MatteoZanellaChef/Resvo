import { supabase } from '../client';
import type { RoomSpace } from '@/types';

export class SpacesService {
    /**
     * Get all spaces for a restaurant
     */
    async getSpaces(restaurantId: string): Promise<RoomSpace[]> {
        const { data, error } = await supabase
            .from('room_spaces')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching spaces:', error);
            throw new Error('Failed to fetch spaces');
        }

        return data.map(this.mapToRoomSpace);
    }

    /**
     * Add a new space
     */
    async addSpace(restaurantId: string, space: Omit<RoomSpace, 'id'>): Promise<RoomSpace> {
        const { data, error } = await supabase
            .from('room_spaces')
            .insert({
                restaurant_id: restaurantId,
                value: space.value,
                label: space.label,
                is_default: space.isDefault,
                display_order: space.order,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding space:', error);
            throw new Error(error.message || 'Failed to add space');
        }

        return this.mapToRoomSpace(data);
    }

    /**
     * Update a space
     */
    async updateSpace(spaceId: string, updates: Partial<Omit<RoomSpace, 'id' | 'isDefault'>>): Promise<void> {
        const { error } = await supabase
            .from('room_spaces')
            .update({
                value: updates.value,
                label: updates.label,
                display_order: updates.order,
            })
            .eq('id', spaceId);

        if (error) {
            console.error('Error updating space:', error);
            throw new Error(error.message || 'Failed to update space');
        }
    }

    /**
     * Delete a space
     */
    async deleteSpace(spaceId: string): Promise<void> {
        const { error } = await supabase
            .from('room_spaces')
            .delete()
            .eq('id', spaceId);

        if (error) {
            console.error('Error deleting space:', error);
            throw new Error(error.message || 'Failed to delete space');
        }
    }

    /**
     * Map database row to RoomSpace type
     */
    /**
     * Map database row to RoomSpace type
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapToRoomSpace(data: any): RoomSpace {
        return {
            id: data.id,
            value: data.value,
            label: data.label,
            isDefault: data.is_default,
            order: data.display_order,
        };
    }
}

export const spacesService = new SpacesService();
