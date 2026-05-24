<!--
@File(Method): ExportModalGroupList.vue
@Date Created: 2024.10.30
@Description: 게시글 내보내기 모달 (그룹 불러오기)
@modified: 2025.02.04 #71527 [댓글]등록된 태그 없을 경우 안내문구 영역 hover 시 bg 영역은 잡히지 않도록 >> hi-nodata hover시 bg 삭제 공통 적용  >>>  nodata를 hi-nodata로 변경 적용 및 style 변경
-->
<template>  
  <div v-show="isShow" class="option-list type01" v-click-outside="() => closeModal('fetchGroups')">
    <ul>
      <li v-if="groups.length === 0" class="hi-nodata sm">
        <p>등록된 그룹이 없습니다.</p>
      </li>
      <li v-else v-for="group in groups" :key="group.groupId" :class="{ 'is-selected': group.groupId === selectedGroup }">
        <HiButton color="link" class="item" @click="callGroup(group.groupId, group.folderCount)">
          {{ group.groupName }}
        </HiButton>
        <div class="append">
          <HiButton color="link" @click="openGroupEditModal(group)">
            <HiIcon name="ico-pen" size="20"></HiIcon>
          </HiButton>
          <HiButton color="link" @click="openGroupDelModal(group)">
            <HiIcon name="ico-delete" size="20"></HiIcon>
          </HiButton>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import HiButton from "@/components/Button/HiButton";
import HiIcon from "@/components/Icon/HiIcon";
import {mapState} from "vuex";

export default {
  name: "export-modal-group-list",
  components: {HiIcon, HiButton},
  data() {
    return {
      isShow: false,
      groups: [],
      selectedGroup: "그룹이름",
    }
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
  },
  methods: {
    async fetchGroupData() {
      try {
        const response = await this.$axios({
          method: 'get',
          url: `/users/${this.user.currentId}/boards/groups`,          
        })
        this.groups = response.data._embedded.groups
        this.isShow = true
      } catch (error) {
        this.$log.debug('API 호출 실패:', error);
      }
    },

    callGroup(groupId, folderCount) {
      this.$emit('callGroup', {groupId, folderCount})
    },
    openModal(modalName) {
      this.$emit('openModal', modalName)
    },
    closeModal(modalName) {
      this.$emit('closeModal', modalName)
    },
    openGroupEditModal(group) {
      this.$emit('openGroupEditModal', {mode: 'update', groupName: group.groupName, groupId: group.groupId})
    },
    openGroupDelModal(group) {
      this.$emit('openGroupDelModal', {mode: 'delete', groupName: group.groupName, groupId: group.groupId})
    }
  },
  mounted() {
    this.fetchGroupData()
  }
}
</script>

<style lang="scss" scoped>
.post-export-wrap {
  .post-export {
    ::v-deep .modal__layer {
      height: 740px;
    }

    // 그룹불러오기 리스트
    .option-list {
      border: 1px solid #d6d6d6;
      border-radius: 6px;
      overflow-y: auto;
      width: 260px;
      max-height: 242px;
      position: absolute;
      top: 35px;
      background: #fff;
      z-index: 1;
      box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.16);

      > ul {
        max-height: 100%;
        > li {
          .append > button {
            width: 40px;
            height: 40px;

            i:after {
              background-color: #bdbdbd;
            }
            &:hover {
              > i:after {
                background-color: #616161;
              }
            }
          }
          &:hover:not(.hi-nodata) {
            padding-right: 70px;
          }
        }
      }
    }
  }
}
</style>