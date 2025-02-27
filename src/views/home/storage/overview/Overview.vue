<template>
  <div class="overview chart-content">
    <div class="overview-select">
      <m-select @on-change="handleIntervalChange" v-model="timeframe">
        <m-option v-for="item of intervalList" :key="item.value" :label="item.label" :value="item.value">
        </m-option>
      </m-select>
    </div>
    <overview-card style="width: calc(100%)">
      <div slot="title">Status</div>
      <div slot="content" class="card-content">
        <div class="card-item">
          <single-line :desc="db.storageObj &&
            db.storageObj.enabled &&
            db.storageObj.enabled === 1
            ? 'Yes'
            : 'No'
            " />
          <single-line title="Active" :desc="db.storageObj &&
            db.storageObj.active &&
            db.storageObj.active === 1
            ? 'Yes'
            : 'No'
            " />
          <single-line title="Content" :desc="db.storageObj && db.storageObj.content && db.storageObj.content
            " />
          <single-line title="Category" :desc="db.storageObj &&
            db.storageObj.type &&
            $t(`storage.${db.storageObj.type}`)
            " />
          <line-percent-chart :desc="`${Number(
            (db.storageObj && db.storageObj.total && db.storageObj.used
              ? db.storageObj.used / db.storageObj.total
              : 0) * 100
          ).toFixed(2)}%
                                (${(db.storageObj &&
              db.storageObj.used &&
              byteToSize(db.storageObj.used)) ||
            0
            } of ${(db.storageObj &&
              db.storageObj.total &&
              byteToSize(db.storageObj.total)) ||
            0
            })`" :value="Number(
              (db.storageObj && db.storageObj.total && db.storageObj.used
                ? db.storageObj.used / db.storageObj.total
                : 0) * 100
            )
              " title="Usage" />
        </div>
      </div>
    </overview-card>
    <overview-card style="width: calc(100%)">
      <div slot="title">Usage</div>
      <template slot="content">
        <line-graph :param="usedRate" v-loading="loading"></line-graph>
      </template>
    </overview-card>
  </div>
</template>

<script>
import LinePercentChart from "@src/components/chart/line/LinePercentChart";
import StorageOverviewHttp from "@src/views/home/storage/overview/http";
import SingleLine from "@src/components/chart/line/SingleLine";
import OverviewCard from "@src/components/card/OverviewCard";
import { render_uptime, byteToSize } from "@libs/utils";
export default {
  name: "StorageOverview",
  mixins: [StorageOverviewHttp],
  components: {
    SingleLine,
    OverviewCard,
    LinePercentChart,
  },
  data() {
    return {
      baseInfo: {},
      storage: {},
      interval: null,
      timeframe: "hour(AVERAGE)",
      loading: false,
      intervalList: [
        {
          label: "Hour (Average)",
          value: "hour(AVERAGE)",
        },
        {
          label: "Hour (Maximum)",
          value: "hour(MAX)",
        },
        {
          label: "Day (Average)",
          value: "day(AVERAGE)",
        },
        {
          label: "Day (Maximum)",
          value: "day(MAX)",
        },
        {
          label: "Week (Average)",
          value: "week(AVERAGE)",
        },
        {
          label: "Week (Maximum)",
          value: "week(MAX)",
        },
        {
          label: "Month (Average)",
          value: "month(AVERAGE)",
        },
        {
          label: "Month (Maximum)",
          value: "month(MAX)",
        },
        {
          label: "Year (Average)",
          value: "year(AVERAGE)",
        },
        {
          label: "Year (Maximum)",
          value: "year(MAX)",
        },
      ],
      colors: [
        {
          line: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(148, 174, 10, 1)",
              },
              {
                offset: 1,
                color: "rgba(148, 174, 10, 0.1)",
              },
            ],
            globalCord: false,
          },
          start: "rgba(148, 174, 10, 0.1)",
          end: "rgba(148, 174, 10, 1)",
        },
        {
          line: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(18, 94, 166, 1)",
              },
              {
                offset: 1,
                color: "rgba(18, 94, 166, 0.1)",
              },
            ],
            globalCord: false,
          },
          start: "rgba(18, 94, 166, 0.1)",
          end: "rgba(18, 94, 166, 1)",
        },
      ],
      usedRate: {
        value: [],
        label: ["Total Size", "Used Size"],
      },
    };
  },
  methods: {
    render_uptime,
    byteToSize,
    __init__() {
      let last = window.localStorage.getItem("lastsel") || "[]";
      this.storage = (JSON.parse(last) && JSON.parse(last)) || "";
      this.queryStatus();
      this.queryRrdData(this.timeframe);
    },
    handleIntervalChange(value) {
      if (/[\u4e00-\u9fa5]/.test(value)) return;
      this.timeframe = value;
      this.queryRrdData();
    },
  },
  mounted() {
    this.__init__();
    this.interval = setInterval(() => this.__init__(), 60 * 1000);
  },
  /***
   * Clear timer task before route change
   */
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = null;
  },
  watch: {
    "$store.state.db.lastSelectObj": function (newVal, oldVal) {
      if (newVal !== oldVal && newVal.type === "storage") {
        this.__init__();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.overview {
  &-select {
    margin: 5px 10px;
    position: relative;
    background-color: #fff;
    text-align: right;
  }
}
</style>
