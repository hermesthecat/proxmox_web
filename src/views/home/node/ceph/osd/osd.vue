<template>
  <page-template>
    <div slot="toolbar-left">
      <m-button icon="fa fa-refresh" type="primary" @on-click="__init__()">Reload</m-button>
      <m-button icon="el-icon-plus" type="primary" @on-click="showModal('create')">Create</m-button>
      <m-button icon="el-icon-plus" type="primary" @on-click="visibleFlag = true">Manage</m-button>
    </div>
    <div slot="toolbar-right" style="text-align: right">
      <ul class="tab-container">
        <li class="tab-item" :class="{
          active: isIn,
          disabled: !current || current.type !== 'osd',
        }" @click="handleChangeTab('in')">
          <span class="circle"></span>in
        </li>
        <li class="tab-item" :class="{
          active: isOut,
          disabled: !current || current.type !== 'osd',
        }" @click="handleChangeTab('out')">
          <span class="circle-out"></span>out
        </li>
      </ul>
      <m-dropdown trigger="click" icon="fa fa-user" @on-change="handleCommand" style="
          width: 8rem;
          height: 30px;
          line-height: 30px;
          color: #fff !important;
        ">
        <span slot="label">
          <m-button type="primary" style="position: absolute; left: -1px; top: -1px; right: -1px"
            icon="el-icon-plus">More Operations</m-button>
        </span>
        <m-dropdown-item command="start" icon="fa fa-play" :disabled="!current">Start</m-dropdown-item>
        <m-dropdown-item command="stop" icon="fa fa-stop"
          :disabled="!current || inStatus('down')">Stop</m-dropdown-item>
        <m-dropdown-item command="restart" icon="fa fa-refresh"
          :disabled="!current || inStatus('down')">Restart</m-dropdown-item>
        <m-dropdown-item command="clear" icon="fa fa-refresh">Scrub</m-dropdown-item>
        <m-dropdown-item command="deepClear" icon="fa fa-refresh">Deep Scrub</m-dropdown-item>
        <m-dropdown-item command="clean" icon="fa fa-refresh" :disabled="inStatus('up')">Clean</m-dropdown-item>
      </m-dropdown>
    </div>
    <div slot="page-content">
      <el-table :data="treeData" row-key="id" default-expand-all highlight-current-row :row-class-name="setRowClassName"
        :current-row-key="currentRowKey" @row-click="handleSingleSelect" ref="dataTable"
        :tree-props="{ children: 'children' }">
        <el-table-column label="Name" prop="name">
          <template slot-scope="scope">
            <i :class="{
              'fa x-fa-tree fa-server':
                scope.row.type && scope.row.type === 'root',
              'fa x-fa-tree fa-building':
                scope.row.type && scope.row.type === 'host',
              'fa x-fa-tree fa-hdd-o':
                scope.row.type && scope.row.type === 'osd',
            }"></i>
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="Category" prop="type"></el-table-column>
        <el-table-column label="OSD Type" prop="osdtype"></el-table-column>
        <el-table-column label="Status" prop="status">
          <template slot-scope="scope" v-if="scope.row.type === 'osd'">
            {{ scope.row.status }}
            <i :class="render_statusCls(scope.row.status, scope.row)[0]"></i>
            / {{ scope.row && scope.row.in && scope.row.in ? "in" : "out" }}
            <i :class="render_statusCls(scope.row.status, scope.row)[1]"></i>
          </template>
        </el-table-column>
        <el-table-column label="Version" prop="version"></el-table-column>
        <el-table-column label="weight" prop="crush_weight">
          <template slot-scope="scope" v-if="scope.row.type === 'osd'">
            {{
              flotToFixed(
                scope.row && scope.row.crush_weight && scope.row.crush_weight,
                5
              )
            }}
          </template>
        </el-table-column>
        <el-table-column label="reweight" prop="reweight">
          <template slot-scope="scope" v-if="scope.row.type === 'osd'">
            {{
              flotToFixed(
                scope.row && scope.row.reweight && scope.row.reweight,
                5
              )
            }}
          </template>
        </el-table-column>
        <el-table-column label="Used (%)" prop="">
          <template slot-scope="scope" v-if="scope.row.type === 'osd'">
            {{
              flotToFixed(
                (scope.row &&
                  scope.row.percent_used &&
                  scope.row.percent_used) ||
                0,
                2
              )
            }}
          </template>
        </el-table-column>
        <el-table-column label="Total" prop="osd_size">
          <template slot-scope="scope">
            {{ byteToSize(scope.row.total_space ? scope.row.total_space : 0) }}
          </template>
        </el-table-column>
        <el-table-column label="Apply/Commit Latency(ms)">
          <template slot-scope="scope">
            {{ render_osd_latency(scope.row) }}
          </template>
        </el-table-column>
      </el-table>
      <create-osd :visible="visible" v-if="visible" @close="
        visible = false;
      __init__();
      " :title="title"></create-osd>
      <add-flags :visible="visibleFlag" v-if="visibleFlag" @close="
        visibleFlag = false;
      __init__();
      "></add-flags>
      <m-dialog :visible="visibleClean" v-if="visibleClean" @confirm="confirm" @close="
        visibleClean = false;
      __init__();
      " @cancel="
          visibleClean = false;
        __init__();
        " :title="`Destroy: Ceph OSD ${current.name}`">
        <template slot="content">
          <div class="m-form__content">
            <div class="m-form__section">
              <m-checkbox v-model="clean" label="Clean Disk" labelWidth="100px"></m-checkbox>
            </div>
          </div>
        </template>
      </m-dialog>
    </div>
  </page-template>
</template>

<script>
import PageTemplate from "@src/components/page/PageTemplate";
import CephHttp from "@src/views/home/node/ceph/http";
import CreateOsd from "./CreateOsd";
import { byteToSize, flotToFixed } from "@libs/utils/index";
import AddFlags from "./addFlags";
export default {
  name: "osd",
  mixins: [CephHttp],
  components: {
    CreateOsd,
    PageTemplate,
    AddFlags,
  },
  data() {
    return {
      tab: "",
      visible: false,
      title: "",
      treeData: [],
      current: "",
      currentRowKey: "",
      visibleClean: false,
      clean: false,
      visibleFlag: false,
    };
  },
  computed: {
    isIn() {
      if (
        this.current &&
        this.current.type === "osd" &&
        this.current.in === 1
      ) {
        return true;
      } else {
        return false;
      }
    },
    isOut() {
      if (
        this.current &&
        this.current.type === "osd" &&
        this.current.in === 0
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  mounted() {
    this.__init__();
  },
  methods: {
    byteToSize, //Format disk size
    flotToFixed, //Keep decimal places for floating point numbers
    //Initialize request
    __init__() {
      this.queryConfig("osd", { _dc: new Date().getTime() }).then((res) => {
        this.treeData = res.root.children;
      });
    },
    //Set selected row highlight
    setRowClassName({ row, rowIndex }) {
      if (row.id === this.current.id) {
        this.current = row;
        return "current-row";
      }
    },
    //Show create osd dialog
    showModal(type) {
      this.title = type === "create" ? "Create: OSD" : "";
      this.visible = true;
    },
    //Check if data is in certain status
    inStatus() {
      let states = [];
      for (let i in arguments) {
        states.push(arguments[i]);
      }
      return states.some((state) => state === this.current.status);
    },
    //Confirm add flag
    confirm() {
      this.deleteOSDInOrOut(this.current.id, { cleanup: this.clean ? 1 : 0 });
    },
    //Handle dropdown operations
    handleCommand(operate) {
      if (!this.current || this.current.type !== "osd") return;
      switch (operate) {
        case "clear":
          this.$confirm
            .confirm({
              msg: `Are you sure you want to scrub ${this.current.name}?`,
              icon: "icon-question",
            })
            .then((res) => {
              this.updateOSDInOrOut(this.current.id, "scrub");
            });
          break;
        case "deepClear":
          this.$confirm
            .confirm({
              msg: `Are you sure you want to scrub ${this.current.name}?\nCaution: This can reduce performance while it is running`,
              type: "warning",
              icon: "icon-warning",
            })
            .then((res) => {
              this.updateOSDInOrOut(this.current.id, "scrub", { deep: 1 });
            });
          break;
        case "clean":
        case "deepClear":
          this.$confirm
            .confirm({
              msg: `Are you sure you want to scrub ${this.current.name}?\nCaution: This can reduce performance while it is running`,
              type: "warning",
              icon: "icon-warning",
            })
            .then((res) => {
              this.visibleClean = true;
            });
          break;
      }
      if (["start", "restart", "stop"].includes(operate))
        this.operateCeph(this.current.host, operate, {
          service: this.current.name,
        });
    },
    //Switch tab
    handleChangeTab(tab) {
      if (!this.current || this.current.type !== "osd") return;
      this.tab = tab;
      switch (tab) {
        case "in":
          this.updateOSDInOrOut(this.current.id, "in").then((res) => {
            this.__init__();
          });
          break;
        case "out":
          this.updateOSDInOrOut(this.current.id, "out").then((res) => {
            this.__init__();
          });
          break;
      }
    },
    //Render table last column
    render_osd_latency(recode) {
      if (recode.type !== "osd") {
        return "";
      }
      let commit_ms = recode.commit_latency_ms || 0,
        apply_ms = recode.apply_latency_ms || 0;
      return apply_ms + " / " + commit_ms;
    },
    //Render status icons
    render_statusCls(value, rec) {
      if (!value) return ["", ""];
      let inout = rec["in"] ? "in" : "out",
        updownicon =
          value === "up"
            ? "fa good fa-arrow-circle-up"
            : "fa critical fa-arrow-circle-down",
        inouticon = rec["in"] ? "fa good fa-circle" : "fa warning fa-circle-o";
      return [updownicon, inouticon];
    },
    //Table single selection
    handleSingleSelect(row) {
      this.current = row;
    },
  },
};
</script>

<style scoped="" lang="less">
.tab {
  &-container {
    border-radius: 2px;
    display: inline-flex;
    border: none;
    background: #e0eaf3;
    background-image: linear-gradient(180deg, #5ca4e6, #aaccf0);
    color: #fff;
    cursor: pointer;

    .active {
      background: #21bf4b;
      color: #fff;
      transition: all 0.4s linear;
    }
  }

  &-item {
    flex: 1 1 auto;
    height: 30px;
    line-height: 30px;
    padding: 0px 20px;
    text-align: center;

    .circle-out {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #333;
      position: relative;
      margin-right: 10px;
      display: inline-block;
      vertical-align: middle;
    }

    .circle {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #333;
      position: relative;
      margin-right: 10px;
      display: inline-block;
      vertical-align: middle;

      &:after {
        content: "";
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        background: #fff;
        transform: translate(-50%, -50%);
      }
    }
  }
}

.snap-table {
  display: table;
  width: 100%;
}

.snap-table-tr,
.snap-table-header__tr {
  display: table-row;
  height: 35px;
  line-height: 35px;
}

.snap-table-td {
  display: table-cell;
}

.snap-table-header__tr>.snap-table-td {
  border-bottom: 1px solid #f5f5f5;
}

/deep/.el-table__body tr.current-row>td {
  background-image: linear-gradient(180deg, #0076e2, #095cb5);
  color: #fff;
}
</style>
