<template>
  <div class="price-alert q-pa-md">
    <q-input
      v-model.number="alertPrice"
      type="number"
      label="Alert Price"
      dark
      dense
    />
    <q-btn
      @click="setAlert"
      color="primary"
      label="Set Alert"
      class="q-mt-sm"
    />
  </div>
</template>

<script>
export default {
  name: "PriceAlert",
  data() {
    return {
      alertPrice: null,
    };
  },
  methods: {
    setAlert() {
      if (this.alertPrice) {
        this.$emit("alert-set", this.alertPrice);
        this.$q.notify({
          message: `Alert set for $${this.alertPrice}`,
          color: "positive",
        });
      }
    },
  },
};
</script>
