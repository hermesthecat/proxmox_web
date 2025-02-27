<template>
  <page-template>
    <div slot="toolbar-left">
      <m-dropdown trigger="click" @on-change="handleCommand" style="
          width: 8rem;
          height: 30px;
          line-height: 30px;
          color: #fff !important;
        ">
        <span slot="label">
          <m-button type="primary" style="position: absolute; left: -1px; top: -1px; right: -1px"
            icon="el-icon-plus">Create</m-button>
        </span>
        <m-dropdown-item v-for="item in menu_items" :key="item.iftype" :command="item.iftype">{{ item.text
          }}</m-dropdown-item>
      </m-dropdown>
      <m-button type="primary" @on-click="handleResume()" icon="el-icon-edit" :disabled="!changes">Reset</m-button>
      <m-button type="warning" @on-click="handleCommand('edit')" icon="el-icon-video-play"
        :disabled="selectedList.length !== 1">Edit</m-button>
      <m-button type="info" @on-click="handleDelete()" icon="el-icon-view"
        :disabled="selectedList.length !== 1">Delete</m-button>
      <m-button type="info" @on-click="handleConfig()" icon="el-icon-edit-outline">Apply Configuration</m-button>
    </div>
    <div slot="page-content">
      <el-table :data="db.nodeNetWorkList" ref="dataTable" @selection-change="handleSelect"
        :default-sort="{ prop: 'iface', order: 'ascending' }">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="Name" prop="iface" sortable></el-table-column>
        <el-table-column label="Category" prop="type" sortable></el-table-column>
        <el-table-column label="Active" prop="active">
          <template slot-scope="scope">
            <table-info-state :content="scope.row.active && scope.row.active === 1 ? 'Yes' : 'No'
              " :state="scope.row.active && scope.row.active === 1
                  ? 'actived'
                  : 'unActived'
                "></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="Auto Start" prop="autostart">
          <template slot-scope="scope">
            <table-info-state :content="scope.row.autostart && scope.row.autostart === 1 ? 'Yes' : 'No'
              " :state="scope.row.autostart && scope.row.autostart === 1
                  ? 'actived'
                  : 'unActived'
                "></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="VLAN Aware" prop="bridge_vlan_aware">
          <template slot-scope="scope">
            <table-info-state :content="scope.row.bridge_vlan_aware && scope.row.bridge_vlan_aware === 1
                ? 'Yes'
                : 'No'
              " :state="scope.row.bridge_vlan_aware && scope.row.bridge_vlan_aware === 1
                  ? 'actived'
                  : 'unActived'
                "></table-info-state>
          </template>
        </el-table-column>
        <el-table-column label="Ports/Slaves" prop="bridge_ports" sortable></el-table-column>
        <el-table-column label="Bond Mode" prop="bond_mode" sortable></el-table-column>
        <el-table-column label="CIDR" prop="cidr" sortable></el-table-column>
        <el-table-column label="Gateway" prop="gateway" sortable></el-table-column>
        <el-table-column label="Comments" prop="comments"></el-table-column>
      </el-table>
      <create-network-modal :visible="visible" :isCreate="isCreate" :title="title" :param="param" @close="
        visible = false;
      queryNetWorkList();
      " v-if="visible" :iftype="iftype"></create-network-modal>
      <overview-card class="m-margin-top-10" v-if="changes" style="width: 100%">
        <div slot="title">
          Pending Changes (Activate by rebooting or using "Apply Configuration" (requires ifupdown2))
        </div>
        <template slot="content">
          {{ changes }}
        </template>
      </overview-card>
    </div>
  </page-template>
</template>
<script>
import NodeSystemHttp from "@src/views/home/node/system/network/http";
import PageTemplate from "@src/components/page/PageTemplate";
import OverviewCard from "@src/components/card/OverviewCard";
import Dialog from "@src/components/dialog/Dialog";
import MButton from "@src/components/button/Button";
import { dateFormat } from "@libs/utils/index";
import { network_iface_types } from "@libs/enum/enum";
import CreateNetworkModal from "./CreateNetWorkModal";
import { isEmpty } from "@libs/utils/index";
export default {
  name: "Replication",
  mixins: [NodeSystemHttp],
  components: {
    PageTemplate,
    MButton,
    Dialog,
    CreateNetworkModal,
    OverviewCard,
  },
  data() {
    return {
      visible: false,
      title: "Create: Copy Job",
      selectedList: [],
      isCreate: true,
      param: {},
      showLog: false,
      interVal: null,
      menu_items: [],
      visible: false,
      isCreate: false,
      iftype: "",
      title: "",
      changes: "",
      datetime: [
        dateFormat(
          new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd hh:mm:ss"
        ),
        dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss"),
      ],
      text: "",
      done: false,
      modalType: "progress",
      beginRefresh: false,
      types: ["bridge", "bond", "vlan", "ovs"],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //Initialize search
    __init__() {
      let _this = this;
      _this.menu_items = [];
      if (_this.types.indexOf("bridge") !== -1) {
        _this.menu_items.push({
          text: network_iface_types["bridge"],
          iftype: "bridge",
        });
      }

      if (_this.types.indexOf("bond") !== -1) {
        _this.menu_items.push({
          text: network_iface_types["bond"],
          iftype: "bond",
        });
      }

      if (_this.types.indexOf("vlan") !== -1) {
        _this.menu_items.push({
          text: network_iface_types["vlan"],
          iftype: "vlan",
        });
      }

      if (_this.types.indexOf("ovs") !== -1) {
        _this.menu_items.push(
          { text: network_iface_types["OVSBridge"], iftype: "OVSBridge" },
          {
            text: network_iface_types["OVSBond"],
            iftype: "OVSBond",
          },
          {
            text: network_iface_types["OVSIntPort"],
            iftype: "OVSIntPort",
          }
        );
      }
      _this.queryNetWorkList({ _dc: new Date().getTime() });
    },
    //Show modal dialog
    showModal(type) {
      this.type = type;
      this.isCreate = type === "create";
      this.title = type === "create" ? "Create: Copy Job" : "Edit: Copy Job";
      this.param = type === "create" ? {} : this.selectedList[0];
      this.visible = true;
    },
    //Check if button is clickable
    inStatus() {
      if (this.selectedList.length !== 1) return false;
      let states = [];
      for (let i in arguments) {
        states.unshift(arguments[i]);
      }
      return this.selectedList.every((it) =>
        states.some((state) => it.state === state)
      );
    },
    //Selection
    handleSelect(row) {
      this.selectedList = row;
    },
    handleOperate(operate) {
      if (operate !== "systemLog") {
        this.operateService(operate);
        this.modalType = "progress";
      } else {
        this.showLog = true;
        let param = {
          _dc: new Date().getTime(),
          start: 0,
          limit: 500,
          since: this.datetime[0],
          until: this.datetime[1],
          service: this.selectedList[0].service,
        };
        this.querySystemLog(param);
        this.modalType = "systemLog";
      }
    },
    upateSystemLog() {
      this.datetime[1] = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
      let param = {
        _dc: new Date().getTime(),
        start: 0,
        limit: 500,
        since: this.datetime[0],
        until: this.datetime[1],
        service: this.selectedList[0].service,
      };
      this.beginRefresh = true;
      this.querySystemLog(param).then(
        () => (this.beginRefresh = false),
        () => (this.beginRefresh = false)
      );
    },
    closeLog() {
      this.showLog = false;
      this.__init__();
    },
    //Choose creation method
    handleCommand(type) {
      let _this = this;
      _this.iftype = type === "edit" ? _this.selectedList[0].type : type;
      _this.isCreate = type !== "edit";
      let textList = _this.menu_items.filter((it) => {
        if (type !== "edit") {
          return it.iftype === type;
        } else {
          return it.iftype === _this.selectedList[0].type;
        }
      });
      _this.title =
        (type !== "edit" ? "Create: " : "Edit: ") +
        (!isEmpty(textList) ? textList[0].text : "Network Device");
      _this.param = type !== "edit" ? {} : _this.selectedList[0];
      _this.visible = true;
    },
    //Reset network
    handleResume() {
      this.resume();
    },
    //Delete network
    handleDelete() {
      this.$confirm
        .info({
          msg: "Are you sure you want to delete the following network?",
        })
        .then(() => {
          this.deleteNetWork()
            .then((res) => {
              this.queryNetWorkList();
            })
            .catch((res) => {
              this.$confirm.error({
                msg: res,
              });
            });
        });
    },
    //Apply configuration
    handleConfig() {
      this.$confirm
        .info({
          msg: "Do you want to apply pending network changes?",
          icon: "icon-question",
          _style: {
            width: "600px",
          },
        })
        .then(() => {
          this.netWorkConfig()
            .then((res) => {
              this.queryNetWorkList();
            })
            .catch((res) => {
              this.$confirm.error({
                msg: res,
              });
            });
        });
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

.content {
  background: #000;
  color: #fff;
  font-family: "Courier New", Courier, monospace;
  max-height: 350px;
  padding: 5px 20px;
  overflow: auto;
  letter-spacing: 0vw;
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

.refresh {
  animation: refresh-animation 0.5s infinite;
}

@keyframes refresh-animation {
  0% {
    rotate: (0deg);
  }

  25% {
    rotate: (90deg);
  }

  50% {
    rotate: (180deg);
  }

  75% {
    rotate: (270deg);
  }

  100% {
    rotate: (360deg);
  }
}
</style>
