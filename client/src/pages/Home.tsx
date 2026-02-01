import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Clock, Star } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Unsplash image: sleek dark car on road */}
          <img 
            src="https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
            Elevate Your Journey
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-300 mb-10">
            Premium car rentals and car services by JJK Cars. Experience the freedom of the open road with our curated selection of luxury and performance vehicles.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/catalog">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full">
                Browse Cars <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-300 mb-10">
            Premium car rentals and car services by JJK Cars. Experience the freedom of the open road with our curated selection of luxury and performance vehicles.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/catalog">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full">
                Browse Cars <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-foreground">Why Choose JJK Cars?</h2>
            <p className="mt-4 text-muted-foreground">We provide a seamless rental experience tailored to your needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Premium Insurance",
                description: "Drive with peace of mind knowing you're fully covered with our comprehensive insurance plans."
              },
              {
                icon: Clock,
                title: "24/7 Support",
                description: "Our dedicated support team is available around the clock to assist you with any roadside issues."
              },
              {
                icon: Star,
                title: "Top Rated Cars",
                description: "Our vehicles are meticulously maintained and regularly serviced to ensure safety and comfort."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Ready to hit the road?</h2>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
                Join thousands of satisfied customers who trust us for their travel needs. Book your perfect car today.
              </p>
              <Link href="/catalog">
                <Button variant="secondary" size="lg" className="rounded-full h-12 px-8 font-semibold">
                  View Available Cars
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
