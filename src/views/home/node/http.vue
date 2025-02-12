<script>
import { parse_task_upid } from "@libs/utils/index";
export default {
  name: "NodeHttp",
  methods: {
    //Batch operation vm
    beatchOperate(operate, node, param) {
      let event = this.createEvent(`action.node.${operate}`);
      return this.$http
        .post(`json/nodes/${node}/${operate}`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then(async (res) => {
          this.incEventSuccess(event);
          if (res.data) {
            let task = parse_task_upid(res.data);
            await this.queryLog(task.node, res.data);
            await this.queryStatus(task.node, res.data);
          }
        })
        .catch((res) => {
          this.incEventFail(event);
          return Promise.reject(event);
        });
    },
    //Query resources
    queryResource() {
      return this.$http
        .get(`json/cluster/resources`)
        .then((res) => {
          if (res.data) {
            return Promise.resolve(res.data);
          }
        })
        .catch((res) => {
          return Promise.reject(res);
        });
    },
    //Query batch operation logs
    queryLog(node, pid) {
      return this.$http
        .get(`json/nodes/${node}/tasks/${pid}/log`, {
          _dc: new Date().getTime(),
          start: 0,
          limit: 500,
        })
        .then((res) => {
          if (res.status !== "running" && this.interVal) {
            clearInterval(this.interVal);
            this.interVal = null;
          }
          this.updateTable({
            tableName: "addClusterLogList",
            list: res.data,
          });
        });
    },
    //Query batch operation status
    queryStatus(node, pid) {
      return this.$http
        .get(`json/nodes/${node}/tasks/${pid}/status`, {
          _dc: new Date().getTime(),
        })
        .then((res) => {
          if (res.status !== "running" && this.interVal) {
            clearInterval(this.interVal);
            this.interVal = null;
          }
          this.updateDbObject({
            name: "addClusterStatusObj",
            data: res.data,
          });
        });
    },
    //Stop current task
    stopTask(node, pid) {
      return this.$http.del(`json/nodes/${node}/tasks/${pid}`);
    },
    //Query nodes
    queryNodeList() {
      return this.$http.get(`json/nodes`).then((res) => {
        if (res.data) {
          this.updateTable({
            tableName: "nodeList",
            list: res.data,
          });
        }
      });
    },
  },
};
</script>
