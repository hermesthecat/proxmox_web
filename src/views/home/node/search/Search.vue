<template>
  <div class="search">
    <div class="search-content">
      <span class="search-input">
        <m-input placeholder="Search" v-model="searchModel">
          <i slot="prefix" class="el-icon-search"></i>
        </m-input>
      </span>
    </div>
    <el-table :data="chunkData(searchTable, pageSize)[currentPage - 1]" highlight-current-row
      @row-click="handleRowClick">
      <el-table-column prop="type" label="Category">
        <template slot-scope="scope">
          <span>
            <i class="fa" :class="{
              'fa-tags': scope.row.type === 'pool',
              'fa-desktop':
                scope.row.type === 'qemu' && !isTemplate(scope.row.template),
              'fa-file-o qemu':
                scope.row.type === 'qemu' && isTemplate(scope.row.template),
              'fa-database': scope.row.type === 'storage',
              'fa-building': scope.row.type === 'node',
              'fa-cube':
                scope.row.type === 'lxc' && !isTemplate(scope.row.template),
              'fa-file-o lxc':
                scope.row.type === 'lxc' && isTemplate(scope.row.template),
            }"></i>
            <span class="m-icon-custom fa" style="left: -10px; top: -1px"
              :class="setStautsCls(scope.row, scope.row.type)"></span>
            <span>{{ scope.row.type }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Description">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 'pool'">pools</span>
          <span v-if="scope.row.type === 'qemu' || scope.row.type === 'lxc'">{{
            scope.row.vmid +
            `${scope.row.name ? "(" + scope.row.name + ")" : " "}`
          }}</span>
          <span v-if="scope.row.type === 'storage'">{{
            scope.row.storage
          }}</span>
          <span v-if="scope.row.type === 'node'">{{ scope.row.node }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="node" label="Disk Usage">
        <template slot-scope="scope">
          <line-charts :value="Number(
            (scope && scope.row && scope.row.maxdisk && scope.row.disk
              ? scope.row.disk / scope.row.maxdisk
              : 0) * 100
          )
            "></line-charts>
        </template>
      </el-table-column>
      <el-table-column prop="pool" label="Memory Usage">
        <template slot-scope="scope">
          <line-charts :value="Number(
            (scope && scope.row && scope.row.maxmem && scope.row.mem
              ? scope.row.mem / scope.row.maxmem
              : 0) * 100
          )
            "></line-charts>
        </template>
      </el-table-column>
      <el-table-column prop="pool" label="CPU Usage">
        <template slot-scope="scope">
          <line-charts :value="Number(
            (scope && scope.row && scope.row.cpu ? scope.row.cpu : 0) * 100
          )
            "></line-charts>
        </template>
      </el-table-column>
      <el-table-column prop="pool" label="Uptime">
        <template slot-scope="scope">
          {{ scope.row.uptime ? render_uptime(scope.row.uptime) : "-" }}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="page-table-pagination" @size-change="(val) => {
        pageSize = val;
        __init__();
      }
      " @current-change="(val) => {
          currentPage = val;
          __init__();
        }
        " :current-page="currentPage" :page-sizes="[10, 20, 30, 40, 50]" :page-size="pageSize"
      :total="searchTable.length" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
</template>

<script>
import VuexMixins from "@src/mixins/VuexMixins";
import LineCharts from "@src/components/chart/line/LineCharts";
import { render_uptime, quickSort, chunkData } from "@libs/utils/";
export default {
  name: "index",
  mixins: [VuexMixins],
  components: {
    "line-charts": LineCharts,
  },
  data() {
    return {
      searchModel: "",
      intervalId: null,
      data: [],
      currentPage: 1,
      pageSize: 10,
    };
  },
  computed: {
    searchTable() {
      let _this = this;
      let datas = _this.data.filter((item) => {
        if (
          _this.searchModel &&
          JSON.stringify(item).indexOf(_this.searchModel) > -1
        ) {
          return item;
        } else if (_this.searchModel === "") {
          return item;
        }
      });
      return quickSort(datas, "type", "+");
    },
  },
  methods: {
    render_uptime,
    chunkData,
    //Row click handler
    handleRowClick(row, columns, event) {
      this.updateSearchObj(row);
    },
    __init__() {
      this.queryResource();
    },
    //Set status class
    setStautsCls(record, type) {
      let status = "";
      let objType = type;
      if (record.template && this.isTemplate(record.template)) {
        // Template
        objType = "template";
        status = type;
      } else {
        // Other records
        status = record.status
          ? record.status + " ha-" + record.hastate
          : " ha-" + record.hastate;
      }
      if (record.lock) {
        status += " locked lock-" + record.lock;
      }
      return status;
    },
    isTemplate(tmpl) {
      if (tmpl && String(tmpl) !== "0") {
        return true;
      } else {
        return false;
      }
    },
    //Query resources
    queryResource() {
      this.$http.get("/json/cluster/resources").then((res) => {
        if (res.data) {
          let last = window.localStorage.getItem("lastsel") || "[]";
          this.data = res.data.filter(
            (item) =>
              item.node === (JSON.parse(last).text && JSON.parse(last).text) &&
              item.type !== "node"
          );
        }
      });
    },
  },
  mounted() {
    this.__init__();
    this.intervalId = setInterval(() => this.__init__(), 10000);
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  },
};
</script>

<style scoped lang="less">
.search {
  padding: 20px;

  &-content {
    text-align: right;
    height: 45px;
    line-height: 45px;
  }

  &-input {
    width: 300px;
    display: inline-block;
    padding-bottom: 20px;
  }
}

/deep/.el-table td {
  padding: 0px;
}
</style>
