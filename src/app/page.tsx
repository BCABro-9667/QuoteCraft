import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Zap, Users, BarChart } from 'lucide-react';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-accent" />,
    title: 'AI-Powered Quoting',
    description: 'Leverage AI to automatically extract product details from images, saving you time and reducing errors.',
  },
  {
    icon: <Users className="h-8 w-8 text-accent" />,
    title: 'Company Management',
    description: 'Keep all your client and company profiles organized in one central location for easy access.',
  },
  {
    icon: <BarChart className="h-8 w-8 text-accent" />,
    title: 'PDF Generation',
    description: 'Instantly generate professional, customizable PDF quotations with your own branding and terms.',
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
        title: "Register Your Account",
        description: "Sign up in seconds and set up your company profile with your own branding and details."
    },
    {
        title: "Add Client Companies",
        description: "Easily add and manage all your client information in a centralized system."
    },
    {
        title: "Create Quotations",
        description: "Generate new quotations manually or use our AI to extract product details from an image."
    },
    {
        title: "Download & Share",
        description: "Instantly download professional PDFs of your quotations to send to your clients."
    }
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="w-full py-20 md:py-32 lg:py-40 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Modern Quotation Management, Powered by AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    QuoteCraft streamlines your sales process. Create, manage, and send professional quotations faster than ever before.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/register">Get Started for Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="invoice app"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is packed with features designed to make your quotation process seamless and professional.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              {features.map((feature) => (
                <div key={feature.title} className="grid gap-4 text-center">
                  <div className="mx-auto">{feature.icon}</div>
                  <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Our Workflow</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A Simple Path to Perfect Quotes</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                           Follow these simple steps to get up and running with QuoteCraft.
                        </p>
                    </div>
                </div>
                <div className="relative mt-12 max-w-5xl mx-auto">
                    {workflowSteps.map((step, index) => (
                        <div key={step.title} className={`flex items-start gap-6 mb-10 ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg">
                                    {index + 1}
                                </div>
                                {index < workflowSteps.length - 1 && <div className="w-px h-16 bg-border mt-2"></div>}
                            </div>
                            <div className={`p-6 bg-card rounded-lg shadow-md w-full ${index % 2 !== 0 ? 'md:text-right' : 'md:text-left'}`}>
                                <h3 className="text-xl font-bold mb-2 font-headline">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Testimonials</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">What Our Users Say</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hear from satisfied customers who have transformed their business with QuoteCraft.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name}>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground italic">&quot;{testimonial.quote}&quot;</p>
                    <div className="mt-4 flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} data-ai-hint="person" />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
