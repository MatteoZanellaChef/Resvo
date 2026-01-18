'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantSettingsForm } from '@/components/settings/restaurant-settings-form';
import { SpaceManagement } from '@/components/settings/space-management';
import { TableManagement } from '@/components/settings/table-management';
import { AppearanceSettings } from '@/components/settings/appearance-settings';
import { Toaster } from '@/components/ui/sonner';
import { Store, UtensilsCrossed, Palette } from 'lucide-react';

export default function RestaurantSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Impostazioni Ristorante</h1>
                <p className="text-muted-foreground mt-1">
                    Configura tutte le impostazioni del tuo ristorante
                </p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full max-w-2xl grid-cols-3">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span className="hidden sm:inline">Generale</span>
                    </TabsTrigger>
                    <TabsTrigger value="tables" className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4" />
                        <span className="hidden sm:inline">Tavoli</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">Aspetto</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <RestaurantSettingsForm />
                </TabsContent>



                <TabsContent value="tables" className="space-y-6">
                    <SpaceManagement />
                    <TableManagement />
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                    <AppearanceSettings />
                </TabsContent>
            </Tabs>

            <Toaster />
        </div>
    );
}
