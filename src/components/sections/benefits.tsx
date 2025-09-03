import { CheckCircle } from 'lucide-react';
import React from 'react';

type Props = {};

const Benefits = (props: Props) => {
  return (
    <section className='bg-muted/50 py-20'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mb-8 text-4xl font-bold'>
            Why Choose MetaMatrix Fitness?
          </h2>
          <div className='grid gap-8 text-left md:grid-cols-2'>
            <div className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <CheckCircle className='mt-1 h-6 w-6 flex-shrink-0 text-green-500' />
                <div>
                  <h3 className='font-semibold'>All-in-One Solution</h3>
                  <p className='text-muted-foreground'>
                    Manage every aspect of your gym from a single, intuitive
                    dashboard.
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-3'>
                <CheckCircle className='mt-1 h-6 w-6 flex-shrink-0 text-green-500' />
                <div>
                  <h3 className='font-semibold'>Real-Time Analytics</h3>
                  <p className='text-muted-foreground'>
                    Make data-driven decisions with comprehensive reporting and
                    insights.
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-3'>
                <CheckCircle className='mt-1 h-6 w-6 flex-shrink-0 text-green-500' />
                <div>
                  <h3 className='font-semibold'>Scalable & Secure</h3>
                  <p className='text-muted-foreground'>
                    Built to grow with your business with enterprise-grade
                    security.
                  </p>
                </div>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <CheckCircle className='mt-1 h-6 w-6 flex-shrink-0 text-green-500' />
                <div>
                  <h3 className='font-semibold'>Easy Integration</h3>
                  <p className='text-muted-foreground'>
                    Seamlessly connect with your existing tools and workflows.
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-3'>
                <CheckCircle className='mt-1 h-6 w-6 flex-shrink-0 text-green-500' />
                <div>
                  <h3 className='font-semibold'>24/7 Support</h3>
                  <p className='text-muted-foreground'>
                    Get help when you need it with our dedicated support team.
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-3'>
                <CheckCircle className='mt-1 h-6 w-6 flex-shrink-0 text-green-500' />
                <div>
                  <h3 className='font-semibold'>Mobile Ready</h3>
                  <p className='text-muted-foreground'>
                    Access your gym management tools from anywhere, anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
