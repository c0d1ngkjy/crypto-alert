<template>
  <div class="position-input q-pa-md">
    <q-input v-model.number="amount" type="number" label="Amount" dark dense />
    <q-input
      v-model.number="entryPrice"
      type="number"
      label="Entry Price"
      dark
      dense
      class="q-mt-sm"
    />
    <q-btn
      @click="addPosition"
      color="primary"
      label="Add Position"
      class="q-mt-sm"
    />
  </div>
</template>

<script>
export default {
  name: "PositionInput",
  data() {
    return {
      amount: null,
      entryPrice: null,
    };
  },
  methods: {
    addPosition() {
      if (this.amount && this.entryPrice) {
        this.$emit("position-added", {
          amount: this.amount,
          entryPrice: this.entryPrice,
        });
        this.amount = null;
        this.entryPrice = null;
        this.$q.notify({
          message: "Position added",
          color: "positive",
        });
      }
    },
  },
};
</script>
