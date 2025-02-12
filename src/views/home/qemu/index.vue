<template>
  <transition name="transition">
    <div class="content">
      <div class="m-operate">
        <div class="m-operate-left">
          {{ qemu.type === "qemu" ? "Virtual Machine" : "Container" }}{{ qemu.vmid }}({{
            qemu.name
          }})
        </div>
        <div class="m-operate-right">
          <m-button v-if="qemu.type === 'qemu' && !isTemplate" icon="fa fa-play" v-confirm="{
            msg: `Start virtual machine '${qemu.name}'?`,
            ok: () => handleReset(),
          }" :disabled="inStatus('running')">{{ inStatus("running") ? "Start" : "Continue" }}
          </m-button>
          <!--Only start LXC container when in stopped status-->
          <m-button v-if="qemu.type === 'lxc' && !isTemplate" icon="fa fa-play" v-confirm="{
            msg: `Start LXC container '${qemu.name}'?`,
            ok: () => handleReset(),
          }" :disabled="!inLxcStatus('stopped')">Start
          </m-button>
          <dropdown style="
              width: auto;
              border: 1px solid #adb0b8;
              display: inline-block;
              padding: 0px 10px;
            " :disabled="qemu.type === 'qemu'
              ? inStatus('stopped', 'suspended')
              : inLxcStatus('stopped')
              " @on-change="handleOperate" v-if="!isTemplate">
            <m-button icon="fa fa-power-off" slot="label"
              style="border: none; background: tranparent; height: 28px">Shutdown
            </m-button>
            <template v-if="qemu.type === 'qemu'">
              <dropdown-item command="off" icon="fa fa-power-off"
                :disabled="inStatus('stopped')">Shutdown</dropdown-item>
              <dropdown-item command="pause" icon="fa fa-pause" :disabled="inStatus('paused')">Pause</dropdown-item>
              <dropdown-item command="hibernate" icon="fa fa-download" :disabled="inStatus('paused')">Suspend to Disk
              </dropdown-item>
              <dropdown-item command="stop" icon="fa fa-stop" :disabled="inStatus('stopped')">Stop
                Immediately</dropdown-item>
              <dropdown-item command="reset" icon="fa fa-bolt" :disabled="!inStatus('running')">Reset</dropdown-item>
            </template>
            <template v-if="qemu.type === 'lxc'">
              <dropdown-item command="reboot" icon="fa fa-refresh" :disabled="!inLxcStatus('running')">Reboot
              </dropdown-item>
              <dropdown-item command="stop" icon="fa fa-stop" :disabled="inLxcStatus('stopped')">Stop</dropdown-item>
            </template>
          </dropdown>
          <m-button icon="fa fa-paper-plane-o" @on-click="showModal('migrate')" :disabled="nodeList.length < 1"
            v-if="nodeList.length >= 1">Migrate
          </m-button>
          <dropdown style="
              width: auto;
              border: 1px solid #adb0b8;
              display: inline-block;
              padding: 0px 10px;
            " @on-change="handleConsole" v-if="!isTemplate">
            <m-button icon="fa fa-terminal" slot="label" style="border: none; height: 28px">Console</m-button>
            <dropdown-item command="novnc" name="novnc">NoVNC</dropdown-item>
            <dropdown-item command="spice" name="virt-viewer" :disabled="!qemu.type || qemu.type !== 'lxc'">SPICE
            </dropdown-item>
            <dropdown-item command="xtermjs" name="xtermjs" :disabled="!qemu.type || qemu.type !== 'lxc'">xtermjs
            </dropdown-item>
          </dropdown>
          <dropdown style="
              width: auto;
              border: 1px solid #adb0b8;
              display: inline-block;
              padding: 0px 10px;
            " @on-change="showModal">
            <m-button icon="fa fa-fw fa-ellipsis-v" slot="label" style="border: none; height: 28px">More
              Actions</m-button>
            <dropdown-item command="clone" icon="fa fa-fw fa-clone">Clone</dropdown-item>
            <dropdown-item command="file" icon="fa fa-fw fa-file-o" :disabled="isTemplate">Convert to
              Template</dropdown-item>
            <dropdown-item command="ha" icon="fa fa-heartbeat">Manage HA</dropdown-item>
            <dropdown-item command="delete" icon="fa fa-trash-o" :disabled="qemu.type === 'qemu'
              ? !inStatus('stopped')
              : !inLxcStatus('stopped')
              ">Delete
            </dropdown-item>
          </dropdown>
        </div>
      </div>
      <operate-modal :visible="visible" :title="title" v-if="visible" :modalType="modalType" :isLeft="false" @close="
        visible = false;
      __init__();
      "></operate-modal>
      <Pv-Menu :data="menuData"></Pv-Menu>
      <div class="m-scroll-wrapper scroll-container">
        <div class="m-scroll-view scroll-view" @scroll="onScroll">
          <div class="m-content">
            <router-view />
          </div>
        </div>
        <div class="m-scroll-bar" v-show="showScrollbar" :style="{ top: scrollTop + 'px', height: scrollLength + 'px' }"
          @mousedown="onScrollBarMouseDown($event)"></div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from "vuex";
import PvMenu from "@src/components/menu/Menu";
import MScrollbar from "@src/components/scroll/Scrollbar";
import MButton from "@src/components/button/Button";
// Menu tree
import { qemuMenuList } from "@src/components/menu/menuList";
import Dropdown from "@src/components/dropdown/dropdown";
import DropdownItem from "@src/components/dropdown/dropdownItem";
import { openConsoleWindow } from "@libs/utils";
import QemuHttpIndex from "@src/views/home/qemu/http";
import OperateModal from "./OperateModal";

export default {
  name: "QEMU",
  mixins: [QemuHttpIndex, MScrollbar],
  components: {
    DropdownItem,
    Dropdown,
    PvMenu,
    MButton,
    OperateModal,
  },
  data() {
    return {
      menuData: qemuMenuList,
      qemu: {},
      interval: null,
      visible: false,
      title: "",
      modalType: "",
      isTemplate: false,
      nodeList: [],
      flag: false,
    };
  },
  computed: {
    ...mapState({
      viewType: (state) => state.db.selectView,
    }),
  },
  async mounted() {
    this.scrollElementSelector = ".scroll-view";
    this.scrollContainerSelector = ".scroll-container";
    this.__init__();
  },
  methods: {
    /**
     * Initial request
     */
    __init__(type) {
      let _this = this;
      _this.queryResource().then((res) => {
        _this.isTemplate =
          _this.db.qemuObj &&
            _this.db.qemuObj.template &&
            _this.db.qemuObj.template === 1
            ? true
            : false;
        if (type) {
          _this.setMenu(type);
        } else {
          _this.setMenu(_this.qemu.type);
        }
      });
      _this.queryNodeList();
    },
    /**
     * Restart virtual machine
     */
    handleReset() {
      let _this = this;
      if (
        _this.db.qemuObj.qmpstatus !== "stopped" &&
        _this.qemu.type === "qemu"
      ) {
        let event = _this.createEvent(`action.qemu.resume`, _this.qemu.name);
        this.$http
          .post(
            `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/resume`,
            {},
            {
              headers: {
                "Content-Type":
                  "application/x-www-form-urlencoded; charset=UTF-8",
              },
            }
          )
          .then((res) => {
            this.incEventSuccess(event);
            if (res.data) {
              this.queryStatus(res.data);
              this.interval = setInterval(() => {
                this.queryStatus(res.data);
              }, 3000);
            }
          })
          .catch((res) => {
            this.incEventFail(event);
            this.alertConfirm(res);
          });
      } else if (_this.db.qemuObj.status === "stopped") {
        let event = this.createEvent(`action.qemu.reboot`, this.qemu.name);
        this.$http
          .post(
            `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/start`,
            {},
            {
              headers: {
                "Content-Type":
                  "application/x-www-form-urlencoded; charset=UTF-8",
              },
            }
          )
          .then((res) => {
            this.incEventSuccess(event);
            if (res.data) {
              this.queryStatus(res.data);
              this.interval = setInterval(() => {
                this.queryStatus(res.data);
              }, 3000);
            }
          })
          .catch((res) => {
            this.incEventFail(event);
            this.alertConfirm(res);
          });
      }
    },
    /**
     * Clone template
     */
    handleClose() {
      this.$confirm
        .confirm({
          title: "Confirm",
          msg: `Shutdown virtual machine '${this.qemu.name && this.qemu.name}'?`,
          icon: "icon-question",
          yesBtnText: "Confirm",
        })
        .then(() => {
          this.offQemu()
            .then((res) => {
              this.__init__();
            })
            .catch((res) => {
              this.alertConfirm(res);
            });
        })
        .catch(() => { });
    },
    /**
     * VNC operations
     */
    handleConsole(e) {
      let options = {
        cmd: undefined,
        consoleName: this.qemu.name,
        nodename: undefined,
        vmid: this.qemu.vmid,
      };
      let console = this.qemu.type === "lxc" ? "lxc" : "kvm";
      switch (e) {
        case "novnc":
          openConsoleWindow(
            "html5",
            console,
            options.vmid,
            this.qemu.node,
            options.consoleName,
            options.cmd
          );
          break;
        case "spice":
          openConsoleWindow(
            "vv",
            console,
            options.vmid,
            this.qemu.node,
            options.consoleName,
            options.cmd
          );
          break;
        case "xtermjs":
          openConsoleWindow(
            "xtermjs",
            console,
            options.vmid,
            this.qemu.node,
            options.consoleName,
            options.cmd
          );
          break;
      }
    },
    /**
     * Virtual machine power operations (on/off/restart/stop etc.)
     */
    handleOperate(command) {
      switch (command) {
        case "off":
          this.handleClose();
          break;
        case "pause":
          this.paused();
          break;
        case "hibernate":
          this.paused({ todisk: 1 });
          break;
        case "stop":
          let param = {};
          if (this.qemu.type === "qemu") {
            param = {
              timeout: 30,
            };
          }
          this.stop(param);
          break;
        case "reset":
          this.reset();
          break;
        case "reboot":
          this.reboot();
          break;
      }
    },
    /**
     * Reset virtual machine
     */
    reset() {
      this.$confirm
        .confirm({
          title: "Confirm",
          msg: `Reset virtual machine '${this.qemu.name && this.qemu.name}'?`,
          icon: "icon-question",
          yesBtnText: "Confirm",
        })
        .then(() => {
          this.resetQemu()
            .then((res) => {
              if (res.data) {
                this.queryStatus(res.data);
                this.interval = setInterval(() => {
                  this.queryStatus(res.data);
                }, 3000);
              }
            })
            .catch((res) => {
              this.alertConfirm(res);
            });
        })
        .catch(() => { });
    },
    /**
     * Pause virtual machine
     */
    paused(params) {
      this.$confirm
        .confirm({
          title: "Confirm",
          msg: `${params ? "Suspend" : "Pause"} virtual machine '${this.qemu.name && this.qemu.name
            }'?`,
          icon: "icon-question",
          yesBtnText: "Confirm",
        })
        .then(() => {
          this.pausedQemu()
            .then((res) => {
              if (res.data) {
                this.queryStatus(res.data);
                this.interval = setInterval(() => {
                  this.queryStatus(res.data);
                }, 3000);
              }
            })
            .catch((res) => {
              this.alertConfirm(res);
            });
        })
        .catch(() => { });
    },
    /**
     * Stop virtual machine
     */
    stop() {
      this.$confirm
        .confirm({
          title: "Confirm",
          msg: `Stop virtual machine '${this.qemu.name && this.qemu.name}'?`,
          icon: "icon-question",
          yesBtnText: "Confirm",
        })
        .then(() => {
          this.stopQemu()
            .then((res) => {
              this.__init__();
            })
            .catch((res) => {
              this.alertConfirm(res);
            });
        })
        .catch(() => { });
    },
    /**
     * Restart virtual machine
     */
    reboot() {
      this.$confirm
        .confirm({
          title: "Confirm",
          msg: `Restart '${this.qemu.name && this.qemu.name}'?`,
          icon: "icon-question",
          yesBtnText: "Confirm",
        })
        .then(() => {
          this.rebootLxc()
            .then((res) => {
              this.__init__();
            })
            .catch((res) => {
              this.alertConfirm(res);
            });
        })
        .catch(() => { });
    },
    alertConfirm(msg) {
      this.$confirm.confirm({
        icon: "icon-warning",
        msg,
      });
    },
    /**
     * Delete virtual machine
     */
    delete() {
      this.$confirm
        .confirm({
          title: "Confirm",
          msg: `Delete virtual machine '${this.qemu.name && this.qemu.name}'?`,
          icon: "icon-question",
          yesBtnText: "Confirm",
        })
        .then(() => {
          this.deleteQemu().catch((res) => {
            this.alertConfirm(res);
          });
        });
    },
    /**
     * Check if in certain status
     */
    inStatus() {
      let states = [];
      for (let arg in arguments) {
        states.push(arguments[arg]);
      }
      return states.some((status) => status === this.db.qemuObj.qmpstatus);
    },
    /**
     * Check if LXC container is in certain status
     */
    inLxcStatus() {
      let states = [];
      for (let arg in arguments) {
        states.push(arguments[arg]);
      }
      return states.some((status) => status === this.db.qemuObj.status);
    },
    /**
     * For LXC containers, menu is slightly different from virtual machines
     */
    setMenu(type) {
      this.menuData = [];
      if (type === "lxc" && !this.isTemplate) {
        this.menuData = qemuMenuList.filter((item) => {
          return !/(monitor|volume|cloud-init)/.test(item.path);
        });
      } else if (this.isTemplate) {
        this.menuData = qemuMenuList.filter((item) => {
          return !/(console|monitor|snapshot|resource|network)/.test(item.path);
        });
      } else {
        this.menuData = qemuMenuList.filter((item) => {
          return !/(lxc)/.test(item.path);
        });
      }
    },
    showModal(type) {
      if (!["file"].includes(type)) {
        this.modalType = type;
        this.setTitle(type);
        this.visible = true;
      } else {
        if (type === "delete") {
          this.delete();
          return;
        }
        if (type === "file") {
          this.template();
          return;
        }
      }
    },
    /**
     * Set modal title
     */
    setTitle(type) {
      switch (type) {
        case "migrate":
          this.title = "Migrate";
          break;
        case "delete":
          this.title = `Delete: ${this.qemu.id}`;
          break;
        case "ha":
          this.title = `Manage HA: ${this.qemu.id}`;
          break;
        case "clone":
          this.title = `Clone: ${this.qemu.id}`;
          break;
      }
    },
    template() {
      this.$confirm
        .confirm({
          title: "Confirm",
          msg: `Delete virtual machine '${this.db.qemuObj.name}'?`,
          icon: "icon-question",
          yesBtnText: "Confirm",
        })
        .then(() =>
          this.makeTemplate().catch((res) => {
            this.alertConfirm(res);
          })
        );
    },
  },
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  watch: {
    "$store.state.db.lastSelectObj": function (newVal, oldVal) {
      let _this = this;
      if (
        newVal !== oldVal &&
        (newVal.type === "qemu" || newVal.type === "lxc")
      ) {
        _this.__init__(newVal.type);
      }
    },
  },
};
</script>

<style scoped>
.transition-enter {
  transition: all 0.5s ease-in;
}

.content {
  height: 100%;
}
</style>
