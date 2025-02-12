<script>
export default {
  name: "NodeDiskLvmHttp",
  data() {
    return {
      node: "",
    };
  },
  mounted() {
    let last = window.localStorage.getItem("lastsel") || "[]";
    this.node = (JSON.parse(last).node && JSON.parse(last).node) || "";
  },
  methods: {
    //Query disk
    queryDiskLvm(param) {
      this.loading = true;
      return this.$http
        .get(`json/nodes/${this.node}/disks/lvm`, param)
        .then((res) => {
          this.loading = false;
          if (res.data) {
            this.updateDbObject({
              name: "nodeDiskLvmObj",
              data: res.data,
            });
          }
        })
        .catch((res) => {
          this.loading = false;
        });
    },
    //Query node disk list
    queryListNodeDiskList(param) {
      return this.$http
        .get(`json/nodes/${this.node}/disks/list`, param)
        .then((res) => {
          if (res.data) {
            this.updateTable({
              tableName: "nodeDiskList",
              list: res.data,
            });
          }
        });
    },
    //Create volume group
    createVolumeGroup(param) {
      let event = this.createEvent(`action.node.disk.lvm.create`);
      return this.$http
        .post(`json/nodes/${this.node}/disks/lvm`, param, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
        })
        .catch((res) => {
          return Promise.reject(res);
        });
    },
  },
};
</script>
