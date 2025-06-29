import Link from 'next/link';
import { Bot, Twitter, Github, Linkedin } from 'lucide-react';
import { Button } from './ui/button';

export function Footer() {
    const socialLinks = [
        { icon: Twitter, href: "#", name: "Twitter" },
        { icon: Github, href: "#", name: "GitHub" },
        { icon: Linkedin, href: "#", name: "LinkedIn" },
    ];

    const footerLinks = {
        "Product": [
            { name: "Features", href: "/#features" },
            { name: "Workflow", href: "/#workflow" },
            { name: "Testimonials", href: "/#testimonials" },
            { name: "Pricing", href: "#" },
        ],
        "Company": [
            { name: "About Us", href: "#" },
            { name: "Careers", href: "#" },
            { name: "Contact", href: "#" },
        ],
        "Legal": [
            { name: "Privacy Policy", href: "#" },
            { name: "Terms of Service", href: "#" },
        ]
    };

    return (
        <footer className="bg-secondary text-secondary-foreground border-t">
            <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <Bot className="w-7 h-7 text-accent" />
                            <h2 className="text-xl font-bold font-headline">QuoteCraft</h2>
                        </div>
                        <p className="text-muted-foreground max-w-sm">The modern, AI-powered way to manage your quotations and streamline your sales.</p>
                    </div>

                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="font-semibold mb-4">{title}</h3>
                            <ul className="space-y-3">
                                {links.map(link => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 border-t border-muted pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} QuoteCraft. All rights reserved.
                    </p>
                    <div className="flex gap-2">
                        {socialLinks.map(social => (
                             <Button key={social.name} variant="ghost" size="icon" asChild>
                                <a href={social.href} aria-label={social.name}>
                                    <social.icon className="h-5 w-5 text-muted-foreground" />
                                </a>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
