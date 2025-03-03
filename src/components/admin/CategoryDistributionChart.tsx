// src/components/admin/CategoryDistributionChart.tsx
"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Category {
  categoryId: string;
  categoryName: string;
  applianceCount: number;
}

interface CategoryDistributionChartProps {
  categories: Category[];
}

export default function CategoryDistributionChart({
  categories,
}: CategoryDistributionChartProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No category data available</p>
      </div>
    );
  }

  // Prepare data for chart
  const data = categories.map((category) => ({
    name: category.categoryName,
    value: category.applianceCount,
  }));

  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* Pie Chart Section with fixed height */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} Appliances`, "Count"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend with padding */}
      <div className="mt-6 mb-4 flex flex-wrap justify-center gap-4">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-4 h-4 mr-2 flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm">
              {entry.name} ({entry.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
