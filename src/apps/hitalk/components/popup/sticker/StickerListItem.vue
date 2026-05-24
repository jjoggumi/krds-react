<template>
  <li @click="selectStickerItem">
    <img :src="imageThumbnailPath" alt="">
  </li>
</template>

<script>
import {mapMutations, mapState} from "vuex";

export default {
  data: () => ({}),
  props: {
    stickerItem: Object
  },
  computed: {
    ...mapState("storeHitalk", [
      "stickerItemArrayList",
      "selectedStickerItem",
    ]),
    imageThumbnailPath: function(){
      return this.stickerItem.stickerThumbnail;
    }
  },
  methods: {
    ...mapMutations("storeHitalk",[
      "setSelectedStickerItem",
      "hideStickerMessageBox"
    ]),
    selectStickerItem:function(){
      this.setSelectedStickerItem(this.stickerItem);
      this.hideStickerMessageBox();
    }
  }
}
</script>

<style scoped></style>
