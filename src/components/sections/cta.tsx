import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight, Star } from 'lucide-react';

type Props = {};

const Cta = (props: Props) => {
  return (
    <section className='container mx-auto px-4 py-20 text-center'>
      <div className='mx-auto max-w-3xl'>
        <h2 className='mb-4 text-4xl font-bold'>
          Ready to Transform Your Gym?
        </h2>
        <p className='text-muted-foreground mb-8 text-xl'>
          Join thousands of fitness professionals who trust MetaMatrix Fitness
          to power their business growth.
        </p>
        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
          {/* <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link> */}
          <Link href='/auth/signin'>
            <Button size='lg' className='px-8 py-6 text-lg'>
              Join Us
            </Button>
          </Link>
        </div>
        {/* <div className="flex items-center justify-center space-x-1 mt-6 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-2">Trusted by 1000+ gyms worldwide</span>
          </div> */}
      </div>
    </section>
  );
};

export default Cta;
