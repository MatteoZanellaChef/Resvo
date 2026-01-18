'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Restaurant, RoomSpace, Table } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { restaurantService } from '@/lib/supabase/services/restaurant.service';
import { spacesService } from '@/lib/supabase/services/spaces.service';
import { tablesService } from '@/lib/supabase/services/tables.service';

interface RestaurantSettingsContextType {
    restaurant: Restaurant | null;
    spaces: RoomSpace[];
    tables: Table[];
    updateSettings: (settings: Partial<Restaurant>) => Promise<void>;
    addSpace: (space: Omit<RoomSpace, 'id'>) => Promise<void>;
    updateSpace: (id: string, updates: Partial<Omit<RoomSpace, 'id' | 'isDefault'>>) => Promise<void>;
    deleteSpace: (id: string) => Promise<void>;
    addTable: (table: Omit<Table, 'id' | 'restaurantId'>) => Promise<void>;
    updateTable: (id: string, updates: Partial<Omit<Table, 'id' | 'restaurantId'>>) => Promise<void>;
    deleteTable: (id: string) => Promise<void>;
    isLoading: boolean;
    refreshAll: () => Promise<void>;
}

const RestaurantSettingsContext = createContext<RestaurantSettingsContextType | undefined>(undefined);

export function RestaurantSettingsProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [spaces, setSpaces] = useState<RoomSpace[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);



    const loadAllData = useCallback(async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            // Load or create restaurant
            const restaurantData = await restaurantService.getOrCreateRestaurant(user.id);
            setRestaurant(restaurantData);

            if (restaurantData) {
                // Load spaces and tables in parallel
                const [spacesData, tablesData] = await Promise.all([
                    spacesService.getSpaces(restaurantData.id),
                    tablesService.getTables(restaurantData.id),
                ]);

                setSpaces(spacesData);
                setTables(tablesData);
            }
        } catch (error) {
            console.error('Error loading restaurant data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Load all data when user is authenticated
    useEffect(() => {
        if (authLoading) return;

        if (user) {
            loadAllData();
        } else {
            setIsLoading(false);
        }
    }, [user, authLoading, loadAllData]);

    const refreshAll = async () => {
        await loadAllData();
    };

    const updateSettings = async (settings: Partial<Restaurant>) => {
        if (!restaurant) throw new Error('No restaurant loaded');

        try {
            await restaurantService.updateRestaurant(restaurant.id, settings);

            // Update local state
            setRestaurant({ ...restaurant, ...settings });
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    };

    const addSpace = async (space: Omit<RoomSpace, 'id'>) => {
        if (!restaurant) throw new Error('No restaurant loaded');

        try {
            // Check for duplicate value
            if (spaces.some(s => s.value === space.value)) {
                throw new Error('Esiste già uno spazio con questo valore');
            }

            const newSpace = await spacesService.addSpace(restaurant.id, space);
            setSpaces([...spaces, newSpace]);
        } catch (error) {
            console.error('Error adding space:', error);
            throw error;
        }
    };

    const updateSpace = async (id: string, updates: Partial<Omit<RoomSpace, 'id' | 'isDefault'>>) => {
        try {
            // Check for duplicate value if value is being updated
            if (updates.value) {
                const duplicates = spaces.filter(s => s.value === updates.value && s.id !== id);
                if (duplicates.length > 0) {
                    throw new Error('Esiste già uno spazio con questo valore');
                }
            }

            await spacesService.updateSpace(id, updates);

            // Update local state
            setSpaces(spaces.map(space =>
                space.id === id ? { ...space, ...updates } : space
            ));
        } catch (error) {
            console.error('Error updating space:', error);
            throw error;
        }
    };

    const deleteSpace = async (id: string) => {
        try {
            await spacesService.deleteSpace(id);
            setSpaces(spaces.filter(space => space.id !== id));
        } catch (error) {
            console.error('Error deleting space:', error);
            throw error;
        }
    };

    const addTable = async (table: Omit<Table, 'id' | 'restaurantId'>) => {
        if (!restaurant) throw new Error('No restaurant loaded');

        try {
            const newTable = await tablesService.addTable(restaurant.id, table);
            setTables([...tables, newTable]);
        } catch (error) {
            console.error('Error adding table:', error);
            throw error;
        }
    };

    const updateTable = async (id: string, updates: Partial<Omit<Table, 'id' | 'restaurantId'>>) => {
        try {
            await tablesService.updateTable(id, updates);

            // Update local state
            setTables(tables.map(table =>
                table.id === id ? { ...table, ...updates } : table
            ));
        } catch (error) {
            console.error('Error updating table:', error);
            throw error;
        }
    };

    const deleteTable = async (id: string) => {
        try {
            await tablesService.deleteTable(id);
            setTables(tables.filter(table => table.id !== id));
        } catch (error) {
            console.error('Error deleting table:', error);
            throw error;
        }
    };

    // Provide a default restaurant object while loading to avoid null issues
    const contextValue: RestaurantSettingsContextType = {
        restaurant: restaurant || {
            id: '',
            name: 'Caricamento...',
            maxCapacityLunch: 80,
            maxCapacityDinner: 100,
            defaultTableDuration: 120,
            openingHours: {},
            createdAt: new Date(),
        },
        spaces,
        tables,
        updateSettings,
        addSpace,
        updateSpace,
        deleteSpace,
        addTable,
        updateTable,
        deleteTable,
        isLoading,
        refreshAll,
    };

    return (
        <RestaurantSettingsContext.Provider value={contextValue}>
            {children}
        </RestaurantSettingsContext.Provider>
    );
}

export function useRestaurantSettings() {
    const context = useContext(RestaurantSettingsContext);
    if (!context) {
        throw new Error('useRestaurantSettings must be used within RestaurantSettingsProvider');
    }
    return context;
}
