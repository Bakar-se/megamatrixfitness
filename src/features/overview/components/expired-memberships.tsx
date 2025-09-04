'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Member } from '@/store/MemberSlice';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import {
  IconAlertTriangle,
  IconClock,
  IconUser,
  IconMail,
  IconPhone
} from '@tabler/icons-react';

interface ExpiredMembershipsProps {
  members: Member[];
}

export function ExpiredMemberships({ members }: ExpiredMembershipsProps) {
  const expiredMembers = useMemo(() => {
    const now = new Date();
    const warningDays = 7; // Show memberships expiring within 7 days

    return members
      .filter((member) => {
        if (!member.membership_fee || member.membership_fee.length === 0)
          return false;

        const latestMembership = member.membership_fee
          .filter((fee) => fee.is_active && !fee.is_deleted)
          .sort(
            (a, b) =>
              new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
          )[0];

        if (!latestMembership) return false;

        const endDate = new Date(latestMembership.end_date);
        const warningDate = addDays(now, warningDays);

        // Include expired memberships or those expiring soon
        return isBefore(endDate, warningDate);
      })
      .map((member) => {
        const latestMembership = member.membership_fee
          .filter((fee) => fee.is_active && !fee.is_deleted)
          .sort(
            (a, b) =>
              new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
          )[0];

        const endDate = new Date(latestMembership.end_date);
        const now = new Date();
        const isExpired = isBefore(endDate, now);
        const daysUntilExpiry = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...member,
          membership: latestMembership,
          isExpired,
          daysUntilExpiry: isExpired ? 0 : daysUntilExpiry
        };
      })
      .sort((a, b) => {
        // Sort by expiry status and days until expiry
        if (a.isExpired && !b.isExpired) return -1;
        if (!a.isExpired && b.isExpired) return 1;
        return a.daysUntilExpiry - b.daysUntilExpiry;
      });
  }, [members]);

  const handleRenewMembership = (memberId: string) => {
    // This would typically open a modal or navigate to a renewal page
    console.log('Renew membership for member:', memberId);
  };

  const handleContactMember = (member: Member) => {
    // This would typically open a contact modal or compose an email
    console.log('Contact member:', member.user.email);
  };

  if (expiredMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <IconUser className='h-5 w-5' />
            <span>Membership Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <div className='mb-4 rounded-full bg-green-100 p-3'>
              <IconUser className='h-6 w-6 text-green-600' />
            </div>
            <h3 className='mb-2 text-lg font-medium text-green-900'>
              All Good!
            </h3>
            <p className='text-muted-foreground text-sm'>
              No memberships are expired or expiring soon.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <IconAlertTriangle className='h-5 w-5 text-orange-500' />
          <span>Expired/Expiring Memberships</span>
          <Badge variant='destructive' className='ml-auto'>
            {expiredMembers.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='max-h-[400px] space-y-4 overflow-y-auto'>
          {expiredMembers.map((member) => (
            <div
              key={member.id}
              className='bg-card flex items-center space-x-4 rounded-lg border p-3'
            >
              <Avatar className='h-10 w-10'>
                <AvatarFallback>
                  {member.user.first_name[0]}
                  {member.user.last_name[0]}
                </AvatarFallback>
              </Avatar>

              <div className='min-w-0 flex-1'>
                <div className='flex items-center space-x-2'>
                  <p className='truncate text-sm font-medium'>
                    {member.user.first_name} {member.user.last_name}
                  </p>
                  <Badge
                    variant={member.isExpired ? 'destructive' : 'secondary'}
                    className='text-xs'
                  >
                    {member.isExpired
                      ? 'Expired'
                      : `${member.daysUntilExpiry}d left`}
                  </Badge>
                </div>

                <div className='text-muted-foreground mt-1 flex items-center space-x-4 text-xs'>
                  <div className='flex items-center space-x-1'>
                    <IconMail className='h-3 w-3' />
                    <span className='truncate'>{member.user.email}</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <IconPhone className='h-3 w-3' />
                    <span>{member.user.phone_number}</span>
                  </div>
                </div>

                <div className='mt-1 flex items-center space-x-2'>
                  <IconClock className='text-muted-foreground h-3 w-3' />
                  <span className='text-muted-foreground text-xs'>
                    Expires:{' '}
                    {format(
                      new Date(member.membership.end_date),
                      'MMM dd, yyyy'
                    )}
                  </span>
                  <span className='text-xs font-medium'>
                    ${member.membership.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {expiredMembers.length > 5 && (
          <div className='mt-4 border-t pt-4'>
            <Button variant='outline' className='w-full text-sm'>
              View All ({expiredMembers.length} members)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
