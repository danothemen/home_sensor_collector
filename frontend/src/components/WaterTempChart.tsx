import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import { Stack, Typography } from "@mui/material";

const WaterTempChart: React.FC = () => {
  const [chartOptions, setChartOptions] = useState<Highcharts.Options | null>(
    null
  );
  const [mostRecentDataPoint, setMostRecentDataPoint] = useState<any | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://192.168.0.108:3001/api/sensor-data"
        );
        const data = response.data.data;

        setMostRecentDataPoint(data?.[data.length - 1] ?? null);

        const chartData = data.map((d: any) => [
          new Date(d.reported_timestamp).getTime(),
          d.water_temperature,
        ]);

        const relayOnData = data.map((d: any) => [
          new Date(d.reported_timestamp).getTime(),
          d.relay_on ? 1 : 0,
        ]);

        setChartOptions({
          title: {
            text: "Water Temperature and Relay Status (Last 24 Hours)",
          },
          xAxis: {
            labels: {
              formatter: (ctx) => {
                console.log("CTX", ctx);
                return new Date(ctx.pos).toLocaleTimeString("en-us", {
                  timeStyle: "short",
                });
              },
            },
            type: "datetime",
          },
          yAxis: [
            {
              title: {
                text: "Water Temperature",
              },
            },
            {
              title: {
                text: "Relay Status",
              },
              opposite: true,
              min: 0,
              max: 1,
              tickInterval: 1,
            },
          ],
          series: [
            {
              name: "Water Temperature",
              type: "line",
              data: chartData,
              yAxis: 0,
            },
            {
              name: "Relay On",
              type: "area",
              step: "left",
              data: relayOnData,
              yAxis: 1,
              color: "#ff9b8277",
            },
          ],
          tooltip: {
            xDateFormat: "%A, %b %e, %H:%M:%S", // Format for the x-axis (time)
          },
        });
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };
    setInterval(fetchData, 60000);
    fetchData();
    Highcharts.setOptions({
      time: {
        timezone: undefined,
      },
    });
  }, []);

  return (
    <Stack sx={{ px: 1 }}>
      <Stack
        direction={"row"}
        gap={1}
        justifyContent={"space-evenly"}
        sx={{
          borderBottomStyle: "solid",
          borderBottomColor: "grey",
          borderBottomWidth: "1px",
        }}
      >
        <Typography>
          Reported At:{" "}
          {mostRecentDataPoint?.reported_timestamp
            ? new Date(
                mostRecentDataPoint.reported_timestamp
              ).toLocaleTimeString()
            : null}
        </Typography>
        <Typography>
          Temp: {mostRecentDataPoint?.water_temperature ?? null}°F
        </Typography>
        <Typography>
          Heater: {mostRecentDataPoint?.relay_on ? "On" : "Off"}
        </Typography>
        <Typography>
          Overridden: {mostRecentDataPoint?.override_active ? "True" : "False"}
        </Typography>
      </Stack>
      {chartOptions ? (
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      ) : (
        <Typography>Loading chart...</Typography>
      )}
    </Stack>
  );
};

export default WaterTempChart;
