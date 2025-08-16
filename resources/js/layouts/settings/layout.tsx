import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useState, useEffect } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profil',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Passwort',
        href: '/settings/password',
        icon: null,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Admin-Einstellungen',
        href: '/settings/admin',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const [currentPath, setCurrentPath] = useState<string>('');
    const [isClient, setIsClient] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'admin';

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsClient(true);
            setCurrentPath(window.location.pathname);
        }
    }, []);

    const allNavItems = isAdmin ? [...sidebarNavItems, ...adminNavItems] : sidebarNavItems;

    return (
        <div className="px-4 py-6">
            <Heading title="Einstellungen" description="Verwalten Sie Ihr Profil und Kontoeinstellungen" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {allNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start text-white hover:bg-white/20', {
                                    'bg-white/20 text-white': isClient && currentPath === item.href,
                                    'text-white/70': isClient && currentPath !== item.href,
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
