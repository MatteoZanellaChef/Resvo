'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
    onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
    const currentDate = new Date().toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onMobileMenuToggle}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Apri menu</span>
            </Button>

            {/* Current date */}
            <div className="flex-1">
                <p className="text-sm text-muted-foreground capitalize hidden sm:block">
                    {currentDate}
                </p>
            </div>
        </header>
    );
}
