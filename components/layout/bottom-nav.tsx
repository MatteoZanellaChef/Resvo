'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, ListOrdered, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Calendario', href: '/', icon: Calendar },
    { name: 'Prenotazioni', href: '/reservations', icon: ListOrdered },
    { name: 'Statistiche', href: '/statistics', icon: BarChart3 },
    { name: 'Impostazioni', href: '/settings/restaurant', icon: Settings },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden safe-area-bottom">
            <div className="flex justify-around items-center h-20">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center w-full h-full space-y-1',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
