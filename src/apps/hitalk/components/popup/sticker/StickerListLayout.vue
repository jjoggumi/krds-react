<template>
  <div class="scrollbar-outer">
    <div class="emoticon-item-wrap">
      <div class="emoticon-item on">
        <ul>
          <sticker-list-item
              v-for="stickerItem in stickerItemArrayList"
              :key="stickerItem.currentId+'-StickerListItem'"
              :stickerItem="stickerItem"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import StickerListItem from "@/apps/hitalk/components/popup/sticker/StickerListItem";

export default {
  components: {StickerListItem},
  data: () => ({
    isShowEmoticon: false,
  }),
  computed: {
    ...mapState("storeHitalk", [
      "stickerItemArrayList"
    ]),
    isDisplay: function () {
      return this.isShowEmoticon ? "display:block;" : "display:none;"
    },
  },

}
</script>

<style scoped></style>