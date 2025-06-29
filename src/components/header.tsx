'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, FileText, Bot, User, Menu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from './ui/skeleton';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';

const Logo = () => (
  <div className="flex items-center gap-2">
    <Bot className="w-7 h-7 text-accent" />
    <h2 className="text-xl font-bold font-headline">QuoteCraft</h2>
  </div>
);

const appNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/companies', label: 'Companies', icon: Building },
  { href: '/quotations', label: 'Quotations', icon: FileText },
  { href: '/profile', label: 'My Profile', icon: User },
];

const publicNavItems = [
  { href: '/#features', label: 'Features' },
  { href: '/#workflow', label: 'Workflow' },
  { href: '/#testimonials', label: 'Testimonials' },
];

export function Header() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const isAuthenticated = !!user;

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && href !== '/' && !href.startsWith('/#')) return pathname.startsWith(href);
    if(href.startsWith('/#')) return false; // Don't highlight anchor links
    return false;
  };

  const renderNavLinks = () => {
    if (loading) {
      return (
        <div className="hidden md:flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      );
    }

    if (isAuthenticated) {
      return appNavItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            'flex items-center gap-2 transition-colors hover:text-primary',
            isActive(item.href)
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground'
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ));
    }

    return publicNavItems.map((item) => (
      <Link
        key={item.label}
        href={item.href}
        className="transition-colors hover:text-primary text-muted-foreground"
      >
        {item.label}
      </Link>
    ));
  };

  const renderActionButtons = () => {
    if (loading) {
      return <Skeleton className="h-10 w-24" />;
    }
    if (isAuthenticated) {
      return (
        <div className='hidden md:flex'>
        <Button variant="ghost" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
        </div>
      );
    }
    return (
      <div className="hidden md:flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    );
  };

  const renderMobileMenu = () => {
    if (loading) return null;

    let items = isAuthenticated ? appNavItems : publicNavItems;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-4">
                <nav className="grid gap-4 text-lg font-medium mt-8">
                    <SheetClose asChild>
                        <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <Logo />
                        </Link>
                    </SheetClose>
                    {items.map((item) => (
                        <SheetClose asChild key={item.label}>
                            <Link
                                href={item.href}
                                className={cn(
                                'flex items-center gap-4 px-2.5 transition-colors hover:text-primary',
                                isActive(item.href) && isAuthenticated ? 'text-foreground' : 'text-muted-foreground'
                                )}
                            >
                                {item.icon && <item.icon className="h-5 w-5" />}
                                <span>{item.label}</span>
                            </Link>
                        </SheetClose>
                    ))}
                </nav>
                <div className="mt-auto">
                    <Separator className="my-4" />
                    {isAuthenticated ? (
                    <SheetClose asChild>
                        <Button variant="ghost" onClick={logout} className="w-full justify-start gap-4 px-2.5">
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                        </Button>
                    </SheetClose>
                    ) : (
                    <div className="grid gap-2">
                        <SheetClose asChild>
                            <Button asChild className="w-full"><Link href="/login">Login</Link></Button>
                        </SheetClose>
                        <SheetClose asChild>
                            <Button variant="outline" asChild className="w-full"><Link href="/register">Sign Up</Link></Button>
                        </SheetClose>
                    </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
      <Link
        href={isAuthenticated ? '/dashboard' : '/'}
        className="flex items-center gap-2"
      >
        <Logo />
      </Link>

      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {renderNavLinks()}
      </nav>

      <div className="flex items-center gap-2">
        {renderActionButtons()}
        <div className="md:hidden">{renderMobileMenu()}</div>
      </div>
    </header>
  );
}
