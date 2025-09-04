'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBuilding, IconUsers, IconTools } from '@tabler/icons-react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

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

  const overviewChartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    },
    title: {
      text: undefined
    },
    xAxis: {
      categories: data.chartData?.map((gym: any) => gym.name) || [],
      gridLineColor: '#e5e7eb',
      lineColor: '#e5e7eb',
      tickColor: '#e5e7eb',
      labels: {
        style: {
          color: '#6b7280',
          fontSize: '12px'
        },
        rotation: -45
      }
    },
    yAxis: {
      title: {
        text: 'Count',
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
        name: 'Members',
        type: 'column',
        data: data.chartData?.map((gym: any) => gym.members) || [],
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
        borderRadius: 4,
        borderWidth: 0
      },
      {
        name: 'Equipment',
        type: 'column',
        data: data.chartData?.map((gym: any) => gym.equipment) || [],
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
        borderRadius: 4,
        borderWidth: 0
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
      column: {
        dataLabels: {
          enabled: false
        }
      }
    }
  };

  const distributionChartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    },
    title: {
      text: undefined
    },
    series: [
      {
        name: 'Gym Status',
        type: 'pie',
        data: data.pieData || [],
        innerSize: '40%',
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.percentage:.1f}%',
          style: {
            color: '#374151',
            fontSize: '12px',
            fontWeight: '500'
          }
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
        return `
          <div style="padding: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: ${point.color}; border-radius: 50%;"></div>
              <span><strong>${point.name}</strong>: ${point.y} gyms (${point.percentage?.toFixed(1) || 0}%)</span>
            </div>
          </div>
        `;
      }
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        showInLegend: false
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
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'distribution'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            Status Distribution
          </button>
        </div>

        <div className='h-[300px] w-full'>
          <HighchartsReact
            highcharts={Highcharts}
            options={
              activeTab === 'overview'
                ? overviewChartOptions
                : distributionChartOptions
            }
          />
        </div>

        <div className='mt-4 grid grid-cols-3 gap-4 text-sm'>
          <div className='flex items-center space-x-2'>
            <div className='h-2 w-2 rounded-full bg-blue-500' />
            <span className='text-muted-foreground'>Total Members: </span>
            <span className='font-semibold'>
              {totalMembers.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='h-2 w-2 rounded-full bg-green-500' />
            <span className='text-muted-foreground'>Total Equipment: </span>
            <span className='font-semibold'>
              {totalEquipment.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='h-2 w-2 rounded-full bg-emerald-500' />
            <span className='text-muted-foreground'>Active Gyms: </span>
            <span className='font-semibold'>{activeGyms.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
