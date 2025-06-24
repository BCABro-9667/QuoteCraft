"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, FileText, Bot } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-2">
    <Bot className="w-7 h-7 text-accent" />
    <h2 className="text-xl font-bold font-headline">QuoteCraft</h2>
  </div>
);

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/companies', label: 'Companies', icon: Building },
  { href: '/quotations', label: 'Quotations', icon: FileText },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="p-4 md:p-6 lg:p-8 bg-background flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
