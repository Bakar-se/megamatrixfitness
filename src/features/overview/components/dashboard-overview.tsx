'use client';

import { useEffect, useState } from 'react';
import { DashboardStats } from './dashboard-stats';
import { RevenueChart } from './revenue-chart';
import { ExpiredMemberships } from './expired-memberships';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';

interface DashboardStats {
  totalGyms: number;
  activeGyms: number;
  totalMembers: number;
  totalEquipment: number;
  totalRevenue: number;
  activeMemberships: number;
  growthRates: {
    gym: string;
    member: string;
    equipment: string;
    revenue: string;
  };
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const statsResponse = await axios.get('/api/analytics/dashboard-stats');
        setStats(statsResponse.data);

        // Fetch members for expired memberships component
        const gymsResponse = await axios.get('/api/gyms/fetchgyms');
        const gyms = gymsResponse.data.gyms || [];

        if (gyms.length > 0) {
          const firstGymId = gyms[0].id;
          const membersResponse = await axios.get(
            `/api/members/fetchmembers?gym_id=${firstGymId}`
          );
          setMembers(membersResponse.data.members || []);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-8 w-32' />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-64 w-full' />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-64 w-full' />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardContent className='flex items-center justify-center py-8'>
            <p className='text-muted-foreground'>
              {error || 'Failed to load dashboard data'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <DashboardStats
        activeGyms={stats.activeGyms}
        totalGyms={stats.totalGyms}
        totalMembers={stats.totalMembers}
        totalEquipment={stats.totalEquipment}
        totalRevenue={stats.totalRevenue}
      />

      {/* Charts and Lists */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <RevenueChart />
        <ExpiredMemberships members={members} />
      </div>
    </div>
  );
}
