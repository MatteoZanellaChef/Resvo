import { Reservation, ServiceType, CapacityStatus } from '@/types';
import { DEFAULT_CAPACITY_THRESHOLDS } from '@/lib/constants';

interface ColorThresholds {
    green: number;
    yellow: number;
    orange: number;
}

/**
 * Calculate capacity for a specific date and service
 */
export function calculateCapacity(
    reservations: Reservation[],
    maxCapacity: number,
    thresholds?: ColorThresholds
): CapacityStatus {
    const totalGuests = reservations.reduce((sum, res) => sum + res.numGuests, 0);
    const percentage = maxCapacity > 0 ? (totalGuests / maxCapacity) * 100 : 0;

    // Use provided thresholds or defaults
    const greenThreshold = thresholds?.green ?? DEFAULT_CAPACITY_THRESHOLDS.GREEN;
    const yellowThreshold = thresholds?.yellow ?? DEFAULT_CAPACITY_THRESHOLDS.YELLOW;
    const orangeThreshold = thresholds?.orange ?? DEFAULT_CAPACITY_THRESHOLDS.ORANGE;

    let color: 'green' | 'yellow' | 'orange' | 'red' = 'green';
    if (percentage > orangeThreshold) {
        color = 'red';
    } else if (percentage >= yellowThreshold) {
        color = 'orange';
    } else if (percentage >= greenThreshold) {
        color = 'yellow';
    }

    return {
        available: Math.max(0, maxCapacity - totalGuests),
        total: maxCapacity,
        percentage: Math.round(percentage),
        color,
    };
}

/**
 * Get reservations for a specific date and service
 */
export function getReservationsForDateAndService(
    reservations: Reservation[],
    date: Date,
    serviceType: ServiceType
): Reservation[] {
    return reservations.filter((res) => {
        const resDate = new Date(res.date);
        return (
            resDate.getFullYear() === date.getFullYear() &&
            resDate.getMonth() === date.getMonth() &&
            resDate.getDate() === date.getDate() &&
            res.serviceType === serviceType &&
            res.status !== 'cancelled'
        );
    });
}

/**
 * Calculate daily capacity statistics
 */
export function calculateDailyStats(
    reservations: Reservation[],
    maxCapacityLunch: number,
    maxCapacityDinner: number
) {
    const lunchReservations = reservations.filter((r) => r.serviceType === 'lunch' && r.status !== 'cancelled');
    const dinnerReservations = reservations.filter((r) => r.serviceType === 'dinner' && r.status !== 'cancelled');

    const lunchGuests = lunchReservations.reduce((sum, r) => sum + r.numGuests, 0);
    const dinnerGuests = dinnerReservations.reduce((sum, r) => sum + r.numGuests, 0);

    return {
        lunch: {
            reservations: lunchReservations.length,
            guests: lunchGuests,
            capacity: calculateCapacity(lunchReservations, maxCapacityLunch),
        },
        dinner: {
            reservations: dinnerReservations.length,
            guests: dinnerGuests,
            capacity: calculateCapacity(dinnerReservations, maxCapacityDinner),
        },
        total: {
            reservations: lunchReservations.length + dinnerReservations.length,
            guests: lunchGuests + dinnerGuests,
        },
    };
}

/**
 * Get capacity status based on guests and max capacity
 */
export function getCapacityStatus(
    totalGuests: number,
    maxCapacity: number,
    thresholds?: ColorThresholds
): CapacityStatus {
    const percentage = maxCapacity > 0 ? (totalGuests / maxCapacity) * 100 : 0;

    // Use provided thresholds or defaults
    const greenThreshold = thresholds?.green ?? DEFAULT_CAPACITY_THRESHOLDS.GREEN;
    const yellowThreshold = thresholds?.yellow ?? DEFAULT_CAPACITY_THRESHOLDS.YELLOW;
    const orangeThreshold = thresholds?.orange ?? DEFAULT_CAPACITY_THRESHOLDS.ORANGE;

    let color: 'green' | 'yellow' | 'orange' | 'red' = 'green';
    if (percentage > orangeThreshold) {
        color = 'red';
    } else if (percentage >= yellowThreshold) {
        color = 'orange';
    } else if (percentage >= greenThreshold) {
        color = 'yellow';
    }

    return {
        available: Math.max(0, maxCapacity - totalGuests),
        total: maxCapacity,
        percentage: Math.round(percentage),
        color,
    };
}
