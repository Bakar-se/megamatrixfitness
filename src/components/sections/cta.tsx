'use client';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {};

const Cta = (props: Props) => {
  return (
    <section className='container mx-auto px-4 py-20 text-center'>
      <motion.div
        className='mx-auto max-w-3xl'
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <motion.h2
          className='mb-4 text-4xl font-bold'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Ready to Transform Your Gym?
        </motion.h2>
        <motion.p
          className='text-muted-foreground mb-8 text-xl'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Join thousands of fitness professionals who trust MetaMatrix Fitness
          to power their business growth.
        </motion.p>
        <motion.div
          className='flex flex-col justify-center gap-4 sm:flex-row'
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Link href='/auth/signin'>
            <Button size='lg' className='px-8 py-6 text-lg'>
              Join Us
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Cta;
