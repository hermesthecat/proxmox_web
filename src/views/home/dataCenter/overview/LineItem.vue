<template>
  <div class="line">
    <h1 class="line-title">{{ title }}</h1>
    <template v-if="isDouble && type !== 'node'">
      <div class="line-content">
        <div class="line-content-item">
          <i class="good fa fa-play-circle"></i>Running
        </div>
        <div class="line-content-item">{{ data && data.running }}</div>
      </div>
      <div class="line-content">
        <div class="line-content-item">
          <i class="fail fa fa-stop-circle"></i>Stopped
        </div>
        <div class="line-content-item">{{ data && data.stopped }}</div>
      </div>
      <div class="line-content" v-show="data && data.template">
        <div class="line-content-item"><i class="fa fa-circle-o"></i>Template</div>
        <div class="line-content-item">{{ data && data.template }}</div>
      </div>
      <div class="line-content" v-show="data && data.error">
        <div class="line-content-item">
          <i class="critical fa fa-times-circle"></i>Error
        </div>
        <div class="line-content-item">{{ data && data.error }}</div>
      </div>
    </template>
    <template v-if="isDouble && type == 'node'">
      <div class="line-content">
        <div class="line-content-item">
          <i class="good fa fa-play-circle"></i>Online
        </div>
        <div class="line-content-item">{{ data && data.online }}</div>
      </div>
      <div class="line-content">
        <div class="line-content-item">
          <i class="fail fa fa-stop-circle"></i>Offline
        </div>
        <div class="line-content-item">{{ data && data.offline }}</div>
      </div>
    </template>
    <template v-if="!isDouble">
      <div class="single line-content">
        <div class="single line-content-item">
          <i :class="['fa fa-5x', icon]"></i>
        </div>
        <div class="single line-content-item">
          {{ des }}
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "LineItem",
  props: {
    title: String,
    isDouble: Boolean,
    data: Object,
    type: String,
    icon: String,
    des: String, // Description
  },
};
</script>

<style scoped lang="less">
.line {
  display: inline-block;
  padding: 20px 0px;
  width: 100%;
  height: 100%;

  &-title {
    text-align: center;
    padding: 0px 0px 20px 0px;
  }

  &-content {
    display: flex;
    flex-grow: 1;

    &-item {
      flex: 1 1 auto;
      padding: 5px 20px;

      &:nth-child(2) {
        text-align: right;
      }
    }
  }
}

.fail {
  color: #cfcfcf;
}

.single.line-content-item {
  display: block;
  text-align: center;
}

.single.line-content {
  display: block;
}

.fa-5x {
  font-size: 50px;
}

.critical {
  color: #ff6c59;
}
</style>
