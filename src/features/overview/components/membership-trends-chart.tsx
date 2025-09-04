'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconUsers, IconTrendingUp } from '@tabler/icons-react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export function MembershipTrendsChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/analytics/membership-trends');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch membership trends');
        console.error('Error fetching membership trends:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendsData();
  }, []);

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'areaspline',
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
        text: 'Members',
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
        }
      }
    },
    series: [
      {
        name: 'Total Members',
        type: 'areaspline',
        data: data.map((item) => item.totalMembers),
        color: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1
          },
          stops: [
            [0, '#10b981'],
            [1, '#059669']
          ]
        },
        fillOpacity: 0.3,
        lineWidth: 3,
        marker: {
          radius: 4,
          fillColor: '#10b981',
          lineWidth: 2,
          lineColor: '#ffffff'
        }
      },
      {
        name: 'Active Memberships',
        type: 'areaspline',
        data: data.map((item) => item.activeMemberships),
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
        fillOpacity: 0.2,
        lineWidth: 2,
        marker: {
          radius: 3,
          fillColor: '#3b82f6',
          lineWidth: 2,
          lineColor: '#ffffff'
        }
      },
      {
        name: 'New Memberships',
        type: 'line',
        data: data.map((item) => item.newMemberships),
        color: '#f59e0b',
        lineWidth: 2,
        marker: {
          radius: 3,
          fillColor: '#f59e0b',
          lineWidth: 2,
          lineColor: '#ffffff'
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
        const point = this as any;
        const series = this.series;
        const color = series.color;

        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${point.x}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
              <span>${series.name}: <strong>${point.y?.toLocaleString()}</strong></span>
            </div>
          </div>
        `;
      }
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: {
        color: '#6b7280',
        fontSize: '12px'
      },
      itemHoverStyle: {
        color: '#374151'
      }
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      areaspline: {
        marker: {
          enabled: true,
          states: {
            hover: {
              enabled: true,
              radius: 6
            }
          }
        }
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
          <CardTitle>Membership Growth Trends</CardTitle>
        </CardHeader>
        <CardContent className='flex items-center justify-center py-8'>
          <p className='text-muted-foreground'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  const totalMembers = data.length > 0 ? data[data.length - 1].totalMembers : 0;
  const activeMemberships =
    data.length > 0 ? data[data.length - 1].activeMemberships : 0;
  const newMemberships = data.reduce(
    (sum, item) => sum + item.newMemberships,
    0
  );

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div>
          <CardTitle className='text-base font-medium'>
            Membership Growth Trends
          </CardTitle>
          <p className='text-muted-foreground text-sm'>
            Track member growth and engagement over time
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <IconUsers className='text-muted-foreground h-5 w-5' />
          <IconTrendingUp className='text-muted-foreground h-5 w-5' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-[300px] w-full'>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
        <div className='mt-4 grid grid-cols-3 gap-4 text-sm'>
          <div className='flex items-center space-x-2'>
            <div className='h-2 w-2 rounded-full bg-green-500' />
            <span className='text-muted-foreground'>Total: </span>
            <span className='font-semibold'>
              {totalMembers.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='h-2 w-2 rounded-full bg-blue-500' />
            <span className='text-muted-foreground'>Active: </span>
            <span className='font-semibold'>
              {activeMemberships.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='h-2 w-2 rounded-full bg-amber-500' />
            <span className='text-muted-foreground'>New: </span>
            <span className='font-semibold'>
              {newMemberships.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
