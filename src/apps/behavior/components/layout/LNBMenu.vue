<template>
  <div class="menu">
    <ul>
      <li :class="{on: selectedLnb === 'classrooms'}" class="mn-classroom" @click="onClick('classrooms')"><i></i><span>{{ isOpen ? '교실' : '' }}</span>
      </li>
      <li :class="{on: selectedLnb === 'records'}" class="mn-record" @click="onClick('records')">
        <i></i><span>{{ isOpen ? '행동기록' : '' }}</span></li>
      <li :class="{on: selectedLnb === 'personnel'}" class="mn-personnel" @click="onClick('personnel')">
        <i></i><span>{{ isOpen ? '인원체크' : '' }}</span></li>
      <!-- <li @click="onClick('classrooms')" class="mn-classrecord"><i></i><span>{{ isOpen ? '학급일지' : ''}}</span></li> -->
      <li :class="{on: selectedLnb === 'reports'}" class="mn-report" @click="onClick('reports')">
        <i></i><span>{{ isOpen ? '학생 리포트' : '' }}</span></li>
      <!-- <li @click="onClick('classrooms')" class="mn-search"><i></i><span>{{ isOpen ? '통합검색' : ''}}</span></li> -->
      <li
          ref="toolkit"
          :class="{on: selectedLnb === 'toolkit'}" class="mn-toolkit" @click="onClick('toolkit')"
          @mouseenter="toolkitHover" @mouseleave="delayedHide"
      >
        <i></i><span>{{ isOpen ? '수업 도구' : '' }}</span>
      </li>
      <li :class="{on: selectedLnb === 'groupmission'}" class="mn-groupmission" @click="onClick('groupmission')">
        <i></i><span>{{ isOpen ? '단체 미션' : '' }}
        <span v-if="curClassroom.groupMission" class="groupmission-badge">
          {{ curClassroom.groupMission.point }}/{{ curClassroom.groupMission.goal }}
        </span>
      </span>
      </li>
    </ul>

    <!-- #74664 -->
    <ToolkitDropdown :targetRef="$refs.toolkit" :visible="isToolkitHovered" @hoverin="clearHide"
                     @hoverout="delayedHide"/>

    <div v-if="isOpen === true" class="guide">
      <ul>
        <li @click="guideView('1')">초기 셋팅 방법<i class="bh-icon-arrowright-circle-fill-20"></i></li>
        <li @click="guideView('2')">전체 가이드 & FAQ<i class="bh-icon-arrowright-circle-fill-20"></i></li>
        <li @click="guideView('3')">업데이트 예정 안내<i class="bh-icon-arrowright-circle-fill-20"></i></li>
      </ul>
    </div>
  </div>
</template>

<script>
import ToolkitDropdown from '@/apps/behavior/pages/toolkit/components/ToolkitDropdown.vue'
import {mapActions, mapState} from "vuex";

export default {
  name: 'lnb-menu',
  components: {
    ToolkitDropdown
  },
  props: {
    isOpen: Boolean
  },
  data() {
    return {
      selectedLnb: 'classrooms',
      isToolkitHovered: false,
      hideTimer: null,
    }
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
  },
  watch: {
    $route: {
      handler: function (newVal, oldVal) {
        const name = newVal.name
        const classroomsMenu = ['behavior', 'calssrooms', 'students', 'seat', 'points', 'manageStudents']
        const reportsMenu = ['reports', 'point-report', 'record-report', 'report-history']
        this.selectedLnb = classroomsMenu.includes(name)
            ? 'classrooms'
            : (reportsMenu.includes(name) ? 'reports' : name)
        /*const submenus = ['students', 'points', 'point-report', 'record-report']
        if(!submenus.includes(newVal.name) && newVal.name !== oldVal.name) {
            this.selectedLnb = newVal.name
        }*/
      }
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    onClick: async function (menu) {
      if (menu === 'toolkit') {
        // toolkit 클릭 할 때 GA 클릭 이벤트 전송
        this.triggerAnalyticsLogEvent({code: 'analytics.behavior.toolkit'})
      }
      const isHaveSubmenu = ['classrooms', 'reports']
      if (this.selectedLnb === menu) {
        if (isHaveSubmenu.includes(menu)) {
          const classroomId = this.$route.params.classroomId

          if (menu === 'classrooms') await this.$router.push(`/behavior-records/${classroomId}/${menu}?mode=check`)
          else await this.$router.push(`/behavior-records/${classroomId}/${menu}`)
        }
        this.$router.go(this.$router.currentRoute)
      } else {
        this.selectedLnb = menu
        const classroomId = this.$route.params.classroomId

        if (menu === 'classrooms') await this.$router.push(`/behavior-records/${classroomId}/${menu}?mode=check`)
        else if (menu === 'groupmission') await this.$router.push(`/behavior-records/${classroomId}/groupmission/progress`)
        else await this.$router.push(`/behavior-records/${classroomId}/${menu}`)
      }
    },
    guideView(type) {
      if (type === "1") {
        window.open('https://www.notion.so/hiclass/ca4ccff59ad644458a5936814e907015?pvs=4#275edf75fe604671b65713d726a836b0')
      } else if (type === "2") {
        window.open('https://www.notion.so/hiclass/ca4ccff59ad644458a5936814e907015?pvs=4#084a3a4aa60844bbbd00475ebebb7ad8')
      } else if (type === "3") {
        window.open('https://hiclass.notion.site/ca4ccff59ad644458a5936814e907015#885d82914a634914bcd46723102433ed')
      }
    },
    toolkitHover: function () {
      // #74664 툴킷 페이지가 아닐 경우만 hover
      this.clearHide()
      if (this.$route.name !== 'toolkit') {
        this.isToolkitHovered = true
      }
    },
    delayedHide() {
      // #74664 LNB에서 이탈하여 hover시 열린 dropdown 메뉴로 마우스 이동 시 바로 닫히지 않도록 timeout 처리
      this.hideTimer = setTimeout(() => {
        this.isToolkitHovered = false
      }, 200)
    },
    clearHide() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer)
        this.hideTimer = null
      }
    },
  },
  created() {
    const name = this.$route.name
    const classroomsMenu = ['behavior', 'calssrooms', 'students', 'seat', 'points', 'manageStudents']
    const reportsMenu = ['reports', 'point-report', 'record-report', 'report-history']
    this.selectedLnb = classroomsMenu.includes(name)
        ? 'classrooms'
        : (reportsMenu.includes(name) ? 'reports' : name)
  }
}
</script>

<style lang="scss" scoped>
@media (max-width: 1180px) {
  .groupmission-badge {
    display: none;
  }
}
</style>