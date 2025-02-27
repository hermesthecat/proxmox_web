<template>
  <div class="overview">
    <div class="overview-content__top">
      <div class="overview-content__top_left">
        <overview-card>
          <div slot="title">Health</div>
          <div slot="content" class="card-content">
            <div class="card-item">
              <line-item title="Status" :isDouble="false" type="cluster" :icon="`${status &&
                  status.cluster &&
                  status.cluster[0] &&
                  status.cluster[0].quorate &&
                  status.cluster[0].quorate == '0'
                  ? 'fa critical fa-times-circle'
                  : 'good fa-check-circle'
                }`" :des="`Cluster${status &&
                    status.cluster &&
                    status.cluster[0] &&
                    status.cluster[0].name
                    ? status.cluster[0].name
                    : ''
                  }, Quorum:${status &&
                    status.cluster &&
                    status.cluster[0] &&
                    status.cluster[0].quorate
                    ? status.cluster[0].quorate
                    : 0
                  }`"></line-item>
            </div>
            <div class="card-item">
              <line-item title="Node" :isDouble="true" type="node" :data="status && status.node"></line-item>
            </div>
            <div class="card-item" v-if="!uninstallCeph">
              <h1 class="ceph-title">Ceph Status</h1>
              <router-link to="/datacenter/ceph" class="ceph-icon" :class="{
                'fa fa-exclamation-circle warning':
                  db.cephObj &&
                  db.cephObj.health &&
                  db.cephObj.health.status === 'HEALTH_WARN',
                'fa fa-check-circle good':
                  db.cephObj &&
                  db.cephObj.health &&
                  db.cephObj.health.status === 'HEALTH_OK',
              }"></router-link>
              <div class="ceph-health">
                {{
                  db.cephObj && db.cephObj.health && db.cephObj.health.status
                }}
              </div>
            </div>
          </div>
        </overview-card>
      </div>
      <div class="overview-content__top_right">
        <overview-card>
          <div slot="title">Guests</div>
          <div slot="content" class="card-content">
            <div class="card-item">
              <line-item title="Virtual Machine" :isDouble="true" type="qemu" :data="resources.qemu"></line-item>
            </div>
            <div class="card-item">
              <line-item title="LXC Container" :isDouble="true" type="lxc" :data="resources.lxc"></line-item>
            </div>
          </div>
        </overview-card>
      </div>
    </div>
    <div class="overview-content__center">
      <div class="overview-content__center_left">
        <overview-card>
          <div slot="title">Resources</div>
          <div slot="content" class="card-content">
            <div class="card-item">
              <mh-circle :value="resources &&
                resources.griditem &&
                resources.griditem.cpuusage * 100
                " title="CPU" :label="setLabel('cpu', resources.griditem)">
              </mh-circle>
            </div>
            <div class="card-item">
              <mh-circle :value="resources &&
                resources.griditem &&
                resources.griditem.memoryusage * 100
                " :label="setLabel('mem', resources.griditem)" title="Memory"></mh-circle>
            </div>
            <div class="card-item">
              <mh-circle :value="resources &&
                resources.griditem &&
                resources.griditem.storageusage * 100
                " :label="setLabel('storage', resources.griditem)" title="Storage"></mh-circle>
            </div>
          </div>
        </overview-card>
      </div>
      <div class="overview-content__center_right">
        <overview-card>
          <div slot="title">Nodes</div>
          <div slot="content">
            <el-table :data="nodes" class="m-margin-top-10">
              <el-table-column label="Node" prop="name"></el-table-column>
              <el-table-column label="ID" prop="nodeid" width="50px"></el-table-column>
              <el-table-column label="Online" prop="online">
                <template slot-scope="scope">
                  <i :class="{
                    'good fa fa-play-circle': scope.row.status === 'online',
                  }"></i>
                </template>
              </el-table-column>
              <el-table-column label="Support" prop="level">
                <template slot-scope="scope">
                  <span v-if="scope.row.level">{{ scope.row.level }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="Server Address" prop="ip">
                <template slot-scope="scope">
                  <span style="font-size: 12px">{{ scope.row.ip }}</span>
                </template>
              </el-table-column>
              <el-table-column label="CPU Usage" prop="cpu">
                <template slot-scope="scope">
                  <line-charts :value="Number(
                    (scope && scope.row && scope.row.cpu
                      ? scope.row.cpu
                      : 0) * 100
                  )
                    "></line-charts>
                </template>
              </el-table-column>
              <el-table-column label="Memory Usage" prop="mem">
                <template slot-scope="scope">
                  <line-charts :value="Number(
                    (scope && scope.row && scope.row.maxmem && scope.row.mem
                      ? scope.row.mem / scope.row.maxmem
                      : 0) * 100
                  )
                    "></line-charts>
                </template>
              </el-table-column>
              <el-table-column label="Uptime" prop="uptime">
                <template slot-scope="scope">
                  <span style="font-size: 12px">{{
                    scope.row.uptime ? render_uptime(scope.row.uptime) : "-"
                  }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </overview-card>
      </div>
    </div>
    <overview-card>
      <div slot="title">Subscription</div>
      <div slot="content" class="card-content">
        <div class="card-item">
          <line-item :title="this.subs && this.subs.title" :isDouble="false" type="subscription"
            :icon="this.subs && this.subs.iconCls" :des="this.subs && this.subs.text"></line-item>
        </div>
      </div>
    </overview-card>
  </div>
</template>

<script>
import OverviewCard from "../../../../components/card/OverviewCard";
import LineItem from "./LineItem";
import Circle from "@src/components/chart/circle/index.vue";
import LineCharts from "@src/components/chart/line/LineCharts";
import { dateFormat, byteToSize, render_uptime } from "@libs/utils";

export default {
  name: "index",
  components: {
    OverviewCard,
    LineItem,
    "mh-circle": Circle,
    "line-charts": LineCharts,
  },
  data() {
    return {
      resources: {},
      status: {},
      nodes: [],
      intervalId: null,
      uninstallCeph: false,
      subs: {
        title: "Unknown",
        text: "Unknown",
        iconCls: "fa-info-circle",
      },
    };
  },
  methods: {
    render_uptime,
    async __init__() {
      await this.getClusterStatus();
      this.getClusterResource();
      this.queryCephStatus();
    },
    getClusterStatus() {
      this.$http.get("/json/cluster/status").then((results) => {
        this.status.node = {
          online: results.data.filter(
            (it) => it.type === "node" && it.online === 1
          ).length,
          offline: results.data.filter(
            (it) => it.type === "node" && it.online === 0
          ).length,
        };
        (this.status.cluster = results.data.filter(
          (it) => it.type === "cluster"
        )),
          (this.nodes = results.data.filter((item) => item.type === "node"));
        let i;
        let level;
        let mixed = false;

        for (let node of results.data) {
          if (node.type !== "node") {
            continue;
          }
          if (node.status === "offline") {
            continue;
          }
          var curlevel = node.level;
          if (curlevel === "") {
            // no subscription trumps all, set and break
            level = "";
            break;
          }
          if (level === undefined) {
            // save level
            level = curlevel;
          } else if (level !== curlevel) {
            // detect different levels
            mixed = true;
          }
        }
        if (level === "") {
          this.subs = {
            title: this.$t("No Subscription"),
            iconCls: this.get_health_icon("critical", true),
            text: this.$t("You have at least one node without subscription."),
          };
        } else if (mixed) {
          this.subs = {
            title: this.$t("Mixed Subscriptions"),
            iconCls: this.get_health_icon("warning", true),
            text: this.$t(
              "Warning: Your subscription levels are not the same."
            ),
          };
        } else if (level) {
          this.subs = {
            title: this.$t("subsStatus"),
            iconCls: this.get_health_icon("good", true),
            text: this.$t("Your subscription status is valid."),
          };
        }
      });
    },
    getClusterResource() {
      this.$http.get("/json/cluster/resources").then((results) => {
        var cpu = 0;
        var maxcpu = 0;

        var nodes = 0;

        var memory = 0;
        var maxmem = 0;

        var countedStorages = {};
        var used = 0;
        var total = 0;
        var usableStorages = {};
        var qemu = {
          running: 0,
          paused: 0,
          stopped: 0,
          template: 0,
        };
        var lxc = {
          running: 0,
          paused: 0,
          stopped: 0,
          template: 0,
        };
        var error = 0;
        var i;
        for (i = 0; i < results.data.length; i++) {
          var item = results.data[i];
          switch (item.type) {
            case "node":
              cpu += item.cpu * item.maxcpu;
              maxcpu += item.maxcpu || 0;
              memory += item.mem || 0;
              maxmem += item.maxmem || 0;
              nodes++;
              var griditem = {};
              if (griditem) {
                griditem["cpuusage"] = item.cpu || 0;
                var max = item.maxmem || 1;
                var val = item.mem || 0;
                griditem["memoryusage"] = val / max;
                griditem["memory"] = memory;
                griditem["maxmem"] = maxmem;
                griditem["cpu"] = maxcpu;
                griditem["uptime"] = item.uptime;
              }
              this.nodes = this.nodes.map((it) => {
                if (item.node === it.name) {
                  it["cpu"] = item.cpu;
                  it["maxmem"] = item.maxmem;
                  it["mem"] = item.mem;
                  it["uptime"] = item.uptime;
                  it["status"] = item.status;
                }
                return it;
              });
              break;
            case "storage":
              if (
                !countedStorages[item.storage] ||
                (item.storage === "local" && !countedStorages[item.id])
              ) {
                used += item.disk || 0;
                total += item.maxdisk || 0;
                griditem["storageusage"] = used / total;
                griditem["storage"] = total;
                griditem["storageused"] = used;
                countedStorages[
                  item.storage === "local" ? item.id : item.storage
                ] = true;
              }
              break;
            case "qemu":
              qemu[item.template ? "template" : item.status]++;
              if (item.hastate === "error") {
                error++;
              }
              qemu["error"] = error;
              break;
            case "lxc":
              lxc[item.template ? "template" : item.status]++;
              if (item.hastate === "error") {
                error++;
              }
              lxc["error"] = error;
              break;
            default:
              break;
          }
        }
        this.resources = {
          qemu,
          lxc,
          countedStorages,
          griditem,
        };
      });
    },
    setLabel(type, item) {
      switch (type) {
        case "cpu":
          return item && item.cpuusage && item.cpu
            ? `of ${item.cpu} CPU(s)`
            : "";
        case "mem":
          return item && item.memory && item.maxmem
            ? `${byteToSize(item.memory)} of ${byteToSize(item.maxmem)}`
            : "";
        case "storage":
          return item && item.storage && item.storageused
            ? `${byteToSize(item.storageused)} of ${byteToSize(item.storage)}`
            : "";
      }
    },
    get_health_icon(type) {
      switch (type) {
        case "critical":
          return "critical fa-times-circle";
        case "warning":
          return "warning fa-info-circle";
        case "good":
          return "good fa-check-circle";
      }
    },
    queryCephStatus() {
      return this.$http
        .get("json/cluster/ceph/status")
        .then((res) => {
          if (res.data) {
            this.uninstallCeph = false;
            this.updateDbObject({
              name: "cephObj",
              data: res.data,
            });
          }
        })
        .catch((res) => {
          if (/(not installed)/.test(res)) {
            this.uninstallCeph = true;
          }
          this.updateDbObject({
            name: "cephObj",
            data: {},
          });
        });
    },
  },
  mounted() {
    this.__init__();
    this.intervalId = setInterval(() => this.__init__(), 3000);
  },
  beforeDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },
};
</script>

<style scoped lang="less">
.content-item {
  height: 100%;
}

.card-item {
  height: 100%;
}

.ceph-title {
  margin: 20px 0 20px;
  font-size: 12px;
  text-align: center;
}

.ceph-icon {
  font-size: 65px;
  width: 100%;
  text-align: center;
}

.ceph-health {
  text-align: center;
}

/deep/.el-table td,
.el-table th {
  padding: 0px;
}

/deep/.el-table .cell {
  white-space: nowrap;
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
