<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="refresh" icon="el-icon-refresh">Reload</m-button>
      <m-button type="primary" @on-click="showModal()" icon="el-icon-plus">Create: Directory</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="db.nodeDiskDirectoryList" ref="dataTable" v-loading="loading">
        <el-table-column label="Path" prop="path"></el-table-column>
        <el-table-column label="Device" prop="device"></el-table-column>
        <el-table-column label="Type" prop="type"></el-table-column>
        <el-table-column label="Options" prop="options"></el-table-column>
      </el-table>
      <create-directory-modal :title="title" :visible="visible" v-if="visible" @close="
        visible = false;
      __init__();
      "></create-directory-modal>
    </div>
  </page-template>
</template>
<script>
import LinePercentChart from "@src/components/chart/line/LineCharts";
import NodeDiskDirectoryHttp from "@src/views/home/node/disk/directory/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import { percentToFixed, byteToSize, debounce } from "@libs/utils/index";
import CreateDirectoryModal from "./CreateDirectoryModal";
export default {
  name: "Lvm",
  mixins: [NodeDiskDirectoryHttp],
  components: {
    PageTemplate,
    MButton,
    LinePercentChart,
    CreateDirectoryModal,
  },
  data() {
    return {
      visible: false,
      title: "Create: Lvm Directory",
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
      this.queryDiskDirectory();
    },
    refresh: debounce(function () {
      this.__init__();
    }, 500),
    //Show dialog
    showModal() {
      this.title = "Create: Lvm Directory";
      this.visible = true;
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
