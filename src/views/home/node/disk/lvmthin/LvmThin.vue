<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="refresh" icon="el-icon-refresh"
        >Reload</m-button
      >
      <m-button type="primary" @on-click="showModal()" icon="el-icon-plus"
        >Create: Thinpool</m-button
      >
    </div>
    <div slot="page-content">
      <el-table
        :data="db.nodeDiskLvmThinList"
        ref="dataTable"
        v-loading="loading"
      >
        <el-table-column label="Name" prop="lv">
          <template slot-scope="scope">
            <i
              :class="
                scope.row && scope.row.leaf === 0
                  ? 'fa fa-object-group'
                  : 'fa fa-hdd-o'
              "
            ></i>
            <span>{{ scope.row && scope.row.lv }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Usage" prop="used">
          <template slot-scope="scope">
            <LinePercentChart
              :value="
                scope.row.lv_size && scope.row.used
                  ? (1 -
                      (scope.row.lv_size - scope.row.used) /
                        scope.row.lv_size) *
                    100
                  : 0
              "
              :title="
                scope.row.lv_size && scope.row.used
                  ? percentToFixed(
                      1 -
                        (scope.row.lv_size - scope.row.used) /
                          scope.row.lv_size,
                      3
                    )
                  : 0
              "
            ></LinePercentChart>
          </template>
        </el-table-column>
        <el-table-column label="Size" prop="size">
          <template slot-scope="scope">
            {{
              scope.row && scope.row.lv_size && byteToSize(scope.row.lv_size)
            }}
          </template>
        </el-table-column>
        <el-table-column label="Used" prop="used">
          <template slot-scope="scope">
            {{ scope.row && scope.row.used && byteToSize(scope.row.used) }}
          </template>
        </el-table-column>
        <el-table-column label="Metadata Usage" prop="metadata_used">
          <template slot-scope="scope">
            <LinePercentChart
              :value="
                scope.row.metadata_size && scope.row.metadata_used
                  ? (scope.row.metadata_used / scope.row.metadata_size) * 100
                  : 0
              "
              :title="
                scope.row.metadata_size && scope.row.metadata_used
                  ? percentToFixed(
                      scope.row.metadata_used / scope.row.metadata_size,
                      3
                    )
                  : 0
              "
            ></LinePercentChart>
          </template>
        </el-table-column>
        <el-table-column label="Metadata Size" prop="metadata_size">
          <template slot-scope="scope">
            {{
              scope.row &&
              scope.row.metadata_size &&
              byteToSize(scope.row.metadata_size)
            }}
          </template>
        </el-table-column>
        <el-table-column label="Metadata Used" prop="metadata_used">
          <template slot-scope="scope">
            {{
              scope.row &&
              scope.row.metadata_used &&
              byteToSize(scope.row.metadata_used)
            }}
          </template>
        </el-table-column>
      </el-table>
      <create-thin-pool-modal
        :title="title"
        :visible="visible"
        v-if="visible"
        @close="
          visible = false;
          __init__();
        "
      ></create-thin-pool-modal>
    </div>
  </page-template>
</template>
<script>
import LinePercentChart from "@src/components/chart/line/LineCharts";
import NodeDiskLvmThinHttp from "@src/views/home/node/disk/lvmthin/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { percentToFixed, byteToSize, debounce } from "@libs/utils/index";
import CreateThinPoolModal from "./CreateThinPoolModal";
export default {
  name: "Lvm",
  mixins: [NodeDiskLvmThinHttp],
  components: {
    PageTemplate,
    MButton,
    LinePercentChart,
    CreateThinPoolModal,
  },
  data() {
    return {
      visible: false,
      title: "Create: Lvm Thinpool",
      loading: false,
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    percentToFixed,
    byteToSize,
    //Initialize search
    __init__() {
      this.queryDiskLvmThin();
    },
    refresh: debounce(function () {
      this.__init__();
    }, 500),
    //Show dialog
    showModal() {
      this.title = "Create: Lvm Thinpool";
      this.visible = true;
    },
    //Check if button is clickable
    inStatus() {
      return this.selectedList.length !== 1;
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
