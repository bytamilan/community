"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface CategoryData {
  categories: {
    name: string
    id: number
  }
}

interface CategoryDistributionProps {
  data: CategoryData[]
}

export function CategoryDistribution({ data }: CategoryDistributionProps) {
  // Process data for the chart
  const categoryMap = new Map<string, number>()

  data.forEach((item) => {
    const categoryName = item.categories.name
    categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1)
  })

  const chartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
  }))

  // Colors for the chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>Posts by category</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} posts`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No category data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
