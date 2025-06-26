import Link from 'next/link';
import { Bot } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-secondary text-secondary-foreground border-t">
            <div className="container mx-auto px-4 md:px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <Bot className="w-7 h-7 text-accent" />
                        <h2 className="text-xl font-bold font-headline">QuoteCraft</h2>
                    </div>
                    <nav className="flex gap-4 md:gap-6 text-sm">
                        <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
                        <Link href="/#workflow" className="hover:text-primary transition-colors">Workflow</Link>
                        <Link href="/#testimonials" className="hover:text-primary transition-colors">Testimonials</Link>
                    </nav>
                </div>
                <div className="mt-8 border-t border-muted pt-4 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} QuoteCraft. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
