'use client';

import { useState } from 'react';
import { ServiceType, Reservation } from '@/types';
import { CalendarView } from '@/components/calendar/calendar-view';
import { ServiceToggle } from '@/components/calendar/service-toggle';
import { DayDetailView } from '@/components/calendar/day-detail-view';
import { ReservationFormDialog } from '@/components/reservations/reservation-form-dialog';
import { mockReservations, mockRestaurant } from '@/lib/mock-data';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function HomePage() {
    const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
    const [selectedService, setSelectedService] = useState<ServiceType>('dinner');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [detailViewOpen, setDetailViewOpen] = useState(false);
    const [reservationFormOpen, setReservationFormOpen] = useState(false);
    const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);
    const [prefilledService, setPrefilledService] = useState<ServiceType>('dinner');

    const maxCapacity = selectedService === 'lunch'
        ? mockRestaurant.maxCapacityLunch
        : mockRestaurant.maxCapacityDinner;

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setDetailViewOpen(true);
    };

    const handleAddReservation = (date: Date, service: ServiceType) => {
        setPrefilledDate(date);
        setPrefilledService(service);
        setDetailViewOpen(false);
        setReservationFormOpen(true);
    };

    const handleSaveReservation = (data: Partial<Reservation>) => {
        setReservations((prev) => [...prev, data as Reservation]);
    };

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendario Prenotazioni</h1>
                    <p className="text-muted-foreground mt-1">
                        Visualizza e gestisci tutte le prenotazioni del tuo ristorante
                    </p>
                </div>

                <ServiceToggle
                    selectedService={selectedService}
                    onServiceChange={setSelectedService}
                />
            </div>

            {/* Calendar */}
            <CalendarView
                reservations={reservations}
                selectedService={selectedService}
                maxCapacity={maxCapacity}
                onDayClick={handleDayClick}
            />

            {/* Day detail modal */}
            <DayDetailView
                date={selectedDate}
                serviceType={selectedService}
                reservations={reservations}
                maxCapacityLunch={mockRestaurant.maxCapacityLunch}
                maxCapacityDinner={mockRestaurant.maxCapacityDinner}
                open={detailViewOpen}
                onClose={() => setDetailViewOpen(false)}
                onAddReservation={handleAddReservation}
            />

            {/* Reservation form dialog */}
            <ReservationFormDialog
                open={reservationFormOpen}
                onOpenChange={setReservationFormOpen}
                reservation={prefilledDate ? {
                    id: '',
                    restaurantId: 'restaurant-1',
                    date: prefilledDate,
                    time: '',
                    serviceType: prefilledService,
                    customerName: '',
                    customerPhone: '',
                    numGuests: 2,
                    status: 'confirmed',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Reservation : null}
                onSave={handleSaveReservation}
            />

            <Toaster />
        </div>
    );
}
