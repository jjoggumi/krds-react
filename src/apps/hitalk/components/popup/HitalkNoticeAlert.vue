<template>
  <div
      class="modal normal-modal hitalk-alert-modal"
      style="display: block;"
  >
    <div class="modal-cont-wrap" style="margin-top: -115px;margin-left: -25px;">
      <div class="modal-cont boundary-box-386">
        <div class="modal-cont-inner">
          <div class="icon-title-wrap">
            <div class="text-wrap">
              <span v-html="getTitle"></span><br>
              <p v-html="getDescription"></p>
            </div>
            <slot></slot>
          </div>
          <div class="btn-wrap">
            <button class="btn-bg-c" @click="closeDialog">{{ $t("chat.confirm") }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
  import {mapMutations} from 'vuex'

  export default {
    name: "HitalkNoticeAlert",
    props: {
        title: String,
        description: String,
        highlight: Boolean
    },
    computed: {
        getTitle: function () {
        return this.title.split('\n').join('<br />')
        },
        getDescription: function () {
        return this.description.split('\n').join('<br />')
        }
    },
    methods: {
      ...mapMutations('storeHitalk',['setHitalkNoticePopup']),
      closeDialog: function(){
        this.$emit("closeDialog")
    }
  }
}
</script>
  
<style scoped></style>
  