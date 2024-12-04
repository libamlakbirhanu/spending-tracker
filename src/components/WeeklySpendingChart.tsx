import React from "react";
import ReactApexChart from "react-apexcharts";

interface WeeklySpendingChartProps {
  weeklyExpenses: { date: string; amount: number }[];
}

const WeeklySpendingChart: React.FC<WeeklySpendingChartProps> = ({ weeklyExpenses }) => {
  const options = {
    chart: {
      type: "area" as const,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
      width: 2,
    },
    xaxis: {
      type: "datetime" as const,
      categories: weeklyExpenses.map(day => day.date),
      labels: {
        formatter: function(value: string) {
          return new Date(value).toLocaleDateString('en-US', { weekday: 'short' });
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(value: number) {
          return `$${value.toFixed(2)}`;
        }
      }
    },
    tooltip: {
      x: {
        format: "dd MMM",
      },
    },
    colors: ["#3B82F6"], // Blue color to match the UI
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100]
      }
    }
  };

  const series = [
    {
      name: "Daily Spending",
      data: weeklyExpenses.map(day => day.amount)
    }
  ];

  return (
    <div>
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={350}
      />
    </div>
  );
};

export default WeeklySpendingChart;
