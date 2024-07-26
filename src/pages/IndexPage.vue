<template>
  <q-page class="flex flex-center">
    <div class="row full-width q-pa-md">
      <div class="col-12 q-mb-md">
        <q-btn-group spread>
          <q-btn
            label="15m"
            @click="changeTimeframe('15m')"
            :color="selectedTimeframe === '15m' ? 'primary' : 'grey'"
          />
          <q-btn
            label="1h"
            @click="changeTimeframe('1h')"
            :color="selectedTimeframe === '1h' ? 'primary' : 'grey'"
          />
          <q-btn
            label="4h"
            @click="changeTimeframe('4h')"
            :color="selectedTimeframe === '4h' ? 'primary' : 'grey'"
          />
          <q-btn
            label="1d"
            @click="changeTimeframe('1d')"
            :color="selectedTimeframe === '1d' ? 'primary' : 'grey'"
          />
        </q-btn-group>
      </div>
      <div class="col-12 col-md-8">
        <PriceChart
          :prices="prices"
          :timeframe="selectedTimeframe"
          :key="selectedTimeframe"
        />
      </div>
      <div class="col-12 col-md-4">
        <PriceAlert @alert-set="setAlert" />
        <PositionInput @position-added="addPosition" />
        <q-list dark bordered class="rounded-borders q-mt-md">
          <q-item v-for="(position, index) in positions" :key="index">
            <q-item-section>
              <q-item-label>Amount: {{ position.amount }}</q-item-label>
              <q-item-label caption
                >Entry Price: ${{ position.entryPrice }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import PriceAlert from "src/components/PriceAlert.vue";
import PriceChart from "src/components/PriceChart_v1.vue";
import PositionInput from "src/components/PositionInput.vue";
import axios from "axios";
import { db } from "src/boot/firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

export default defineComponent({
  name: "IndexPage",
  components: {
    PriceChart,
    PriceAlert,
    PositionInput,
  },
  data() {
    return {
      prices: [],
      positions: [],
      alertPrice: null,
      selectedTimeframe: "1d",
    };
  },
  mounted() {
    this.fetchHistoricalPrices().then(() => {
      this.fetchPrices();
    });
    this.listenToPositions();
  },
  methods: {
    async changeTimeframe(timeframe) {
      this.selectedTimeframe = timeframe;
      await this.fetchHistoricalPrices();
    },

    async fetchHistoricalPrices() {
      try {
        const endTime = Date.now();
        let startTime, interval;

        switch (this.selectedTimeframe) {
          case "15m":
            startTime = endTime - 7 * 24 * 60 * 60 * 1000; // 1 week ago
            interval = "15m";
            break;
          case "1h":
            startTime = endTime - 30 * 24 * 60 * 60 * 1000; // 1 month ago
            interval = "1h";
            break;
          case "4h":
            startTime = endTime - 120 * 24 * 60 * 60 * 1000; // 4 months ago
            interval = "4h";
            break;
          case "1d":
          default:
            startTime = endTime - 365 * 24 * 60 * 60 * 1000; // 1 year ago
            interval = "1d";
        }

        const response = await axios.get(
          "https://api.binance.com/api/v3/klines",
          {
            params: {
              symbol: "BTCUSDT",
              interval: interval,
              startTime: startTime,
              endTime: endTime,
            },
          }
        );

        this.prices = response.data.map((item) => ({
          timestamp: item[0],
          value: parseFloat(item[4]), // Closing price
        }));

        console.log(
          `Historical prices loaded for ${this.selectedTimeframe}:`,
          this.prices.length
        );
      } catch (error) {
        console.error("Error fetching historical prices:", error);
      }
    },
    async fetchPrices() {
      try {
        const response = await axios.get(
          "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
        );
        const price = parseFloat(response.data.price);
        const newPrice = { timestamp: Date.now(), value: price };

        this.prices.push(newPrice);

        // Keep only the last year of data
        const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
        this.prices = this.prices.filter(
          (price) => price.timestamp >= oneYearAgo
        );

        this.checkAlert(price);
        setTimeout(this.fetchPrices, 5000);
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    },
    setAlert(price) {
      this.alertPrice = price;
    },
    checkAlert(currentPrice) {
      if (this.alertPrice && currentPrice >= this.alertPrice) {
        this.$q.notify({
          message: `Alert: Price has reached $${currentPrice}`,
          color: "warning",
          position: "top",
        });
        this.alertPrice = null;
      }
    },
    async addPosition(position) {
      try {
        await addDoc(collection(db, "positions"), position);
      } catch (error) {
        console.error("Error adding position:", error);
      }
    },
    listenToPositions() {
      onSnapshot(collection(db, "positions"), (snapshot) => {
        this.positions = snapshot.docs.map((doc) => doc.data());
      });
    },
  },
});
</script>
