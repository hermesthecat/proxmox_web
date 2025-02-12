<script>
import { parse_task_upid } from "@libs/utils/index";
export default {
  name: "ClusterHttp",
  methods: {
    // Query nodes under cluster
    queryClusterNode() {
      return this.$http.get("json/cluster/config/nodes").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "nodeList",
            list: res.data,
          });
        }
      });
    },
    // Query data under cluster
    queryClusterList() {
      return this.$http.get("json/cluster/config/join").then((res) => {
        if (res.data) {
          this.updateDbObject({
            name: "clusterObj",
            data: res.data,
          });
        }
      });
    },
    // Query network under cluster
    queryClusterNetWork() {
      return this.$http.get("json/nodes/localhost/network").then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "netWorkList",
            list: res.data,
          });
        }
      });
    },
    // Create cluster
    createCluster(param) {
      let event = this.createEvent("clusters.action.create", param.clustername);
      return this.$http
        .post("json/cluster/config", param, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
          this.queryClusterList();
        })
        .catch((error) => {
          this.incEventFail(event);
          return Promise.resolve(error);
        });
    },
    // Join cluster
    clusterJoin(param) {
      let event = this.createEvent("clusters.action.join", param.hostname);
      return this.$http
        .post("json/cluster/config/join", param, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then(async (res) => {
          this.incEventSuccess(event);
          if (res.data) {
            let task = parse_task_upid(res.data);
            await this.queryLog(task.node, res.data);
            await this.queryStatus(task.node, res.data);
          }
          this.queryClusterList();
        })
        .catch((error) => {
          this.incEventFail(event);
          return Promise.resolve(error);
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
          if (res.status === "stopped" && this.interVal) {
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
        this.queryClusterList();
      });
    },
  },
};
</script>
