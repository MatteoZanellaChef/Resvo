import { supabase } from '../client';
import type { Table } from '@/types';

export class TablesService {
    /**
     * Get all tables for a restaurant
     */
    async getTables(restaurantId: string): Promise<Table[]> {
        const { data, error } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('table_number', { ascending: true });

        if (error) {
            console.error('Error fetching tables:', error);
            throw new Error('Failed to fetch tables');
        }

        return data.map(this.mapToTable);
    }

    /**
     * Get tables by position/space
     */
    async getTablesBySpace(restaurantId: string, position: string): Promise<Table[]> {
        const { data, error } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .eq('position', position)
            .order('table_number', { ascending: true });

        if (error) {
            console.error('Error fetching tables by space:', error);
            throw new Error('Failed to fetch tables');
        }

        return data.map(this.mapToTable);
    }

    /**
     * Add a new table
     */
    async addTable(restaurantId: string, table: Omit<Table, 'id' | 'restaurantId'>): Promise<Table> {
        const { data, error } = await supabase
            .from('tables')
            .insert({
                restaurant_id: restaurantId,
                table_number: table.tableNumber,
                capacity: table.capacity,
                position: table.position,
                is_active: table.isActive,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding table:', error);
            throw new Error(error.message || 'Failed to add table');
        }

        return this.mapToTable(data);
    }

    /**
     * Update a table
     */
    async updateTable(tableId: string, updates: Partial<Omit<Table, 'id' | 'restaurantId'>>): Promise<void> {
        const { error } = await supabase
            .from('tables')
            .update({
                table_number: updates.tableNumber,
                capacity: updates.capacity,
                position: updates.position,
                is_active: updates.isActive,
            })
            .eq('id', tableId);

        if (error) {
            console.error('Error updating table:', error);
            throw new Error(error.message || 'Failed to update table');
        }
    }

    /**
     * Delete a table
     */
    async deleteTable(tableId: string): Promise<void> {
        const { error } = await supabase
            .from('tables')
            .delete()
            .eq('id', tableId);

        if (error) {
            console.error('Error deleting table:', error);
            throw new Error(error.message || 'Failed to delete table');
        }
    }

    /**
     * Map database row to Table type
     */
    private mapToTable(data: any): Table {
        return {
            id: data.id,
            restaurantId: data.restaurant_id,
            tableNumber: data.table_number,
            capacity: data.capacity,
            position: data.position,
            isActive: data.is_active,
        };
    }
}

export const tablesService = new TablesService();
