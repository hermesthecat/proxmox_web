<template>
  <div
    class="m-step"
    :style="style"
    :class="[
      !isSimple && `is-${$parent.direction}`,
      isSimple && 'is-simple',
      isLast && !space && !isCenter && 'is-flex',
      isCenter && !isVertical && !isSimple && 'is-center',
    ]"
  >
    <!-- icon & line -->
    <div class="m-step__head" :class="`is-${currentStatus}`">
      <div class="m-step__line" :style="__lineStyle">
        <i class="m-step__line-inner" :style="lineStyle"></i>
      </div>

      <div class="m-step__icon" :class="`is-${icon ? 'icon' : 'text'}`">
        <slot
          v-if="currentStatus !== 'success' && currentStatus !== 'error'"
          name="icon"
        >
          <i v-if="icon" class="m-step__icon-inner" :class="[icon]"></i>
          <div class="m-step__icon-inner" v-if="!icon && !isSimple">
            {{ index + 1 }}
          </div>
        </slot>
        <i
          v-else
          :class="[
            'el-icon-' + (currentStatus === 'success' ? 'check' : 'close'),
          ]"
          class="m-step__icon-inner is-status"
        >
        </i>
      </div>
      <div class="m-step__title" ref="title" :class="['is-' + currentStatus]">
        <slot name="title">{{ title }}</slot>
      </div>
    </div>
    <!-- title & description -->
    <div class="m-step__main">
      <div v-if="isSimple" class="el-step__arrow"></div>
      <div v-else class="m-step__description" :class="['is-' + currentStatus]">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>
  </div>
</template>

<script>
// Step component
export default {
  name: "ElStep",

  props: {
    title: String,
    icon: String,
    description: String,
    status: String,
  },

  data() {
    return {
      index: -1,
      lineStyle: {},
      internalStatus: "",
    };
  },

  beforeCreate() {
    // Add the state of child components to the parent's steps
    this.$parent.steps.push(this);
  },

  beforeDestroy() {
    const steps = this.$parent.steps;
    const index = steps.indexOf(this);
    if (index >= 0) {
      steps.splice(index, 1);
    }
  },

  computed: {
    // Calculate the current step status
    currentStatus() {
      return this.status || this.internalStatus;
    },
    // Previous status
    prevStatus() {
      const prevStep = this.$parent.steps[this.index - 1];
      return prevStep ? prevStep.currentStatus : "wait";
    },
    // Check if centered
    isCenter() {
      return this.$parent.alignCenter;
    },
    // Check if vertical direction
    isVertical() {
      return this.$parent.direction === "vertical";
    },
    isSimple() {
      return this.$parent.simple;
    },
    // Check if it's the last step
    isLast() {
      const parent = this.$parent;
      return parent.steps[parent.steps.length - 1] === this;
    },
    // Total number of steps
    stepsCount() {
      return this.$parent.steps.length;
    },
    // Space
    space() {
      const {
        isSimple,
        $parent: { space },
      } = this;
      return isSimple ? "" : space;
    },
    style: function () {
      const style = {};
      const parent = this.$parent;
      const len = parent.steps.length;

      const space =
        typeof this.space === "number"
          ? this.space + "px"
          : this.space
          ? this.space
          : 100 / (len - (this.isCenter ? 0 : 1)) + "%";
      style.flexBasis = space;
      if (this.isVertical) return style;
      if (this.isLast) {
        style.maxWidth = 100 / this.stepsCount + "%";
      } else {
        style.marginRight = -this.$parent.stepOffset + "px";
      }

      return style;
    },
    __lineStyle() {
      if (this.isLast) {
        return "";
      } else {
        return {
          left: this.$refs.title.clientWidth + 30 + "px",
        };
      }
    },
  },

  methods: {
    // Update step status
    updateStatus(val) {
      const prevChild = this.$parent.$children[this.index - 1];

      if (val > this.index) {
        this.internalStatus = this.$parent.finishStatus;
      } else if (val === this.index && this.prevStatus !== "error") {
        this.internalStatus = this.$parent.processStatus;
      } else {
        this.internalStatus = "wait";
      }

      if (prevChild) prevChild.calcProgress(this.internalStatus);
    },
    // Calculate progress
    calcProgress(status) {
      let step = 100;
      const style = {};

      style.transitionDelay = 150 * this.index + "ms";
      if (status === this.$parent.processStatus) {
        step = this.currentStatus !== "error" ? 0 : 0;
      } else if (status === "wait") {
        step = 0;
        style.transitionDelay = -150 * this.index + "ms";
      }

      style.borderWidth = step && !this.isSimple ? "1px" : 0;
      this.$parent.direction === "vertical"
        ? (style.height = step + "%")
        : (style.width = step + "%");

      this.lineStyle = style;
    },
  },

  mounted() {
    const unwatch = this.$watch("index", (val) => {
      this.$watch("$parent.active", this.updateStatus, { immediate: true });
      this.$watch(
        "$parent.processStatus",
        () => {
          const activeIndex = this.$parent.active;
          this.updateStatus(activeIndex);
        },
        { immediate: true }
      );
      unwatch();
    });
  },
};
</script>
<style scoped lang="less">
@import "~@src/components/step/mstep.less";
</style>
