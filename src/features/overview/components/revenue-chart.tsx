'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IconCalendar, IconTrendingUp } from '@tabler/icons-react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

type TimeRange = '7d' | '30d' | '90d' | '1y';
type ChartType = 'line' | 'bar';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))'
  }
};

export function RevenueChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/analytics/revenue?timeRange=${timeRange}`
        );
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch revenue data');
        console.error('Error fetching revenue data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [timeRange]);

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue =
    data.length > 0 ? Math.round(totalRevenue / data.length) : 0;
  const growthRate =
    data.length > 1
      ? (
          ((data[data.length - 1].revenue - data[0].revenue) /
            data[0].revenue) *
          100
        ).toFixed(1)
      : '0';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background rounded-lg border p-2 shadow-sm'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col'>
              <span className='text-muted-foreground text-[0.70rem] uppercase'>
                Date
              </span>
              <span className='text-muted-foreground font-bold'>{label}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-muted-foreground text-[0.70rem] uppercase'>
                Revenue
              </span>
              <span className='font-bold'>
                PKR {payload[0].value?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

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
          <CardTitle>Revenue Overview</CardTitle>
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
            Revenue Overview
          </CardTitle>
          <p className='text-muted-foreground text-sm'>
            Total: PKR {totalRevenue.toLocaleString()} | Avg: PKR{' '}
            {avgRevenue.toLocaleString()}
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Select
            value={timeRange}
            onValueChange={(value: TimeRange) => setTimeRange(value)}
          >
            <SelectTrigger className='w-[100px]'>
              <IconCalendar className='mr-2 h-4 w-4' />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7d'>7 days</SelectItem>
              <SelectItem value='30d'>30 days</SelectItem>
              <SelectItem value='90d'>90 days</SelectItem>
              <SelectItem value='1y'>1 year</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={chartType}
            onValueChange={(value: ChartType) => setChartType(value)}
          >
            <SelectTrigger className='w-[100px]'>
              <IconTrendingUp className='mr-2 h-4 w-4' />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='line'>Line</SelectItem>
              <SelectItem value='bar'>Bar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            {chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                <XAxis
                  dataKey='date'
                  className='fill-muted-foreground text-xs'
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  className='fill-muted-foreground text-xs'
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `PKR ${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type='monotone'
                  dataKey='revenue'
                  stroke='hsl(var(--chart-1))'
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                  activeDot={{
                    r: 6,
                    stroke: 'hsl(var(--chart-1))',
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                <XAxis
                  dataKey='date'
                  className='fill-muted-foreground text-xs'
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  className='fill-muted-foreground text-xs'
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `PKR ${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey='revenue'
                  fill='hsl(var(--chart-1))'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
        <div className='text-muted-foreground mt-4 flex items-center justify-between text-sm'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <div
                className='h-2 w-2 rounded-full'
                style={{ backgroundColor: 'hsl(var(--chart-1))' }}
              />
              <span>Revenue Growth: +{growthRate}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
