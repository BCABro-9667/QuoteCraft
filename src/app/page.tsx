import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import Image from 'next/image';
import img1 from './ban.png'
import { Rocket, ShieldCheck, Layers, GitBranch, Award, MessageCircle, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <Rocket className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Speed',
    description: 'Go from image to invoice in seconds. Our AI extracts product details instantly, eliminating manual data entry.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: 'Secure & Reliable',
    description: 'Your data is safe with us. We use industry-standard security to protect your company and client information.',
  },
  {
    icon: <Layers className="h-10 w-10 text-primary" />,
    title: 'Professional Branding',
    description: 'Generate beautiful, branded PDF quotations that impress your clients and win you more business.',
  },
];

const testimonials = [
  {
    name: 'Rohan Mehta',
    title: 'CEO, Innovate Solutions',
    quote: "QuoteCraft has revolutionized how we handle quotations. The AI features are a game-changer and have saved us countless hours.",
    avatar: 'https://placehold.co/100x100.png',
  },
  {
    name: 'Priya Sharma',
    title: 'Sales Head, Apex Supplies',
    quote: 'The ability to generate professional PDFs on the fly has significantly improved our sales cycle. Our clients are impressed!',
    avatar: 'https://placehold.co/100x100.png',
  },
  {
    name: 'Ankit Desai',
    title: 'Freelancer',
    quote: "As a freelancer, QuoteCraft gives me the professional edge I need. It's simple, powerful, and incredibly efficient.",
    avatar: 'https://placehold.co/100x100.png',
  },
];

const workflowSteps = [
    {
        icon: <GitBranch className="h-8 w-8 text-primary" />,
        title: "Sign Up & Set Up",
        description: "Create your account and personalize your profile with your company's branding in just a few minutes."
    },
    {
        icon: <Layers className="h-8 w-8 text-primary" />,
        title: "Add Your Clients",
        description: "Easily import and manage all your client companies' details in one organized, central hub."
    },
    {
        icon: <Rocket className="h-8 w-8 text-primary" />,
        title: "Create AI-Powered Quotes",
        description: "Generate quotations manually or let our AI work its magic by extracting details from a product image."
    },
    {
        icon: <Award className="h-8 w-8 text-primary" />,
        title: "Download & Win",
        description: "Instantly download professional PDFs of your quotations, ready to be sent to your clients to close deals."
    }
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="w-full py-24 md:py-32 lg:py-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          </div>
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Build Quotes, Not Paperwork.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    QuoteCraft is the AI-native platform that automates your quotation process. Turn images into invoices and manage clients with ease.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="group">
                    <Link href="/register">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Image
                  src={img1}
                  width="600"
                  height="400"
                  alt="Dashboard Preview"
                  data-ai-hint="dashboard analytics"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last "
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why You'll Love QuoteCraft</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We've built a suite of powerful tools designed to make your sales process faster and more professional.
                </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="grid gap-4 text-center p-6 rounded-lg transition-all hover:bg-card hover:shadow-lg">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold">Our Workflow</div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Your Path to Effortless Quoting</h2>
                </div>
                <div className="relative mx-auto max-w-5xl">
                    <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2"></div>
                    {workflowSteps.map((step, index) => (
                        <div key={step.title} className={`relative mb-12 flex w-full items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                            <div className={`w-[calc(50%-2rem)] ${index % 2 === 0 ? 'order-1 text-right' : 'order-3 text-left'}`}>
                                <Card className="p-6">
                                    <h3 className="text-xl font-bold mb-2 font-headline">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </Card>
                            </div>
                            <div className="order-2 z-10 flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-primary shadow-lg">
                                {step.icon}
                            </div>
                            <div className="w-[calc(50%-2rem)] order-1"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold">Testimonials</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Trusted by Professionals</h2>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="flex flex-col justify-between h-full">
                  <CardContent className="p-6 flex-1">
                    <MessageCircle className="w-8 h-8 text-primary/50 mb-4" />
                    <p className="text-muted-foreground text-lg">&quot;{testimonial.quote}&quot;</p>
                  </CardContent>
                  <CardHeader className="p-6 pt-0 border-t">
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={testimonial.avatar} data-ai-hint="person face" />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                        </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-4xl text-center bg-card p-10 rounded-2xl shadow-lg">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Ready to Upgrade Your Workflow?</h2>
                    <p className="mt-4 text-muted-foreground md:text-lg">
                        Stop wasting time on manual quotes. Join hundreds of businesses streamlining their sales process with QuoteCraft.
                    </p>
                    <div className="mt-8">
                         <Button asChild size="lg" className="group">
                            <Link href="/register">
                            Claim Your Free Account
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}
