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

type Props = {};

const Features = (props: Props) => {
  return (
    <section className='container mx-auto px-4 py-20'>
      <div className='mb-16 text-center'>
        <h2 className='mb-4 text-4xl font-bold'>
          Everything You Need to Run Your Gym
        </h2>
        <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
          Powerful features designed to streamline your fitness business
          operations
        </p>
      </div>

      <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
        <Card className='group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
          <CardHeader>
            <div className='bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors'>
              <Users className='text-primary h-6 w-6' />
            </div>
            <CardTitle>Member Management</CardTitle>
            <CardDescription>
              Track member profiles, memberships, and engagement with
              comprehensive client management tools.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className='group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
          <CardHeader>
            <div className='bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors'>
              <Dumbbell className='text-primary h-6 w-6' />
            </div>
            <CardTitle>Equipment Tracking</CardTitle>
            <CardDescription>
              Monitor equipment status, maintenance schedules, and usage
              analytics to optimize your gym operations.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className='group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
          <CardHeader>
            <div className='bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors'>
              <BarChart3 className='text-primary h-6 w-6' />
            </div>
            <CardTitle>Analytics & Reports</CardTitle>
            <CardDescription>
              Get insights into member growth, revenue trends, and operational
              efficiency with detailed analytics.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className='group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
          <CardHeader>
            <div className='bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors'>
              <Calendar className='text-primary h-6 w-6' />
            </div>
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>
              Handle membership plans, billing cycles, and payment processing
              with automated subscription management.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className='group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
          <CardHeader>
            <div className='bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors'>
              <Shield className='text-primary h-6 w-6' />
            </div>
            <CardTitle>Role-Based Access</CardTitle>
            <CardDescription>
              Secure your data with granular permissions for owners, admins, and
              staff members.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className='group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
          <CardHeader>
            <div className='bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors'>
              <Zap className='text-primary h-6 w-6' />
            </div>
            <CardTitle>Task Management</CardTitle>
            <CardDescription>
              Organize daily operations with Kanban boards and task tracking for
              your team.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
};

export default Features;
