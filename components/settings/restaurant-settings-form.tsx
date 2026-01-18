'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { restaurantSettingsSchema, type RestaurantSettingsFormData } from '@/lib/utils/validators';
import { useRestaurantSettings } from '@/lib/contexts/restaurant-settings-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export function RestaurantSettingsForm() {
    const [isSaving, setIsSaving] = useState(false);
    const { restaurant, updateSettings } = useRestaurantSettings();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<RestaurantSettingsFormData>({
        resolver: zodResolver(restaurantSettingsSchema),
        defaultValues: {
            maxCapacityLunch: restaurant?.maxCapacityLunch || 80,
            maxCapacityDinner: restaurant?.maxCapacityDinner || 100,
            greenThreshold: restaurant?.greenThreshold || 60,
            yellowThreshold: restaurant?.yellowThreshold || 80,
            orangeThreshold: restaurant?.orangeThreshold || 99,
        },
    });

    // Watch threshold values for live preview
    const greenThreshold = watch('greenThreshold');
    const yellowThreshold = watch('yellowThreshold');
    const orangeThreshold = watch('orangeThreshold');

    // Update form values when restaurant data is loaded
    useEffect(() => {
        if (restaurant) {
            reset({
                maxCapacityLunch: restaurant.maxCapacityLunch,
                maxCapacityDinner: restaurant.maxCapacityDinner,
                greenThreshold: restaurant.greenThreshold ?? 60,
                yellowThreshold: restaurant.yellowThreshold ?? 80,
                orangeThreshold: restaurant.orangeThreshold ?? 99,
            });
        }
    }, [restaurant, reset]);

    const onSubmit = async (data: RestaurantSettingsFormData) => {
        setIsSaving(true);

        try {
            await updateSettings(data);
            toast.success('Impostazioni salvate con successo!');
        } catch (error) {
            toast.error('Errore nel salvataggio delle impostazioni');
            console.error('Error saving settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Configurazione Sala</CardTitle>
                    <CardDescription>
                        Imposta la capacità massima per servizio
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Capacities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="maxCapacityLunch">Capacità Pranzo</Label>
                            <Input
                                id="maxCapacityLunch"
                                type="number"
                                {...register('maxCapacityLunch', { valueAsNumber: true })}
                                placeholder="80"
                            />
                            {errors.maxCapacityLunch && (
                                <p className="text-sm text-destructive">{errors.maxCapacityLunch.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Numero massimo di coperti a pranzo
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxCapacityDinner">Capacità Cena</Label>
                            <Input
                                id="maxCapacityDinner"
                                type="number"
                                {...register('maxCapacityDinner', { valueAsNumber: true })}
                                placeholder="100"
                            />
                            {errors.maxCapacityDinner && (
                                <p className="text-sm text-destructive">{errors.maxCapacityDinner.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Numero massimo di coperti a cena
                            </p>
                        </div>
                    </div>

                    {/* Color Thresholds */}
                    <Card className="border-2 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Configurazione Colori Capacità</CardTitle>
                            <CardDescription>
                                Personalizza le soglie percentuali per i colori della visualizzazione capacità
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Visual Preview */}
                            <div className="space-y-3">
                                <Label>Anteprima</Label>
                                <div className="h-8 rounded-full overflow-hidden flex">
                                    <div
                                        className="bg-green-500 flex items-center justify-center text-xs font-semibold text-white transition-all"
                                        style={{ width: `${greenThreshold}%` }}
                                    >
                                        {greenThreshold! > 15 && `${greenThreshold}%`}
                                    </div>
                                    <div
                                        className="bg-yellow-500 flex items-center justify-center text-xs font-semibold text-white transition-all"
                                        style={{ width: `${yellowThreshold! - greenThreshold!}%` }}
                                    >
                                        {(yellowThreshold! - greenThreshold!) > 15 && `${yellowThreshold}%`}
                                    </div>
                                    <div
                                        className="bg-orange-500 flex items-center justify-center text-xs font-semibold text-white transition-all"
                                        style={{ width: `${orangeThreshold! - yellowThreshold!}%` }}
                                    >
                                        {(orangeThreshold! - yellowThreshold!) > 15 && `${orangeThreshold}%`}
                                    </div>
                                    <div
                                        className="bg-red-500 flex items-center justify-center text-xs font-semibold text-white transition-all"
                                        style={{ width: `${100 - orangeThreshold!}%` }}
                                    >
                                        {(100 - orangeThreshold!) > 5 && '100%'}
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>🟢 Verde</span>
                                    <span>🟡 Giallo</span>
                                    <span>🟠 Arancione</span>
                                    <span>🔴 Rosso</span>
                                </div>
                            </div>

                            {/* Threshold Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="greenThreshold">Soglia Verde (%)</Label>
                                    <Input
                                        id="greenThreshold"
                                        type="number"
                                        min="0"
                                        max="100"
                                        {...register('greenThreshold', { valueAsNumber: true })}
                                        placeholder="60"
                                    />
                                    {errors.greenThreshold && (
                                        <p className="text-sm text-destructive">{errors.greenThreshold.message}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Capacità sotto questa soglia sarà verde
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="yellowThreshold">Soglia Gialla (%)</Label>
                                    <Input
                                        id="yellowThreshold"
                                        type="number"
                                        min="0"
                                        max="100"
                                        {...register('yellowThreshold', { valueAsNumber: true })}
                                        placeholder="80"
                                    />
                                    {errors.yellowThreshold && (
                                        <p className="text-sm text-destructive">{errors.yellowThreshold.message}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Capacità tra verde e gialla sarà gialla
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="orangeThreshold">Soglia Arancione (%)</Label>
                                    <Input
                                        id="orangeThreshold"
                                        type="number"
                                        min="0"
                                        max="100"
                                        {...register('orangeThreshold', { valueAsNumber: true })}
                                        placeholder="99"
                                    />
                                    {errors.orangeThreshold && (
                                        <p className="text-sm text-destructive">{errors.orangeThreshold.message}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Sopra questa soglia sarà rosso
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? 'Salvataggio...' : 'Salva Modifiche'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
