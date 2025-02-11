<template>
  <div class="m-tree" ref="m-tree">
    <div class="m-scroll-wrapper tree-scroll-container">
      <div class="m-scroll-view tree-scroll-view" @scroll="onScroll">
        <ul class="m-tree-content">
          <transition name="el-zoom-in-top">
            <li
              v-if="renderData && renderData.data && !renderData.data.parentId"
            >
              <span
                class="m-tree-text"
                :class="
                  renderData.data.selected && renderData.data.selected
                    ? 'is-selected'
                    : ''
                "
                @click.stop="handleSelect(renderData.data)"
              >
                <span
                  :class="
                    renderData.data.expanded
                      ? 'm-tree-expander el-icon-caret-right'
                      : 'm-tree-expander collapse el-icon-caret-right'
                  "
                  @click.stop="handleExpanded(renderData.data)"
                ></span>
                <i :class="renderData.data.iconCls" class="m-icon-custom"></i>
                <span>{{ renderData.data.text }}</span>
              </span>
              <div class="m-tree_li"></div>
              <div class="m-tree-child" v-if="renderData.data.expanded">
                <transition-group name="el-zoom-in-top">
                  <ul
                    v-for="(tree, index) of renderData.childNodes"
                    :key="tree.data.id"
                  >
                    <li
                      v-if="
                        tree.data && tree.data.parentId === renderData.data.id
                      "
                    >
                      <span
                        class="m-tree-text"
                        :class="
                          tree.data.selected && tree.data.selected
                            ? 'is-selected'
                            : ''
                        "
                        @click.stop="handleSelect(tree.data)"
                      >
                        <span
                          :class="
                            tree.data.expanded
                              ? 'm-tree-expander el-icon-caret-right'
                              : 'm-tree-expander collapse el-icon-caret-right'
                          "
                          v-if="tree.childNodes && tree.childNodes.length > 0"
                          @click.stop="handleExpanded(tree.data)"
                        ></span>
                        <i :class="tree.data.iconCls" class="m-icon-custom"></i>
                        <span>{{ tree.data.text }}</span>
                      </span>
                      <div class="m-tree_li"></div>
                      <transition name="el-zoom-in-top">
                        <m-sub-tree
                          :tree-data="tree.childNodes"
                          :parent-id="tree.id"
                          ref="mSubTree"
                          v-show="tree.childNodes && tree.childNodes.length > 0"
                          @reset-select="handleSelect"
                          v-if="tree.data.expanded"
                        ></m-sub-tree>
                      </transition>
                    </li>
                  </ul>
                </transition-group>
              </div>
            </li>
          </transition>
        </ul>
      </div>
      <div
        class="m-scroll-bar"
        v-show="showScrollbar"
        :style="{ top: scrollTop + 'px', height: scrollLength + 'px' }"
        @mousedown="onScrollBarMouseDown($event)"
      ></div>
    </div>
  </div>
</template>

<script>
import MSubTree from "./MSubTree";
import { treeNode } from "@libs/utils";
import MScrollbar from "@src/components/scroll/Scrollbar";

export default {
  name: "MTree",
  mixins: [MScrollbar],
  components: { MSubTree },
  props: {
    treeData: {
      type: Object | Array,
    },
  },
  data() {
    return {
      renderData: {},
      expandedArr: [],
    };
  },
  mounted() {
    this.renderData = this.treeData;
    let el = document.documentElement || document.body;
    this.$refs["m-tree"].style.height = el.clientHeight - 100 + "px";
    this.scrollElementSelector = ".tree-scroll-view";
    this.scrollContainerSelector = ".tree-scroll-container";
    window.addEventListener("resize", this.setTreeHeight, false);
  },
  methods: {
    // Set the height of the left menu
    setTreeHeight() {
      let el = document.documentElement || document.body;
      this.$refs["m-tree"].style.height = el.clientHeight - 100 + "px";
    },
    // Handle tree expansion event
    handleExpanded(node) {
      if (node.hasOwnProperty("expanded")) {
        Object.assign(node, { expanded: !node.expanded });
      } else {
        Object.assign(node, { expanded: true });
      }
      if (node.expanded) {
        // When node is expanded, add to expandedArr
        if (this.expandedArr.indexOf(node.id) === -1)
          this.expandedArr.push(node.id);
        this.$emit("changeExpand", this.expandedArr);
      } else {
        // Collapse
        this.expandedArr.splice(this.expandedArr.indexOf(node.id), 1);
        this.$emit("changeExpand", this.expandedArr);
      }
    },
    // Select tree node
    handleSelect(node) {
      let _this = this;
      // Recursively implement which tree is currently expanded and selected
      let loop = (item) => {
        item.forEach((it) => {
          if (it.data.id === node.id) {
            Object.assign(it.data, { selected: true });
            Object.assign(it.data, { expanded: true });
          } else {
            Object.assign(it.data, { selected: false });
          }
          if (it.childNodes && it.childNodes.length > 0) {
            loop(it.childNodes);
          }
        });
      };
      loop([_this.renderData]);
      _this.$refs.mSubTree &&
        this.$refs.mSubTree.forEach((item) => {
          item.resetSelect(node);
        });
      // Jump to the route corresponding to the selected tree
      _this.linkTo(node);
      _this.$parent.selectById(node.id, node);
      // Set the finally selected tree node
      window.localStorage.setItem("lastsel", JSON.stringify(node) || "");
      this.$forceUpdate();
    },
    // Default route navigation
    linkTo(node) {
      switch (node.type) {
        case "node":
          this.$router.push({ path: "/node/overview" });
          window.localStorage.setItem("lastLink", "/node/overview" || "");
          break;
        case "qemu":
          this.$router.push({ path: "/qemu/overview" });
          window.localStorage.setItem("lastLink", "/qemu/overview" || "");
          break;
        case "lxc":
          this.$router.push({ path: "/qemu/overview" });
          window.localStorage.setItem("lastLink", "/qemu/overview" || "");
          break;
        case "storage":
          this.$router.push({ path: "/storage/overview" });
          window.localStorage.setItem("lastLink", "/storage/overview" || "");
          break;
        case "pool":
          this.$router.push({ path: "/pool/overview" });
          window.localStorage.setItem("lastLink", "/pool/overview" || "");
          break;
        default:
          this.$router.push({ path: "/datacenter/overview" });
          window.localStorage.setItem("lastLink", "/datacenter/overview" || "");
          break;
      }
      this.commitUpateLastSelect(node);
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.setTreeHeight, false);
  },
  watch: {
    treeData: {
      immediate: true,
      deep: true,
      handler: function (newVal, oldVal) {
        // Monitor treeData changes and recursively find which tree should be expanded
        this.renderData = JSON.parse(JSON.stringify(newVal || "{}"));
        let loop = (item) => {
          item.forEach((it) => {
            if (!it.data.hasOwnProperty("expanded")) {
              Object.assign(it.data, { expanded: false });
            }
            if (it.childNodes && it.childNodes.length > 0) {
              loop(it.childNodes);
            }
          });
        };
        loop(this.renderData.childNodes);
      },
    },
    "$store.state.db.searchObject": function (newVal, oldVal) {
      let _this = this;
      // Set default open tree node
      if (newVal !== oldVal) {
        _this.handleSelect(newVal);
      }
    },
  },
};
</script>

<style scoped lang="less">
.m-tree {
  width: 100%;
  padding: 0px 10px;
  background: #2e3d50;
  overflow-y: auto;
  position: relative;
  overflow-x: hidden;

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

  &-content {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    table-layout: fixed;
    display: inline-block;
  }

  &-text {
    font-size: 14px;
    width: 100%;
    padding: 5px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
  }

  &-expander {
    display: inline-block;
    width: 20px;
    height: 16px;
    display: inline-block;
    transform: rotate(90deg);
  }

  &-child {
    .m-tree-text {
      padding-left: 15px;
    }
  }
}

.collapse {
  transform: rotate(0deg);
}

.is-selected {
  background-image: linear-gradient(
    180deg,
    rgba(64, 158, 255, 0.7),
    rgba(64, 158, 255)
  );
  color: #fff;
}

/deep/ .m-icon-custom {
  color: #fff !important;
}
</style>
