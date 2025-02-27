<script>
import { genUniqueId, on, off, throttle, stopEvent } from "@libs/utils/index";
import Vue from "vue";
export default {
  name: "toolTips",
  props: {
    openDelay: {
      type: Number,
      default: 0,
    },
    disabled: Boolean,
    manual: Boolean,
    popperClass: String,
    content: String,
    visibleArrow: {
      default: true,
    },
    transition: {
      type: String,
      default: "el-fade-in-linear",
    },
    popperOptions: {
      default() {
        return {
          boundariesPadding: 10,
          gpuAcceleration: false,
        };
      },
    },
    tabindex: {
      type: Number,
      default: 0,
    },
    enterable: {
      type: Boolean,
      default: true,
    },
    hideAfter: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      tooltipId: `el-tooltip-${genUniqueId()}`,
      timeoutPending: null,
      focusing: false,
    };
  },
  mounted() {
    // Get parent component's element
    this.referenceElm = this.$el;
    if (this.$el.nodeType === 1) {
      // Set tooltip ID for parent component
      this.$el.setAttribute("aria-describedby", this.tooltipId);
      // Set tabindex for parent component to make it focusable
      this.$el.setAttribute("tabindex", this.tabindex);
      // Show tooltip on mouse enter
      on(this.referenceElm, "mouseenter", this.show);
      // Hide tooltip on mouse leave
      on(this.referenceElm, "mouseleave", this.hide);
      // Focus
      on(this.referenceElm, "focus", () => {
        if (!this.$slots.default || !this.$slots.default.length) {
          this.handleFocus();
          return;
        }
        const instance = this.$slots.default[0].componentInstance;
        if (instance && instance.focus) {
          instance.focus();
        } else {
          this.handleFocus();
        }
      });
      // Hide component when focus is lost
      on(this.referenceElm, "blur", this.handleBlur);
      // Hide component when clicked and focus is lost
      on(this.referenceElm, "click", this.removeFocusing);
    }
    if (this.popperVM) {
      this.popperVM.$nextTick(() => {
        this.$forceUpdate();
      });
    }
  },
  methods: {
    // Hide tooltip
    handleClosePopper() {
      if ((this.enterable && this.expectedState) || this.manual) return;
      clearTimeout(this.timeout);

      if (this.timeoutPending) {
        clearTimeout(this.timeoutPending);
      }
      this.popperVM.$el.style.display = "none";
      this.showPopper = false;

      if (this.disabled) {
        this.doDestroy();
      }
    },
    // Render first element (default slot)
    getFirstElement() {
      const slots = this.$slots.default;
      if (!Array.isArray(slots)) return null;
      let element = null;
      for (let index = 0; index < slots.length; index++) {
        if (slots[index] && slots[index].tag) {
          element = slots[index];
        }
      }
      return element;
    },
    doDestroy() { },
    // Set expected state
    setExpectedState(expectedState) {
      if (expectedState === false) {
        clearTimeout(this.timeoutPending);
      }
      this.expectedState = expectedState;
    },
    // Show tooltip
    handleShowPopper() {
      if (!this.expectedState || this.manual) return;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.showPopper = true;
        let x = this.$el.getBoundingClientRect().x,
          y = this.$el.getBoundingClientRect().y;
        this.popperVM.$el.style.left = x + "px";
        this.popperVM.$el.style.top = y + this.$el.clientHeight + 10 + "px";
        this.popperVM.$el.style.display = "block";
        document.body.appendChild(this.popperVM.$el);
        this.popperVM.$el.focus();
        this.focusing = true;
      }, this.openDelay);

      if (this.hideAfter > 0) {
        this.timeoutPending = setTimeout(() => {
          this.showPopper = false;
        }, this.hideAfter);
      }
    },
    show(event) {
      this.setExpectedState(true);
      this.handleShowPopper();
      stopEvent(event);
    },

    hide(event) {
      this.setExpectedState(false);
      this.debounceClose();
      stopEvent(event);
      this.destroyPopper();
    },
    handleFocus(event) {
      this.focusing = true;
      this.destroyPopper();
      this.show(event);
    },
    handleBlur(event) {
      this.focusing = false;
      this.hide(event);
    },
    removeFocusing(event) {
      this.focusing = false;
      stopEvent(event);
    },
    addTooltipClass(prev) {
      if (!prev) {
        return "el-tooltip";
      } else {
        return "el-tooltip " + prev.replace("el-tooltip", "");
      }
    },
    updatePopper() {
      this.setExpectedState(true);
      this.handleShowPopper();
    },
    destroyPopper() {
      this.popperVM.$el.style.display = "none";
      document.body.removeChild(this.popperVM.$el);
    },
  },
  beforeCreate() {
    this.popperVM = new Vue({
      data: { node: "" },
      render(h) {
        return this.node;
      },
    }).$mount();
    this.debounceClose = throttle(() => this.handleClosePopper(), 200);
  },
  render(h) {
    if (this.popperVM) {
      this.popperVM.node = (
        <transition name={this.transition} onAfterLeave={this.doDestroy}>
          <div
            onMouseleave={() => {
              this.setExpectedState(false);
            }}
            onMouseenter={() => {
              this.setExpectedState(true);
            }}
            ref="popper"
            role="tooltip"
            tabIndex="0"
            id={this.tooltipId}
            aria-hidden={!this.showPopper ? "true" : "false"}
            v-show={this.showPropper}
            class="tooltip-content"
          >
            {this.$slots.content || this.content}
          </div>
        </transition>
      );
    }
    const firstElement = this.getFirstElement();
    if (!firstElement) return null;

    const data = (firstElement.data = firstElement.data || {});
    data.staticClass = this.addTooltipClass(data.staticClass);

    return firstElement;
  },
  beforeDestroy() {
    this.popperVM && this.popperVM.$destroy();
    if (this.$refs.popper && this.$refs.popper.parentNode === document.body) {
      document.body.removeChild(this.$refs.popper);
    }
  },

  destroyed() {
    const reference = this.referenceElm;
    if (reference.nodeType === 1) {
      off(reference, "mouseenter", this.show);
      off(reference, "mouseleave", this.hide);
      off(reference, "focus", this.handleFocus);
      off(reference, "blur", this.handleBlur);
      off(reference, "click", this.removeFocusing);
    }
  },
  showPopper(val) {
    if (this.disabled) return;
    val ? this.updatePopper() : this.destroyPopper();
    this.$emit("input", val);
  },
};
</script>

<style scoped>
.tooltip-content {
  position: absolute;
  z-index: 999;
  background: #ffff;
  border: 1px solid #333;
  padding: 10px;
  line-height: 20px;
  border-radius: 3px;
}
</style>
