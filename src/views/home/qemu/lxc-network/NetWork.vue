<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="showModal('create')" icon="fa fa-save">Add</m-button>
      <m-button type="primary" @on-click="showModal('edit')" icon="el-icon-edit"
        :disabled="selectedList.length !== 1">Edit</m-button>
      <m-button type="danger" @on-click="handleDelete()" icon="el-icon-delete"
        :disabled="selectedList.length <= 0">Delete</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="netWorkList" ref="dataTable" @selection-change="handleSelect" @sort-change="handleSort">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="ID" prop="id" sortable></el-table-column>
        <el-table-column label="Name" prop="name" sortable></el-table-column>
        <el-table-column label="Bridge" prop="bridge" sortable></el-table-column>
        <el-table-column label="Firewall" prop="firewall">
          <template slot-scope="scope">
            <table-info-state :content="scope.row.disable && scope.row.disable === 1 ? 'No' : 'Yes'
              " :state="scope.row.disable && scope.row.disable === 1
                  ? 'unActived'
                  : 'actived'
                "></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="VLAN" prop="tag" sortable></el-table-column>
        <el-table-column label="MAC Address" prop="hwaddr"></el-table-column>
        <el-table-column label="IP Address" prop="ip" sortable>
          <template slot-scope="scope">
            <div v-show="scope.row.ip">
              {{ scope.row.ip }}
            </div>
            <div v-show="scope.row.ip6">
              {{ scope.row.ip6 }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Gateway" prop="gw">
          <template slot-scope="scope">
            <div v-show="scope.row.gw">
              {{ scope.row.gw }}
            </div>
            <div v-show="scope.row.gw6">
              {{ scope.row.gw6 }}
            </div>
          </template>
        </el-table-column>
      </el-table>
      <add-or-edit-net-work-modal :visible="visible" v-if="visible" :title="title" :param="param" :isCreate="isCreate"
        :modalType="modalType" @close="
          visible = false;
        __init__();
        "></add-or-edit-net-work-modal>
    </div>
  </page-template>
</template>
<script>
import NetWorkHttp from "@src/views/home/qemu/lxc-network/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
import AddOrEditNetWorkModal from "./AddOrEditNetWorkModal";
import { quickSort } from "@libs/utils/index";
export default {
  name: "QemuBackUp",
  mixins: [NetWorkHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog,
    AddOrEditNetWorkModal,
  },
  data() {
    return {
      modalType: "backup",
      visible: false,
      title: "",
      selectedList: [],
      isCreate: true,
      param: {},
      search: "",
      storage: "",
      netWorkList: [],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //Initialize search
    async __init__() {
      let _this = this;
      await _this.queryConfig({ _dc: new Date().getTime() }).then((res) => {
        let netWorkList = Object.keys(this.db.qemuConfigObj)
          .filter((item) => /^(net)\d$/.test(item))
          .map((item) => {
            return {
              id: item,
              name: (() => {
                if (/(name=)(\w+)/.test(this.db.qemuConfigObj[item]))
                  return RegExp.$2;
              })(),
              bridge: (() => {
                if (/(bridge=)(\w+)/.test(this.db.qemuConfigObj[item]))
                  return RegExp.$2;
              })(),
              firewall: (() => {
                if (/(firewall=)(\w+)/.test(this.db.qemuConfigObj[item]))
                  return RegExp.$2;
              })(),
              hwaddr: (() => {
                if (/(hwaddr=)([\w+\:]+)/.test(this.db.qemuConfigObj[item]))
                  return RegExp.$2;
              })(),
              type: (() => {
                if (/(type=)(\w+)/.test(this.db.qemuConfigObj[item]))
                  return RegExp.$2;
              })(),
              tag: (() => {
                if (/(tag=)(\w+)/.test(this.db.qemuConfigObj[item]))
                  return RegExp.$2;
              })(),
              ip: (() => {
                if (/(ip=)([\w+\.\/]+)/.test(this.db.qemuConfigObj[item]))
                  return RegExp.$2;
              })(),
              ip6: (() => {
                let ip = "";
                if (/(ip6=)([\w+\:\/]+)/.test(this.db.qemuConfigObj[item]))
                  return RegExp.$2;
              })(),
              gw: (() => {
                if (/(gw=)([\w+\.]+)/.test(this.db.qemuConfigObj[item]))
                  return RegExp.$2;
              })(),
              gw6: (() => {
                if (/(gw6=)([\w+\:]+)/.test(this.db.qemuConfigObj[item]))
                  return RegExp.$2;
              })(),
              rate: (() => {
                if (/(rate=)([\w+\:]+)/.test(this.db.qemuConfigObj[item]))
                  return RegExp.$2;
              })(),
            };
          });
        this.netWorkList = quickSort(netWorkList, "id", "+");
        this.updateTable({
          tableName: "lxcNetWorkList",
          list: this.netWorkList,
        });
      });
    },
    //Button click state
    inStatus() {
      return this.selectedList.length <= 0;
    },
    //Selection
    handleSelect(row) {
      this.selectedList = row;
    },
    /**
     * Delete backup task
     */
    handleDelete(type) {
      this.$confirm
        .confirm({
          msg: `Are you sure you want to delete the selected items?`,
          type: "info",
          icon: "icon-warning",
        })
        .then(() => {
          this.delete()
            .then((res) => {
              this.__init__();
            })
            .catch((res) => {
              this.$confirm.confirm({
                msg: res,
              });
            });
        })
        .catch(() => { });
    },
    //Sort
    handleSort({ colume, prop, order }) {
      let _this = this;
      if (order !== null)
        _this.netWorkList = quickSort(
          _this.db.lxcNetWorkList,
          prop,
          order === "ascending" ? "+" : "-"
        );
    },
    /**
     * Show modal
     */
    showModal(type) {
      this.modalType = type;
      this.param = type !== "create" ? this.selectedList[0] : {};
      this.isCreate = type === "create";
      this.setTitle(type);
      this.visible = true;
    },
    /**
     * Set title @param type 'backup', 'config', 'restore'
     */
    setTitle(type) {
      switch (type) {
        case "create":
          this.title = `Add: Network Device (veth)`;
          break;
        case "edit":
          this.title = `Edit: Network Device (veth)`;
          break;
      }
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

/deep/.run-error {
  background: #f3d6d7 !important;
  color: #fff !important;

  &:hover {
    color: #606266 !important;
  }
}
</style>
