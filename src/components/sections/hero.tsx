import React from 'react';
import { Badge } from '../ui/badge';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

type Props = {};

const Hero = (props: Props) => {
  return (
    <section className='container mx-auto px-4 py-20 text-center'>
      <div className='mx-auto max-w-4xl'>
        <Badge variant='secondary' className='mb-4'>
          <Zap className='mr-1 h-4 w-4' />
          Next-Gen Fitness Management
        </Badge>
        <h1 className='mb-6 text-5xl font-bold tracking-tight md:text-7xl'>
          Transform Your Gym
          <br />
          <span className='text-primary'>Management</span>
        </h1>
        <p className='text-muted-foreground mx-auto mb-8 max-w-2xl text-xl'>
          The all-in-one platform for modern fitness businesses. Manage members,
          track equipment, handle subscriptions, and grow your gym with powerful
          analytics and automation.
        </p>
        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
          <Link href='/dashboard'>
            <Button size='lg' className='px-8 py-6 text-lg'>
              Join Us
              <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
          </Link>
          <Link href='/auth/signin'>
            <Button variant='outline' size='lg' className='px-8 py-6 text-lg'>
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
