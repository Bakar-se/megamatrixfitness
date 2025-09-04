'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  IconUsers,
  IconCalendar,
  IconMail,
  IconPhone
} from '@tabler/icons-react';
import axios from 'axios';
import { format } from 'date-fns';

interface Member {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_picture?: string;
  };
  joinedAt: string;
  membership_fee: Array<{
    price: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
  }>;
}

export function RecentMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentMembers = async () => {
      try {
        setLoading(true);

        // First get user's gyms
        const gymsResponse = await axios.get('/api/gyms/fetchgyms');
        const gyms = gymsResponse.data.gyms || [];

        if (gyms.length === 0) {
          setMembers([]);
          return;
        }

        // Get members from the first gym
        const firstGymId = gyms[0].id;
        const response = await axios.get(
          `/api/members/fetchmembers?gym_id=${firstGymId}`
        );
        setMembers(response.data.members || []);
      } catch (err) {
        setError('Failed to fetch recent members');
        console.error('Error fetching recent members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMembers();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getMembershipStatus = (membership_fee: any[]) => {
    if (!membership_fee || membership_fee.length === 0) {
      return { status: 'No Membership', color: 'bg-gray-100 text-gray-800' };
    }

    const activeMembership = membership_fee
      .filter((fee) => fee.is_active && !fee.is_deleted)
      .sort(
        (a, b) =>
          new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      )[0];

    if (!activeMembership) {
      return { status: 'Inactive', color: 'bg-red-100 text-red-800' };
    }

    const endDate = new Date(activeMembership.end_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return { status: 'Expired', color: 'bg-red-100 text-red-800' };
    } else if (daysUntilExpiry <= 7) {
      return {
        status: 'Expiring Soon',
        color: 'bg-yellow-100 text-yellow-800'
      };
    } else {
      return { status: 'Active', color: 'bg-green-100 text-green-800' };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className='bg-muted h-6 w-32 animate-pulse rounded' />
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center space-x-4'>
                <div className='bg-muted h-10 w-10 animate-pulse rounded-full' />
                <div className='flex-1 space-y-2'>
                  <div className='bg-muted h-4 w-32 animate-pulse rounded' />
                  <div className='bg-muted h-3 w-24 animate-pulse rounded' />
                </div>
                <div className='bg-muted h-6 w-16 animate-pulse rounded' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Members</CardTitle>
        </CardHeader>
        <CardContent className='flex items-center justify-center py-8'>
          <p className='text-muted-foreground'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div>
          <CardTitle className='text-base font-medium'>
            Recent Members
          </CardTitle>
          <p className='text-muted-foreground text-sm'>
            Latest members who joined your gym
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <IconUsers className='text-muted-foreground h-5 w-5' />
          <span className='text-muted-foreground text-sm'>
            {members.length} members
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <IconUsers className='text-muted-foreground mb-4 h-12 w-12' />
            <p className='text-muted-foreground'>No members found</p>
            <p className='text-muted-foreground text-sm'>
              Members will appear here once they join
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {members.map((member) => {
              const membershipStatus = getMembershipStatus(
                member.membership_fee
              );
              const activeMembership = member.membership_fee?.find(
                (fee) => fee.is_active
              );

              return (
                <div
                  key={member.id}
                  className='flex items-center space-x-4 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50'
                >
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={member.user.profile_picture} />
                    <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
                      {getInitials(
                        member.user.first_name,
                        member.user.last_name
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center space-x-2'>
                      <p className='truncate text-sm font-medium text-gray-900'>
                        {member.user.first_name} {member.user.last_name}
                      </p>
                      <Badge
                        variant='secondary'
                        className={`text-xs ${membershipStatus.color}`}
                      >
                        {membershipStatus.status}
                      </Badge>
                    </div>

                    <div className='mt-1 flex items-center space-x-4 text-xs text-gray-500'>
                      <div className='flex items-center space-x-1'>
                        <IconMail className='h-3 w-3' />
                        <span className='truncate'>{member.user.email}</span>
                      </div>
                      <div className='flex items-center space-x-1'>
                        <IconPhone className='h-3 w-3' />
                        <span>{member.user.phone_number}</span>
                      </div>
                    </div>

                    <div className='mt-1 flex items-center space-x-4 text-xs text-gray-500'>
                      <div className='flex items-center space-x-1'>
                        <IconCalendar className='h-3 w-3' />
                        <span>
                          Joined{' '}
                          {format(new Date(member.joinedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      {activeMembership && (
                        <div className='flex items-center space-x-1'>
                          <span className='font-medium text-green-600'>
                            PKR {activeMembership.price.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
