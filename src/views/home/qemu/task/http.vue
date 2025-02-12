<script>
export default {
  name: "NodeTaskHttp",
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
    queryTask() {
      return this.$http
        .get(`json/nodes/${this.node.node}/tasks`, {
          errors: 0,
          start: 0,
          limit: 500,
          vmid: this.node.vmid,
        })
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "nodeTaskList",
              list: res.data,
            });
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
    queryStatus(node, pid) {
      return this.$http
        .get(`json/nodes/${node}/tasks/${pid}/status`, {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (!res.data) return;
          if (res.data.status !== "running" && this.interVal) {
            clearInterval(this.interVal);
            this.interVal = null;
          }
          this.updateDbObject({
            name: "addClusterStatusObj",
            data: res.data,
          });
        });
    },
    stopTask(node, pid) {
      return this.$http.del(`json/nodes/${node}/tasks/${pid}`).then(() => {
        this.querySubscriptionInfo();
      });
    },
    filter(type) {
      if (type === "user") {
        if (this.user) {
          this.qemuTaskList = this.db.nodeTaskList.filter((item) => {
            return item.user === this.user;
          });
        } else {
          this.__init__();
        }
      } else if (type === "error") {
        if (this.error) {
          this.qemuTaskList = this.db.nodeTaskList.filter((item) => {
            return item.status !== "OK";
          });
        } else {
          this.__init__();
        }
      }
      this.chunks();
    },
    handleSort({ colume, prop, order }) {
      let _this = this;
      if (order !== null)
        _this.qemuTaskList = quickSort(
          _this.db.nodeTaskList,
          prop,
          order === "ascending" ? "+" : "-"
        );
    },
    chunks() {
      this.chunkDataList = chunkData(this.qemuTaskList, this.pageSize)[
        this.currentPage - 1
      ];
    },
  },
};
</script>
