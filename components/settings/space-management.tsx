'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { spaceSchema, type SpaceFormData } from '@/lib/utils/validators';
import { RoomSpace } from '@/types';
import { useRestaurantSettings } from '@/lib/contexts/restaurant-settings-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

export function SpaceManagement() {
    const { spaces, tables, addSpace, updateSpace, deleteSpace } = useRestaurantSettings();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSpace, setEditingSpace] = useState<RoomSpace | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SpaceFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(spaceSchema) as any,
        defaultValues: {
            label: '',
            value: '',
        },
    });

    const handleAddSpace = () => {
        setEditingSpace(null);
        reset({
            label: '',
            value: '',
        });
        setIsDialogOpen(true);
    };

    const handleEditSpace = (space: RoomSpace) => {
        setEditingSpace(space);
        reset({
            label: space.label,
            value: space.value,
        });
        setIsDialogOpen(true);
    };

    const handleDeleteSpace = async (space: RoomSpace) => {
        // Check if there are tables using this space
        const tablesInSpace = tables.filter(t => t.position === space.value);

        if (tablesInSpace.length > 0) {
            toast.error(`Impossibile eliminare lo spazio`, {
                description: `Ci sono ${tablesInSpace.length} tavol${tablesInSpace.length === 1 ? 'o' : 'i'} in questo spazio. Spostali prima di eliminare.`
            });
            return;
        }

        try {
            await deleteSpace(space.id);
            toast.success('Spazio eliminato!');
        } catch {
            toast.error('Errore durante l\'eliminazione dello spazio');
        }
    };

    const onSubmit = async (data: SpaceFormData) => {
        try {
            if (editingSpace) {
                // Update existing space
                await updateSpace(editingSpace.id, {
                    label: data.label,
                    value: data.value,
                });
                toast.success('Spazio aggiornato!');
            } else {
                // Add new space
                const maxOrder = spaces.reduce((max, s) => Math.max(max, s.order), 0);
                await addSpace({
                    label: data.label,
                    value: data.value,
                    isDefault: false,
                    order: maxOrder + 1,
                });
                toast.success('Spazio aggiunto!');
            }

            setIsDialogOpen(false);
            reset();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Errore durante il salvataggio');
            }
        }
    };

    // Sort spaces by order
    const sortedSpaces = [...spaces].sort((a, b) => a.order - b.order);

    // Count tables per space
    const tableCountBySpace = tables.reduce((acc, table) => {
        acc[table.position] = (acc[table.position] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Gestione Spazi</CardTitle>
                        <CardDescription>
                            Gestisci le sale e gli spazi del tuo ristorante
                        </CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAddSpace}>
                                <Plus className="mr-2 h-4 w-4" />
                                Aggiungi Spazio
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingSpace ? 'Modifica Spazio' : 'Nuovo Spazio'}
                                </DialogTitle>
                                <DialogDescription>
                                    Inserisci il nome e il valore identificativo dello spazio
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="label">Nome Spazio</Label>
                                    <Input
                                        id="label"
                                        {...register('label')}
                                        placeholder="es. Sala Principale"
                                    />
                                    {errors.label && (
                                        <p className="text-sm text-destructive">{errors.label.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="value">Valore Identificativo</Label>
                                    <Input
                                        id="value"
                                        {...register('value')}
                                        placeholder="es. sala-principale"
                                        disabled={editingSpace?.isDefault}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Solo lettere minuscole, numeri, trattini e underscore
                                    </p>
                                    {errors.value && (
                                        <p className="text-sm text-destructive">{errors.value.message}</p>
                                    )}
                                    {editingSpace?.isDefault && (
                                        <p className="text-xs text-muted-foreground">
                                            Il valore degli spazi predefiniti non può essere modificato
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Annulla
                                    </Button>
                                    <Button type="submit">
                                        {editingSpace ? 'Aggiorna' : 'Crea'} Spazio
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedSpaces.map((space) => {
                        const tableCount = tableCountBySpace[space.value] || 0;
                        const canDelete = !space.isDefault && tableCount === 0;

                        return (
                            <div
                                key={space.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">
                                            {space.label}
                                            {space.isDefault && (
                                                <Badge variant="secondary" className="text-xs">Predefinito</Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {tableCount} {tableCount === 1 ? 'tavolo' : 'tavoli'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleEditSpace(space)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDeleteSpace(space)}
                                        disabled={!canDelete}
                                        title={!canDelete ? (space.isDefault ? 'Gli spazi predefiniti non possono essere eliminati' : 'Sposta i tavoli prima di eliminare') : 'Elimina spazio'}
                                    >
                                        <Trash2 className={`h-4 w-4 ${canDelete ? 'text-destructive' : 'text-muted-foreground'}`} />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
