<script>
export default {
  name: "VolumeHttp",
  data() {
    return {
      node: {},
    };
  },
  mounted() {
    let _this = this,
      last = window.localStorage.getItem("lastsel") || "[]";
    _this.node = (JSON.parse(last) && JSON.parse(last)) || "";
  },
  methods: {
    queryResource() {
      return this.$http
        .get(`/json/nodes/${this.node.node}/${this.node.id}/pending`)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "volumeList",
              list: res.data,
            });
          }
        });
    },
    resume(param) {
      let event = this.createEvent("action.qemu.hardware.resume");
      return this.$http
        .put(`json/nodes/${this.node.node}/${this.node.id}/config`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          this.incEventFail(event);
        });
    },
    queryConfig(param) {
      return this.$http
        .get(`json/nodes/${this.node.node}/${this.node.id}/config`, param)
        .then((res) => {
          if (res.data) {
            this.updateDbObject({
              name: "qemuConfigObj",
              data: res.data,
            });
          }
        });
    },
    queryStorage(param) {
      return this.$http
        .get(`/json/nodes/${this.node.node}/storage`, param)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "storageList",
              list: res.data,
            });
          }
        });
    },
    queryImage(param) {
      return this.$http
        .get(
          `/json/nodes/${this.node.node}/storage/${this.storage}/content`,
          param
        )
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "imageList",
              list: res.data,
            });
          }
        });
    },
    queryNetWork(param) {
      return this.$http
        .get(`/json/nodes/${this.node.node}/network`, param)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "netWorkList",
              list: res.data,
            });
          }
        });
    },
    queryUsb(param) {
      return this.$http
        .get(`json/nodes/${this.node.node}/scan/usb`, param)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "usbList",
              list: res.data,
            });
          }
        });
    },
    queryPci(param) {
      return this.$http
        .get(`json/nodes/${this.node.node}/hardware/pci`, param)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "pciList",
              list: res.data,
            });
          }
        });
    },
    // Query MDev
    queryMDev(pciid) {
      return this.$http
        .get(`json/nodes/${this.node.node}/hardware/pci/${pciid}/mdev`)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "pciMDevList",
              list: res.data,
            });
          }
        });
    },
    // Add Hardware
    createHardWare(param) {
      let event = this.createEvent("action.qemu.hardware.create");
      return this.$http
        .post(`json/nodes/${this.node.node}/${this.node.id}/config`, param, {
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
    // Add LXC Resource
    createLxcRs(param) {
      let event = this.createEvent("action.qemu.lxc.resource.create");
      return this.$http
        .put(`json/nodes/${this.node.node}/${this.node.id}/config`, param, {
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
    // HTTP request triggered when editing
    updateHardWare(param) {
      let event = this.createEvent("action.qemu.hardware.update");
      return this.$http
        .put(`json/nodes/${this.node.node}/${this.node.id}/config`, param, {
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
    // Delete Configuration
    deleteHareWare(param) {
      let event = this.createEvent(`action.qemu.hardware.delete`);
      return this.$http
        .put(`extjs/nodes/${this.node.node}/${this.node.id}/config`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
          if (res.data) {
            this.jobVisible = true;
            this.queryStatus(res.data);
            this.interVal = setInterval(() => this.queryStatus(res.data), 3000);
          }
          if (res.status == "400") {
            return Promise.reject(res.errors);
          }
          if (res.status == "500") {
            return Promise.reject(res.message);
          }
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    // Query Status
    queryStatus(upid) {
      return this.$http
        .get(`json/nodes/${this.node.node}/tasks/${upid}/status`)
        .then((res) => {
          if (res.data) {
            this.statusObj = res.data;
            this.updateDbObject({
              name: "addClusterStatusObj",
              data: res.data,
            });
            if (res.data.status === "stopped") {
              this.jobText = "Done!";
              this.jobVisible = false;
              if (this.inverVal) {
                clearInterval(this.inverVal);
                this.inverVal = null;
              }
            }
          }
        });
    },
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
    // Increase Disk Size
    updateHardWareSize(param) {
      let event = this.createEvent("action.qemu.hardware.size.update");
      return this.$http
        .put(`json/nodes/${this.node.node}/${this.node.id}/resize`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
          this.queryStatus(res.data);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    // Move Disk
    removeDisk(param, url) {
      let event = this.createEvent("action.qemu.hardware.remove.disk");
      return this.$http
        .post(`json/nodes/${this.node.node}/${this.node.id}/${url}`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
          this.queryStatus(res.data);
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(res);
        });
    },
    // Query Current VM Status
    queryCurrentStatus() {
      return this.$http
        .get(`json/nodes/${this.node.node}/${this.node.id}/status/current`)
        .then((res) => {
          if (res.data) {
            return Promise.resolve(res.data);
          }
        });
    },
  },
};
</script>
