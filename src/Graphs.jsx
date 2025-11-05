// GraphsPage.jsx
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

function GraphsPage() {
  const [graphData, setGraphData] = useState([]);
  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const fetchGraphData = async () => {
      const today = new Date();
      const allWeeks = [];

      for (let i = 0; i < 4; i++) {
        const endDate = new Date(today);
        endDate.setDate(today.getDate() - i * 7);
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6);

        const start = startDate.toISOString().split("T")[0];
        const end = endDate.toISOString().split("T")[0];

        const response = await fetch(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${apiKey}`
        );
        const result = await response.json();
        const neos = Object.values(result.near_earth_objects || {}).flat();

        const hazardousCount = neos.filter(n => n.is_potentially_hazardous_asteroid).length;
        const avgMissDistance =
          neos.length > 0
            ? neos
                .map(n => parseFloat(n.close_approach_data[0]?.miss_distance.kilometers))
                .filter(v => !isNaN(v))
                .reduce((a, b) => a + b, 0) / neos.length
            : 0;

        allWeeks.push({
          week: `${start} → ${end}`,
          total: neos.length,
          hazardous: hazardousCount,
          avgMissDistance: avgMissDistance.toFixed(0),
        });
      }

      setGraphData(allWeeks.reverse());
    };

    fetchGraphData();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>NEO Graphs</h1>
      <p>Visual trends of Near-Earth Objects</p>

      {/* Graph 1: Total vs Hazardous */}
      <h2>Total & Hazardous NEOs per Week</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={graphData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#8884d8" name="Total NEOs" />
          <Bar dataKey="hazardous" fill="#ff4444" name="Hazardous" />
        </BarChart>
      </ResponsiveContainer>

      {/* Graph 2: Average Miss Distance */}
      <h2 style={{ marginTop: "2rem" }}>Average Miss Distance per Week (km)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={graphData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avgMissDistance" stroke="#82ca9d" name="Avg Miss Distance" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GraphsPage;
