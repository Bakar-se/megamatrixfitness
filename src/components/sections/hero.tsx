'use client';
import { Badge } from '../ui/badge';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import Image from 'next/image';
import { ShineBorder } from '../ui/shine-border';
import { motion } from 'framer-motion';
import { ShimmerButton } from '../ui/shimmer-button';

type Props = {};

const Hero = (props: Props) => {
  return (
    <section className='relative container mx-auto mt-20 min-h-screen overflow-hidden px-4 py-20 text-center'>
      <div
        className='absolute top-1/2 left-1/2 -z-10 h-[1150px] w-[1150px] -translate-x-1/2 -translate-y-1/2 transform rounded-full opacity-10'
        style={{
          background: `radial-gradient(ellipse, #5ea500 40%, transparent 70%)`
        }}
      />

      <div className='mx-auto max-w-6xl'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Badge variant='secondary' className='mb-4'>
            <Zap className='mr-1 h-4 w-4' />
            Next-Gen Fitness Management
          </Badge>
        </motion.div>

        <motion.h1
          className='mb-6 text-5xl font-medium tracking-tight md:text-8xl'
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Transform Your Gym
          <br />
          <span className='text-primary'>Management</span>
        </motion.h1>

        <motion.p
          className='text-muted-foreground mx-auto mb-8 max-w-3xl text-lg'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          The all-in-one platform for modern fitness businesses. Manage members,
          track equipment, handle subscriptions, and grow your gym with powerful
          analytics and automation.
        </motion.p>

        <motion.div
          className='flex flex-col justify-center gap-4 sm:flex-row'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Link href='/dashboard'>
            <ShimmerButton className='shadow-2xl'>
              Get Started
              <ArrowRight className='ml-2 h-5 w-5' />
            </ShimmerButton>
          </Link>
        </motion.div>

        <motion.div
          className='relative mt-10 h-full w-full'
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <ShineBorder shineColor={['#5ea500', '#5ea500', '#5ea500']} />
          <Image
            src='/dashboard.png'
            alt='Hero'
            width={1200}
            height={700}
            className='h-full w-full rounded-lg'
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
