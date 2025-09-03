import { Dumbbell } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';

type Props = {};

const Navbar = (props: Props) => {
  return (
    <nav className='bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur'>
      <div className='container mx-auto flex items-center justify-between px-4 py-4'>
        <div className='flex items-center space-x-2'>
          <Dumbbell className='text-primary h-8 w-8' />
          <span className='text-2xl font-bold'>MetaMatrix Fitness</span>
        </div>
        <div className='flex items-center space-x-4'>
          <Link href='/auth/signin'>
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
