'use client';

import { Reservation, ServiceType } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/lib/utils/date-utils';
import { getReservationsForDateAndService, calculateDailyStats } from '@/lib/utils/capacity-calculator';
import { Users, Phone, Mail, Clock, UtensilsCrossed, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { STATUS_COLORS } from '@/lib/constants';

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
        serviceStats.capacity.color === 'green' ? 'bg-green-500 text-green-500' :
            serviceStats.capacity.color === 'yellow' ? 'bg-yellow-500 text-yellow-500' :
                'bg-red-500 text-red-500';

    const capacityBgColor =
        serviceStats.capacity.color === 'green' ? 'bg-green-50 dark:bg-green-950' :
            serviceStats.capacity.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-950' :
                'bg-red-50 dark:bg-red-950';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 flex flex-col">
                {/* Fixed Header */}
                <div className="p-4 sm:p-6 pr-12 sm:pr-14 border-b bg-muted/30 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                            <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                                <span className="truncate">{formatDate(date, 'EEE d MMM')}</span>
                            </DialogTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-sm">
                                    {serviceType === 'lunch' ? '☀️ Pranzo' : '🌙 Cena'}
                                </Badge>
                                <Badge className={capacityColor.split(' ')[1]} variant="outline">
                                    {serviceStats.capacity.percentage}% Occupazione
                                </Badge>
                            </div>
                        </div>
                        {onAddReservation && (
                            <Button onClick={() => onAddReservation(date, serviceType)} className="w-full sm:w-auto flex-shrink-0">
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Nuova Prenotazione</span>
                                <span className="sm:hidden">Nuova</span>
                            </Button>
                        )}
                    </div>

                    {/* Statistics Cards - Compact for Mobile */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
                        <Card className="p-3 sm:p-4">
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Prenotazioni</div>
                            <div className="text-xl sm:text-3xl font-bold">{serviceStats.reservations}</div>
                        </Card>

                        <Card className="p-3 sm:p-4">
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Coperti</div>
                            <div className="text-xl sm:text-3xl font-bold">{serviceStats.guests}</div>
                        </Card>

                        <Card className={`p-3 sm:p-4 ${capacityBgColor}`}>
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Disponibili</div>
                            <div className="text-xl sm:text-3xl font-bold">{serviceStats.capacity.available}</div>
                        </Card>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full px-4 sm:px-6">
                        <div className="py-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base sm:text-lg font-semibold">
                                    {sortedReservations.length} {sortedReservations.length === 1 ? 'Prenotazione' : 'Prenotazioni'}
                                </h3>
                            </div>

                            {sortedReservations.length === 0 ? (
                                <div className="text-center py-12 sm:py-16">
                                    <div className="text-5xl sm:text-6xl mb-4">📋</div>
                                    <h4 className="text-lg sm:text-xl font-semibold mb-2">Nessuna prenotazione</h4>
                                    <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                                        Non ci sono ancora prenotazioni per questo servizio
                                    </p>
                                    {onAddReservation && (
                                        <Button onClick={() => onAddReservation(date, serviceType)} size="lg">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Aggiungi Prima Prenotazione
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3 pb-4">
                                    {sortedReservations.map((reservation) => (
                                        <Card
                                            key={reservation.id}
                                            className="p-3 sm:p-4 hover:shadow-lg transition-all duration-200 border-l-4"
                                            style={{
                                                borderLeftColor:
                                                    reservation.status === 'confirmed' ? 'rgb(34, 197, 94)' :
                                                        reservation.status === 'pending' ? 'rgb(234, 179, 8)' :
                                                            reservation.status === 'cancelled' ? 'rgb(239, 68, 68)' :
                                                                'rgb(156, 163, 175)'
                                            }}
                                        >
                                            <div className="space-y-3">
                                                {/* Time and Status */}
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-bold text-base sm:text-lg">{reservation.time}</span>
                                                    </div>
                                                    <Badge className={STATUS_COLORS[reservation.status]} variant="default">
                                                        {reservation.status === 'confirmed' ? 'Confermata' :
                                                            reservation.status === 'pending' ? 'In Attesa' :
                                                                reservation.status === 'cancelled' ? 'Cancellata' : 'Completata'}
                                                    </Badge>
                                                </div>

                                                <Separator />

                                                {/* Customer Info */}
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-sm sm:text-base truncate">
                                                                {reservation.customerName}
                                                            </div>
                                                            <div className="text-xs sm:text-sm text-muted-foreground">
                                                                {reservation.numGuests} {reservation.numGuests === 1 ? 'persona' : 'persone'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Contact Details */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Phone className="h-3 w-3 flex-shrink-0" />
                                                            <span className="truncate">{reservation.customerPhone}</span>
                                                        </div>
                                                        {reservation.customerEmail && (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Mail className="h-3 w-3 flex-shrink-0" />
                                                                <span className="truncate">{reservation.customerEmail}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Table Assignment */}
                                                    {reservation.tableId && reservation.table && (
                                                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                                                            <UtensilsCrossed className="h-3 w-3 text-primary flex-shrink-0" />
                                                            <span className="font-medium text-primary">
                                                                Tavolo {reservation.table.tableNumber}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                ({reservation.table.capacity} posti - {reservation.table.position})
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Notes and Special Requests */}
                                                {(reservation.notes || reservation.specialRequests) && (
                                                    <>
                                                        <Separator />
                                                        <div className="space-y-1.5 text-xs sm:text-sm">
                                                            {reservation.notes && (
                                                                <div className="flex gap-2 items-start">
                                                                    <span className="flex-shrink-0">📝</span>
                                                                    <span className="text-muted-foreground">{reservation.notes}</span>
                                                                </div>
                                                            )}
                                                            {reservation.specialRequests && (
                                                                <div className="flex gap-2 items-start">
                                                                    <span className="flex-shrink-0">⭐</span>
                                                                    <span className="text-muted-foreground font-medium">{reservation.specialRequests}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
