<template>
  <page-template>
    <div slot="toolbar-right" style="text-align: right; padding-right: 10px">
      <span class="search-input">
        <m-input placeholder="Search" v-model="searchModel">
          <i slot="prefix" class="el-icon-search"></i>
        </m-input>
      </span>
    </div>
    <div slot="toolbar-left">
      <m-button type="primary" @on-click="showModal('create')" icon="fa fa-save">Add</m-button>
      <m-button type="primary" @on-click="showModal('edit')" icon="fa fa-retweet" :disabled="inStatus()">Edit</m-button>
      <m-button type="danger" @on-click="handleDelete()" icon="el-icon-delete" :disabled="inStatus()">Delete</m-button>
      <m-button type="info" @on-click="handleRollback" icon="el-icon-view" :disabled="inStatus()">Rollback</m-button>
      <m-button type="info" @on-click="handleClone" icon="el-icon-view" :disabled="current === ''">Clone VM</m-button>
    </div>
    <div slot="page-content" style="position: relative; top: 0; bottom: 0; left: 0; right: -20px">
      <div class="list">
        <div class="row-title">
          <span id="common-name" class="name">Name</span>
          <span id="common-size" class="size">Memory</span>
          <span id="common-createDate" class="date">Date</span>
          <span id="common-createDate" class="description">Description</span>
        </div>
        <label class="row" v-for="it in chunkData(searchTable, pageSize)[currentPage - 1]" :key="it.name"
          :class="{ 'is-active': current === it.name }">
          <template>
            <input name="snapshot" :id="it.name" type="radio" style="display: none; width: 0px"
              @change="handleSelect" />
            <span class="root-name">{{ it.name && it.name }}</span>
            <span class="name">
              <table-info-state :state="it.vmstate === 1 ? 'actived' : 'unActived'"
                :content="it.vmstate === 1 ? 'Yes' : 'No'"></table-info-state>
            </span>
            <span class="date">{{
              it.snaptime
                ? dateFormat(
                  new Date(it.snaptime * 1000),
                  "yyyy-MM-dd hh:mm:ss"
                )
                : ""
            }}</span>
            <span class="description">{{
              it.description && it.description
            }}</span>
          </template>
        </label>
        <p v-if="searchTable.length <= 0" style="text-align: center">
          <img src="~@images/noata.png" />
        </p>
        <el-pagination class="page-table-pagination" @size-change="(val) => {
          pageSize = val;
          currentPage = 1;
          __init__();
          current = '';
        }
          " @current-change="(val) => {
            currentPage = val;
            __init__();
            current = '';
          }
            " :current-page="currentPage" :page-sizes="[10, 20, 30, 40, 50]" :page-size="pageSize"
          :total="searchTable.length" small layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
      <add-snap-shot-modal :visible="visible" v-if="visible" :title="title" :param="param" :isCreate="isCreate"
        :modalType="modalType" @close="
          visible = false;
        __init__();
        "></add-snap-shot-modal>
      <m-dialog :visible="showDeleteLog" @close="closeDeleteLog" title="Task Progress">
        <template slot="content">
          <div class="progress" v-if="!done">
            <div class="progress-inner"></div>
          </div>
          <div v-else>
            <div class="progress">Done!</div>
          </div>
        </template>
        <template slot="footer"><span></span></template>
      </m-dialog>
      <operate-modal :visible="visibleclone" v-if="visibleclone" :param="{ snapshotname: current }" @close="
        visibleclone = false;
      __init__();
      "></operate-modal>
    </div>
  </page-template>
</template>
<script>
import SnapShotHttp from "@src/views/home/qemu/snapshot/http";
import PageTemplate from "@src/components/page/PageTemplate";
import MButton from "@src/components/button/Button";
import Dialog from "@src/components/dialog/Dialog";
import AddSnapShotModal from "./AddSnapShotModal";
import {
  dateFormat,
  byteToSize,
  quickSort,
  isEmpty,
  chunkData,
} from "@libs/utils/index";
import OperateModal from "./CloneQemuModal";
export default {
  name: "Snapshot",
  mixins: [SnapShotHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog,
    AddSnapShotModal,
    OperateModal,
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
      current: "",
      interVal: null,
      snapshotList: [],
      showDeleteLog: false, //Show progress
      done: true,
      yMax: -1,
      xSpace: 48,
      ySpace: 34,
      fakeNewNode: {},
      currentTreeUuid: "",
      currentPage: 1,
      pageSize: 10,
      searchModel: "",
      visibleclone: false,
    };
  },
  computed: {
    searchTable() {
      let _this = this;
      let datas = _this.snapshotList.filter((item) => {
        if (
          _this.searchModel &&
          item.name.indexOf(_this.searchModel) > -1 &&
          item.name !== "current"
        ) {
          return item;
        } else if (_this.searchModel === "") {
          return item;
        }
      });
      return datas || [];
    },
  },
  mounted() {
    let _this = this;
    _this.__init__();
  },
  methods: {
    dateFormat,
    byteToSize,
    chunkData,
    //Initialize search
    __init__() {
      let _this = this;
      _this.querySnapShotList({ _dc: new Date().getTime() }).then((res) => {
        _this.snapshotList = quickSort(
          _this.db.snapshotList.map((item) => {
            if (item.name == "current") {
              item.snaptime = new Date().getTime() / 1000;
            }
            return item;
          }),
          "snaptime",
          "-"
        );
        //_this.snapshotList.push();
      });
    },
    //Button click state
    inStatus() {
      return isEmpty(this.current) || this.current === "current";
    },
    //Selection
    handleSelect(event) {
      this.current = event.target.id;
    },
    /**
     * Delete backup task
     */
    handleDelete(type) {
      this.$confirm
        .confirm({
          msg: `Are you sure you want to delete ${this.current}?`,
          type: "info",
          icon: "icon-warning",
        })
        .then(() => {
          this.deleteSnapShot()
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
        _this.qemuTaskList = quickSort(
          _this.db.nodeTaskList,
          prop,
          order === "ascending" ? "+" : "-"
        );
    },
    /**
     * Modal
     */
    showModal(type) {
      this.modalType = type;
      this.param =
        type !== "create"
          ? this.db.snapshotList.filter((item) => item.name == this.current)[0]
          : {};
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
          this.title = `Create: Snapshot`;
          break;
        case "edit":
          this.title = `Edit: Snapshot`;
          break;
      }
    },
    /**
     * Render sync
     */
    renderSync(value, type, recode) {
      if (!value) {
        return "-";
      }
      if (type === "last") {
        if (record.data.pid) {
          return gettext("syncing");
        }
      } else {
        let now = new Date(),
          next = new Date(value * 1000);
        if (next < now) {
          return gettext("pending");
        }
      }
      return dateFormat(new Date(value * 1000), "yyyy-MM-dd hh:mm:ss");
    },
    /**
     * Duration
     */
    render_duration(value) {
      if (value === undefined) {
        return "-";
      }
      return format_duration_short(value);
    },
    closeDeleteLog() {
      this.showDeleteLog = false;
      this.__init__();
      if (this.interVal) {
        clearInterval(this.interVal);
        this.interVal = null;
      }
    },
    //Rollback
    handleRollback() {
      this.$confirm
        .confirm({
          msg: `Are you sure you want to rollback ${this.current}?`,
          icon: "icon-question",
        })
        .then((res) => {
          this.rollback(this.current).catch((res) => {
            this.$confirm.info({
              msg: res,
            });
          });
        });
    },
    //Clone VM
    handleClone() {
      this.visibleclone = true;
    },
  },
  beforeDestroy() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
    }
  },
};
</script>

<style lang="less" scoped>
.icon {
  background-image: url(~@images/elbow-end.png);
  height: 15px;
  display: inline-block;
  width: 16px;
  background-repeat: no-repeat;
}

.is-active {
  background: #1989fa;
  color: #fff;
}

.progress {
  width: 90%;
  position: relative;
  height: 30px;
  line-height: 30px;
  background: #f5f5f5;
  padding: 0px 10px;
  margin: 90px 0px;
  text-align: center;

  &-inner {
    position: absolute;
    height: 30px;
    line-height: 30px;
    animation: progress 3s infinite;
    background: #369;
  }
}

@keyframes progress {
  0% {
    width: 0%;
  }

  25% {
    width: 25%;
  }

  50% {
    width: 50%;
  }

  75% {
    width: 75%;
  }

  100% {
    width: 100%;
  }
}

.tree {
  position: absolute;
}

.list {
  padding-top: 7px;
  font-size: 14px;
}

.list-left {
  padding-left: 74px;
}

.list .row {
  height: 48px;
  line-height: 48px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list .row-title {
  height: 31px;
  box-shadow: inset 0 -1px 0 0 #e2eef4;
  margin-bottom: 20px;
}

.list .row-title .name {
  display: inline-block;
  width: 24%;
}

.list .row-title .size {
  display: inline-block;
  width: 24%;
}

.list .row-title .date {
  display: inline-block;
  width: 24%;
}

.list .row-title .description {
  display: inline-block;
  width: 24%;
}

.list .row .name {
  display: inline-block;
  width: 24%;
  color: #3c73b9;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: 48px;
  line-height: 48px;
}

.list .row .description {
  display: inline-block;
  width: 24%;
  color: #3c73b9;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: 48px;
  line-height: 48px;
}

.list .row .root-name {
  display: inline-block;
  width: 24%;
  height: 48px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 48px;
}

.list .row .size {
  display: inline-block;
  width: 24%;
  height: 48px;
  line-height: 48px;
}

.list .row .date {
  display: inline-block;
  width: 24%;
  height: 48px;
  line-height: 48px;
  vertical-align: top;
}

.snapshot.link {
  fill: none !important;
  stroke: #5e6978 !important;
  stroke-width: 1px !important;
}

.hidden {
  display: none !important;
}
</style>
