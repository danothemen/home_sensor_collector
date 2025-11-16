import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WaterTempChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/sensor-data"
        );
        const data = response.data.data;

        const chartLabels = data.map((d: any) =>
          new Date(d.reported_timestamp).toLocaleTimeString()
        );
        const chartValues = data.map((d: any) => d.water_temperature);

        setChartData({
          labels: chartLabels,
          datasets: [
            {
              label: "Water Temperature",
              data: chartValues,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        });
        console.log("Fetched data");
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };
    setInterval(fetchData, 60000);
  }, []);
  console.log("Temp Chart");
  return (
    <div>
      <h2>Water Temperature (Last 24 Hours)</h2>
      {chartData ? <Line data={chartData} /> : <p>Loading chart...</p>}
    </div>
  );
};

export default WaterTempChart;
