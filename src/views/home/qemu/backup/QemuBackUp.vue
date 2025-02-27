<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="showModal('backup')" icon="fa fa-save" v-if="!showOperate">Backup
        Now</m-button>
      <m-button type="primary" @on-click="showModal('restore')" icon="fa fa-retweet" v-if="!showOperate"
        :disabled="selectedList.length !== 1">Restore</m-button>
      <m-button type="danger" @on-click="handleDelete()" icon="el-icon-delete" v-if="!showOperate"
        :disabled="selectedList.length !== 1">Delete</m-button>
      <m-button type="info" @on-click="showModal('config')" icon="el-icon-view" v-if="!showOperate"
        :disabled="selectedList.length !== 1">Show Configuration</m-button>
      <m-dropdown trigger="click" v-if="showOperate" @on-change="showModal" style="
          width: 8rem;
          height: 30px;
          line-height: 30px;
          color: #fff !important;
        ">
        <span slot="label">
          <m-button type="primary" style="position: absolute; left: -1px; top: -1px; right: -1px"
            icon="el-icon-plus">Operations</m-button>
        </span>
        <template v-for="item in operateItems" :key="item.value">
          <m-dropdown-item :command="item.value" :icon="item.icon" :disabled="item.value === 'backup' ? false : selectedList.length !== 1
            ">{{ item.label }}</m-dropdown-item>
        </template>
      </m-dropdown>
    </div>
    <div slot="toolbar-right" style="text-align: right">
      <m-select v-model="storage" label="Storage" prop="storage" @on-change="(value) => {
          storage = value;
          handleChangeStorage();
        }
        ">
        <m-option v-for="(item, index) in qemuStorageList" :label="item.storage" :key="item.storage"
          :value="item.storage">
          <div class="table-tr" v-if="index === 0">
            <div class="table-td">Name</div>
            <div class="table-td">Category</div>
            <div class="table-td">Available</div>
            <div class="table-td">Capacity</div>
          </div>
          <div class="table-tr">
            <div class="table-td" :title="item.storage">{{ item.storage }}</div>
            <div class="table-td" :title="item.type">{{ item.type }}</div>
            <div class="table-td" :title="item.avail ? byteToSize(item.avail) : '0'">
              {{ item.avail ? byteToSize(item.avail) : "0" }}
            </div>
            <div class="table-td" :title="item.total ? byteToSize(item.total) : '0'">
              {{ item.total ? byteToSize(item.total) : "0" }}
            </div>
          </div>
        </m-option>
      </m-select>
      <m-input type="text" prop="search" labelWidth="53px" label="Search Name" v-model="search"
        @input="throttle(filter('volid'), 1000)" placeholder="Please enter name">
        <i slot="prefix" class="el-icon-search"></i>
      </m-input>
    </div>
    <div slot="page-content">
      <el-table :data="qemuBackUpList" ref="dataTable" @selection-change="handleSelect" @sort-change="handleSort">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Name" prop="volid" sortable width="400px">
          <template slot-scope="scope">
            {{
              scope.row.volid ? scope.row.volid.replace(/([\s\S]*)\//, "") : ""
            }}
          </template>
        </el-table-column>
        <el-table-column label="Date" prop="ctime" sortable>
          <template slot-scope="scope">
            {{
              dateFormat(
                new Date(scope.row.ctime * 1000),
                "yyyy-MM-dd hh:mm:ss"
              )
            }}
          </template>
        </el-table-column>
        <el-table-column label="Format" prop="format"></el-table-column>
        <el-table-column label="Size" prop="size">
          <template slot-scope="scope">
            {{ byteToSize(scope.row.size) }}
          </template>
        </el-table-column>
      </el-table>
      <back-up-operate-modal :visible="visible" v-if="visible" :title="title" :param="param" :modalType="modalType"
        @close="
          visible = false;
        __init__();
        "></back-up-operate-modal>
    </div>
  </page-template>
</template>
<script>
import QemuBackUpHttp from "@src/views/home/qemu/backup/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
import BackUpOperateModal from "./BackUpOperateModal";
import { dateFormat, byteToSize, quickSort, throttle } from "@libs/utils/index";
export default {
  name: "QemuBackUp",
  mixins: [QemuBackUpHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog,
    BackUpOperateModal,
  },
  data() {
    let _this = this;
    return {
      modalType: "backup",
      visible: false,
      title: "",
      selectedList: [],
      isCreate: true,
      param: {},
      search: "",
      storage: "",
      qemuBackUpList: [],
      qemuStorageList: [],
      showOperate: false,
      operateItems: [
        {
          label: "Backup Now",
          value: "backup",
          icon: "fa fa-save",
        },
        {
          label: "Restore",
          value: "restore",
          icon: "fa fa-retweet",
        },
        {
          label: "Show Configuration",
          value: "config",
          icon: "el-icon-view",
        },
        {
          label: "Delete",
          value: "delete",
          icon: "el-icon-delete",
        },
      ],
    };
  },
  mounted() {
    this.__init__();
    this.showOperateDrown();
    window.addEventListener("resize", this.showOperateDrown, false);
  },
  methods: {
    dateFormat,
    byteToSize,
    throttle,
    getHTMLWidth() {
      return document.documentElement.clientWidth || document.body.clientWidth;
    },
    showOperateDrown() {
      if (this.getHTMLWidth() > 1511) {
        this.showOperate = false;
      } else {
        this.showOperate = true;
      }
    },
    //Initialize search
    async __init__() {
      let _this = this;
      await _this
        .queryQemuStorageList({ format: 1, content: "backup" })
        .then((res) => {
          _this.qemuStorageList = quickSort(
            this.db.storageList,
            "storage",
            "+"
          );
          _this.storage = _this.qemuStorageList[0]
            ? _this.qemuStorageList[0].storage
            : "local";
        });
      this.queryQemuBackUpList({ content: "backup" }).then((res) => {
        _this.qemuBackUpList = quickSort(
          _this.db.qemuBackUpList,
          "ctime",
          ""
        ).filter((item) => item.vmid === _this.node.vmid);
      });
    },
    //Switch storage query
    async handleChangeStorage() {
      let _this = this;
      this.queryQemuBackUpList({ content: "backup" }).then((res) => {
        _this.qemuBackUpList = quickSort(
          _this.db.qemuBackUpList,
          "ctime",
          ""
        ).filter((item) => item.vmid === _this.node.vmid);
      });
    },
    //Check if button is clickable
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
          msg: `Are you sure you want to delete ${this.selectedList[0].volid}?`,
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
    /**
     * Search
     */
    filter(type) {
      if (this.search) {
        this.qemuBackUpList = this.db.qemuBackUpList
          .filter((item) => {
            let regx = new RegExp(`(${this.search})`, "g");
            return regx.test(item[type]);
          })
          .filter((item) => item.vmid === this.node.vmid);
      } else {
        this.handleChangeStorage();
      }
    },
    //Sort
    handleSort({ colume, prop, order }) {
      let _this = this;
      if (order !== null)
        _this.qemuTaskList = quickSort(
          _this.db.nodeTaskList,
          prop,
          order === "ascending" ? "+" : "-"
        );
    },
    /**
     * Modal dialog
     */
    showModal(type) {
      debugger;
      if (type !== "delete") {
        this.modalType = type;
        this.param = type !== "backup" ? this.selectedList[0] : {};
        this.setTitle(type);
        this.visible = true;
      } else {
        this.handleDelete();
      }
    },
    /**
     * Set title @param type 'backup', 'config', 'restore'
     */
    setTitle(type) {
      switch (type) {
        case "backup":
          this.title = `Backup: ${this.node.text}`;
          break;
        case "config":
          this.title = `Configuration`;
          break;
        case "restore":
          this.title = `Restore: ${this.node.text}`;
          break;
      }
    },
  },
  beforeDestroy() {
    window.addEventListener("resize", this.showOperateDrown, false);
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

/deep/.tool-bar-right {
  flex: 2;
}
</style>
