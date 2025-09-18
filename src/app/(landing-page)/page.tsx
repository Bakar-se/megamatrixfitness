import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell,
  Users,
  BarChart3,
  Calendar,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';
import Link from 'next/link';
import Hero from '@/components/sections/hero';
import Navbar from '@/components/sections/navbar';
import Features from '@/components/sections/features';
import Benefits from '@/components/sections/benefits';
import Cta from '@/components/sections/cta';
import Footer from '@/components/sections/footer';

export default function LandingPage() {
  return (
    <div className='min-h-screen'>
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Benefits Section */}
      <Benefits />

      {/* CTA Section */}
      <Cta />

      {/* Footer */}
      <Footer />
    </div>
  );
}
