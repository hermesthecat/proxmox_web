<template>
  <div class="overview chart-content">
    <div class="overview-select">
      <m-select @on-change="handleIntervalChange" v-model="timeframe">
        <m-option
          v-for="item of intervalList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </m-option>
      </m-select>
    </div>
    <div class="overview-content__top">
      <div
        class="overview-content__top_left"
        :style="{
          'padding-right': isTempalte ? '0px' : '20px',
          'margin-bottom': isTempalte ? '0px' : '20px',
        }"
      >
        <overview-card>
          <div slot="title">Status</div>
          <div
            slot="content"
            class="card-content"
            v-loading="loading"
            :element-loading-text="loadingText"
          >
            <div class="card-item">
              <single-line
                title="Status"
                icon="fa fa-info"
                :desc="db.qemuObj && db.qemuObj.status && db.qemuObj.status"
              />
              <single-line
                icon="fa fa-heartbeat"
                title="HA Status"
                :desc="
                  db.qemuObj && db.qemuObj.ha && db.qemuObj.ha.status
                    ? db.qemuObj.ha.status
                    : 'None'
                "
              />
              <single-line
                icon="fa fa-building"
                title="Node"
                :desc="node && node.parent && node.parent"
              />
              <line-percent-chart
                name="icon-ram"
                :desc="`${Number(
                  (db.qemuObj.cpu && db.qemuObj.cpu && db.qemuObj.cpus
                    ? db.qemuObj.cpu / db.qemuObj.cpus
                    : 0) * 100
                ).toFixed(1)}%
                               of ${
                                 (db.qemuObj.cpus && db.qemuObj.cpus) || 0
                               } CPU(s)`"
                :value="
                  (db.qemuObj.cpu && db.qemuObj.cpu && db.qemuObj.cpus
                    ? db.qemuObj.cpu / db.qemuObj.cpus
                    : 0) * 100
                "
                title="CPU Usage"
              />
              <line-percent-chart
                name="icon-ram"
                :desc="`${Number(
                  (db.qemuObj.mem && db.qemuObj.mem && db.qemuObj.maxmem
                    ? db.qemuObj.mem / db.qemuObj.maxmem
                    : 0) * 100
                ).toFixed(1)}%
                              (${byteToSize(
                                (db.qemuObj.mem && db.qemuObj.mem) || 0
                              )} of ${byteToSize(
                  (db.qemuObj.maxmem && db.qemuObj.maxmem) || 0
                )})`"
                :value="
                  (db.qemuObj.mem && db.qemuObj.mem && db.qemuObj.maxmem
                    ? db.qemuObj.mem / db.qemuObj.maxmem
                    : 0) * 100
                "
                title="Memory Usage"
              />
              <single-line
                icon="fa fa-hdd-o"
                title="Node"
                :desc="
                  db.qemuObj &&
                  db.qemuObj.maxdisk &&
                  byteToSize(db.qemuObj.maxdisk)
                "
              />
              <single-line
                icon="fa fa-exchange"
                title="IPs"
                :desc="'Guest Agent'"
              />
            </div>
          </div>
        </overview-card>
        <overview-card>
          <div slot="title">Notes</div>
          <div
            slot="operate"
            class="m-tool-img"
            @click.stop="handleComment"
          ></div>
          <div slot="content" class="card-content" ref="comment-content">
            <ace-editor
              v-model="comment"
              :read-only="true"
              style="width: 100%; height: 250px"
              ref="ace-comment"
            ></ace-editor>
          </div>
        </overview-card>
      </div>
      <div class="overview-content__top_right" v-if="!isTempalte">
        <overview-card>
          <div slot="title">CPU Usage</div>
          <template slot="content">
            <line-graph :param="cpu" v-loading="rrdLoading"></line-graph>
          </template>
        </overview-card>
      </div>
    </div>
    <div class="overview-content__center" v-if="!isTempalte">
      <div class="overview-content__center_left">
        <overview-card>
          <div slot="title">Memory Usage</div>
          <template slot="content">
            <line-graph :param="memory" v-loading="rrdLoading"></line-graph>
          </template>
        </overview-card>
      </div>
      <div class="overview-content__center_right">
        <overview-card>
          <div slot="title">Network Traffic</div>
          <template slot="content">
            <line-graph :param="network" v-loading="rrdLoading"></line-graph>
          </template>
        </overview-card>
      </div>
    </div>
    <overview-card v-if="!isTempalte">
      <div slot="title">Disk I/O</div>
      <template slot="content">
        <line-graph :param="disk" v-loading="rrdLoading"></line-graph>
      </template>
    </overview-card>
    <Dialog
      :visible="showComment"
      @close="showComment = false"
      @confirm="confirm"
      @cancel="cancel"
      cancelText="Reset"
      :_style="{
        width: '800px',
      }"
      title="Notes"
    >
      <div slot="content" ref="content">
        <ace-editor v-model="comment" ref="ace-editor"></ace-editor>
      </div>
    </Dialog>
  </div>
</template>

<script>
import LinePercentChart from "@src/components/chart/line/LinePercentChart";
import QemuOverviewHttp from "@src/views/home/qemu/overview/http";
import SingleLine from "@src/components/chart/line/SingleLine";
import OverviewCard from "@src/components/card/OverviewCard";
import { render_uptime, byteToSize } from "@libs/utils";
import Dialog from "@src/components/dialog/Dialog";
import AceEditor from "@src/components/ace/AceEditor";

export default {
  name: "QEMU-Overview",
  mixins: [QemuOverviewHttp],
  components: {
    Dialog,
    OverviewCard,
    LinePercentChart,
    SingleLine,
    AceEditor,
  },
  data() {
    return {
      node: "",
      comment: "",
      showComment: false,
      interval: null,
      timeframe: "hour(AVERAGE)",
      loading: false,
      loadingText: "",
      isTempalte: false,
      rrdLoading: false,
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
      cpu: {
        value: [],
        label: ["CPU Usage", "I/O Delay"],
      },
      loadavg: {
        value: [],
        label: ["Average Load"],
      },
      memory: {
        value: [],
        label: ["Total", "Memory Usage"],
      },
      network: {
        value: [],
        label: ["netin", "netout"],
      },
      disk: {
        value: [],
        label: ["diskread", "diskwrite"],
      },
      config: {},
    };
  },
  methods: {
    render_uptime,
    byteToSize,
    __init__() {
      let last = window.localStorage.getItem("lastsel") || "[]";
      this.node = (JSON.parse(last) && JSON.parse(last)) || "";
      this.queryResource().then((res) => {
        this.isTempalte =
          this.db.qemuObj &&
          this.db.qemuObj.template &&
          this.db.qemuObj.template === 1
            ? true
            : false;
      });
      this.queryConfig().catch((res) => {
        this.comment = res ? res : "";
      });
      this.handleIntervalChange(this.timeframe);
    },
    handleIntervalChange(value) {
      if (/[\u4e00-\u9fa5]/.test(value)) return;
      this.timeframe = value;
      this.queryRrdData();
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      this.interval = setInterval(() => this.queryRrdData(), 60 * 1000);
    },
    handleComment() {
      let _this = this;
      _this.comment = _this.comment ? _this.comment : "";
      _this.showComment = true;
      _this.$nextTick(() => {
        _this.$refs[`ace-editor`].$el.style.height =
          _this.$refs["content"].parentElement.clientHeight - 30 + "px";
        window.addEventListener("resize", _this.updateAceEditorHeight, false);
      });
    },
    confirm() {
      this.setComment();
      window.removeEventListener("resize", this.updateAceEditorHeight, false);
    },
    cancel() {
      this.comment = "";
    },
    /**
     * Calculate dialog height when dialog height changes
     */
    updateAceEditorHeight() {
      let _this = this;
      _this.$refs[`ace-editor`].$el.style.height =
        _this.$refs["content"].parentElement.clientHeight - 30 + "px";
    },
  },
  /**
   * Initialize request
   */
  mounted() {
    let _this = this;
    _this.__init__();
  },
  beforeDestroy() {
    if (this.interval) {
      window.clearInterval(this.interval);
      this.interval = null;
    }
  },
  watch: {
    "$store.state.db.lastSelectObj": function (newVal, oldVal) {
      if (newVal !== oldVal && newVal.type === "qemu") {
        this.__init__();
      }
    },
  },
};
</script>

<style scoped lang="less">
.overview {
  &-select {
    margin: 5px 10px;
    position: relative;
    background-color: #fff;
    text-align: right;
  }
}
.m-tool-img {
  background-image: url("~@images/tool-sprites.png");
  overflow: hidden;
  width: 16px;
  height: 14px;
  margin: 0;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80);
  opacity: 0.8;
  background-position: 0 -97px;
  display: inline-block;
}

.m-overview-comment {
  width: 100%;
  height: 100%;
  min-height: 170px;
  border-color: #e0eaf3;
  padding-left: 5px;
}
.overview-content {
  &__top {
    height: 340px;
    display: flex;
    background: #f5f5f5;
    &_right {
      flex-grow: 1;
      flex-basis: auto;
      flex-shrink: 1;
      flex-wrap: nowrap;
      display: flex;
      width: 0;
    }
    &_left {
      flex-grow: 1;
      flex-basis: auto;
      flex-shrink: 1;
      flex-wrap: nowrap;
      padding-right: 20px;
      width: 0;
      display: flex;
    }
  }
  &__center {
    height: 340px;
    display: flex;
    background: #f5f5f5;
    &_right {
      flex-grow: 1;
      flex-basis: auto;
      flex-shrink: 1;
      flex-wrap: nowrap;
      width: 0;
    }
    &_left {
      flex-grow: 1;
      flex-basis: auto;
      flex-shrink: 1;
      flex-wrap: nowrap;
      padding-right: 20px;
      width: 0;
    }
  }
}
.card {
  height: 320px;
}
</style>
