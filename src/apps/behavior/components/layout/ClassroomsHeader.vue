<template>
    <div class="class__top-menu">
        <div class="menu">
            <span @click="onClick('students')" :class="{on: selectedTab === 'students'}">학생</span>
            <!--span @click="onClick('groups')" :class="{on: selectedTab === 'groups'}">모둠</span>
            <span @click="onClick('rewards')" :class="{on: selectedTab === 'rewards'}">단체보상</span-->
            <span @click="onClick('seat')" :class="{on: selectedTab === 'seat'}">자리배치도</span>
            <span @click="onClick('points')" :class="{on: selectedTab === 'points'}">포인트</span>
            <span @click="onClick('manageStudents')" :class="{on: selectedTab === 'manageStudents'}">학생명단관리</span>
        </div>
        <div class="menu-right">
            <div class="m" v-if="selectedTab === 'students'">
                <div class="hi-selectbox" :class="{'is-opened': isOpenSortBox}" @click="toggleSortSelectBox" v-click-outside="outsideSortSelectBox">
                    <button class="selected">{{ selectedSorting }}</button>
                    <div class="option__layer">
                        <button @click="clickSortingItem('no')" class="option" :class="{'is-selected': sorting === 'no'}">번호순</button>
                        <button @click="clickSortingItem('badge')" class="option" :class="{'is-selected': sorting === 'badge'}">포인트 많은 순</button>
                    </div>
                </div>
            </div>
            <div class="m" v-if="['students', 'groups'].includes(selectedTab)">
                <i 
                    class="cursor-pointer" 
                    :class="{'bh-icon-expand-32': !expanded, 'bh-icon-shrink-32': expanded}"
                    @click="changeViewMode"
                >
                </i>
                <em>
                    <template v-if="!expanded">
                        크게보기
                    </template>

                    <template v-else>
                        화면 맞춤보기
                    </template>
                </em>
            </div>
            <div class="m more" v-click-outside="outsideMoreLayer" v-if="['students', 'groups', 'seat', 'points', 'manageStudents'].includes(selectedTab)">
                <i class="bh-plus-morevert-32 cursor-pointer" @click="toggleMoreButton"></i>
                <ul v-if="isOpenMoreLayer" style="display: block;">
                    <!-- <li class="cursor-pointer" @click="openHidingModal"><i class="bh-icon-user-24"></i>{{ moreMenuText }}</li> -->
                    <li @click="showPointRewardsPopup"><i class="bh-icon-pointlist-24"></i>포인트 지급 내역</li>
                    <li @click="showStudentViewSettingPopup"><i class="bh-icon-setting-24"></i>화면 설정</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import {mapMutations} from 'vuex'
export default {
    name: 'classrooms-header',
    props: {
        expanded: Boolean
    },
    data() {
        return {
            isOpenSortBox: false,
            isOpenMoreLayer: false,
            sorting: 'no',
            selectedTab: 'students'
        }
    },
    computed: {
        selectedSorting: function() {
            return this.sorting === 'no' ? '번호순' : '포인트 많은 순'
        },
        moreMenuText: function() {
            return this.selectedTab === 'students' ? '숨긴 학생 보기' : '숨긴 모둠 보기'
        }
    },
    watch: {
        $route(route) {
            this.selectedTab = route.name
        }
    },
    methods: {
        ...mapMutations('storeBehavior', {
            setResetStudentsIds: 'setResetStudentsIds'
        }),
        onClick: async function(menu) {
            if(this.selectedTab === menu) {
                this.$router.go(this.$router.currentRoute)
            } else {
                this.selectedTab = menu
                const classroomId = this.$route.params.classroomId
                await this.$router.push({
                    name: menu,
                    params: {classroomId}
                })
            }
        },
        toggleSortSelectBox: function() {
            this.isOpenSortBox = !this.isOpenSortBox 
        },
        clickSortingItem: function(sorting) {
            this.sorting = sorting
            this.$emit('changeSort', this.sorting)
        },
        outsideSortSelectBox: function() {
            if(this.isOpenSortBox) {
                this.isOpenSortBox = false
            }
        },
        toggleMoreButton: function() {
            this.isOpenMoreLayer = !this.isOpenMoreLayer
        },
        outsideMoreLayer: function() {
            if(this.isOpenMoreLayer) {
                this.isOpenMoreLayer = false
            }
        },
        openHidingModal: function() {
            this.$emit('showHidingModal')
            this.isOpenMoreLayer = false
        },
        changeViewMode: function(){
            this.$emit('changeView', !this.expanded)
        },
        showPointRewardsPopup: function() {
          this.$emit('showPointRewardsPopup', true)
        },
        showStudentViewSettingPopup: function() {
            this.setResetStudentsIds([])
            this.$emit('showStudentViewSettingPopup', true)
            this.isOpenMoreLayer = false
        }
    },
    created() {
        this.selectedTab = this.$route.name
    }
}
</script>

<style>

</style>