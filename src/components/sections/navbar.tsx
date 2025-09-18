'use client';
import { Dumbbell } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

type Props = {};

const Navbar = (props: Props) => {
  return (
    <motion.nav
      className='bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur'
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className='container mx-auto flex items-center justify-between px-4 py-4'>
        <motion.div
          className='flex items-center space-x-2'
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Dumbbell className='text-primary h-8 w-8' />
          <span className='text-2xl font-semibold'>MetaMatrix Fitness</span>
        </motion.div>
        <motion.div
          className='flex items-center space-x-4'
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href='/auth/signin'>
            <Button variant='ghost'>Sign In</Button>
          </Link>
          <Link href='/auth/signup'>
            <Button>Get Started</Button>
          </Link>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
