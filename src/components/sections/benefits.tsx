'use client';
import { CheckCircle } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';

type Props = {};

const Benefits = (props: Props) => {
  const benefits = [
    {
      title: 'All-in-One Solution',
      description:
        'Manage every aspect of your gym from a single, intuitive dashboard.'
    },
    {
      title: 'Real-Time Analytics',
      description:
        'Make data-driven decisions with comprehensive reporting and insights.'
    },
    {
      title: 'Scalable & Secure',
      description:
        'Built to grow with your business with enterprise-grade security.'
    },
    {
      title: 'Easy Integration',
      description: 'Seamlessly connect with your existing tools and workflows.'
    },
    {
      title: '24/7 Support',
      description: 'Get help when you need it with our dedicated support team.'
    },
    {
      title: 'Mobile Ready',
      description: 'Access your gym management tools from anywhere, anytime.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className='bg-primary/5 py-20'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-4xl text-center'>
          <motion.h2
            className='mb-8 text-4xl font-bold'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Choose MetaMatrix Fitness?
          </motion.h2>
          <motion.div
            className='grid gap-8 text-left md:grid-cols-2'
            variants={containerVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className='flex items-start space-x-3'
                variants={itemVariants}
              >
                <CheckCircle className='text-primary mt-1 h-6 w-6 flex-shrink-0' />
                <div>
                  <h3 className='font-semibold'>{benefit.title}</h3>
                  <p className='text-muted-foreground'>{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
