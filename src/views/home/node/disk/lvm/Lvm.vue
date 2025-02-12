<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="refresh" icon="el-icon-refresh"
        >Reload</m-button
      >
      <m-button type="primary" @on-click="showModal()" icon="el-icon-plus"
        >Create: Volume Group</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="db.nodeDiskLvmObj.children"
        ref="dataTable"
        :row-key="setRowKeys"
        :expand-row-keys="expands"
        v-loading="loading"
        :tree-props="{ children: 'children' }"
      >
        >
        <el-table-column label="Name" prop="name">
          <template slot-scope="scope">
            <i
              :class="
                scope.row && scope.row.leaf === 0
                  ? 'fa fa-object-group'
                  : 'fa fa-hdd-o'
              "
            ></i>
            <span>{{ scope.row && scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Lvs Count" prop="lvcount"></el-table-column>
        <el-table-column label="Usage" prop="used">
          <template slot-scope="scope">
            <LinePercentChart
              :value="
                scope.row.size && scope.row.free
                  ? ((scope.row.size - scope.row.free) / scope.row.size) * 100
                  : 0
              "
              :title="
                scope.row.size && scope.row.free
                  ? percentToFixed(
                      (scope.row.size - scope.row.free) / scope.row.size,
                      3
                    )
                  : 0
              "
            ></LinePercentChart>
          </template>
        </el-table-column>
        <el-table-column label="Size" prop="size">
          <template slot-scope="scope">
            {{ scope.row && scope.row.size && byteToSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="Free" prop="free">
          <template slot-scope="scope">
            {{ scope.row && scope.row.free && byteToSize(scope.row.free) }}
          </template>
        </el-table-column>
      </el-table>
      <create-volume-group-modal
        :title="title"
        :visible="visible"
        v-if="visible"
        @close="
          visible = false;
          __init__();
        "
      ></create-volume-group-modal>
    </div>
  </page-template>
</template>
<script>
import LinePercentChart from "@src/components/chart/line/LineCharts";
import NodeDiskLvmHttp from "@src/views/home/node/disk/lvm/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { percentToFixed, byteToSize, debounce } from "@libs/utils/index";
import CreateVolumeGroupModal from "./CreateVolumeModal";
export default {
  name: "Lvm",
  mixins: [NodeDiskLvmHttp],
  components: {
    PageTemplate,
    MButton,
    LinePercentChart,
    CreateVolumeGroupModal,
  },
  data() {
    return {
      visible: false,
      title: "Create: Lvm Volume Group",
      selectedList: [],
      expands: [],
      loading: false,
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    percentToFixed,
    byteToSize,
    refresh: debounce(function () {
      this.__init__();
    }, 500),
    //Initialize search
    __init__() {
      this.queryDiskLvm({ _dc: new Date().getTime() });
    },
    //Show dialog
    showModal() {
      this.title = "Create: Lvm Volume Group";
      this.visible = true;
    },
    //Check if button is clickable
    inStatus() {
      return this.selectedList.length !== 1;
    },
    expandChange(row, expandedRows) {
      var that = this;
      if (expandedRows.length) {
        that.expands = [];
        if (row) {
          that.expands.push(row.name);
        }
      } else {
        that.expands = [];
      }
    },
    setRowKeys(row) {
      return row.name;
    },
  },
};
</script>

<style lang="less" scoped>
.cluster-desc {
  display: flex;
  margin: 10px 0px;
  padding: 10px 0px;
  border-top: 1px solid #c4d6ec;
  border-bottom: 1px solid #c4d6ec;
  &__item {
    flex: 1 1 auto;
    display: flex;
  }
  &__title {
    flex: 1 1 auto;
    display: inline-flex;
  }
  &__desc {
    flex: 1 1 auto;
    display: inline-flex;
  }
}
</style>
