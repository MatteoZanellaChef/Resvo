'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Reservation, ServiceType, ReservationStatus } from '@/types';
import { ReservationFormDialog } from '@/components/reservations/reservation-form-dialog';
import { ReservationListGrouped } from '@/components/reservations/reservation-list-grouped';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Plus, Search, Filter, Loader2, X, Calendar } from 'lucide-react';
import { useRestaurantSettings } from '@/lib/contexts/restaurant-settings-context';
import { reservationsService } from '@/lib/supabase/services/reservations.service';
import { checkIsToday, normalizeToMidnight } from '@/lib/utils/date-utils';
import { addDays, endOfWeek, startOfWeek, isWithinInterval, endOfMonth, startOfMonth, isWeekend } from 'date-fns';

type DateFilterType = 'today' | 'tomorrow' | 'weekend' | 'week' | 'month' | 'all';

export default function ReservationsPage() {
    const { restaurant, isLoading: settingsLoading } = useRestaurantSettings();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [isLoadingReservations, setIsLoadingReservations] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceFilter, setServiceFilter] = useState<ServiceType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
    const [dateFilter, setDateFilter] = useState<DateFilterType>('today'); // Default to Today

    const loadReservations = useCallback(async () => {
        if (!restaurant) return;

        try {
            setIsLoadingReservations(true);
            const data = await reservationsService.getReservations(restaurant.id);
            setReservations(data);
        } catch (error) {
            console.error('Error loading reservations:', error);
            toast.error('Errore durante il caricamento');
        } finally {
            setIsLoadingReservations(false);
        }
    }, [restaurant]);

    // Load reservations
    useEffect(() => {
        if (restaurant && restaurant.id) {
            loadReservations();
        }
    }, [restaurant, loadReservations]);

    // Filter and search logic
    const filteredReservations = useMemo(() => {
        let filtered = [...reservations];

        // Search by customer name or phone
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (res) =>
                    res.customerName.toLowerCase().includes(query) ||
                    res.customerPhone.includes(query) ||
                    res.customerEmail?.toLowerCase().includes(query)
            );
        }

        // Filter by service
        if (serviceFilter !== 'all') {
            filtered = filtered.filter((res) => res.serviceType === serviceFilter);
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter((res) => res.status === statusFilter);
        }

        // Filter by Date Logic
        const today = normalizeToMidnight(new Date());

        if (dateFilter === 'today') {
            filtered = filtered.filter(res => checkIsToday(new Date(res.date)));
        } else if (dateFilter === 'tomorrow') {
            const tomorrow = addDays(today, 1);
            filtered = filtered.filter(res => {
                const d = normalizeToMidnight(new Date(res.date));
                return d.getTime() === tomorrow.getTime();
            });
        } else if (dateFilter === 'weekend') {
            // Logic for "next weekend" or "this weekend" if technically today is friday/sat/sun
            // For simplicity, let's show any upcoming Friday/Saturday/Sunday in the near future (e.g. next 7 days)
            // Or strictly "This Weekend"
            filtered = filtered.filter(res => isWeekend(new Date(res.date)));
        } else if (dateFilter === 'week') {
            const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
            const end = endOfWeek(today, { weekStartsOn: 1 });
            filtered = filtered.filter(res => isWithinInterval(new Date(res.date), { start, end }));
        } else if (dateFilter === 'month') {
            const start = startOfMonth(today);
            const end = endOfMonth(today);
            filtered = filtered.filter(res => isWithinInterval(new Date(res.date), { start, end }));
        }

        // Sort by Date then Time
        filtered.sort((a, b) => {
            const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
        });

        return filtered;
    }, [reservations, searchQuery, serviceFilter, statusFilter, dateFilter]);

    // Statistics
    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
            total: reservations.length,
            today: reservations.filter((r) => {
                const resDate = new Date(r.date);
                resDate.setHours(0, 0, 0, 0);
                return resDate.getTime() === today.getTime() && r.status !== 'cancelled';
            }).length,
            upcoming: reservations.filter((r) => {
                const resDate = new Date(r.date);
                return resDate >= today && r.status !== 'cancelled' && r.status !== 'completed';
            }).length,
            pending: reservations.filter((r) => r.status === 'pending').length,
        };
    }, [reservations]);

    const handleAddNew = () => {
        setEditingReservation(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (reservation: Reservation) => {
        setEditingReservation(reservation);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!restaurant) return;

        try {
            await reservationsService.deleteReservation(id);
            toast.success('Prenotazione eliminata');
            await loadReservations();
        } catch (error) {
            console.error('Error deleting reservation:', error);
            toast.error('Errore durante l\'eliminazione');
        }
    };

    const handleConfirm = async (reservation: Reservation) => {
        if (!restaurant) return;

        try {
            await reservationsService.updateReservation(reservation.id, { status: 'confirmed' });
            toast.success('Prenotazione confermata con successo');
            await loadReservations();
        } catch (error) {
            console.error('Error confirming reservation:', error);
            toast.error('Errore durante la conferma');
        }
    };

    const handleSave = async (data: Partial<Reservation>) => {
        if (!restaurant) return;

        try {
            if (editingReservation) {
                await reservationsService.updateReservation(editingReservation.id, data);
                toast.success('Prenotazione aggiornata');
            } else {
                await reservationsService.createReservation(restaurant.id, data as Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>);
                toast.success('Prenotazione creata');
            }

            await loadReservations();
        } catch (error) {
            console.error('Error saving reservation:', error);
            toast.error('Errore durante il salvataggio');
        }
    };

    // Show loading state
    if (settingsLoading || isLoadingReservations) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Caricamento...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Prenotazioni</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestisci tutte le prenotazioni del ristorante
                    </p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuova Prenotazione
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                        setSearchQuery('');
                        setServiceFilter('all');
                        setStatusFilter('all');
                        setDateFilter('all');
                    }}
                >
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Totali</div>
                </Card>
                <Card
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setDateFilter('today')}
                >
                    <div className="text-2xl font-bold text-green-600">{stats.today}</div>
                    <div className="text-sm text-muted-foreground">Oggi</div>
                </Card>
                <Card
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setDateFilter('all')} // Or 'tomorrow'/'week' depending on preference, 'all' for upcoming usually implies future
                >
                    <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
                    <div className="text-sm text-muted-foreground">In Arrivo</div>
                </Card>
                <Card
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                        setSearchQuery('');
                        setServiceFilter('all');
                        setStatusFilter('pending');
                        setDateFilter('all');
                    }}
                >
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-sm text-muted-foreground">Da Confermare</div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-3 sm:p-4 border-none shadow-md bg-card/50 backdrop-blur-sm space-y-4">
                {/* Date Quick Filters (Chips) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {[
                        { label: 'Oggi', value: 'today' },
                        { label: 'Domani', value: 'tomorrow' },
                        { label: 'Weekend', value: 'weekend' },
                        { label: 'Settimana', value: 'week' },
                        { label: 'Mese', value: 'month' },
                        { label: 'Tutti', value: 'all' },
                    ].map((filter) => (
                        <Badge
                            key={filter.value}
                            variant={dateFilter === filter.value ? 'default' : 'outline'}
                            className="cursor-pointer hover:bg-primary/90 px-3 py-1 text-sm font-medium transition-colors whitespace-nowrap"
                            onClick={() => setDateFilter(filter.value as DateFilterType)}
                        >
                            {filter.label}
                        </Badge>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm sm:text-base">Filtri Avanzati</h3>
                    </div>

                    {/* Search - Full width */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cerca cliente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background/50 h-11 sm:h-10"
                        />
                    </div>

                    {/* Selectors + Reset Button */}
                    <div className="flex gap-2 sm:gap-3">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1">
                            <Select value={serviceFilter} onValueChange={(value) => setServiceFilter(value as ServiceType | 'all')}>
                                <SelectTrigger className="h-11 sm:h-10 bg-background/50 text-sm">
                                    <SelectValue placeholder="Servizio" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tutti</SelectItem>
                                    <SelectItem value="lunch">☀️ Pranzo</SelectItem>
                                    <SelectItem value="dinner">🌙 Cena</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReservationStatus | 'all')}>
                                <SelectTrigger className="h-11 sm:h-10 bg-background/50 text-sm">
                                    <SelectValue placeholder="Stato" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tutti</SelectItem>
                                    <SelectItem value="confirmed">Confermate</SelectItem>
                                    <SelectItem value="pending">In Attesa</SelectItem>
                                    <SelectItem value="cancelled">Cancellata</SelectItem>
                                    <SelectItem value="completed">Completata</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reset Button */}
                        {(searchQuery || serviceFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'today') && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery('');
                                    setServiceFilter('all');
                                    setStatusFilter('all');
                                    setDateFilter('today');
                                }}
                                className="h-11 sm:h-10 w-11 sm:w-10 flex-shrink-0 bg-background/50 p-0 flex items-center justify-center"
                                title="Reset filtri"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Reservations List (Grouped) */}
            <ReservationListGrouped
                reservations={filteredReservations}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onConfirm={handleConfirm}
            />

            {/* Form Dialog */}
            <ReservationFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                reservation={editingReservation}
                onSave={handleSave}
            />

            <Toaster />
        </div>
    );
}
