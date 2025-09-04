'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconTools, IconBuilding } from '@tabler/icons-react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const getColorForType = (type: string) => {
  const colors = {
    Cardio: '#ef4444',
    Strength: '#f59e0b',
    'Free Weights': '#10b981',
    Machines: '#3b82f6',
    Accessories: '#8b5cf6',
    Other: '#6b7280'
  };
  return colors[type as keyof typeof colors] || '#6b7280';
};

export function EquipmentDistributionChart() {
  const [data, setData] = useState<any>({
    equipmentDistribution: [],
    gymEquipmentData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'type' | 'gym'>('type');

  useEffect(() => {
    const fetchEquipmentData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          '/api/analytics/equipment-distribution'
        );
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch equipment distribution');
        console.error('Error fetching equipment distribution:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentData();
  }, []);

  const typeChartOptions: Highcharts.Options = {
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
        name: 'Equipment Type',
        type: 'pie',
        data:
          data.equipmentDistribution?.map((item: any) => ({
            name: item.name,
            y: item.value,
            color: getColorForType(item.type)
          })) || [],
        innerSize: '30%',
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.y}',
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
              <span><strong>${point.name}</strong>: ${point.y} units (${point.percentage?.toFixed(1) || 0}%)</span>
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

  const gymChartOptions: Highcharts.Options = {
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
      categories: data.gymEquipmentData?.map((gym: any) => gym.name) || [],
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
        text: 'Equipment Count',
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
        name: 'Equipment',
        type: 'column',
        data: data.gymEquipmentData?.map((gym: any) => gym.equipment) || [],
        color: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1
          },
          stops: [
            [0, '#8b5cf6'],
            [1, '#7c3aed']
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
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${this.x}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: #8b5cf6; border-radius: 2px;"></div>
              <span>Equipment: <strong>${this.y?.toLocaleString()}</strong></span>
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
      column: {
        dataLabels: {
          enabled: false
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
          <CardTitle>Equipment Distribution</CardTitle>
        </CardHeader>
        <CardContent className='flex items-center justify-center py-8'>
          <p className='text-muted-foreground'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  const totalEquipment =
    data.equipmentDistribution?.reduce(
      (sum: number, item: any) => sum + item.value,
      0
    ) || 0;
  const totalGyms = data.gymEquipmentData?.length || 0;

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div>
          <CardTitle className='text-base font-medium'>
            Equipment Distribution
          </CardTitle>
          <p className='text-muted-foreground text-sm'>
            Equipment types and gym-wise distribution
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <IconTools className='text-muted-foreground h-5 w-5' />
          <IconBuilding className='text-muted-foreground h-5 w-5' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='mb-4 flex space-x-2'>
          <button
            onClick={() => setActiveTab('type')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'type'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            By Type
          </button>
          <button
            onClick={() => setActiveTab('gym')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'gym'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            By Gym
          </button>
        </div>

        <div className='h-[300px] w-full'>
          <HighchartsReact
            highcharts={Highcharts}
            options={activeTab === 'type' ? typeChartOptions : gymChartOptions}
          />
        </div>

        <div className='mt-4 grid grid-cols-2 gap-4 text-sm'>
          <div className='flex items-center space-x-2'>
            <div className='h-2 w-2 rounded-full bg-purple-500' />
            <span className='text-muted-foreground'>Total Equipment: </span>
            <span className='font-semibold'>
              {totalEquipment.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='h-2 w-2 rounded-full bg-indigo-500' />
            <span className='text-muted-foreground'>Gyms: </span>
            <span className='font-semibold'>{totalGyms.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
