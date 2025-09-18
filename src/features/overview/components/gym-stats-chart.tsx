'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBuilding, IconUsers, IconTools } from '@tabler/icons-react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

export function GymStatsChart() {
  const [data, setData] = useState<any>({ chartData: [], pieData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'distribution'>(
    'overview'
  );

  useEffect(() => {
    const fetchGymStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/analytics/gym-stats');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch gym statistics');
        console.error('Error fetching gym stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGymStats();
  }, []);

  const chartConfig = {
    members: {
      label: 'Members',
      color: 'var(--chart-1)'
    },
    equipment: {
      label: 'Equipment',
      color: 'var(--chart-2)'
    }
  };

  const pieColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)'
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className='bg-muted h-6 w-32 animate-pulse rounded' />
        </CardHeader>
        <CardContent>
          <div className='bg-muted h-[300px] w-full animate-pulse rounded' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gym Performance Overview</CardTitle>
        </CardHeader>
        <CardContent className='flex items-center justify-center py-8'>
          <p className='text-muted-foreground'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  const totalMembers =
    data.chartData?.reduce((sum: number, gym: any) => sum + gym.members, 0) ||
    0;
  const totalEquipment =
    data.chartData?.reduce((sum: number, gym: any) => sum + gym.equipment, 0) ||
    0;
  const activeGyms =
    data.pieData?.find((item: any) => item.name === 'Active Gyms')?.value || 0;

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div>
          <CardTitle className='text-base font-medium'>
            Gym Performance Overview
          </CardTitle>
          <p className='text-muted-foreground text-sm'>
            Member and equipment distribution across gyms
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <IconBuilding className='text-muted-foreground h-5 w-5' />
          <IconUsers className='text-muted-foreground h-5 w-5' />
          <IconTools className='text-muted-foreground h-5 w-5' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='mb-4 flex space-x-2'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'distribution'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            Status Distribution
          </button>
        </div>

        <div className='h-[300px] w-full'>
          {activeTab === 'overview' ? (
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={data.chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='primary' />
                  <XAxis
                    dataKey='name'
                    stroke='bg-chart-1'
                    fontSize={12}
                    angle={-45}
                    textAnchor='end'
                    height={60}
                  />
                  <YAxis stroke='primary' fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    dataKey='members'
                    fill='var(--color-members)'
                    name='Members'
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey='equipment'
                    fill='var(--color-equipment)'
                    name='Equipment'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={data.pieData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey='value'
                    nameKey='name'
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                    labelLine={false}
                  >
                    {data.pieData?.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className='bg-background rounded-lg border p-2 shadow-sm'>
                            <div className='flex items-center gap-2'>
                              <div
                                className='h-3 w-3 rounded-full'
                                style={{ backgroundColor: data.color }}
                              />
                              <span className='font-medium'>{data.name}</span>
                            </div>
                            <p className='text-muted-foreground text-sm'>
                              {data.value} gyms (
                              {data.payload?.total
                                ? (
                                    (Number(data.value) /
                                      Number(data.payload.total)) *
                                    100
                                  ).toFixed(1)
                                : '0.0'}
                              %)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        <div className='mt-4 grid grid-cols-3 gap-4 text-sm'>
          <div className='flex items-center space-x-2'>
            <div className='bg-chart-1 h-2 w-2 rounded-full' />
            <span className='text-muted-foreground'>Total Members: </span>
            <span className='text-foreground font-semibold'>
              {totalMembers.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='bg-chart-2 h-2 w-2 rounded-full' />
            <span className='text-muted-foreground'>Total Equipment: </span>
            <span className='text-foreground font-semibold'>
              {totalEquipment.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='bg-chart-3 h-2 w-2 rounded-full' />
            <span className='text-muted-foreground'>Active Gyms: </span>
            <span className='text-foreground font-semibold'>
              {activeGyms.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
