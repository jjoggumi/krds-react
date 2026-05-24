<template>
  <div id="wrap" class="l-page-sub">
    <div class="hi-modal-common modal-admin-folder-next" style="display: block">
      <div class="modal__dim"></div>
      <div class="modal__layer">
        <div class="modal__header">
          <h2 class="heading">기본폴더를 선택해주세요.</h2>
          <p class="desc mt-10">이 후 작성된 게시글은 기본 폴더에 저장됩니다.</p>
          <button class="btn-close" @click="onClose"></button>
        </div>
        <div class="modal__content">
          <div class="admin-checkbox__list">
            <div class="admin-checkbox____item" v-for="(item, idx) in folders" :key="idx">
              <input type="radio" :id="'folders' + idx" :value="idx" v-model="setDefault" name="folder">
              <label :for="'folders' + idx">
                <span><span class="icon-color" :style="{ 'background-color': item.color }"></span>{{ item.folderName }}</span>
              </label>
            </div>
          </div>
          <div class="group-btn">
            <button class="hi-btn btn-md btn-line" @click="onClose">취소</button>
            <button class="hi-btn btn-md" @click="onSubmit">확인</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DefaultFolderSelectModal",
  props: {
    items: {
      type: Array
    }
  },
  data() {
    return {
      folders: [],
      setDefault: 0
    }
  },
  mounted() {
    this.folders =  this.items
  },
  methods: {
    onClose() {
      this.$emit('onChangeFolderModal', false)
    },
    onSubmit() {
      // this.$toasted.clear()
      // this.$toasted.show('폴더 사용을 OFF 해도 작성한 게시글은 모두 확인 가능합니다.')
      this.folders.forEach((item, idx) => {
        item.isDefault = idx === this.setDefault ? true : false
      })
      this.$emit('setFolder', this.folders)
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-admin-folder-next {
  .admin-checkbox____item {
    .folder {
      &::before {
        content: "";
        display: inline-block;
        width: 18px;
        height: 16px;
        background: url("~@/assets/img/icon/icons_board.png") -180px -80px/200px auto no-repeat;
        vertical-align: middle;
        margin-right: 6px;
        margin-top: -2px;
      }
    }
  }
  .modal__layer { 
    width: 410px;
  }
  .admin-checkbox__list {
    height: 230px;
  }
  .group-btn {
    .hi-btn {
      width: 150px;
      margin: 24px 4px 0;
    }
  }
}
</style>