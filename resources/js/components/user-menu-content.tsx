import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings, Users } from 'lucide-react';

export function UserMenuContent() {
    const cleanup = useMobileNavigation();
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role === 'admin';

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={auth.user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild className="text-white hover:bg-white/20 focus:bg-white/20">
                    <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2" />
                        Einstellungen
                    </Link>
                </DropdownMenuItem>
                
                {isAdmin && (
                    <DropdownMenuItem asChild className="text-white hover:bg-white/20 focus:bg-white/20">
                        <Link className="block w-full" href="/admin/users" as="button" prefetch onClick={cleanup}>
                            <Users className="mr-2" />
                            Benutzerverwaltung
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuItem asChild className="text-white hover:bg-white/20 focus:bg-white/20">
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                    <LogOut className="mr-2" />
                    Abmelden
                </Link>
            </DropdownMenuItem>
        </>
    );
}
