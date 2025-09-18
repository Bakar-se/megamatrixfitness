'use client';
import { Dumbbell } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';

type Props = {};

const Footer = (props: Props) => {
  return (
    <motion.footer
      className='bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur'
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className='container mx-auto px-4 py-8'>
        <div className='flex flex-col items-center justify-between md:flex-row'>
          <motion.div
            className='mb-4 flex items-center space-x-2 md:mb-0'
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Dumbbell className='text-primary h-6 w-6' />
            <span className='text-lg font-semibold'>MetaMatrix Fitness</span>
          </motion.div>
          <motion.p
            className='text-muted-foreground text-sm'
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            © 2024 MetaMatrix Fitness. All rights reserved.
          </motion.p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
