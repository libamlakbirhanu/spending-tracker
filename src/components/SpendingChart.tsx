import React from "react";
import ReactApexChart from "react-apexcharts";
import { useCategories } from "../contexts/CategoryContext";

interface SpendingChartProps {
  expenses: { [key: string]: number };
}

const SpendingChart: React.FC<SpendingChartProps> = ({ expenses }) => {
  const { categories } = useCategories();

  console.log("SpendingChart - Categories:", categories);
  console.log("SpendingChart - Expenses:", expenses);

  // Filter out categories with 0 amount
  const nonZeroExpenses = Object.entries(expenses).filter(
    ([_, amount]) => amount > 0
  );

  // If no expenses, show a message
  if (nonZeroExpenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-gray-500">
        No spending data available
      </div>
    );
  }

  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  const chartData = nonZeroExpenses.map(([category_id, amount]) => {
    const category = categoryMap.get(category_id);
    return {
      category: category?.name || "Other",
      amount,
      // Use category color if available, otherwise generate a random one
      color: category?.color || `hsl(${Math.random() * 360}, 70%, 50%)`,
    };
  });

  console.log("SpendingChart - Processed data:", chartData);

  const options = {
    chart: {
      type: "pie" as const,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    labels: chartData.map((item) => item.category),
    colors: chartData.map((item) => item.color),
    legend: {
      position: "bottom" as const,
      horizontalAlign: "center" as const,
      floating: false,
      fontSize: "14px",
      offsetY: 7,
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        return `$${opts.w.config.series[opts.seriesIndex].toFixed(2)}`;
      },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return `$${val.toFixed(2)}`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom" as const,
          },
        },
      },
    ],
  };

  const series = chartData.map((item) => item.amount);

  return (
    <div>
      <ReactApexChart
        options={options}
        series={series}
        type="pie"
        height={350}
      />
    </div>
  );
};

export default SpendingChart;
