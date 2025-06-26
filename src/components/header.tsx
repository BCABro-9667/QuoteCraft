'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, FileText, Bot, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

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
  // This logic determines which set of navigation items to show.
  // In a real app, this would be based on user authentication state.
  const isPublicPage = ['/', '/login', '/register'].includes(pathname) || pathname.startsWith('/#');

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && href !== '/') return pathname.startsWith(href);
    return false;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
      <Link href={isPublicPage ? "/" : "/dashboard"} className="flex items-center gap-2">
        <Logo />
      </Link>
      
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {isPublicPage ? (
            publicNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))
        ) : (
            appNavItems.map((item) => (
            <Link
                key={item.label}
                href={item.href}
                className={cn(
                "flex items-center gap-2 transition-colors hover:text-primary",
                isActive(item.href) ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
            >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
            </Link>
            ))
        )}
      </nav>

      <div className="flex items-center gap-2">
        {isPublicPage && (
             <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/register">Sign Up</Link>
                </Button>
            </div>
        )}
        <div className="md:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {(isPublicPage ? publicNavItems : appNavItems).map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                        <Link
                            href={item.href}
                            className={cn("flex items-center gap-4 py-2", isActive(item.href) && !isPublicPage ? "font-semibold" : "")}
                        >
                           {item.icon && <item.icon className="h-5 w-5" />}
                           <span>{item.label}</span>
                        </Link>
                    </DropdownMenuItem>
                    ))}
                    {isPublicPage && (
                        <>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem asChild>
                            <Link href="/login" className="flex items-center gap-4 py-2">Login</Link>
                         </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/register" className="flex items-center gap-4 py-2">Sign Up</Link>
                         </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
