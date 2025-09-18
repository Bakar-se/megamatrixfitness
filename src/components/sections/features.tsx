'use client';
import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart3,
  Calendar,
  Dumbbell,
  Shield,
  Users,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MagicCard } from '../ui/magic-card';

type Props = {};

const Features = (props: Props) => {
  const features = [
    {
      icon: Users,
      title: 'Member Management',
      description:
        'Track member profiles, memberships, and engagement with comprehensive client management tools.'
    },
    {
      icon: Dumbbell,
      title: 'Equipment Tracking',
      description:
        'Monitor equipment status, maintenance schedules, and usage analytics to optimize your gym operations.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description:
        'Get insights into member growth, revenue trends, and operational efficiency with detailed analytics.'
    },
    {
      icon: Calendar,
      title: 'Subscription Management',
      description:
        'Handle membership plans, billing cycles, and payment processing with automated subscription management.'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description:
        'Secure your data with granular permissions for owners, admins, and staff members.'
    },
    {
      icon: Zap,
      title: 'Task Management',
      description:
        'Organize daily operations with Kanban boards and task tracking for your team.'
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section className='container mx-auto px-4 py-20'>
      <motion.div
        className='mb-16 text-center'
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className='mb-4 text-4xl font-bold'>
          Everything You Need to Run Your Gym
        </h2>
        <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
          Powerful features designed to streamline your fitness business
          operations
        </p>
      </motion.div>

      <motion.div
        className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'
        variants={containerVariants}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true }}
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={cardVariants}>
            <Card className='group h-full p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
              <MagicCard className='h-full py-6'>
                <CardHeader>
                  <div className='bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors'>
                    <feature.icon className='text-primary h-6 w-6' />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </MagicCard>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Features;
