<template>
  <div class="content-item">
    <div class="title">{{ title }}</div>
    <div :class="`m-chart-instance-${_uid}`" style="height: 200px"></div>
  </div>
</template>
<script>
//1. Import the previously created option.js

import { getAnnulusOption } from "./options.js";

//2. Import echarts chart plugin

import echarts from "echarts";

export default {
  name: "",
  props: {
    value: {
      type: Number,
      validate: (value) => {
        if (!/\d/.test(String(value))) throw new Error("Invalid format");
      },
    },
    title: String,
    label: String,
  },
  data() {
    return {
      chartsDom: null,
    };
  },
  mounted() {
    //Initialize DOM
    let _this = this,
      el = document.querySelector(`.m-chart-instance-${_this._uid}`);
    //Set DOM width and height
    el.style.width = el.parentNode.parentNode.clientWidth + "px";
    el.style.height = el.parentNode.parentNode.clientHeight + "px";
    this.chartsDom = echarts.init(el);
  },
  methods: {
    /**
     * @param {String} id  Get HTML div element ID
     * @param {Number} dividend  Value 1 (number of successes)
     * @param {Number} divisor   Value 2 (total number)
     */
    renderChart(chartInstance, dividend, divisor) {
      if (!chartInstance) return;
      const data = [dividend, divisor - dividend];
      const colors = ["#4b7efe", "#beddff"];
      const percentage = divisor === 0 ? 0 : (dividend / divisor) * 100;
      const text = this.formatValue(percentage, 0) + "%";
      const subText = this.label;
      const textFontSize = 20;
      const subTextFontSize = 0;
      const option = getAnnulusOption(
        data,
        colors,
        text,
        subText,
        textFontSize,
        subTextFontSize
      );
      const charts = chartInstance;
      charts.setOption(option);
    },

    /**
     * @param {number or string} value The value
     * @param {Number} digits Number of decimal places to keep
     * @param {bool} returnStr Return value as string (if keeping decimal places then returns a string)
     */
    formatValue(value, digits, returnStr = false) {
      if (digits < 0) {
        console.log("Number of decimal places cannot be negative");
        value = 0;
      }
      if (!value) {
        value = 0;
      }
      if (returnStr) {
        return parseFloat(value).toFixed(digits);
      }
      return parseFloat(parseFloat(value).toFixed(digits));
    },
  },
  watch: {
    value: function (newVal, oldVal) {
      if (newVal !== oldVal) this.renderChart(this.chartsDom, newVal, 100);
    },
  },
};
</script>

<style scoped lang="less">
.title {
  padding: 20px 0px 0px;
  text-align: center;
}
</style>
