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
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

type TimeRange = '7d' | '30d' | '90d' | '1y';
type ChartType = 'line' | 'bar';

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

  const chartOptions: Highcharts.Options = {
    chart: {
      type: chartType === 'line' ? 'line' : 'column',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    },
    title: {
      text: undefined
    },
    xAxis: {
      categories: data.map((item) => item.date),
      gridLineColor: '#e5e7eb',
      lineColor: '#e5e7eb',
      tickColor: '#e5e7eb',
      labels: {
        style: {
          color: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    yAxis: {
      title: {
        text: 'Revenue (PKR)',
        style: {
          color: '#6b7280',
          fontSize: '12px'
        }
      },
      gridLineColor: '#f3f4f6',
      lineColor: '#e5e7eb',
      labels: {
        style: {
          color: '#6b7280',
          fontSize: '12px'
        },
        formatter: function () {
          return `PKR ${this.value.toLocaleString()}`;
        }
      }
    },
    series: [
      {
        name: 'Revenue',
        type: chartType === 'line' ? 'line' : 'column',
        data: data.map((item) => item.revenue),
        color: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1
          },
          stops: [
            [0, '#3b82f6'],
            [1, '#1d4ed8']
          ]
        },
        lineWidth: 3,
        marker: {
          radius: 4,
          fillColor: '#3b82f6',
          lineWidth: 2,
          lineColor: '#ffffff'
        },
        dataLabels: {
          enabled: false
        }
      }
    ],
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderRadius: 8,
      shadow: {
        color: 'rgba(0, 0, 0, 0.1)',
        offsetX: 0,
        offsetY: 4,
        opacity: 0.1,
        width: 3
      },
      style: {
        color: '#374151',
        fontSize: '14px'
      },
      formatter: function () {
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${this.x}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 2px;"></div>
              <span>Revenue: <strong>PKR ${this.y?.toLocaleString()}</strong></span>
            </div>
          </div>
        `;
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          states: {
            hover: {
              enabled: true,
              radius: 6
            }
          }
        }
      },
      column: {
        borderRadius: 4,
        borderWidth: 0
      }
    }
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
        <div className='h-[300px] w-full'>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
        <div className='text-muted-foreground mt-4 flex items-center justify-between text-sm'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <div className='h-2 w-2 rounded-full bg-blue-500' />
              <span>Revenue Growth: +{growthRate}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
