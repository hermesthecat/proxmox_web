<script>
import { confirm } from "@libs/utils/index";
export default {
  name: "OptionHttp",
  methods: {
    // Query options
    queryOptionList() {
      return this.$http.get("json/cluster/options").then((res) => {
        if (res.data) {
          // Set empty values for the following data to show defaults
          [
            "console",
            "http_proxy",
            "email_from",
            "mac_prefix",
            "migration",
            "ha",
            "keyboard",
          ].forEach((item) => {
            if (!Object.keys(res.data).includes(item)) {
              res.data[item] = "";
            }
          });
          this.updateDbObject({
            name: "optionObj",
            data: res.data,
          });
        }
      });
    },
    // Modify options
    modifyOptions(param) {
      let event = this.createEvent("options.action.modify");
      return this.$http
        .put("json/cluster/options", param, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then((res) => {
          this.incEventSuccess(event);
          this.queryOptionList();
        })
        .catch((res) => {
          this.incEventFail(event);
          confirm.call(this, res, "confirm", "icon-warning");
        });
    },
    // Query network
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
  },
};
</script>
