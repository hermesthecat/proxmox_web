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
            icon="el-icon-plus">Add</m-button>
        </span>
        <template v-for="item in menu_items">
          <m-dropdown-item v-if="/^fa/.test(item.iconCls)" :key="item.itemId + '_fa'" :command="item.itemId"
            :icon="item.iconCls" :disabled="item.disabled">{{ item.text }}</m-dropdown-item>
          <m-dropdown-item v-else :key="item.itemId + '_other'" :command="item.itemId" :name="item.iconCls"
            :disabled="item.disabled">{{ item.text }}</m-dropdown-item>
        </template>
      </m-dropdown>
      <m-button type="primary" @on-click="handleResume()" icon="el-icon-edit"
        :disabled="!canResume()">Restore</m-button>
      <m-button type="warning" @on-click="handleCommand('', 'edit')" icon="el-icon-video-play"
        :disabled="!current">Edit</m-button>
      <m-button type="danger" @on-click="handleDelete()" icon="el-icon-delete" :disabled="!inType('memory', 'swap', 'cores', 'rootfs') ||
        canResume() ||
        !current
        ">Delete</m-button>
      <m-button type="info" @on-click="handleCommand('updatedisksize', 'updatedisksize')" icon="el-icon-edit-outline"
        :disabled="inType('rootfs', 'mp')">Resize Disk</m-button>
      <m-button type="info" @on-click="handleCommand('migrate', 'migrate')" icon="el-icon-edit-outline"
        :disabled="inType('rootfs', 'mp')">Move Disk</m-button>
    </div>
    <div slot="page-content">
      <edit-modal :visible="visible" :type="type" v-if="visible" :modal-type="modalType" :param="param" :title="title"
        @close="
          visible = false;
        __init__();
        "></edit-modal>
      <el-table :data="hardwareList" :show-header="false" highlight-current-row @row-click="handleSingleSelect">
        <el-table-column width="55px">
          <template slot-scope="scope">
            <el-radio :label="scope.row.type" v-model="current">&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column label="Name" prop="name" width="200px">
          <template slot-scope="scope">
            <div>
              <base-icon class="hardware-icon" :name="scope.row.icon" v-if="!/^[fa]/.test(scope.row.icon)"></base-icon>
              <i v-else :class="scope.row.icon" class="fa"></i>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Value" prop="value">
          <template slot-scope="scope">
            <div>
              {{
                scope.row &&
                scope.row.render &&
                String(scope.row.render(false)).replace(/(delete\:true)$/, "")
              }}
            </div>
            <div v-show="scope.row &&
              scope.row.render &&
              String(scope.row.render(false)).indexOf('delete:true') >= 0
              " class="pending" style="text-decoration: line-through">
              {{
                String(scope.row.render(false)).replace(/(delete\:true)$/, "")
              }}
            </div>
            <div class="pending">
              {{ scope.row && scope.row.render && scope.row.render(true) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </page-template>
</template>

<script>
import VolumeHttp from "@src/views/home/qemu/volume/http";
import {
  byteToSize,
  isEmpty,
  stringFormat,
  render_qemu_bios,
  render_kvm_vga_driver,
  forEachMP,
} from "@libs/utils/index";
import { gettext } from "@src/i18n/local_zhCN.js";
import BaseIcon from "@src/components/icon/BaseIcon.vue";
import PageTemplate from "@src/components/page/PageTemplate.vue";
import EditModal from "./EditModal";
export default {
  name: "Volume",
  mixins: [VolumeHttp],
  components: {
    BaseIcon,
    PageTemplate,
    EditModal,
  },
  data() {
    let _this = this;
    return {
      hardwareList: [],
      store: {},
      current: "",
      currentObj: "",
      visible: false,
      type: "",
      modalType: "create",
      param: {},
      jobText: "Deleting...",
      statusObj: {},
      jobVisible: "",
      jobTitle: "",
      title: "",
      //Configurable disk settings
      hardware_counts: {
        net: 32,
        usb: 5,
        hostpci: 16,
        audio: 1,
        efidisk: 1,
        serial: 4,
        rng: 1,
      },
      //Add menu
      menu_items: [
        {
          text: "Mount Point",
          iconCls: "fa fa-fw fa-hdd-o black",
          itemId: "adddisk",
          disabled:
            _this.db && _this.db.cap && !_this.db.cap.vms["VM.Config.Disk"],
        },
      ],
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //Initialize request
    __init__() {
      let _this = this;
      _this.queryResource().then((res) => {
        //Assemble data to get {key: value} format for later processing
        _this.store = _this.db.volumeList.reduce((target, source) => {
          if (!target.hasOwnProperty(source.key)) {
            target[source.key] = {
              data: source,
            };
          }
          return target;
        }, {});
        //Table data
        this.hardwareList = [
          {
            name: gettext("Memory"), //Name
            type: "memory", //Data type
            icon: "icon-ram", //Icon
            itemId: "editMemory", //Add modal id
            render: function (pending) { //Render value
              if (pending) return;
              var res = "";
              var max = _this.getObjectValue("memory", 512, pending);
              var balloon = _this.getObjectValue("balloon", undefined, pending);
              var shares = _this.getObjectValue("shares", undefined, pending);
              res = byteToSize(max * 1024 * 1024);
              if (balloon !== undefined && balloon > 0) {
                res = byteToSize(balloon * 1024 * 1024) + "/" + res;
                if (shares) {
                  res += " [shares=" + shares + "]";
                }
              } else if (balloon === 0) {
                res += " [balloon=0]";
              }
              if (/^[0]/.test(res)) return;
              return res;
            },
          },
          {
            name: gettext("Swap"),
            type: "swap",
            icon: "icon-swap",
            itemId: "editMemory",
            render: function (pending) {
              if (pending) return;
              let cpulimit = _this.getObjectValue(
                "cpulimit",
                undefined,
                pending
              );
              let cpuunits = _this.getObjectValue(
                "cpuunits",
                undefined,
                pending
              );
              let res = "",
                value =
                  (_this.store.swap &&
                    _this.store.swap.data &&
                    _this.store.swap.data.value) ||
                  "";
              if (value) {
                res = byteToSize(value * 1024 * 1024);
              } else {
                res = gettext("unlimited");
              }

              if (cpulimit) {
                res += " [cpulimit=" + cpulimit + "]";
              }

              if (cpuunits) {
                res += " [cpuunits=" + cpuunits + "]";
              }
              return res;
            },
          },
          {
            name: gettext("Cores"),
            type: "cores",
            icon: "icon-cpu",
            itemId: "editCores",
            render: function (pending) {
              if (pending) return;
              return (
                (_this.store.cores &&
                  _this.store.cores.data &&
                  String(_this.store.cores.data.value)) ||
                ""
              );
            },
          },
          {
            name: gettext("Root Disk"),
            type: "rootfs",
            itemId: "editDisk",
            icon: "fa fa-hdd-o",
            render: function (pending) {
              if (pending)
                return _this.store.rootfs &&
                  _this.store.rootfs.data &&
                  _this.store.rootfs.data.pending
                  ? _this.store.rootfs.data.pending
                  : "";
              else
                return _this.store.rootfs &&
                  _this.store.rootfs.data &&
                  _this.store.rootfs.data.value
                  ? _this.store.rootfs.data.value
                  : "Default";
            },
          },
        ];

        forEachMP(function (bus, i) {
          let confid = bus + i;
          let group = 5;
          let header;
          let keys = Object.keys(_this.store);
          if (!keys.includes(confid)) {
            return;
          }
          if (bus === "mp") {
            header = gettext("Mount Point") + " (" + confid + ")";
          } else {
            header = gettext("Unused Disk") + " " + i;
            group += 1;
          }
          _this.hardwareList.push({
            name: header,
            type: confid,
            icon: "fa fa-hdd-o",
            itemId: "editDisk",
            group: group,
            order: i,
            render: (pending) => {
              if (pending) {
                return _this.store[confid] &&
                  _this.store[confid].data &&
                  !isEmpty(_this.store[confid].data.pending)
                  ? _this.store[confid].data.pending
                  : "";
              } else {
                return _this.store[confid] &&
                  _this.store[confid].data &&
                  !isEmpty(_this.store[confid].data.value) &&
                  _this.store[confid].data.delete
                  ? _this.store[confid].data.value + "delete:true"
                  : _this.store[confid] &&
                    _this.store[confid].data &&
                    !isEmpty(_this.store[confid].data.value)
                    ? _this.store[confid].data.value
                    : "";
              }
            },
          });
        }, true);
      });
    },
    handleDelete() {
      this.$confirm
        .confirm({
          msg: `Are you sure you want to delete this ${this.currentObj.name}?`,
          icon: "icon-question",
        })
        .then((res) => {
          this.deleteHareWare({ delete: this.current })
            .then((res) => {
              this.__init__();
            })
            .catch((res) => {
              this.$confirm
                .info({
                  msg: res,
                })
                .then((res) => this.__init__())
                .catch((res) => this.__init__());
            });
        });
    },
    getObjectValue(type, defaultValue, pending) {
      let _this = this;
      let rec = this.store[type];
      if (rec) {
        let value = rec.data.value;
        if (pending) {
          if (!isEmpty(rec.data.pending)) {
            value = rec.data.pending;
          } else if (rec.data["delete"] === 1) {
            value = defaultValue;
          } else {
            value = value;
          }
          return value;
        } else {
          if (!isEmpty(value)) {
            return value;
          } else {
            return defaultValue;
          }
        }
      }
      return defaultValue;
    },
    //Add disk etc.
    handleCommand(type, modaltype = "create") {
      //If modalType exists, it means adding disk type
      this.modalType =
        modaltype === "migrate" ||
          modaltype === "updatedisksize" ||
          modaltype === "create"
          ? type
          : this.currentObj.itemId;
      this.param = modaltype !== "create" ? this.currentObj : {};
      this.visible = true;
      this.setTitle(this.modalType);
    },
    //Set modal title
    setTitle(type) {
      switch (type) {
        case "editMemory":
          this.title = "Edit: Memory/Swap";
          break;
        case "editCores":
          this.title = "Edit: Cores";
          break;
        case "editDisk":
          this.title = "Edit: Disk";
          break;
        case "adddisk":
          this.title = "Add: Mount Point";
          break;
        case "migrate":
          this.title = "Move Volume";
          break;
        case "updatedisksize":
          this.title = "Resize Disk";
          break;
      }
    },
    //Move disk
    handleMoveDisk() {
      //If modalType exists, it means adding disk type
      this.type = "migratedisk";
      //Create or edit
      this.modalType = "create";
      this.param = this.currentObj;
      this.visible = true;
    },
    handleSingleSelect(row) {
      this.current = row.type;
      this.currentObj = row;
    },
    inType() {
      let states = [],
        arg = arguments,
        _this = this;
      if (this.current === "") return true;
      for (let i in arguments) {
        states.push(arguments[i]);
      }
      if (
        _this.store[_this.current] &&
        _this.store[_this.current].data &&
        _this.store[_this.current].data.delete
      )
        return false;
      return !states.some((it) => {
        let regx = new RegExp("\^\(" + it + "\)", "g");
        return regx.test(_this.current);
      });
    },
    //Can restore when data has pending or delete status
    canResume() {
      return (this.store[this.current] &&
        this.store[this.current].data &&
        this.store[this.current].data.pending) ||
        (this.store[this.current] &&
          this.store[this.current].data &&
          this.store[this.current].data.delete)
        ? true
        : false;
    },
    //Restore
    handleResume() {
      let param = {};
      if (this.current === "memory") {
        param["revert"] = ["memory", "balloon", "shares"].join(",");
      } else if (this.current === "sockets") {
        param["revert"] = [
          "sockets",
          "cpu",
          "cores",
          "numa",
          "vcpus",
          "cpulimit",
          "cpuunits",
        ].join(",");
      } else {
        param["revert"] = this.current;
      }
      this.resume(param).then((res) => {
        this.__init__();
      });
    },
    isCloudInit(confid) {
      let _this = this;
      return (
        (_this.store[confid] &&
          _this.store[confid].data &&
          !isEmpty(_this.store[confid].data.pending) &&
          /vm-.*-cloudinit/.test(_this.store[confid].data.pending)) ||
        (_this.store[confid] &&
          _this.store[confid].data &&
          !isEmpty(_this.store[confid].data.value) &&
          /vm-.*-cloudinit/.test(_this.store[confid].data.value))
      );
    },
  },
};
</script>

<style lang="less" scoped>
.pending {
  color: #f87c7c;
}

.hardware-icon {
  width: 16px;
  vertical-align: middle;
  height: 19px;
  line-height: 19px;
  margin-right: 5px;
  background-size: 16px;
}

/deep/.el-table td,
.el-table th {
  padding: 0px;
}

/deep/.base-icon {
  background-size: 16px;
}
</style>
