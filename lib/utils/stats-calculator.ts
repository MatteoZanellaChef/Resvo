import { Reservation } from '@/types';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { it } from 'date-fns/locale';

export interface StatsPeriod {
    label: string;
    value: string;
    start: Date;
    end: Date;
}

export const STATS_PERIODS: StatsPeriod[] = [
    {
        label: 'Ultima Settimana',
        value: 'week',
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: endOfWeek(new Date(), { weekStartsOn: 1 }),
    },
    {
        label: 'Ultimo Mese',
        value: 'month',
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
    },
    {
        label: 'Ultimi 3 Mesi',
        value: '3months',
        start: startOfMonth(subMonths(new Date(), 2)),
        end: endOfMonth(new Date()),
    },
    {
        label: 'Ultimi 6 Mesi',
        value: '6months',
        start: startOfMonth(subMonths(new Date(), 5)),
        end: endOfMonth(new Date()),
    },
];

export function calculateStats(reservations: Reservation[], startDate: Date, endDate: Date) {
    const filteredReservations = reservations.filter((r) => {
        const resDate = new Date(r.date);
        return resDate >= startDate && resDate <= endDate && r.status !== 'cancelled';
    });

    const totalReservations = filteredReservations.length;
    const totalGuests = filteredReservations.reduce((sum, r) => sum + r.numGuests, 0);
    const avgGuestsPerReservation = totalReservations > 0 ? totalGuests / totalReservations : 0;

    const lunchReservations = filteredReservations.filter((r) => r.serviceType === 'lunch');
    const dinnerReservations = filteredReservations.filter((r) => r.serviceType === 'dinner');

    const confirmedReservations = filteredReservations.filter((r) => r.status === 'confirmed').length;
    const completedReservations = filteredReservations.filter((r) => r.status === 'completed').length;
    const pendingReservations = filteredReservations.filter((r) => r.status === 'pending').length;

    return {
        totalReservations,
        totalGuests,
        avgGuestsPerReservation: Math.round(avgGuestsPerReservation * 10) / 10,
        lunchCount: lunchReservations.length,
        dinnerCount: dinnerReservations.length,
        confirmedCount: confirmedReservations,
        completedCount: completedReservations,
        pendingCount: pendingReservations,
        lunchGuests: lunchReservations.reduce((sum, r) => sum + r.numGuests, 0),
        dinnerGuests: dinnerReservations.reduce((sum, r) => sum + r.numGuests, 0),
    };
}

export function getReservationsByDay(reservations: Reservation[], startDate: Date, endDate: Date) {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
        const dayReservations = reservations.filter((r) => {
            const resDate = new Date(r.date);
            return (
                resDate.getFullYear() === day.getFullYear() &&
                resDate.getMonth() === day.getMonth() &&
                resDate.getDate() === day.getDate() &&
                r.status !== 'cancelled'
            );
        });

        const lunchReservations = dayReservations.filter((r) => r.serviceType === 'lunch');
        const dinnerReservations = dayReservations.filter((r) => r.serviceType === 'dinner');

        return {
            date: format(day, 'dd/MM', { locale: it }),
            fullDate: day,
            pranzo: lunchReservations.length,
            cena: dinnerReservations.length,
            totale: dayReservations.length,
            coperti: dayReservations.reduce((sum, r) => sum + r.numGuests, 0),
            copertiPranzo: lunchReservations.reduce((sum, r) => sum + r.numGuests, 0),
            copertiCena: dinnerReservations.reduce((sum, r) => sum + r.numGuests, 0),
        };
    });
}

export function getReservationsByDayOfWeek(reservations: Reservation[]) {
    const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

    const stats = daysOfWeek.map((day, index) => {
        const dayReservations = reservations.filter((r) => {
            const resDate = new Date(r.date);
            const dayOfWeek = resDate.getDay();
            const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0, Sun=6
            return adjustedDay === index && r.status !== 'cancelled';
        });

        return {
            day,
            pranzo: dayReservations.filter((r) => r.serviceType === 'lunch').length,
            cena: dayReservations.filter((r) => r.serviceType === 'dinner').length,
            totale: dayReservations.length,
            coperti: dayReservations.reduce((sum, r) => sum + r.numGuests, 0),
        };
    });

    return stats;
}

export function getTopDays(reservations: Reservation[], limit: number = 5) {
    const dayMap = new Map<string, { date: string; count: number; guests: number }>();

    reservations
        .filter((r) => r.status !== 'cancelled')
        .forEach((r) => {
            const dateStr = format(new Date(r.date), 'dd/MM/yyyy', { locale: it });
            const existing = dayMap.get(dateStr) || { date: dateStr, count: 0, guests: 0 };
            dayMap.set(dateStr, {
                date: dateStr,
                count: existing.count + 1,
                guests: existing.guests + r.numGuests,
            });
        });

    return Array.from(dayMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}
