'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { RestaurantSettingsProvider } from '@/lib/contexts/restaurant-settings-context';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <RestaurantSettingsProvider>
            <div className="min-h-screen bg-background">
                {/* Desktop sidebar */}
                <Sidebar />

                {/* Mobile navigation */}
                <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
                <BottomNav />

                {/* Main content */}
                <div className="lg:pl-64 pb-20 lg:pb-0">
                    <Header onMobileMenuToggle={() => setMobileMenuOpen(true)} />

                    <main className="p-4 lg:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </RestaurantSettingsProvider>
    );
}
