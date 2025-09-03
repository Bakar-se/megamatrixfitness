import { Dumbbell } from 'lucide-react';
import React from 'react';

type Props = {};

const Footer = (props: Props) => {
  return (
    <footer className='bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur'>
      <div className='container mx-auto px-4 py-8'>
        <div className='flex flex-col items-center justify-between md:flex-row'>
          <div className='mb-4 flex items-center space-x-2 md:mb-0'>
            <Dumbbell className='text-primary h-6 w-6' />
            <span className='text-lg font-semibold'>MetaMatrix Fitness</span>
          </div>
          <p className='text-muted-foreground text-sm'>
            © 2024 MetaMatrix Fitness. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
