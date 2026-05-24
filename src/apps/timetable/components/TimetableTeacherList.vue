<!--
@File(Method): TimetableTeacherList.vue
@Date Created: 2025-05-12
@Description: 교사 명단 불러오기
-->
<template>
  <TimeTableModal size="lg" @close="$emit('close')" >
    <template v-slot:heading>
      교직원 명단
      <p class="smr">학교알리미에 등록된 교직원의 명단을 불러옵니다. 명단에 없는 선생님은 직접 입력 가능합니다.</p>
    </template>
    <template v-slot:content>
      <div>
        <div class="table-head type01">
          <HiSearchBox
            v-model="searchKeyword"
            :auto-search="true"
            placeholder="교사명 검색"
          />
          <div class="btn-area">
            <button type="button" class="btn btn-primary ml-10" :disabled="!hasChecked" >
              선택 등록하기
            </button>
          </div>
        </div>
        <p class="total-count">
          총 <strong class="txt-primary">0</strong>명 선택
        </p>
        <div class="table-content sticky-wrap table-box sm">
          <table :class="filteredTeacherList.length === 0 ? 'h100' : null">            
            <caption>교사 명단 리스트</caption>
            <colgroup>
              <col style="width:10%">
              <col style="width:25%">
              <col style="width:40%">
              <col style="width:25%">
            </colgroup>
            <thead>
              <tr>
                <th scope="col" class="sticky-top">
                  <div class="form-check">
                    <input type="checkbox" id="allChecked" v-model="allChecked" @change="toggleAllChecked" />
                    <label for="allChecked"></label>
                  </div>
                </th>
                <th scope="col" class="sticky-top">
                  교사명
                  <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
                </th>
                <th scope="col" class="sticky-top">
                  비고
                  <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
                </th>
                <th scope="col" class="sticky-top">
                  가입 여부
                  <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(crs, index) in filteredTeacherList" :key="index">
                <td>
                  <div class="form-check">
                    <input 
                      type="checkbox" 
                      v-model="crs.checked" 
                      :id="'filteredTeacherList-' + index" />
                    <label :for="'filteredTeacherList-' + index"></label>
                  </div>
                </td>
                <td>
                  {{crs.teacher}}
                </td>                
                <td>
                  {{crs.etc}}
                </td>                
                <td>
                    <span :class="crs.registered === '가입1' ? 'registered-type01' : crs.registered === '가입2' ? 'registered-type02' : 'registered'">
                    {{crs.registered === '가입1' || crs.registered === '가입2' ? '가입' : '미가입'}}
                    </span>
                </td> 
              </tr>
              <tr v-if="filteredTeacherList.length === 0">
                <td colspan="4" >
                  <div class="hi-nodata">
                    <p>등록된 교직원이 없습니다.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>       
    </template>
  </TimeTableModal>
</template>

<script >
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
export default {
  data() {
    return {
      searchKeyword: '',
      teacherlist: [
        { teacher: '박선생', etc: "교무부장",  registered:"가입1", checked: false  },
        { teacher: '최선생', etc: "국어선생님", registered:"미가입", checked: false  },
        { teacher: '김선생', etc: "수학선생님", registered:"가입2", checked: false  },
        { teacher: '이선생', etc: "영어선생님", registered:"가입2", checked: false  },
        { teacher: '정선생', etc: "과학선생님", registered:"가입1", checked: false  },
        { teacher: '홍선생', etc: "사회선생님", registered:"미가입", checked: false  },
        { teacher: '홍선생', etc: "사회선생님", registered:"미가입", checked: false  },
        { teacher: '홍선생', etc: "사회선생님", registered:"미가입", checked: false  },
        { teacher: '홍선생', etc: "사회선생님", registered:"미가입", checked: false  },
        { teacher: '홍선생', etc: "사회선생님", registered:"미가입", checked: false  },
        { teacher: '홍선생', etc: "사회선생님", registered:"미가입", checked: false  },
        { teacher: '홍선생', etc: "사회선생님", registered:"미가입", checked: false  },
        { teacher: '홍선생', etc: "사회선생님", registered:"미가입", checked: false  },
        { teacher: '홍선생', etc: "사회선생님", registered:"미가입", checked: false  },
        { teacher: '홍선생', etc: "사회선생님", registered:"미가입", checked: false  },
        { teacher: '홍선생', etc: "사회선생님", registered:"미가입", checked: false  },
      ],
      allChecked: false,
    };
  },
  components: {
    TimeTableModal
  },
  computed: {
    filteredTeacherList() {
      if (!this.searchKeyword) return this.teacherlist;
      return this.teacherlist.filter((crs) => crs.teacher.includes(this.searchKeyword));
    },
    hasChecked() {
      return this.teacherlist.some((crs) => crs.checked);
    },
  },
  methods: {
    toggleAllChecked() {
      this.teacherlist.forEach((crs) => {
        crs.checked = this.allChecked;
      });
    },
  },
};
</script>
<style scoped lang="scss">
.timetable-modal-common {  
  ::v-deep .modal__layer{
    height: 100%;
    .modal__content{
      > div{
        height: 100%;
        display: flex;
        flex-flow: column;
        .table-content{
          flex: 1;
          overflow: auto;
        }
      }
    }
  }
}

span[class*="registered"] {
  color:var(--gray-08);
}
span[class*="registered-type"] {
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: "";
    display: inline-block;
    width: 20px;
    height: 20px;
    mask-image: url(~@/assets/img/timetable/ico-mobile-check.svg);
    background-color: var(--primary);
    mask-size: 100%;
  }
}
span[class*="registered-type02"] {
  &::after {
    background-color: var(--gray-08);
  }
}
</style>
