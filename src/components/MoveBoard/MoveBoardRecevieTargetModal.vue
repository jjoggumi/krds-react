<template>
  <div
    class="modal normal-modal slick-modal view-main-detail-modal ofy"
    id="moveBoardReceiveTargetModal"
    style="display: block"
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <!-- <div class="modal-cont-inner"
          v-click-outside="vcoConfig"
          @mouseover="offVco"
          @mouseleave="onVco"> -->
        <div class="modal-cont-inner">

          <div class="modal-board-recevie-target-container" :class="{
            suffix: isSuffix
          }">
            <div class="title-wrap">
              <h2>게시판 이동</h2>
            </div>

            <div class="info-wrap">
              <p>
                {{ fromBoardStr }}에서<br/>
                <em>{{ toBoardStr }}</em>으로 이동합니다.
              </p>
            </div>

            <div class="content-wrap">
              <div class="content">
                <div class="content__title-wrap">
                  <span class="title">수신 대상 선택</span>
                  <span class="info-msg">게시판 읽기 권한이 있는 구성원만 선택할 수 있습니다.</span>
                </div>
                <div class="content__check-wrap">
                  <p>
                    <input type="checkbox" name="chk-rec-target" :id="`chk-rec-target-parent-id-${this.moveObj.board.boardId}`" 
                      :class="{
                        'dis': !isChkTargetParent
                      }"
                      :disabled="!isChkTargetParent"
                      v-model="checkTargetParent"
                    />
                    <label :for="`chk-rec-target-parent-id-${this.moveObj.board.boardId}`">
                      <span>학부모</span>
                    </label>
                  </p>
                  <p>
                    <input type="checkbox" name="chk-rec-target" :id="`chk-rec-target-student-id-${this.moveObj.board.boardId}`" 
                      :class="{
                        'dis': !isChkTargetStudent
                      }"
                      :disabled="!isChkTargetStudent"
                      v-model="checkTargetStudent"
                    />
                    <label :for="`chk-rec-target-student-id-${this.moveObj.board.boardId}`">
                      <span>학생</span>
                    </label>
                  </p>
                </div>
              </div>
              <div class="content" v-if="!isSuffix">
                <div class="content__title-wrap">
                  <span class="title">게시글 푸시 알림</span>
                  <span class="info-msg">게시글이 등록되었다는 푸시 알림 메시지를 보내지 않을 수 있습니다.</span>
                </div>
                <div class="content__check-wrap">
                  <p>
                    <input type="radio" name="chk-board-move-push-send" :id="`chk-board-move-push-send-id-${this.moveObj.board.boardId}`" 
                      :value="true"
                      @click="setPushCheck(true)"
                    />
                    <label :for="`chk-board-move-push-send-id-${this.moveObj.board.boardId}`">
                      <span>푸시 알림 보내기</span>
                    </label>
                  </p>
                  <p>
                    <input type="radio" name="chk-board-move-push-send" :id="`chk-board-move-push-send-no-id-${this.moveObj.board.boardId}`" 
                      :value="false"
                      @click="setPushCheck(false)"
                    />
                    <label :for="`chk-board-move-push-send-no-id-${this.moveObj.board.boardId}`">
                      <span>보내지 않기</span>
                    </label>
                  </p>
                </div>
              </div>
            </div>

            <div class="btn-wrap">
              <button class="esc" @click="close">취소</button>
              <button @click="submit"
                :class="{
                  dis: !this.isCheckedPushSend
                }"
                :disabled="!this.isCheckedPushSend"
              >이동</button>
            </div>

            <div class="modal-close-btn" @click="close"></div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: 'move-board-receive-target-modal',
  components: {

  },
  props: {
    selectObj: {
      type: Object
    },
    moveObj: {
      type: Object
    },
    postId: {
      type: String
    },
    postStatus: {
      type: String
    }
  },
  computed: {
    fromBoardStr() {
      return `${this.selectObj.board.boardName}${this.selectObj.folder ? ` (${this.selectObj.folder.folderName})` : ''}`
    },
    toBoardStr() {
      return `${this.moveObj.board.boardName}${this.moveObj.folder ? ` (${this.moveObj.folder.folderName})` : ''}`
    },
    isChkTargetParent() {
      return this.moveObj.board.isReadParents
    },
    isChkTargetStudent() {
      return this.moveObj.board.isReadStudent
    },
    getPushTarget() {
      let target = "TEACHER"

      if(this.checkTargetParent && this.checkTargetStudent) {
        target = "ALL"
      } else if(this.checkTargetParent) {
        target = "PARENTS"
      } else if(this.checkTargetStudent) {
        target = "STUDENT"
      }

      return target
    },
    isSuffix() {
      return this.postStatus === 'RESERVE' || this.postStatus === 'TEMPORARY' ? true : false
    }
  },
  data() {
    return {
      checkTargetParent: false, 
      checkTargetStudent: false, 
      pushSend: false,
      isCheckedPushSend: false
    }
  },
  methods:{
    setPushCheck(data) {
      this.pushSend = data
      this.isCheckedPushSend = true
    },
    async submit() {
      const obj = {
        boardId: this.moveObj.board.boardId,
        folderId: this.moveObj.folder ? this.moveObj.folder.folderId : null,
        pushTarget: this.getPushTarget,
        isPush: this.pushSend
      }

      try {
        const res = await this.$axios({
          method: 'PATCH',
          url: `/posts/${this.postId}/move`,
          data: obj
        })
        
        if(res) {
          this.$emit("movePost", _.cloneDeep({
            ...this.moveObj, 
            postId: this.postId,
            pushTarget: res.data.pushTarget
          }))
        }
      } catch (err) {
        this.$log.debug('boardmove submit GET() error => ', err)

        if(err.response.status === 428) {
          const errorCode = err.response.data.error
          if(errorCode === "deletedPost") {
            this.$hiClass.alert('게시글이 삭제되었습니다.', 'error')
            this.$emit("close", false, true)
          } else if(errorCode === "deletedBoard") {
            this.$hiClass.alert('해당 게시판이 삭제되었습니다. 다시 선택해주세요.', 'error')
            this.$emit("close", true)
          }  else if(errorCode === "deletedFolder") {
            this.$hiClass.alert('해당 폴더가 삭제되었습니다. 다시 선택해주세요.', 'error')
            this.$emit("close", true)
          }

        }
      }
    },
    close() {
      this.$emit("close")
    }
  },
  mounted() {
    if(this.isSuffix) {
      this.isCheckedPushSend = true
    }
  }
}
</script>

<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
  right: 20px;
}
</style>