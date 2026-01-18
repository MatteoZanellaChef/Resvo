'use client';

import { useState, useEffect } from 'react';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { useRestaurantSettings } from '@/lib/contexts/restaurant-settings-context';

type OpeningHours = {
    [key: string]: {
        lunch?: { start: string; end: string };
        dinner?: { start: string; end: string };
        closed?: boolean;
    };
};

export function OpeningHoursConfig() {
    const { restaurant, updateSettings, isLoading } = useRestaurantSettings();
    const [hours, setHours] = useState<OpeningHours>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (restaurant && restaurant.openingHours) {
            setHours(restaurant.openingHours as OpeningHours);
        }
    }, [restaurant]);

    const handleTimeChange = (day: string, service: 'lunch' | 'dinner', type: 'start' | 'end', value: string) => {
        setHours((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [service]: {
                    ...prev[day]?.[service],
                    [type]: value,
                },
            },
        }));
    };

    const handleClosedToggle = (day: string, closed: boolean) => {
        setHours((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                closed,
            },
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateSettings({ openingHours: hours });
            toast.success('Orari salvati con successo!');
        } catch (error) {
            console.error('Error saving hours:', error);
            toast.error('Errore durante il salvataggio');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !restaurant) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orari di Apertura</CardTitle>
                <CardDescription>
                    Configura gli orari di apertura per pranzo e cena per ogni giorno della settimana
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {DAYS_OF_WEEK.map((day) => {
                    const dayHours = hours[day] || {};
                    const isClosed = dayHours.closed || false;

                    return (
                        <div key={day} className="space-y-4 pb-6 border-b last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">{day}</Label>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`${day}-closed`} className="text-sm text-muted-foreground">
                                        Chiuso
                                    </Label>
                                    <Switch
                                        id={`${day}-closed`}
                                        checked={isClosed}
                                        onCheckedChange={(checked) => handleClosedToggle(day, checked)}
                                    />
                                </div>
                            </div>

                            {!isClosed && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Lunch Hours */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Pranzo</Label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <Label htmlFor={`${day}-lunch-start`} className="text-xs text-muted-foreground">
                                                    Apertura
                                                </Label>
                                                <Input
                                                    id={`${day}-lunch-start`}
                                                    type="time"
                                                    value={dayHours.lunch?.start || ''}
                                                    onChange={(e) =>
                                                        handleTimeChange(day, 'lunch', 'start', e.target.value)
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Label htmlFor={`${day}-lunch-end`} className="text-xs text-muted-foreground">
                                                    Chiusura
                                                </Label>
                                                <Input
                                                    id={`${day}-lunch-end`}
                                                    type="time"
                                                    value={dayHours.lunch?.end || ''}
                                                    onChange={(e) =>
                                                        handleTimeChange(day, 'lunch', 'end', e.target.value)
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dinner Hours */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Cena</Label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <Label htmlFor={`${day}-dinner-start`} className="text-xs text-muted-foreground">
                                                    Apertura
                                                </Label>
                                                <Input
                                                    id={`${day}-dinner-start`}
                                                    type="time"
                                                    value={dayHours.dinner?.start || ''}
                                                    onChange={(e) =>
                                                        handleTimeChange(day, 'dinner', 'start', e.target.value)
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Label htmlFor={`${day}-dinner-end`} className="text-xs text-muted-foreground">
                                                    Chiusura
                                                </Label>
                                                <Input
                                                    id={`${day}-dinner-end`}
                                                    type="time"
                                                    value={dayHours.dinner?.end || ''}
                                                    onChange={(e) =>
                                                        handleTimeChange(day, 'dinner', 'end', e.target.value)
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={isSaving || isLoading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Salvataggio...' : 'Salva Orari'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
