'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format, subDays, subWeeks, subMonths, startOfWeek, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { Calendar, Droplets, Heart, TrendingUp, BarChart3, LineChart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsChartProps {
  hydrationData: any[];
  meditationData: any[];
  type: 'hydration' | 'meditation';
  className?: string;
}

type TimePeriod = 'day' | 'week' | 'month';
type ChartType = 'line' | 'bar';

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  hydrationData, 
  meditationData, 
  type, 
  className = '' 
}) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('day');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [processedData, setProcessedData] = useState<any>(null);

  useEffect(() => {
    const rawData = type === 'hydration' ? hydrationData : meditationData;
    // Extract actual array from the data structure
    const data = extractDataArray(rawData, type);
    const processed = processDataForChart(data, timePeriod, type);
    setProcessedData(processed);
  }, [hydrationData, meditationData, timePeriod, type]);

  const extractDataArray = (rawData: any, dataType: 'hydration' | 'meditation') => {
    if (!rawData) return [];
    
    // Debug logging
    console.log(`${dataType} raw data:`, rawData);
    
    if (dataType === 'hydration') {
      // Hydration data comes wrapped in HydrationResponse with entries field
      const entries = rawData.entries || rawData || [];
      console.log(`${dataType} extracted entries:`, entries);
      return Array.isArray(entries) ? entries : [];
    } else {
      // Meditation data comes as direct array
      const sessions = Array.isArray(rawData) ? rawData : [];
      console.log(`${dataType} extracted sessions:`, sessions);
      return sessions;
    }
  };

  const processDataForChart = (data: any[], period: TimePeriod, dataType: 'hydration' | 'meditation') => {
    // Create empty data structure for when there's no data
    const createEmptyDataset = () => {
      const now = new Date();
      let emptyLabels: string[] = [];
      
      // Generate some labels for the empty state based on period
      switch (period) {
        case 'day':
          for (let i = 6; i >= 0; i--) {
            emptyLabels.push(format(subDays(now, i), 'MMM dd'));
          }
          break;
        case 'week':
          for (let i = 3; i >= 0; i--) {
            emptyLabels.push(format(subWeeks(now, i), 'MMM dd'));
          }
          break;
        case 'month':
          for (let i = 5; i >= 0; i--) {
            emptyLabels.push(format(subMonths(now, i), 'MMM yyyy'));
          }
          break;
      }
      
      return {
        labels: emptyLabels,
        datasets: [{
          label: dataType === 'hydration' ? 'Hydration (ml)' : 'Meditation (minutes)',
          data: new Array(emptyLabels.length).fill(0),
          borderColor: dataType === 'hydration' ? '#06b6d4' : '#8b5cf6',
          backgroundColor: dataType === 'hydration' ? 
            chartType === 'bar' ? 'rgba(6, 182, 212, 0.8)' : 'rgba(6, 182, 212, 0.1)' : 
            chartType === 'bar' ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          fill: chartType === 'line',
          tension: 0.4,
        }]
      };
    };

    if (!data || !Array.isArray(data) || data.length === 0) {
      return createEmptyDataset();
    }

    const now = new Date();
    let dateRange: Date[] = [];
    let groupedData: { [key: string]: number } = {};

    // Generate date range based on period
    switch (period) {
      case 'day':
        dateRange = eachDayOfInterval({
          start: subDays(now, 29), // Last 30 days
          end: now
        });
        break;
      case 'week':
        dateRange = eachWeekOfInterval({
          start: subWeeks(now, 11), // Last 12 weeks
          end: now
        });
        break;
      case 'month':
        dateRange = eachMonthOfInterval({
          start: subMonths(now, 11), // Last 12 months
          end: now
        });
        break;
    }

    // Initialize grouped data
    dateRange.forEach(date => {
      const key = period === 'day' ? format(date, 'yyyy-MM-dd') :
                  period === 'week' ? format(date, 'yyyy-MM-dd') :
                  format(date, 'yyyy-MM');
      groupedData[key] = 0;
    });

    // Process data based on type
    data.forEach(item => {
      const itemDate = new Date(item.timestamp || item.createdAt);
      let key: string;

      switch (period) {
        case 'day':
          key = format(itemDate, 'yyyy-MM-dd');
          break;
        case 'week':
          key = format(startOfWeek(itemDate), 'yyyy-MM-dd');
          break;
        case 'month':
          key = format(itemDate, 'yyyy-MM');
          break;
      }

      if (groupedData.hasOwnProperty(key)) {
        if (dataType === 'hydration') {
          groupedData[key] += item.amount || 0;
        } else {
          groupedData[key] += item.duration || 0;
        }
      }
    });

    // Convert to chart format
    const labels = Object.keys(groupedData).map(key => {
      const date = new Date(key);
      switch (period) {
        case 'day':
          return format(date, 'MMM dd');
        case 'week':
          return format(date, 'MMM dd');
        case 'month':
          return format(date, 'MMM yyyy');
        default:
          return key;
      }
    });

    const values = Object.values(groupedData);

    return {
      labels,
      datasets: [{
        label: dataType === 'hydration' ? 'Hydration (ml)' : 'Meditation (minutes)',
        data: values,
        borderColor: dataType === 'hydration' ? '#06b6d4' : '#8b5cf6',
        backgroundColor: dataType === 'hydration' ? 
          chartType === 'bar' ? '#06b6d4' : 'rgba(6, 182, 212, 0.1)' : 
          chartType === 'bar' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        fill: chartType === 'line',
        tension: 0.4,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${type === 'hydration' ? 'Hydration' : 'Meditation'} Analytics - ${timePeriod === 'day' ? 'Daily' : timePeriod === 'week' ? 'Weekly' : 'Monthly'} View`,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const unit = type === 'hydration' ? 'ml' : 'minutes';
            return `${label}: ${value} ${unit}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: type === 'hydration' ? 'Amount (ml)' : 'Duration (minutes)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time Period'
        }
      }
    },
  };

  if (!processedData) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {type === 'hydration' ? (
            <Droplets className="h-6 w-6 text-cyan-500" />
          ) : (
            <Heart className="h-6 w-6 text-purple-500" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {type === 'hydration' ? 'Hydration' : 'Meditation'} Analytics
          </h3>
        </div>
        <TrendingUp className="h-5 w-5 text-gray-400" />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Time Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Daily (30 days)</option>
            <option value="week">Weekly (12 weeks)</option>
            <option value="month">Monthly (12 months)</option>
          </select>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-2 text-sm flex items-center gap-2 ${
                chartType === 'line' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LineChart className="h-4 w-4" />
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-2 text-sm flex items-center gap-2 ${
                chartType === 'bar' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Bar
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {chartType === 'line' ? (
          <Line data={processedData} options={chartOptions} />
        ) : (
          <Bar data={processedData} options={chartOptions} />
        )}
      </div>

      {/* No Data Message */}
      {processedData.datasets[0].data.every((value: number) => value === 0) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-500 text-sm">
            No {type === 'hydration' ? 'hydration' : 'meditation'} data for this period yet.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Start logging your {type === 'hydration' ? 'water intake' : 'meditation sessions'} to see analytics!
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total This Period</p>
          <p className="text-2xl font-bold text-gray-900">
            {processedData.datasets[0].data.reduce((a: number, b: number) => a + b, 0)}
          </p>
          <p className="text-xs text-gray-500">
            {type === 'hydration' ? 'ml' : 'minutes'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Average Per {timePeriod}</p>
          <p className="text-2xl font-bold text-gray-900">
            {processedData.datasets[0].data.length > 0 ? 
              Math.round(processedData.datasets[0].data.reduce((a: number, b: number) => a + b, 0) / processedData.datasets[0].data.length) : 0}
          </p>
          <p className="text-xs text-gray-500">
            {type === 'hydration' ? 'ml' : 'minutes'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart; 