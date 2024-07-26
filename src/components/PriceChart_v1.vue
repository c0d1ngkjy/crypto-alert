<template>
  <div class="chart-container">
    <LineChart :data="chartData" :options="chartOptions" :key="chartKey" />
  </div>
</template>

<script>
import { Line as LineChart } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default {
  name: "PriceChart",
  components: { LineChart },
  props: ["prices", "timeframe"],
  data() {
    return {
      chartKey: 0,
      chartData: {
        labels: [],
        datasets: [
          {
            label: "BTCUSDT Price",
            backgroundColor: "#4CAF50",
            borderColor: "#4CAF50",
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0,
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day",
              displayFormats: {
                minute: "HH:mm",
                hour: "dd MMM HH:mm",
                day: "dd MMM",
                week: "dd MMM",
                month: "MMM yyyy", // Changed from 'MMM YYYY' to 'MMM yyyy'
              },
            },
            ticks: {
              color: "#ffffff",
              maxTicksLimit: 12,
            },
          },
          y: {
            beginAtZero: false,
            ticks: { color: "#ffffff" },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "#ffffff",
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        elements: {
          line: {
            tension: 0.1,
          },
        },
      },
    };
  },
  watch: {
    timeframe: {
      handler(newTimeframe) {
        this.updateChartOptions(newTimeframe);
      },
      immediate: true,
    },
    prices: {
      handler(newPrices) {
        console.log("Prices updated in PriceChart:", newPrices.length);
        this.updateChart(newPrices);
      },
      deep: true,
    },
    // ... existing watches
  },
  methods: {
    updateChartOptions(timeframe) {
      let unit, maxTicksLimit;
      switch (timeframe) {
        case "15m":
          unit = "hour";
          maxTicksLimit = 24;
          break;
        case "1h":
          unit = "day";
          maxTicksLimit = 30;
          break;
        case "4h":
          unit = "day";
          maxTicksLimit = 30;
          break;
        case "1d":
        default:
          unit = "month";
          maxTicksLimit = 12;
      }

      this.chartOptions.scales.x.time.unit = unit;
      this.chartOptions.scales.x.ticks.maxTicksLimit = maxTicksLimit;

      // Update tooltip date format based on timeframe
      let tooltipFormat;
      switch (timeframe) {
        case "15m":
          tooltipFormat = "dd MMM yyyy HH:mm";
          break;
        case "1h":
        case "4h":
          tooltipFormat = "dd MMM yyyy HH:mm";
          break;
        case "1d":
        default:
          tooltipFormat = "dd MMM yyyy";
      }
      this.chartOptions.plugins.tooltip.callbacks = {
        label: function (context) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(context.parsed.y);
          }
          return label;
        },
        title: function (tooltipItems) {
          return new Date(tooltipItems[0].parsed.x).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }
          );
        },
      };

      this.chartKey += 1; // Force chart re-render
    },
    updateChart(prices) {
      console.log("Updating chart with prices:", prices.length);
      this.chartData = {
        labels: prices.map((price) => new Date(price.timestamp)), // Change this line
        datasets: [
          {
            label: "BTCUSDT Price",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            borderColor: "#4CAF50",
            data: prices.map((price) => ({
              x: new Date(price.timestamp),
              y: price.value,
            })), // Change this line
            fill: true,
            pointRadius: 0,
          },
        ],
      };
      this.chartKey += 1;
    },
  },
  mounted() {
    console.log("Initial prices:", this.prices);
  },
};
</script>
<style scoped>
.chart-container {
  height: 600px; /* Increase this value to make the chart taller */
  width: 100%;
}
</style>
