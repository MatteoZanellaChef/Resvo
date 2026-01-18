'use client';

import { Reservation, ServiceType } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date-utils';
import { getReservationsForDateAndService, calculateDailyStats } from '@/lib/utils/capacity-calculator';
import { Users, Phone, Mail, Clock, UtensilsCrossed, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayDetailViewProps {
    date: Date | null;
    serviceType: ServiceType;
    reservations: Reservation[];
    maxCapacityLunch: number;
    maxCapacityDinner: number;
    open: boolean;
    onClose: () => void;
    onAddReservation?: (date: Date, service: ServiceType) => void;
}

export function DayDetailView({
    date,
    serviceType,
    reservations,
    maxCapacityLunch,
    maxCapacityDinner,
    open,
    onClose,
    onAddReservation,
}: DayDetailViewProps) {
    if (!date) return null;

    const dayReservations = reservations.filter((r) => {
        const resDate = new Date(r.date);
        return (
            resDate.getFullYear() === date.getFullYear() &&
            resDate.getMonth() === date.getMonth() &&
            resDate.getDate() === date.getDate()
        );
    });

    const stats = calculateDailyStats(dayReservations, maxCapacityLunch, maxCapacityDinner);
    const serviceReservations = getReservationsForDateAndService(dayReservations, date, serviceType);
    const serviceStats = serviceType === 'lunch' ? stats.lunch : stats.dinner;

    // Sort reservations by time
    const sortedReservations = [...serviceReservations].sort((a, b) => a.time.localeCompare(b.time));

    const capacityColor =
        serviceStats.capacity.color === 'green' ? 'text-green-600 bg-green-50 dark:bg-green-950/50' :
            serviceStats.capacity.color === 'yellow' ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/50' :
                'text-red-600 bg-red-50 dark:bg-red-950/50';

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-300';
        }
    };

    const statusLabels: Record<string, string> = {
        confirmed: 'Confermata',
        pending: 'In attesa',
        cancelled: 'Cancellata',
        completed: 'Completata',
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[95vh] sm:max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
                {/* Compact Header */}
                <div className="p-4 sm:p-5 border-b flex-shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                <span className="truncate">{formatDate(date, 'EEE d MMM')}</span>
                            </DialogTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                    {serviceType === 'lunch' ? '☀️ Pranzo' : '🌙 Cena'}
                                </Badge>
                                <Badge className={cn('text-xs border', capacityColor)}>
                                    {serviceStats.capacity.percentage}% Occupazione
                                </Badge>
                            </div>
                        </div>
                        {onAddReservation && (
                            <Button
                                onClick={() => onAddReservation(date, serviceType)}
                                size="sm"
                                className="flex-shrink-0"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                <span className="hidden xs:inline">Nuova</span>
                                <span className="xs:hidden">+</span>
                            </Button>
                        )}
                    </div>

                    {/* Compact Stats Cards */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                            <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Prenotazioni</div>
                            <div className="text-lg sm:text-2xl font-bold">{serviceStats.reservations}</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                            <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Coperti</div>
                            <div className="text-lg sm:text-2xl font-bold">{serviceStats.guests}</div>
                        </div>
                        <div className={cn('rounded-lg p-2 sm:p-3', capacityColor)}>
                            <div className="text-[10px] sm:text-xs mb-0.5 opacity-80">Disponibili</div>
                            <div className="text-lg sm:text-2xl font-bold">{serviceStats.capacity.available}</div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Reservations List */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3">
                    {/* Header with count */}
                    <div className="sticky top-0 bg-background/95 backdrop-blur-sm pb-2 mb-2 -mt-1 border-b">
                        <h3 className="text-sm sm:text-base font-semibold">
                            {sortedReservations.length} {sortedReservations.length === 1 ? 'Prenotazione' : 'Prenotazioni'}
                        </h3>
                    </div>

                    {sortedReservations.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                            <div className="text-4xl sm:text-5xl mb-3">📋</div>
                            <h4 className="text-base sm:text-lg font-semibold mb-1">Nessuna prenotazione</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                                Non ci sono prenotazioni per questo servizio
                            </p>
                            {onAddReservation && (
                                <Button onClick={() => onAddReservation(date, serviceType)} size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Aggiungi Prima Prenotazione
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2 pb-3">
                            {sortedReservations.map((reservation) => (
                                <Card
                                    key={reservation.id}
                                    className={cn(
                                        'p-3 transition-all duration-200 hover:shadow-md border-l-4',
                                        reservation.status === 'confirmed' && 'border-l-green-500',
                                        reservation.status === 'pending' && 'border-l-yellow-500',
                                        reservation.status === 'cancelled' && 'border-l-red-500'
                                    )}
                                >
                                    {/* Time and Status Row */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                            <span className="font-bold text-sm sm:text-base">{reservation.time}</span>
                                        </div>
                                        <Badge
                                            className={cn('text-[10px] sm:text-xs px-1.5 py-0', getStatusBadgeColor(reservation.status))}
                                        >
                                            {statusLabels[reservation.status]}
                                        </Badge>
                                    </div>

                                    {/* Customer Name and Guests */}
                                    <div className="flex items-start gap-2 mb-2">
                                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm sm:text-base truncate">
                                                {reservation.customerName}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {reservation.numGuests} {reservation.numGuests === 1 ? 'persona' : 'persone'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Details - Compact */}
                                    <div className="space-y-1 text-xs sm:text-sm">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Phone className="h-3 w-3 flex-shrink-0" />
                                            <a
                                                href={`tel:${reservation.customerPhone}`}
                                                className="truncate hover:underline"
                                            >
                                                {reservation.customerPhone}
                                            </a>
                                        </div>
                                        {reservation.customerEmail && (
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Mail className="h-3 w-3 flex-shrink-0" />
                                                <a
                                                    href={`mailto:${reservation.customerEmail}`}
                                                    className="truncate hover:underline"
                                                >
                                                    {reservation.customerEmail}
                                                </a>
                                            </div>
                                        )}

                                        {/* Table Assignment */}
                                        {reservation.tableId && reservation.table && (
                                            <div className="flex items-center gap-1.5 pt-1">
                                                <UtensilsCrossed className="h-3 w-3 text-primary flex-shrink-0" />
                                                <span className="font-medium text-primary">
                                                    Tavolo {reservation.table.tableNumber}
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                    ({reservation.table.capacity} posti)
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes - Compact */}
                                    {(reservation.notes || reservation.specialRequests) && (
                                        <div className="mt-2 pt-2 border-t space-y-1 text-xs">
                                            {reservation.notes && (
                                                <div className="flex gap-1.5 items-start">
                                                    <span className="flex-shrink-0">📝</span>
                                                    <span className="text-muted-foreground line-clamp-2">{reservation.notes}</span>
                                                </div>
                                            )}
                                            {reservation.specialRequests && (
                                                <div className="flex gap-1.5 items-start">
                                                    <span className="flex-shrink-0">⭐</span>
                                                    <span className="text-muted-foreground font-medium line-clamp-2">{reservation.specialRequests}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
