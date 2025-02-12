<template>
  <div class="page-template">
    <div class="tool-bar">
      <div class="tool-bar-left">
        <!-- Left Toolbar Area -->
        <slot name="toolbar-left"></slot>
      </div>
      <div class="tool-bar-right">
        <!-- Right Toolbar Area -->
        <slot name="toolbar-right"></slot>
      </div>
      <div v-if="$slots['toolbar']">
        <slot name="toolbar"></slot>
      </div>
    </div>
    <div class="page-template__content" ref="page-template__content">
      <el-scrollbar style="height: 100%">
        <!-- Main Content Area -->
        <slot name="page-content"></slot>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageTemplate",
  mounted() {
    this.$refs["page-template__content"].style.height =
      this.$el.parentElement.clientHeight - 70 + "px";
    window.addEventListener("resize", this.reRenderContent, false);
  },
  methods: {
    reRenderContent() {
      this.$refs["page-template__content"].style.height =
        this.$el.parentElement.clientHeight - 70 + "px";
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.reRenderContent, false);
  },
};
</script>

<style scoped lang="less">
.page-template {
  padding: 19px;
  position: relative;
}

.tool-bar {
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
  position: absolute;
  z-index: 5;
  background: #fff;
  width: 98%;
  height: 50px;
  line-height: 50px;
  margin-top: -20px;

  &-left {
    flex: 1 1 auto;
  }

  &-right {
    flex: 1 1 auto;
  }
}

.page-template {
  &__content {
    height: 100%;
    padding-top: 5px;
    margin-top: 35px;
    min-height: 350px;
  }
}
</style>
