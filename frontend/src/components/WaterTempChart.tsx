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
  const [mostRecentDataPoint, setMostRecentDataPoint] = useState<any | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "/api/sensor-data"
        );
        const data = response.data.data;

        setMostRecentDataPoint(data?.[data.length -1 ] ?? null)

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
    fetchData();
  }, []);
  console.log("Temp Chart");
  return (
    <div>
      <h2>Water Temperature (Last 24 Hours)</h2>
      <div>Current: {mostRecentDataPoint?.water_temperature ?? null}°F</div>
      <div>Reported At: {mostRecentDataPoint?.reported_timestamp ? new Date(mostRecentDataPoint.reported_timestamp).toLocaleTimeString() : null}</div>
      {chartData ? <Line data={chartData} /> : <p>Loading chart...</p>}
    </div>
  );
};

export default WaterTempChart;
