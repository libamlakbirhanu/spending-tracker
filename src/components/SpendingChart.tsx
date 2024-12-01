import React from "react";
import ReactApexChart from "react-apexcharts";
import { useCategories } from "../contexts/CategoryContext";

interface SpendingChartProps {
  expenses: { [key: string]: number };
}

const SpendingChart: React.FC<SpendingChartProps> = ({ expenses }) => {
  const { categories } = useCategories();

  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  const chartData = Object.entries(expenses).map(([category_id, amount]) => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return {
      category: categoryMap.get(category_id)?.name || "Other",
      amount,
      color: `rgb(${r}, ${g}, ${b})`,
    };
  });

  const options = {
    chart: {
      type: "pie" as const,
    },
    labels: chartData.map((item) => item.category),
    colors: chartData.map((item) => item.color),
    legend: {
      position: "bottom" as const,
      horizontalAlign: "center" as const,
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
