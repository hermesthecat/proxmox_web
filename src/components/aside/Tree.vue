<template>
  <aside class="aside" ref="aside">
    <div class="aside-select">
      <select class="pv-form-input" v-model="view" @change="setViewFilter" style="padding: 4px 10px">
        <option v-for="(item, key) of viewTypeList" :key="key" :value="item.value">
          {{ item.label }}
        </option>
      </select>
    </div>
    <div class="aside-tree">
      <m-tree :treeData="rootnode" @changeExpand="handleChangeExpand"></m-tree>
    </div>
  </aside>
</template>

<script>
import { mapState } from "vuex";
import VuexMixins from "@src/mixins/VuexMixins";
import { deepCopy, isLeaf, setIconCls, stopEvent, throttle } from "@libs/utils";
import MTree from "./MTree";
export default {
  name: "tree",
  mixins: [VuexMixins],
  components: {
    "m-tree": MTree,
  },
  mounted() {
    let _this = this;
    _this.queryResource();
    // Refresh left navigation tree every 3 seconds
    this.interval = setInterval(() => {
      _this.queryResource();
    }, 3000);
  },
  data() {
    // Get data center name
    let ticket = window.localStorage.getItem("ticket") || "{}",
      tic = JSON.parse(ticket);
    return {
      initX: 0,
      drageable: false,
      view: window.sessionStorage.getItem("lastselview") || "server",
      treeData: { dataIndex: {}, updateCount: 0 },
      defaultKey:
        window.localStorage.getItem("lastOpenViewKey") || "dataCenter",
      defaultSelectNodeKey:
        window.localStorage.getItem("lastOpenViewKey") || "dataCenter",
      typeDefaults: {
        node: {
          iconCls: "fa fa-building",
        },
        pool: {
          iconCls: "fa fa-tags",
        },
        storage: {
          iconCls: "fa fa-database",
        },
        qemu: {
          iconCls: "fa fa-desktop",
        },
        lxc: {
          //iconCls: 'x-tree-node-lxc',
          iconCls: "fa fa-cube",
        },
        template: {
          iconCls: "fa fa-file-o",
        },
      },
      interval: null,
      defaultExpandKeys: [],
      rootnode: {
        id: "root",
        data: {
          text: `Data Center ${tic.clustername ? "(" + tic.clustername + ")" : ""
            }`,
          root: true,
          index: 0,
          parentId: null,
          expanded: true,
          id: "root",
          iconCls: "fa fa-server",
          type: "",
          vmid: 0,
        },
        childNodes: [],
      },
      viewTypeList: {
        server: {
          value: "server",
          label: "Server View",
          iconCls: "fa-server",
          groups: ["node"],
        },
        // type: {
        //   value: "type",
        //   label: "Folder View",
        //   iconCls: "fa-building",
        //   groups: ["type"],
        // },
        storage: {
          value: "storage",
          label: "Storage View",
          groups: ["node"],
          iconCls: "fa-database",
          filterfn: function (node) {
            return node.data.type === "storage" || node.data.type === "node";
          },
        },
        pools: {
          value: "pools",
          label: "Resource Pool View",
          iconCls: "fa-tags",
          groups: ["pool"],
          // Pool View only lists VMs and Containers
          filterfn: function (node) {
            return (
              node.data.type === "qemu" ||
              node.data.type === "lxc" ||
              node.data.type === "openvz" ||
              node.data.type === "pool"
            );
          },
        },
      },
    };
  },
  methods: {
    // Query all resources
    queryResource() {
      this.$http.get("/json/cluster/resources").then(async (res) => {
        if (res.data) {
          await this.updateTable({
            tableName: "resources",
            list: res.data,
          }).then(() => {
            this.$nextTick(() => {
              this.updateTree();
            });
          });
        }
      });
    },
    // Filter view
    setViewFilter() {
      this.treeData = { dataIndex: {}, updateCount: 0 };
      this.updateTree();
    },
    updateTree() {
      // Construct root node
      let rootnode = {
        id: "root",
        data: {
          text: "Data Center (test)",
          root: true,
          index: 0,
          parentId: null,
          expanded: true,
          id: "root",
          iconCls: "fa fa-server",
          type: "",
          vmid: 0,
        },
        childNodes: [],
      },
        lastsel = JSON.parse(window.localStorage.getItem("lastsel")) || {}, // Last selected node
        defaultKeys = window.localStorage.getItem("defaultExpandKeys")
          ? JSON.parse(window.localStorage.getItem("defaultExpandKeys"))
          : [],
        parents = [], // Parent nodes
        p = lastsel,
        index = this.treeData.dataIndex, // Index
        groups = this.viewTypeList[this.view].groups || [], // Groups
        // Initialize data
        restore = Object.assign(
          [],
          this.$store.state.db.resources.map((item) => {
            item.type === "node"
              ? (item.text = item.node)
              : item.type === "qemu"
                ? (item.text =
                  item.vmid + `${item.name ? "(" + item.name + ")" : ""}`)
                : item.type === "pool"
                  ? (item.text = item.pool)
                  : item.type === "storage"
                    ? (item.text =
                      item.storage + `${item.node ? "(" + item.node + ")" : ""}`)
                    : item.type === "lxc"
                      ? (item.text =
                        item.vmid + `${item.name ? "(" + item.name + ")" : ""}`)
                      : "";
            return {
              id: item.id,
              data: item,
            };
          })
        ),
        filterfn = this.viewTypeList[this.view].filterfn,
        // Remove duplicates
        rstore = restore.reduce((target, origin) => {
          if (!target.hasOwnProperty(origin.id)) {
            target[origin.id.replace(/^\//g, "")] = origin;
          }
          return target;
        }, {}),
        reselect = false,
        _this = this,
        key;
      this.rootnode.childNodes = [];
      this.defaultExpandKeys = defaultKeys;
      window.localStorage.setItem("lastselview", this.view || "");
      // Traverse source data to compare nodes and check if there are any data node changes
      for (key in index) {
        if (index.hasOwnProperty(key)) {
          let olditem = index[key],
            item = rstore[olditem.data.id],
            changed = false,
            moved = false;
          if (item) {
            let i, len;
            for (i = 0, len = groups.length; i < len; i++) {
              let attr = groups[i];
              if (item.data[attr] != olditem.data[attr]) {
                moved = true;
                break;
              }
            }
            if (!moved && item.data.node !== olditem.data.node) {
              moved = true;
            }
            let fields = [
              "text",
              "running",
              "template",
              "status",
              "qmpstatus",
              "hastate",
              "lock",
            ];

            let field;
            for (i = 0; i < fields.length; i++) {
              field = fields[i];
              if (item.data[field] !== olditem.data[field]) {
                changed = true;
                olditem.data[field] = item.data[field];
                break;
              }
            }

            // fixme: also test filterfn()?
          }
          if (changed) {
            let info = olditem.data;
            Object.assign(info, item.data);
            setIconCls(info, this.typeDefaults);
            _this.$nextTick(() => {
              this.refresh();
              this.selectById(lastsel.id, lastsel);
              _this.handleChangeExpand(_this.defaultExpandKeys);
            });
          }
          if ((!item || moved) && olditem.data.leaf) {
            delete index[key];
            var parentNode = olditem.parentNode;
            if (
              lastsel &&
              lastsel.data &&
              olditem.data.id === lastsel.data.id
            ) {
              reselect = true;
            }
            parentNode.childNodes && parentNode.childNodes.splice(olditem, 1);
          }
          if (moved) {
            _this.$nextTick(() => {
              this.refresh();
              this.selectById(lastsel.id, lastsel);
              _this.handleChangeExpand(_this.defaultExpandKeys);
            });
          }
        }
      }
      let isChange = false;
      if (Object.keys(index).length !== restore.length) {
        isChange = true;
      } else {
        isChange = false;
      }
      //给节点数据分组并排序
      restore.forEach((item) => {
        var olditem = index[item.data.id];
        if (olditem) {
          return;
        }
        if (filterfn && !filterfn(item)) {
          return;
        }
        let info = Object.assign(
          {},
          { leaf: true, selected: false, expanded: false },
          item.data
        ),
          child = this.groupChild(rootnode, info, groups, 0);
        if (child) {
          index[item.data.id] = child;
        }
      });
      let sel = JSON.parse(window.localStorage.getItem("lastsel"));
      if (sel && sel.id && sel.id === "root")
        Object.assign(this.rootnode, { selected: true });
      if (_this.view !== "type") {
        Object.keys(_this.treeData.dataIndex).forEach((item) => {
          // _this.rootnode.childNodes.push(_this.treeData.dataIndex[item]);
          _this.$set(_this.rootnode, "childNodes", [
            ..._this.rootnode.childNodes,
            _this.treeData.dataIndex[item],
          ]);
        });
      }
      if (lastsel && !this.findChild(this.rootnode, "id", lastsel.id)) {
        lastsel = this.rootnode;
        while (!!(p === parents.shift())) {
          if (
            !!(tmp = this.findChild(
              _this.findChild(this.rootnode, "id", lastsel.id, true),
              "id",
              p.data.id,
              true
            ))
          ) {
            lastsel = tmp;
            break;
          }
        }
        if (
          window.localStorage.getItem("lastsel") === "{}" &&
          this.$route.path.indexOf("datacenter") < 0
        ) {
          this.$router.push("/datacenter/overview");
        } else if (this.$route.path.indexOf("datacenter") >= 0) {
          this.selectById(lastsel.id, lastsel);
        }
      } else {
        this.selectById(lastsel.id, lastsel);
      }
      _this.handleChangeExpand(_this.defaultExpandKeys);
      this.treeData.updateCount++;
    },
    refresh() {
      let rootnode = {
        id: "root",
        data: {
          text: "Data Center (test)",
          root: true,
          index: 0,
          parentId: null,
          expanded: true,
          id: "root",
          iconCls: "fa fa-server",
          type: "",
          vmid: 0,
        },
        childNodes: [],
      },
        index = this.treeData.dataIndex,
        groups = this.viewTypeList[this.view].groups || [];
      for (let key in this.treeData.dataIndex) {
        let info = this.treeData.dataIndex[key].data,
          child = this.groupChild(rootnode, info, groups, 0);
        if (child) {
          index[key] = child;
        }
      }
    },
    findParentId(id) {
      let parentId = "";
      let loop = (item) => {
        item.forEach((it) => {
          if (it.data.id === id) {
            parentId = it.data.parentId;
            window.sessionStorage.setItem(
              "lastsel",
              JSON.stringify(it.data) || "{}"
            );
          }
          if (it.childNodes && it.childNodes.length > 0) {
            loop(it.childNodes);
          }
        });
      };
      loop([this.rootnode]);
      return parentId;
    },
    handleChangeExpand(arr) {
      let loop = (item) => {
        item.forEach((it) => {
          if (
            arr.includes(it.data.id) ||
            this.defaultExpandKeys.includes(it.data.id)
          ) {
            Object.assign(it.data, { expanded: true });
          } else if (it.data.id !== "root") {
            Object.assign(it.data, { expanded: false });
          }
          if (it.childNodes && it.childNodes.length > 0) {
            loop(it.childNodes);
          }
        });
      };
      window.localStorage.setItem("defaultExpandKeys", JSON.stringify(arr));
      loop([this.rootnode]);
    },
    selectById(id, lastSelNode) {
      let parentId = this.findParentId(id);
      if (!lastSelNode.parentId) {
        Object.assign(lastSelNode, { parentId });
      }
      let loop = (item) => {
        item.forEach((it) => {
          if (it.data.id === id) {
            Object.assign(it.data, { selected: true });
          } else {
            Object.assign(it.data, { selected: false });
          }
          if (it.childNodes && it.childNodes.length > 0) {
            loop(it.childNodes);
          }
        });
      };
      loop([this.rootnode]);
    },
    setTypeText(info) {
      if (info.type === "type") {
        info.text = this.$t(`type.${info.text}`);
      }
      return info;
    },
    groupChild(node, info, groups, level) {
      let _this = this,
        groupby = groups[level],
        v = info[groupby];
      if (v) {
        let group = _this.findChild(node, "groupbyid", v);
        if (!group) {
          let groupinfo;
          if (info.type === groupby) {
            groupinfo = info;
          } else {
            groupinfo = {
              type: groupby,
              id: groupby + "/" + v,
            };
            if (groupby !== "type") {
              groupinfo[groupby] = v;
            }
          }
          groupinfo.leaf = false;
          groupinfo.groupbyid = v;
          groupinfo.parentId = node.id;
          groupinfo.selected = false;
          groupinfo.expanded = false;
          group = _this.addChildSorted(node, groupinfo);
        }
        if (info.type === groupby) {
          return group;
        }
        if (group) {
          //setIconCls(group.data, this.typeDefaults);
          return _this.groupChild(group, info, groups, level + 1);
        }
      }
      return _this.addChildSorted(node, info);
    },
    findChild: function (d, e, c) {
      for (let child of d.childNodes) {
        if (child.data[e] === c) {
          return child;
        }
        if (child.childNodes && child.childNodes.length > 0) {
          for (let children of child.childNodes) {
            if (children.data[e] === c) {
              return children;
            }
          }
        }
      }
    },
    addChildSorted: function (node, info) {
      let _this = this;
      setIconCls(info, this.typeDefaults);
      var defaults;
      if (info.groupbyid) {
        info.text = info.groupbyid;
        if (info.type === "type") {
          defaults = _this.view[info.groupbyid];
          if (defaults && defaults.label) {
            info.text = defaults.label;
          }
        }
      }
      info.parentId = node.id;
      var child = Object.assign(
        {},
        { id: info.id, childNodes: [] },
        { data: info }
      );
      var cs = node.childNodes;
      var index;
      if (cs) {
        index = _this.findInsertIndex(node, child, 0, cs.length);
      }
      _this.insertBefore(node, child, index);
      return child;
    },
    insertBefore(node, child, index) {
      node.childNodes.splice(index, 0, child);
      let newNode = deepCopy(node);
      delete newNode.childNodes;
      Object.assign(child, { parentNode: newNode });
      return node;
    },
    setText: function (info) {
      var me = this;

      var status = "";
      // if (info.type === 'storage') {
      //   var maxdisk = info.maxdisk;
      //   var disk = info.disk;
      //   var usage = disk/maxdisk;
      //   var cls = '';
      //   if (usage <= 1.0 && usage >= 0.0) {
      //     var height = (usage*100).toFixed(0);
      //     var neg_height = (100-usage*100).toFixed(0);
      //     status = '<div class="usage-wrapper">';
      //     status += '<div class="usage-negative" style="height: ';
      //     status += neg_height + '%"></div>';
      //     status += '<div class="usage" style="height: '+ height +'%"></div>';
      //     status += '</div> ';
      //   }
      // }

      info.text = info.text;
    },
    findInsertIndex(node, child, start, end) {
      let _this = this;
      let diff = end - start;
      let mid = start + (diff >> 1);
      if (diff <= 0) {
        return start;
      }
      let res = _this.nodeSortFn(child, node.childNodes[mid]);
      if (res <= 0) {
        return _this.findInsertIndex(node, child, start, mid);
      } else {
        return _this.findInsertIndex(node, child, mid + 1, end);
      }
    },
    nodeSortFn: function (node1, node2) {
      var n1 = node1.data;
      var n2 = node2.data;

      if ((n1.groupbyid && n2.groupbyid) || !(n1.groupbyid || n2.groupbyid)) {
        var tcmp;

        var v1 = n1.type;
        var v2 = n2.type;

        if ((tcmp = v1 > v2 ? 1 : v1 < v2 ? -1 : 0) != 0) {
          return tcmp;
        }

        // numeric compare for VM IDs
        // sort templates after regular VMs
        if (v1 === "qemu" || v1 === "lxc") {
          if (n1.template && !n2.template) {
            return 1;
          } else if (n2.template && !n1.template) {
            return -1;
          }
          v1 = n1.vmid;
          v2 = n2.vmid;
          if ((tcmp = v1 > v2 ? 1 : v1 < v2 ? -1 : 0) != 0) {
            return tcmp;
          }
        }

        return n1.id > n2.id ? 1 : n1.id < n2.id ? -1 : 0;
      } else if (n1.groupbyid) {
        return -1;
      } else if (n2.groupbyid) {
        return 1;
      }
    },
  },
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  watch: {
    // "$store.state.db.changeTree":  function(newVal,oldVal) {
    //     if(newVal) {
    //       this.queryResource();
    //     }
    // }
  },
};
</script>

<style scoped lang="less">
.aside {
  width: 180px;
  position: absolute;
  padding-top: 60px;
  min-height: 100%;
  cursor: pointer;
  background: #2e3d50;
  border-right: 1px solid #f5f5f5;
  color: #fff !important;

  &-select {
    margin: 5px 10px;
    position: relative;
    background-color: #fff;

    &:after {
      position: absolute;
      top: 36%;
      right: 11px;
      background-color: transparent;
      color: #52545c;
      font: normal normal normal 12px FontAwesome;
      content: "\F0D7";
      pointer-events: none;
      font-size: 11px;
    }
  }

  &_col-resize {
    height: 100%;
    border-right: 3px solid #ded0d0;
    position: absolute;
    right: 0;
    top: 0;
    cursor: col-resize;
  }
}
</style>
