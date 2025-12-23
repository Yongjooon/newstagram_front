import { defineStore } from "pinia";
import { ref } from "vue";

export const useHomePeriodStore = defineStore("homePeriod", () => {
  const period = ref("REALTIME"); // REALTIME | WEEKLY | WEEKLY

  const setPeriod = (value) => {
    period.value = value;
  };

  return { period, setPeriod };
});
