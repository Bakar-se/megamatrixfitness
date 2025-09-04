'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconBuilding,
  IconUsers,
  IconTools
} from '@tabler/icons-react';

interface DashboardStatsProps {
  activeGyms: number;
  totalGyms: number;
  totalMembers: number;
  totalEquipment: number;
  totalRevenue: number;
}

export function DashboardStats({
  activeGyms,
  totalGyms,
  totalMembers,
  totalEquipment,
  totalRevenue
}: DashboardStatsProps) {
  const gymGrowthRate =
    totalGyms > 0 ? ((activeGyms / totalGyms) * 100).toFixed(1) : '0';
  const memberGrowthRate = '12.5'; // This could be calculated from historical data
  const equipmentGrowthRate = '8.2'; // This could be calculated from historical data
  const revenueGrowthRate = '15.2'; // This could be calculated from historical data

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-5'>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Active Gyms</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {activeGyms}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />
              {gymGrowthRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Out of {totalGyms} total gyms <IconBuilding className='size-4' />
          </div>
          <div className='text-muted-foreground'>Active gym management</div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Total Members</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {totalMembers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />+{memberGrowthRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Growing membership base <IconUsers className='size-4' />
          </div>
          <div className='text-muted-foreground'>Member retention strong</div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Total Equipment</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {totalEquipment.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />+{equipmentGrowthRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Equipment inventory <IconTools className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            Well-maintained facilities
          </div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            PKR {totalRevenue.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />+{revenueGrowthRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Monthly recurring revenue <IconBuilding className='size-4' />
          </div>
          <div className='text-muted-foreground'>From active memberships</div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Revenue Growth</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {revenueGrowthRate}%
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />+{revenueGrowthRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Strong financial performance <IconBuilding className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            Exceeding targets this quarter
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
