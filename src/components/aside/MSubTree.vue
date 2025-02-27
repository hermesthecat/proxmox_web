<template>
  <ul class="m-sub-tree">
    <li v-for="tree of renderData" :key="tree.data.id" class="m-sub_li">
      <template v-if="tree.data.parentId === parentId">
        <div class="m-sub-item" :class="tree.data.selected && tree.data.selected ? 'is-selected' : ''"
          @click.stop="handleSelect(tree.data)" @mouseover.stop="showTip(tree)" @mouseout="hiddenTip(tree)"
          @contextmenu="handleContextMenu" @mousedown="showContext = false">
          <div class="m-sub-item-content" :ref="`m$sub$item${tree.data.id}`">
            <i :class="tree.data.iconCls" class="m-icon-custom"></i>
            <span>{{ tree.data.text }}</span>
          </div>
        </div>
      </template>
      <div class="m-sub_li"></div>
      <template v-if="tree.childNodes && tree.childNodes.length > 0">
        <m-sub-tree :tree-data="tree.childNodes" :parent-id="tree.data.parentId" />
      </template>
    </li>
    <context-menu v-show="showContext" :visible="showContext" :axis="axis" :menuData="menuData" :param="param"
      @on-click="handleOperate"></context-menu>
    <operate-modal :visible="visible" :title="title" v-if="visible" :modalType="modalType" :isLeft="true" :param="qemu"
      @close="
        visible = false;
      __init__();
      "></operate-modal>
  </ul>
</template>

<script>
import ContextMenu from "@src/components/contextMenu/Index";
import QemuHttpIndex from "@src/views/home/qemu/http";
import { hasClass, openConsoleWindow } from "@libs/utils";
import OperateModal from "@src/views/home/qemu/OperateModal";
export default {
  name: "MSubTree",
  mixins: [QemuHttpIndex],
  components: {
    "context-menu": ContextMenu,
    OperateModal,
  },
  props: {
    treeData: {
      type: Object | Array,
    },
    parentId: {
      type: String,
    },
  },
  data() {
    return {
      renderData: {},
      menuData: [],
      showContext: false,
      qemu: {},
      param: {},
      interval: null,
      visible: false,
      modalType: "",
      title: "",
      axis: {
        x: 0,
        y: 0,
      },
    };
  },
  mounted() {
    document.addEventListener("click", this.handleHiddenContext, false);
  },
  methods: {
    // Handle node selection and navigation
    handleSelect(node) {
      let loop = (item) => {
        item.forEach((it) => {
          if (it.data.id === node.id) {
            Object.assign(node, { selected: true });
          } else {
            Object.assign(it.data, { selected: false });
          }
          if (it.childNodes && it.childNodes.length > 0) {
            loop(it.childNodes);
          }
        });
      };
      loop(this.renderData);
      this.$forceUpdate();
      this.$emit("reset-select", node);
    },
    // Show modal for virtual machine management operations
    showModal(type) {
      if (!["file"].includes(type)) {
        this.modalType = type;
        this.setTitle(type);
        this.visible = true;
      } else {
        if (type === "file") {
          this.template();
          return;
        }
      }
    },
    // Template operations
    template() {
      this.$confirm
        .confirm({
          title: "Confirm",
          msg: `Delete virtual machine '${this.qemu.name}'?`,
          icon: "icon-question",
          yesBtnText: "Confirm",
        })
        .then(() =>
          this.makeTemplate().catch((res) => {
            this.alertConfirm(res);
          })
        );
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
    // Reset selection
    resetSelect(node) {
      let loop = (item) => {
        item.forEach((it) => {
          if (it.data.id === node.id) {
            Object.assign(node, { selected: true });
          } else {
            Object.assign(it.data, { selected: false });
          }
          if (it.childNodes && it.childNodes.length > 0) {
            loop(it.childNodes);
          }
        });
      };
      loop(this.renderData);
      this.$forceUpdate();
    },
    // Show tooltip
    showTip(tree) {
      /**
       * Fix for previous tooltip not hiding bug
       * **/
      let tips = document.querySelectorAll(".m-sub-item-tips");
      if (tips && tips.length > 0) {
        tips.forEach((tip) => {
          document.body.removeChild(tip);
        });
      }
      let el = document.createDocumentFragment(),
        pos =
          this.$refs[`m$sub$item${tree.data.id}`][0] &&
          this.$refs[`m$sub$item${tree.data.id}`][0].getBoundingClientRect(),
        con = document.querySelector(".m-tree"),
        dom = document.createElement("div");
      dom.className = "m-sub-item-tips";
      dom.setAttribute("id", `${tree.data.id.replace(/\//g, "")}`);
      dom.style.left = con.clientWidth + "px";
      dom.style.top = pos.top - 15 + "px";
      dom.style.zIndex = "999";
      dom.style.backgroundColor = "#fff";
      dom.style.padding = "10px 20px";
      dom.style.color = "#222";
      dom.style.position = "absolute";
      dom.innerHTML = `<ul>
   <li>Name: ${tree.data.text ? tree.data.text : ""}</li>
   <li>Status: ${tree.data.status ? tree.data.status : ""}</li>
   ${tree.data.type === "storage"
          ? `
    <li>
    <span style="display: inline-block;margin-right: 3px;">Usage:</span>
    <span style="width: calc(100% - 47px); display: inline-block; height: 8px;line-height: 8px;border-radius: 50px;position: relative; background-color: #dde4ed;">
        <div style="position: absolute;top:0;height: 100%;border-radius: 50px;width:${tree.data.disk && tree.data.maxdisk && tree.data.maxdisk !== 0
            ? ((tree.data.disk / tree.data.maxdisk) * 100).toFixed(1)
            : 0
          }%;
                    background: ${tree.data.disk &&
            tree.data.maxdisk &&
            tree.data.maxdisk !== 0
            ? (tree.data.disk / tree.data.maxdisk) * 100 < 50
              ? "rgb(33, 191, 75)"
              : (tree.data.disk / tree.data.maxdisk) * 100 >= 50 &&
                (tree.data.disk / tree.data.maxdisk) * 100 <= 80
                ? "rgb(255, 204, 0)"
                : (tree.data.disk / tree.data.maxdisk) * 100 >= 80 &&
                  (tree.data.disk / tree.data.maxdisk) * 100 <= 100
                  ? "#ff0000"
                  : "transparent"
            : "transparent"
          }">
                    </div>
        <div style="position: absolute; width: 100%;text-align: center;height: 8px; line-height: 8px;">${tree.data.disk && tree.data.maxdisk && tree.data.maxdisk !== 0
            ? ((tree.data.disk / tree.data.maxdisk) * 100).toFixed(1)
            : 0
          }%</div>
     </span>
    </li>`
          : ""
        }
</ul>`;
      el.appendChild(dom);
      document.body.appendChild(el);
      this.param = tree;
      this.qemu = this.param.data;
      this.ele = this.$refs[`m$sub$item${tree.data.id}`][0];
    },
    // Hide tooltip
    hiddenTip(tree) {
      let id = document.querySelector(`#${tree.data.id.replace(/\//g, "")}`);
      document.body.removeChild(id);
    },
    /**
     * Handle left-click triggered contextMenu events
     */
    handleContextMenu(event) {
      if (event.button === 2) {
        event.preventDefault();
        var x = event.clientX;
        var y = event.clientY;
        this.axis = { x, y };
        if (!this.getContextMenu()) return;
        this.showContext = true;
      }
    },
    /**
     * Context Menu
     */
    getContextMenu() {
      if (this.param.data.template === 1) {
        this.menuData = [
          { text: this.param.data.name },
          { text: "Migrate", icon: "fa fa-paper-plane-o", operate: "migrate" },
          { text: "Clone", icon: "fa fa-fw fa-clone", operate: "clone" },
        ];
        return true;
      } else if (this.param.data.type === "qemu") {
        this.menuData = [
          { text: this.param.data.name },
          {
            text: "Start",
            icon: "fa fa-play",
            operate: "start",
            disabled: (() => !this.inStatus("stopped", "paused"))(),
          },
          {
            text: "Shutdown",
            icon: "fa fa-power-off",
            operate: "off",
            disabled: (() => this.inStatus("stopped"))(),
          },
          {
            text: "Pause",
            icon: "fa fa-pause",
            operate: "pause",
            disabled: (() => this.inStatus("paused"))(),
          },
          {
            text: "Immediately Stop",
            icon: "fa fa-stop",
            operate: "stop",
            disabled: (() => this.inStatus("stopped"))(),
          },
          {
            text: "Reset",
            icon: "fa fa-bolt",
            operate: "reset",
            disabled: (() => !this.inStatus("running"))(),
          },
          {
            text: "Convert to Template",
            icon: "fa fa-fw fa-file-o",
            operate: "file",
            disabled: (() => this.inStatus("running"))(),
          },
          { text: "Console", icon: "fa fa-terminal", operate: "novnc" },
          { text: "Clone", icon: "fa fa-fw fa-clone", operate: "clone" },
        ];
        return true;
      } else if (this.param.data.type === "lxc") {
        this.menuData = [
          { text: this.param.data.name },
          {
            text: "Start",
            icon: "fa fa-play",
            operate: "start",
            disabled: (() => !this.inLxcStatus("stopped", "paused"))(),
          },
          {
            text: "Reboot",
            icon: "fa fa-refresh",
            operate: "reboot",
            disabled: (() => !this.inLxcStatus("running"))(),
          },
          {
            text: "Shutdown",
            icon: "fa fa-stop",
            operate: "off",
            disabled: (() => this.inLxcStatus("stopped"))(),
          },
          {
            text: "Convert to Template",
            icon: "fa fa-fw fa-file-o",
            operate: "file",
            disabled: (() => this.inStatus("running"))(),
          },
          { text: "Console", icon: "fa fa-terminal", operate: "novnc" },
          { text: "Clone", icon: "fa fa-fw fa-clone", operate: "clone" },
        ];
        return true;
      } else {
        return false;
      }
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
      }
    },
    /**
     * Virtual machine start/stop/restart/disable operations
     */
    handleOperate() {
      let ev = event.srcElement || event.target,
        target =
          ev.parentElement && ev.parentElement.tagName !== "UL"
            ? ev.parentElement
            : ev,
        command = target.id;
      if (hasClass.call(target, "disabled")) return;
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
          if (this.param.data.type === "qemu") {
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
        case "start":
          this.handleReset();
          break;
        case "migrate":
          this.showModal("migrate");
          break;
        case "clone":
          this.showModal("clone");
          break;
        case "file":
          this.showModal("file");
          break;
        case "novnc":
          this.handleConsole("novnc");
          break;
      }
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
     * Reset virtual machine
     */
    reset() {
      this.$confirm
        .confirm({
          title: "Confirm",
          msg: `Reset virtual machine '${this.param.data.name && this.param.data.name}'?`,
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
                  this.getContextMenu();
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
     * Restart virtual machine
     */
    handleReset() {
      let _this = this;
      if (
        this.param.data.status !== "stopped" &&
        this.param.data.type === "qemu"
      ) {
        let event = _this.createEvent(
          `action.qemu.resume`,
          this.param.data.name
        );
        this.$http
          .post(
            `/json/nodes/${this.param.data.node}/${this.param.data.id}/status/resume`,
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
                this.getContextMenu();
              }, 3000);
            }
          })
          .catch((res) => {
            this.incEventFail(event);
            this.alertConfirm(res);
          });
      } else if (this.param.data.status === "stopped") {
        let event = this.createEvent(
          `action.qemu.reboot`,
          this.param.data.name
        );
        this.$http
          .post(
            `/json/nodes/${this.param.data.node}/${this.param.data.id}/status/start`,
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
                this.getContextMenu();
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
     * Initial request
     */
    __init__() {
      this.queryResource();
      this.queryNodeList();
    },
    /**
     * Clone template
     */
    handleClose() {
      this.$confirm
        .confirm({
          title: "Confirm",
          msg: `Shutdown virtual machine '${this.param.data.name && this.param.data.name}'?`,
          icon: "icon-question",
          yesBtnText: "Confirm",
        })
        .then(() => {
          this.offQemu()
            .then((res) => {
              if (res.data) {
                this.interval = setInterval(
                  () => this.queryStatus(res.data),
                  3000
                );
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
          msg: `${params ? "Hibernate" : "Pause"} virtual machine '${this.param.data.name && this.param.data.name}'?`,
          icon: "icon-question",
          yesBtnText: "Confirm",
        })
        .then(() => {
          this.pausedQemu()
            .then((res) => { })
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
          msg: `Stop virtual machine '${this.param.data.name && this.param.data.name}'?`,
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
          msg: `Restart '${this.param.data.name && this.param.data.name}'?`,
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
     * Check if in certain status
     */
    inStatus() {
      let states = [];
      for (let arg in arguments) {
        states.push(arguments[arg]);
      }
      return states.some((status) => status === this.param.data.status);
    },
    /**
     * Check if LXC container is in certain status
     */
    inLxcStatus() {
      let states = [];
      for (let arg in arguments) {
        states.push(arguments[arg]);
      }
      return states.some((status) => status === this.param.data.status);
    },
    handleHiddenContext(event) {
      event.stopPropagation();
      this.showContext = false;
    },
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleHiddenContext, false);
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  watch: {
    treeData: {
      immediate: true,
      deep: true,
      handler: function (newVal, oldVal) {
        this.renderData = newVal;
      },
    },
  },
};
</script>

<style lang="less">
.m-sub {
  &-item {
    padding: 5px 0px;
    width: 100%;
    position: relative;

    &-content {
      padding-left: 47px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      table-layout: fixed;
      display: inline-block;
    }

    &-tips {
      position: absolute;
      z-index: 1086;
      background: #fff;
      color: #222;
      padding: 5px 20px;
      font-size: 12px;
      text-overflow: normal;
      word-wrap: break-word;
      white-space: normal;
      box-shadow: 1px 1px 12px #ccc;
      transition: all 0.5s ease-in;

      &:before {
        content: "";
        display: block;
        width: 10px;
        height: 10px;
        border-right: 2px solid #f6f6f6;
        border-bottom: 2px solid #f6f6f6;
        -webkit-transform: rotate(135deg);
        position: absolute;
        bottom: -4px;
        text-align: center;
        background: #fff;
        top: 50%;
        transform: translateY(-50%) scale(1) rotate(135deg);
        transition-delay: 0.5s;
        transition-timing-function: ease-in;
        left: -5px;
      }
    }

    &:hover {
      .m-sub-item-tips {
        display: block;
      }
    }
  }

  &_li {
    position: relative;

    &:after {
      content: "";
      position: absolute;
      height: 1px;
      background: #fff;
      left: -10px;
      right: 0;
      bottom: 0;
    }
  }
}

.is-selected {
  background-image: linear-gradient(180deg,
      rgba(64, 158, 255, 0.7),
      rgba(64, 158, 255));
  color: #fff;
}
</style>
