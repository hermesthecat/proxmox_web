<template>
  <page-template v-loading="!isCi" element-loading-text="Cloud Init drive not found">
    <div slot="toolbar-left">
      <m-button type="warning" @on-click="handleCommand" icon="el-icon-video-play" :disabled="!current">Edit</m-button>
      <m-button type="danger" @on-click="handleDelete()" icon="el-icon-delete" :disabled="!current ||
        (currentObj.type !== 'cipassword' &&
          !/ciDriveId/.test(currentObj.type))
        ">{{ "Delete" }}</m-button>
      <m-button type="info" @on-click="getCdRom" icon="el-icon-edit-outline">Regenerate Image</m-button>
    </div>
    <div slot="page-content">
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
              {{ scope.row && scope.row.render && scope.row.render(false) }}
            </div>
            <div class="pending" v-if="scope.row && scope.row.render && scope.row.render(true)">
              {{ scope.row && scope.row.render && scope.row.render(true) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
      <edit-modal v-if="visible" :visible="visible" :title="title" :param="param" :modal-type="modalType" @close="
        visible = false;
      __init__();
      "></edit-modal>
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
  forEachBus,
  parseQemuDrive,
} from "@libs/utils/index";
import { gettext } from "@src/i18n/local_zhCN.js";
import BaseIcon from "@src/components/icon/BaseIcon.vue";
import PageTemplate from "@src/components/page/PageTemplate.vue";
import HardwareAddModal from "@src/views/home/qemu/volume/HardwareAddModal";
import EditModal from "./EditModal";
export default {
  name: "Volume",
  mixins: [VolumeHttp],
  components: {
    BaseIcon,
    PageTemplate,
    HardwareAddModal,
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
      statusObj: {},
      title: "",
      isCi: false,
      ciDriveId: "",
      ciDrive: "",
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    //Initialize request
    async __init__() {
      let _this = this;
      _this.queryResource().then(async (res) => {
        //Assemble data to get data in {key: value} format for later data processing
        _this.store = await _this.db.volumeList.reduce((target, source) => {
          if (!target.hasOwnProperty(source.key)) {
            target[source.key] = {
              data: source,
            };
          }
          return target;
        }, {});
        _this.isCi = Object.keys(_this.store).some((item) => {
          if (/ide(\d)$/.test(item)) {
            return _this.isCloudInit(item);
          }
        });
        //Table data
        this.hardwareList = [
          {
            name: "User", //Name
            type: "ciuser", //Data type
            icon: "fa fa-user", //Icon
            itemId: "editUser", //Add dialog id
            render: function (pending) {
              //Render value
              if (pending) {
                return (
                  (_this.store &&
                    _this.store["ciuser"] &&
                    _this.store["ciuser"].data &&
                    _this.store["ciuser"].data.pending) ||
                  ""
                );
              }
              return (
                (_this.store &&
                  _this.store["ciuser"] &&
                  _this.store["ciuser"].data &&
                  _this.store["ciuser"].data.value) ||
                "Default"
              );
            },
          },
          {
            name: "Password",
            type: "cipassword",
            itemId: "editPassword",
            icon: "fa fa-unlock",
            render: function (pending) {
              if (pending) {
                return (
                  (_this.store &&
                    _this.store["cipassword"] &&
                    _this.store["cipassword"].data &&
                    _this.store["cipassword"].data.pending) ||
                  ""
                );
              }
              return (
                (_this.store &&
                  _this.store["cipassword"] &&
                  _this.store["cipassword"].data &&
                  _this.store["cipassword"].data.value) ||
                "None"
              );
            },
          },
          {
            name: "DNS Domain",
            type: "searchdomain",
            itemId: "editDnsDomain",
            icon: "fa-desktop",
            render: function (pending) {
              if (pending) {
                return (
                  (_this.store &&
                    _this.store["searchdomain"] &&
                    _this.store["searchdomain"].data &&
                    _this.store["searchdomain"].data.pending) ||
                  ""
                );
              }
              return (
                (_this.store &&
                  _this.store["searchdomain"] &&
                  _this.store["searchdomain"].data &&
                  _this.store["searchdomain"].data.value) ||
                "Use host settings"
              );
            },
          },
          {
            name: "DNS Server",
            type: "nameserver",
            itemId: "editDnsServer",
            icon: "fa-desktop",
            render: function (pending) {
              if (pending) {
                return (
                  (_this.store &&
                    _this.store["nameserver"] &&
                    _this.store["nameserver"].data &&
                    _this.store["nameserver"].data.pending) ||
                  ""
                );
              }
              return (
                (_this.store &&
                  _this.store["nameserver"] &&
                  _this.store["nameserver"].data &&
                  _this.store["nameserver"].data.value) ||
                "Use host settings"
              );
            },
          },
          {
            name: "SSH Public Key",
            type: "sshkeys",
            icon: "fa-cogs",
            itemId: "editSsh",
            render: function (pending) {
              if (pending) {
                return (
                  (_this.store &&
                    _this.store["sshkeys"] &&
                    _this.store["sshkeys"].data &&
                    _this.store["sshkeys"].data.pending) ||
                  ""
                );
              }
              return (
                (_this.store &&
                  _this.store["sshkeys"] &&
                  _this.store["sshkeys"].data &&
                  _this.store["sshkeys"].data.value) ||
                "None"
              );
            },
          },
        ];
        if (this.ciDriveId) {
          this.hardwareList.push({
            name: `IP Configuration(${this.ciDriveId.replace(/ide/, "net")})`,
            type: "ciDriveId",
            icon: "fa fa-exchange",
            itemId: "editDriveId",
            render: function (pending) {
              var id = _this.ciDriveId.replace(/ide/, "net");
              var match = id.match(/^net(\d+)$/);
              var val = "";
              if (match) {
                val = _this.getObjectValue("ipconfig" + match[1], "", pending);
              }
              return val;
            },
          });
        }
      });
    },
    getObjectValue(type, defaultValue, pending) {
      debugger;
      let _this = this;
      let rec = _this.store[type];
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
    handleDelete() {
      this.$confirm
        .confirm({
          msg: `Are you sure you want to delete this ${this.currentObj.name}?`,
          icon: "icon-question",
        })
        .then((res) => {
          if (this.current === "ciDriveId")
            this.current = this.ciDriveId.replace(/ide/, "ipconfig");
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
    isAtLimit(type) {
      let _this = this,
        hardware_counts = {
          net: 32,
          usb: 5,
          hostpci: 16,
          audio: 1,
          efidisk: 1,
          serial: 4,
          rng: 1,
        };
      const counts = _this.setCounts();
      return counts[type] >= hardware_counts[type];
    },
    setCounts() {
      let _this = this,
        hardware_counts = {
          net: 32,
          usb: 5,
          hostpci: 16,
          audio: 1,
          efidisk: 1,
          serial: 4,
          rng: 1,
        };
      return Object.keys(_this.store).reduce((prev, curr) => {
        Object.keys(hardware_counts).forEach((it) => {
          if (
            !prev.hasOwnProperty(it) &&
            Object.keys(_this.store).join("").indexOf(it) > 0
          ) {
            prev[it] = 1;
          } else {
            let regx = new RegExp(`\^\(${it}\)`, "g");
            if (regx.test(curr)) {
              prev[it]++;
            }
          }
        });
        return prev;
      }, {});
    },
    render_qemu_machine(value) {
      return value || "Default" + " (i440fx)";
    },
    render_scsihw: function (value) {
      if (!value) {
        return "Default" + " (LSI 53C895A)";
      } else if (value === "lsi") {
        return "LSI 53C895A";
      } else if (value === "lsi53c810") {
        return "LSI 53C810";
      } else if (value === "megasas") {
        return "MegaRAID SAS 8708EM2";
      } else if (value === "virtio-scsi-pci") {
        return "VirtIO SCSI";
      } else if (value === "virtio-scsi-single") {
        return "VirtIO SCSI single";
      } else if (value === "pvscsi") {
        return "VMware PVSCSI";
      } else {
        return value;
      }
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
    handleCommand() {
      //Create or edit
      this.modalType = this.currentObj.itemId;
      this.param = this.currentObj || {};
      this.title = "Edit: " + this.currentObj.name;
      this.visible = true;
    },
    //Change disk size
    getCdRom() {
      let disk = parseQemuDrive(this.ciDriveId, this.ciDrive),
        storage = "",
        eject_params = {},
        insert_params = {},
        stormatch = disk.file.match(/^([^\:]+)\:/);
      if (stormatch) {
        storage = stormatch[1];
      }
      eject_params[this.ciDriveId] = "none,media=cdrom";
      insert_params[this.ciDriveId] = storage + ":cloudinit";
      this.updateHardWare(eject_params)
        .then((res) => {
          this.updateHardWare(insert_params).then((res) => {
            this.__init__();
          });
        })
        .then((res) => {
          this.__init__();
        })
        .catch((res) => {
          this.$confirm.confirm({
            msg: res,
          });
        });
    },
    handleSingleSelect(row) {
      this.current = row.type;
      this.currentObj = row;
    },
    isCloudInit(confid) {
      let _this = this;
      if (
        confid.match(/^(ide|scsi|sata)\d+$/) &&
        _this.store[confid] &&
        _this.store[confid].data &&
        !isEmpty(_this.store[confid].data.value) &&
        /vm-.*-cloudinit/.test(_this.store[confid].data.value)
      ) {
        this.ciDriveId = confid;
        this.ciDrive = this.store[confid].data.value;
      }
      return (
        confid.match(/^(ide|scsi|sata)\d+$/) &&
        _this.store[confid] &&
        _this.store[confid].data &&
        !isEmpty(_this.store[confid].data.value) &&
        /vm-.*-cloudinit/.test(_this.store[confid].data.value)
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

/deep/.tool-bar-left {
  flex: 2;
}
</style>
