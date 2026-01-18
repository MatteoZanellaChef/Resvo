'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Restaurant, RoomSpace, Table } from '@/types';
import { mockRestaurant, mockTables } from '@/lib/mock-data';

interface RestaurantSettingsContextType {
    restaurant: Restaurant;
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
}

const RestaurantSettingsContext = createContext<RestaurantSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'resvo_restaurant_settings';
const SPACES_STORAGE_KEY = 'resvo_room_spaces';
const TABLES_STORAGE_KEY = 'resvo_tables';

// Default spaces
const DEFAULT_SPACES: RoomSpace[] = [
    { id: 'space-1', value: 'interno', label: 'Interno', isDefault: true, order: 1 },
    { id: 'space-2', value: 'esterno', label: 'Esterno', isDefault: true, order: 2 },
    { id: 'space-3', value: 'veranda', label: 'Veranda', isDefault: true, order: 3 },
];

export function RestaurantSettingsProvider({ children }: { children: ReactNode }) {
    const [restaurant, setRestaurant] = useState<Restaurant>(mockRestaurant);
    const [spaces, setSpaces] = useState<RoomSpace[]>(DEFAULT_SPACES);
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load settings, spaces, and tables from localStorage on mount
    useEffect(() => {
        const loadSettings = () => {
            try {
                // Load restaurant settings
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsedSettings = JSON.parse(stored);
                    setRestaurant({ ...mockRestaurant, ...parsedSettings });
                }

                // Load spaces
                const storedSpaces = localStorage.getItem(SPACES_STORAGE_KEY);
                if (storedSpaces) {
                    const parsedSpaces = JSON.parse(storedSpaces);
                    setSpaces(parsedSpaces);
                } else {
                    // Initialize with default spaces
                    localStorage.setItem(SPACES_STORAGE_KEY, JSON.stringify(DEFAULT_SPACES));
                }

                // Load tables
                const storedTables = localStorage.getItem(TABLES_STORAGE_KEY);
                if (storedTables) {
                    const parsedTables = JSON.parse(storedTables);
                    setTables(parsedTables);
                } else {
                    // Initialize with mock tables
                    localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(mockTables));
                    setTables(mockTables);
                }
            } catch (error) {
                console.error('Error loading restaurant settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const updateSettings = async (settings: Partial<Restaurant>) => {
        try {
            const updated = { ...restaurant, ...settings };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setRestaurant(updated);
        } catch (error) {
            console.error('Error updating restaurant settings:', error);
            throw error;
        }
    };

    const addSpace = async (space: Omit<RoomSpace, 'id'>) => {
        try {
            // Check for duplicate value
            if (spaces.some(s => s.value === space.value)) {
                throw new Error('Esiste già uno spazio con questo valore');
            }

            const newSpace: RoomSpace = {
                ...space,
                id: `space-${Date.now()}`,
            };

            const updated = [...spaces, newSpace];
            localStorage.setItem(SPACES_STORAGE_KEY, JSON.stringify(updated));
            setSpaces(updated);
        } catch (error) {
            console.error('Error adding space:', error);
            throw error;
        }
    };

    const updateSpace = async (id: string, updates: Partial<Omit<RoomSpace, 'id' | 'isDefault'>>) => {
        try {
            const updated = spaces.map(space =>
                space.id === id ? { ...space, ...updates } : space
            );

            // Check for duplicate value if value is being updated
            if (updates.value) {
                const duplicates = updated.filter(s => s.value === updates.value);
                if (duplicates.length > 1) {
                    throw new Error('Esiste già uno spazio con questo valore');
                }
            }

            localStorage.setItem(SPACES_STORAGE_KEY, JSON.stringify(updated));
            setSpaces(updated);
        } catch (error) {
            console.error('Error updating space:', error);
            throw error;
        }
    };

    const deleteSpace = async (id: string) => {
        try {
            const updated = spaces.filter(space => space.id !== id);
            localStorage.setItem(SPACES_STORAGE_KEY, JSON.stringify(updated));
            setSpaces(updated);
        } catch (error) {
            console.error('Error deleting space:', error);
            throw error;
        }
    };

    const addTable = async (table: Omit<Table, 'id' | 'restaurantId'>) => {
        try {
            const newTable: Table = {
                ...table,
                id: `table-${Date.now()}`,
                restaurantId: restaurant.id,
            };

            const updated = [...tables, newTable];
            localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(updated));
            setTables(updated);
        } catch (error) {
            console.error('Error adding table:', error);
            throw error;
        }
    };

    const updateTable = async (id: string, updates: Partial<Omit<Table, 'id' | 'restaurantId'>>) => {
        try {
            const updated = tables.map(table =>
                table.id === id ? { ...table, ...updates } : table
            );

            localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(updated));
            setTables(updated);
        } catch (error) {
            console.error('Error updating table:', error);
            throw error;
        }
    };

    const deleteTable = async (id: string) => {
        try {
            const updated = tables.filter(table => table.id !== id);
            localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(updated));
            setTables(updated);
        } catch (error) {
            console.error('Error deleting table:', error);
            throw error;
        }
    };

    return (
        <RestaurantSettingsContext.Provider
            value={{
                restaurant,
                spaces,
                tables,
                updateSettings,
                addSpace,
                updateSpace,
                deleteSpace,
                addTable,
                updateTable,
                deleteTable,
                isLoading
            }}
        >
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
