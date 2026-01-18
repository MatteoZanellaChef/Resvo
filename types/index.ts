// TypeScript types for Resvo application

export type ServiceType = 'lunch' | 'dinner';

export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface Restaurant {
    id: string;
    name: string;
    maxCapacityLunch: number;
    maxCapacityDinner: number;
    defaultTableDuration: number; // in minutes
    greenThreshold?: number;  // Default 60
    yellowThreshold?: number; // Default 80
    orangeThreshold?: number; // Default 99
    openingHours: {
        [key: string]: {
            lunch?: { start: string; end: string };
            dinner?: { start: string; end: string };
            closed?: boolean;
        };
    };
    createdAt: Date;
}

export interface RoomSpace {
    id: string;
    value: string;        // unique identifier used in tables
    label: string;        // display name
    isDefault: boolean;   // true for interno/esterno/veranda
    order: number;        // display order
}

export interface Table {
    id: string;
    restaurantId: string;
    tableNumber: string;
    capacity: number;
    position: string;  // dynamic space value instead of hardcoded union
    isActive: boolean;
}

export interface Reservation {
    id: string;
    restaurantId: string;
    date: Date;
    time: string;
    serviceType: ServiceType;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    numGuests: number;
    tableId?: string;
    table?: Table;
    status: ReservationStatus;
    notes?: string;
    specialRequests?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DailyStats {
    id: string;
    restaurantId: string;
    date: Date;
    serviceType: ServiceType;
    totalReservations: number;
    totalGuests: number;
    capacityPercentage: number;
    noShows: number;
}

export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface CapacityStatus {
    available: number;
    total: number;
    percentage: number;
    color: 'green' | 'yellow' | 'orange' | 'red';
}
