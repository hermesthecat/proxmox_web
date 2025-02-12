<script>
import { quickSort } from "@libs/utils/index";
export default {
  name: "QemuHttpIndex",
  methods: {
    /**
     * Delete virtual machine, lxc
     */
    deleteQemu(param) {
      let event = this.createEvent("qemu.action.delete", this.qemu.name);
      return this.$http
        .del(`/json/nodes/${this.qemu.node}/${this.qemu.id}`, param)
        .then((res) => {
          if (res.data) {
            this.queryStatus(res.data);
            this.queryLog(this.qemu.node, res.data);
          }
          this.incEventSuccess(event);
          this.commitUpdateChangeTree(true);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    // Query status
    queryStatus(upid) {
      let _this = this;
      return this.$http
        .get(`json/nodes/${_this.qemu.node}/tasks/${upid}/status`)
        .then((res) => {
          if (res.data) {
            _this.statusObj = res.data;
            _this.updateDbObject({
              name: "addClusterStatusObj",
              data: res.data,
            });
            if (res.data.status === "stopped") {
              /**
               * After deletion, this resource will no longer exist, redirect to homepage
               */
              if (
                res.data.exitstatus &&
                res.data.exitstatus === "OK" &&
                res.data.type &&
                res.data.type.indexOf("destroy") >= 0
              ) {
                if (_this.closeLog) {
                  _this.closeLog();
                  setTimeout(() => {
                    _this.$router.push("/datacenter/overview");
                    window.localStorage.removeItem("lastsel");
                  }, 500);
                }
              } else {
                if (_this.interval) {
                  clearInterval(_this.interval);
                  _this.interval = null;
                }
              }
            }
            if (this.__init__) {
              this.__init__();
            }
          }
        });
    },
    /**
     * Query task logs
     */
    queryLog(node, pid) {
      return this.$http
        .get(`json/nodes/${node}/tasks/${pid}/log`, {
          _dc: new Date().getTime(),
          start: 0,
          limit: 500,
        })
        .then((res) => {
          this.updateTable({
            tableName: "addClusterLogList",
            list: res.data,
          });
        });
    },
    /**
     * Shutdown lxc virtual machine
     */
    offQemu() {
      let event = this.createEvent(`action.qemu.off`, this.qemu.name);
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/shutdown`,
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
          this.__init__();
          return Promise.resolve(res);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * Query resources
     */
    async queryResource() {
      let last = window.localStorage.getItem("lastsel") || "[]";
      this.qemu = (JSON.parse(last) && JSON.parse(last)) || "";
      return this.$http
        .get(`/json/nodes/${this.qemu.node}/${this.qemu.id}/status/current`)
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "qemuObj",
              data: res.data,
            });
          }
        });
    },
    /**
     * Pause lxc virtual machine
     */
    pausedQemu(params) {
      let event = this.createEvent(
        `action.qemu.${params ? "suspend" : "paused"}`,
        this.qemu.name
      );
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/suspend`,
          params,
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
        .then((res) => {
          this.incEventSuccess(event);
          this.__init__();
          return Promise.resolve(res);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * Stop lxc virtual machine
     */
    stopQemu(param) {
      let event = this.createEvent(`action.qemu.stop`, this.qemu.name);
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/stop`,
          param,
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
            this.interval = setInterval(() => this.queryStatus(res.data), 3000);
          }
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * Reset lxc virtual machine
     */
    resetQemu() {
      let event = this.createEvent(`action.qemu.reset`, this.qemu.name);
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/reset`,
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
          this.__init__();
          return Promise.resolve(res);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * Reboot lxc
     */
    rebootLxc() {
      let event = this.createEvent(`action.lxc.reboot`, this.qemu.name);
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/reboot`,
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
          this.__init__();
          return Promise.resolve(res);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * Query nodes
     */
    queryNodeList() {
      return this.$http.get("/json/nodes").then((res) => {
        if (res.data) {
          this.nodeList = quickSort(res.data, "node", "+");
        }
      });
    },
    /**
     * Query storage
     */
    queryStorageList(nodename, param) {
      return this.$http
        .get(`/json/nodes/${nodename}/storage`, param)
        .then((res) => {
          if (res.data) {
            this.storageList = quickSort(res.data, "storage", "+");
          }
        });
    },
    /**
     * Query migrate
     */
    queryMigrate(param) {
      return this.$http
        .get(`json/nodes/${this.qemu.node}/${this.qemu.id}/migrate`, param)
        .then((res) => {
          if (res.data) {
            this.migreateObj = res.data;
          }
        });
    },
    /**
     * Migrate virtual machine, lxc
     */
    migreate(params) {
      return this.$http
        .post(
          `json/nodes/${this.qemu.node}/${this.qemu.type}/${this.qemu.vmid}/migrate`,
          params,
          {
            headers: {
              "content-type": "application/x-www-form-urlencoded; charset=utf8",
            },
          }
        )
        .then((res) => {
          if (res.data) {
            this.queryStatus(res.data);
            this.queryLog(this.qemu.node, res.data);
          }
        })
        .catch((res) => {
          return Promise.reject(res);
        });
    },
    /**
     * Query snapshot list
     */
    querySnapShot(param) {
      return this.$http
        .get(`json/nodes/${this.qemu.node}/${this.qemu.id}/snapshot`, param)
        .then((res) => {
          if (res.data) {
            this.snapshotList = quickSort(res.data, "name", "+");
          }
        });
    },
    /**
     * Query next vmid
     */
    queryNextVmid(param) {
      return this.$http.get(`json/cluster/nextid`, param).then((res) => {
        if (res.data) {
          this.vmid = res.data;
        }
      });
    },
    /**
     * Query resource pool list
     */
    queryPool(param) {
      return this.$http.get(`json/pools`, param).then((res) => {
        if (res.data) {
          this.poolList = res.data;
        }
      });
    },
    /**
     * Clone
     */
    clone(params) {
      return this.$http
        .post(
          `json/nodes/${this.qemu.node}/${this.qemu.type}/${this.qemu.vmid}/clone`,
          params,
          {
            headers: {
              "content-type": "application/x-www-form-urlencoded; charset=utf8",
            },
          }
        )
        .then((res) => {
          if (res.data) {
            this.queryStatus(res.data);
            this.queryLog(this.qemu.node, res.data);
          }
        })
        .catch((res) => {
          return Promise.reject(res);
        });
    },
    /**
     * Create template
     */
    makeTemplate() {
      let event = this.createEvent("action.template.translate", this.qemu.vmid);
      return this.$http
        .post(
          `json/nodes/${this.qemu.node}/${this.qemu.type}/${this.qemu.vmid}/template`,
          "",
          {
            headers: {
              "content-type": "application/x-www-form-urlencoded; charset=utf8",
            },
          }
        )
        .then((res) => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * Get ha groups
     */
    getGroups() {
      return this.$http.get(`json/cluster/ha/groups`).then((res) => {
        if (res.data) {
          this.groupList = quickSort(res.data, "name", "+");
        }
      });
    },
    /**
     * Query ha resources
     */
    queryHaResource(vmid, param) {
      return this.$http
        .get(`json/cluster/ha/resources/${vmid}`, param)
        .then((res) => {
          if (res.data) this.haResource = res.data;
        });
    },
    /**
     * Manage ha
     */
    mangeHa(param) {
      let event = this.createEvent("action.ha.manage");
      return this.$http
        .post(`json/cluster/ha/resources`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    /**
     * Update ha
     */
    updateHa(vmid, param) {
      let event = this.createEvent("action.ha.manage.update");
      return this.$http
        .put(`json/cluster/ha/resources/${vmid}`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    stopTask(node, pid) {
      return this.$http.del(`json/nodes/${node}/tasks/${pid}`);
    },
  },
};
</script>
