import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Calendar, LayoutGrid, List, Menu } from 'lucide-react';


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Jahreskalender',
        href: '/year-calendar',
        icon: Calendar,
    },
    {
        title: 'Buchungsübersicht',
        href: '/booking-overview',
        icon: List,
    },
];

const activeItemStyles = 'text-white bg-white/20';

export function AppHeader() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    return (
        <>
            <div className="border-b border-white/20 bg-white/10 backdrop-blur-lg">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px] text-white hover:bg-white/20">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="glass-card flex h-full w-64 flex-col items-stretch justify-between">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <SheetTitle className="text-white">Navigation</SheetTitle>
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className="flex items-center space-x-2 rounded p-2 font-medium text-white hover:bg-white/20"
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>



                    {/* Desktop Navigation */}
                    <NavigationMenu className="ml-8 hidden lg:flex">
                        <NavigationMenuList>
                            {mainNavItems.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    <Link
                                        prefetch
                                        href={item.href}
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            'bg-transparent text-white/80 hover:bg-white/20 hover:text-white focus:bg-white/20 focus:text-white data-[active]:bg-white/20 data-[active]:text-white data-[state=open]:bg-white/20 data-[state=open]:text-white',
                                            page.url.startsWith(item.href) ? activeItemStyles : '',
                                        )}
                                    >
                                        {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                        {item.title}
                                    </Link>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="ml-auto flex items-center space-x-4">
                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/20">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={auth?.user?.avatar} alt={auth?.user?.name} />
                                        <AvatarFallback className="border border-white/30 bg-white/20 text-xs text-white">
                                            {getInitials(auth?.user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-card w-56 border-white/20" align="end" forceMount>
                                <UserMenuContent />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>


        </>
    );
}
