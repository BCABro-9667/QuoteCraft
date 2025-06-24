'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-4">
        {/* Future elements like user menu can go here */}
      </div>
    </header>
  );
}
