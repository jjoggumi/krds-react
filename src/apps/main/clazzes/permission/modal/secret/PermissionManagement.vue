<!--
@File(Method): ReadableMemberManagement.vue
@Author: 권영준
@Date Created: - 2024-11-27
@Description: 게시판 추가 > 비밀게시판 > 게시판 권한 설정 > 게시판 권한 설정 모달
-->
<template>
  <div>
    <HiModal type="type01" size="lg" @close="modalClose">
      <template v-slot:heading>
        게시판 권한 설정
        <div class="smr">
          구성원 별 게시판의 권한을 설정해주세요.
        </div>
      </template>
      <template v-slot:content>
        <!-- 권한 설정 테이블 -->      
        <div class="btn-group d-flex j-right">
          <HiButton color="light-primary" bitrounded size="sm" @click="isReadableMemberManagement = true">읽기 권한 추가/해제</HiButton>
        </div>
        <div class="permission-table">
          <table class="hi-tbl type04">
            <caption>권한 설정 테이블</caption>
            <colgroup>
              <col style="width:360px;">
              <col style="width:180px;">
              <col style="width:180px;">
            </colgroup>
            <thead>
              <tr>
                <th>읽기 가능 구성원 목록</th>
                <th>
                  <input type="checkbox"
                    id="toggleAllWrite" 
                    @change="toggleAllWrite" 
                    :checked="isAllWriteSelected"
                    @click="toggleAllWrite"
                    :disabled="innerValue.length === 0"
                  />
                    <label for="toggleAllWrite"><span>글쓰기 <small>({{ countPermission('isWritable') }})</small></span></label>
                </th>
                <th>
                  <input type="checkbox"
                    id="toggleAllComment" 
                    @change="toggleAllComment" 
                    :checked="isAllCommentSelected"
                    @click="toggleAllComment"
                    :disabled="innerValue.length === 0"
                  />
                  <label for="toggleAllComment"><span>댓글쓰기 <small>({{ countPermission('isCommentable') }})</small></span></label>
                </th>
              </tr>
            </thead>
          </table>
          <div class="custom-scr" v-if="innerValue.length > 0">
            <table class="hi-tbl type04">
              <caption>권한 설정 테이블</caption>
              <colgroup>
                <col style="width:360px;">
                <col style="width:180px;">
                <col style="width:180px;">
              </colgroup>            
            <tbody>
              <tr v-for="user in innerValue" :key="user.userId">
                <td>
                  <item :user="user" />
                </td>
                <td>
                  <input type="checkbox"
                    :id="'write-' + user.userId" 
                    v-model="user.isWritable"
                  />
                  <label :for="'write-' + user.userId"></label>
                </td>
                <td>
                  <input type="checkbox"
                    :id="'comment-' + user.userId" 
                    v-model="user.isCommentable"
                  />
                  <label :for="'comment-' + user.userId"></label>
                </td>
              </tr>
            </tbody>
            </table>
          </div>
          <div class="hi-nodata" v-else>
            <p>
              읽기 가능한 구성원이 없습니다.<br>
              읽기 권한 추가/해제 버튼을 통해 구성원을 추가해 주세요.
            </p>  
            <p class="mt-20">
              <HiButton color="light-primary" bitrounded size="sm" @click="isReadableMemberManagement = true">읽기 권한 추가/해제</HiButton>
            </p>                
          </div>
        </div>
      </template>
      <!-- 저장/취소 버튼 -->
      <template v-slot:footer>
        <HiButton color="light-primary" size="lg" outline @click="modalClose">취소</HiButton>
        <HiButton color="primary" size="lg" @click="savePermissions">저장</HiButton>
      </template> 
    </HiModal>
    <!-- 읽기 권한 추가/해제 모달 -->
    <ReadableMemberManagement
      v-if="isReadableMemberManagement=== true"  
      @close="isReadableMemberManagement= false"
      v-model="innerValue"
      @input="ensureWritableAndCommentable"
    />
  </div>
</template>

<script>
import ReadableMemberManagement from '@/apps/main/clazzes/permission/modal/secret/ReadableMemberManagement';
import { Item } from '@/components/Profile/List';
import { mapState } from 'vuex';

export default {
  name: 'permission-management',
  components: {
    ReadableMemberManagement, Item
  },
  props: {
    value: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  watch: {
    value: {
      handler() {
        this.syncModelValues()
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      members: [],
      innerValue: [],
      isReadableMemberManagement: false
    }
  },
  computed: {
    ...mapState('storeClazzes', ['clazzes']),
    // 글쓰기 체크박스 전체선택 여부
    isAllWriteSelected() {
      return this.innerValue.length > 0 && 
      this.innerValue.every(member => member.isWritable)
    },
    // 댓글 체크박스 전체선택 여부
    isAllCommentSelected() {
      return this.innerValue.length > 0 && 
      this.innerValue.every(member => member.isCommentable)
    }
  },
  created() {
    this.loadClazzMembers(0)
  },
  methods: {
    async loadClazzMembers(page) {
      const { data: { page: {totalPages}, _embedded: { clazzMembers }}} =
          await this.$axios.get(`/clazzes/${this.clazzes.currentId}/members`, {params: { page }})
      this.members.push(...clazzMembers)
      if (page < (totalPages || 1) - 1) {
        await this.loadClazzMembers(page + 1)
      }
      this.syncModelValues()
    },
    syncModelValues() {
      this.innerValue = this.value.map(v => ({...v, ...this.members.find(m => m.userId === v.userId)}))
    },
    // 글쓰기 체크박스 전체 선택/해제
    toggleAllWrite(e) {
      const checked = e.target.checked
      this.innerValue.forEach(member => {
        member.isWritable = checked
      })
    },
    // 댓글 체크박스 전체 선택/해제
    toggleAllComment(e) {
      const checked = e.target.checked
      this.innerValue.forEach(member => {
        member.isCommentable = checked
      })
    },

    // 권한 설정 저장
    savePermissions() {      
      this.$emit('input', this.innerValue)
      this.modalClose()
    },
    // 모달 닫기
    modalClose() {
      this.$emit('close')
    },
    // 글쓰기, 댓글쓰기 권한이 있는 구성원 수
    countPermission(permission) {
      return this.innerValue.filter(member => member[permission]).length
    }, 
    async ensureWritableAndCommentable() {
      this.innerValue.forEach(m => {
        this.$set(m, 'isWritable', m.isWritable || false);
        this.$set(m, 'isCommentable', m.isCommentable || false);
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.permission-table {
  border: 1px solid #e0e0e0;
  margin-top: 13px;
  height:480px;  
  overflow: auto;
  border-radius: 4px;
  table{
    border:0;
    border-bottom:1px solid #e0e0e0;
    thead > tr > th{border-top:0;}
    td{
      padding:12px 20px; 
      .profile-list-item{
        width:320px;
      }      
    }
    &+ .custom-scr{
      height: 425px;
      overflow: auto;
    }
  }
  .hi-nodata{
    padding:165px 0;
  }

  .hi-tbl.type04 > * > tr > th + th, 
  .hi-tbl.type04 > * > tr > td + td{border-left:0;}  
}
</style>