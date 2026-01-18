import { supabase } from '../client';
import type { Restaurant } from '@/types';

export class RestaurantService {
    /**
     * Get restaurant for current user
     */
    async getRestaurant(userId: string): Promise<Restaurant | null> {
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(1)
            .limit(1);

        if (error) {
            console.error('Error fetching restaurant:', error);
            return null;
        }

        return data && data.length > 0 ? this.mapToRestaurant(data[0]) : null;
    }

    /**
     * Get or create restaurant for user (for first-time setup)
     */
    async getOrCreateRestaurant(userId: string, defaultName: string = 'Il Mio Ristorante'): Promise<Restaurant | null> {
        // Try to get existing
        const restaurant = await this.getRestaurant(userId);

        if (restaurant) {
            return restaurant;
        }

        // Create new restaurant
        const { data, error } = await supabase
            .from('restaurants')
            .insert({
                user_id: userId,
                name: defaultName,
                max_capacity_lunch: 80,
                max_capacity_dinner: 100,
                default_table_duration: 120,
                green_threshold: 60,
                yellow_threshold: 80,
                orange_threshold: 99,
                opening_hours: {
                    'Lunedì': { lunch: { start: '12:00', end: '15:00' }, dinner: { start: '19:00', end: '23:00' } },
                    'Martedì': { lunch: { start: '12:00', end: '15:00' }, dinner: { start: '19:00', end: '23:00' } },
                    'Mercoledì': { closed: true },
                    'Giovedì': { lunch: { start: '12:00', end: '15:00' }, dinner: { start: '19:00', end: '23:00' } },
                    'Venerdì': { lunch: { start: '12:00', end: '15:00' }, dinner: { start: '19:00', end: '23:00' } },
                    'Sabato': { lunch: { start: '12:00', end: '15:00' }, dinner: { start: '19:00', end: '23:00' } },
                    'Domenica': { lunch: { start: '12:00', end: '15:00' }, dinner: { start: '19:00', end: '23:00' } },
                },
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating restaurant:', error);
            throw new Error('Failed to create restaurant');
        }

        return this.mapToRestaurant(data);
    }

    /**
     * Update restaurant settings
     */
    async updateRestaurant(restaurantId: string, updates: Partial<Restaurant>): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.maxCapacityLunch !== undefined) updateData.max_capacity_lunch = updates.maxCapacityLunch;
        if (updates.maxCapacityDinner !== undefined) updateData.max_capacity_dinner = updates.maxCapacityDinner;
        if (updates.defaultTableDuration !== undefined) updateData.default_table_duration = updates.defaultTableDuration;
        if (updates.openingHours !== undefined) updateData.opening_hours = updates.openingHours;
        if (updates.greenThreshold !== undefined) updateData.green_threshold = updates.greenThreshold;
        if (updates.yellowThreshold !== undefined) updateData.yellow_threshold = updates.yellowThreshold;
        if (updates.orangeThreshold !== undefined) updateData.orange_threshold = updates.orangeThreshold;

        const { data, error } = await supabase
            .from('restaurants')
            .update(updateData)
            .eq('id', restaurantId)
            .select()
            .single();

        if (error) {
            console.error('Error updating restaurant:', error);
            throw new Error('Failed to update restaurant');
        }

        if (!data) {
            console.error('No restaurant updated with id:', restaurantId);
            throw new Error('Restaurant not found or not updated');
        }
    }

    /**
     * Map database row to Restaurant type
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapToRestaurant(data: any): Restaurant {
        return {
            id: data.id,
            name: data.name,
            maxCapacityLunch: data.max_capacity_lunch,
            maxCapacityDinner: data.max_capacity_dinner,
            defaultTableDuration: data.default_table_duration,
            greenThreshold: data.green_threshold ?? 60,
            yellowThreshold: data.yellow_threshold ?? 80,
            orangeThreshold: data.orange_threshold ?? 99,
            openingHours: data.opening_hours,
            createdAt: new Date(data.created_at),
        };
    }
}

export const restaurantService = new RestaurantService();
