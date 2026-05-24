<template>
    <div class="behavior-wrapper__body__content">
        <div class="class">
            <classrooms-header 
                :expanded="isExpend"
                @showHidingModal="openHidingModal"
                @changeView="changeViewMode"
                @changeSort="changeSorting"
                @showPointRewardsPopup="showPointRewardsPopup"
                @showStudentViewSettingPopup="showStudentViewSettingPopup"
            />
            <router-view 
                :expanded="isExpend" 
                :sorting="sort"
            />
        </div>
        <hiding-students-modal
            v-if="isOpenHidingStudentsModal"
            :classroomId="curClassroom.classroomId"
            @close="closeHidingModal"
        />
        <hiding-groups-modal
            v-if="isOpenHidingGroupsModal"
            :classroomId="curClassroom.classroomId"
            @close="closeHidingModal"
        />
        <confirm-modal
            v-if="confirmModal.isOpen"
            :title="confirmModal.title"
            :isAlert="true"
            @closeConfirmDialog="closeConfirmModal"
        />
        <point-rewards
            v-if="isOpenPointRewardsModal"
            @showPointRewardsPopup="showPointRewardsPopup"
        />
        <student-view-setting 
            v-if="isOpenStudentViewSettingModal"
            @showStudentViewSettingPopup="showStudentViewSettingPopup"
        />
    </div>
</template>

<script>
import {mapActions, mapState} from 'vuex'
import ClassroomsHeader from '@/apps/behavior/components/layout/ClassroomsHeader.vue'
import HidingStudentsModal from '@/apps/behavior/components/popup/HidingStudentsModal.vue'
import HidingGroupsModal from '@/apps/behavior/components/popup/HidingGroupsModal.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import PointRewards from "@/apps/behavior/components/popup/PointRewards"
import StudentViewSetting from "@/apps/behavior/components/popup/StudentViewSetting"

export default {
    name: 'classrooms',
    components: {
      PointRewards,
      ClassroomsHeader, 
      HidingStudentsModal, 
      HidingGroupsModal, 
      ConfirmModal, 
      StudentViewSetting
    },
    data() {
        return {
            isOpenHidingStudentsModal: false,
            isOpenHidingGroupsModal : false,
            isOpenPointRewardsModal: false,
            isOpenStudentViewSettingModal: false,
            isExpend: false,
            sort: 'no',
            confirmModal: {
                isOpen: false,
                title: '준비중 입니다.'
            }
        }
    },
    computed: {
        ...mapState('storeBehavior', {
            curClassroom: 'curClassroom'
        }),
        classroomId: function() {
            return this.curClassroom.classroomId
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            patchLoadClassStudents: 'patchLoadClassStudents',
            getClassroomStudents: 'getClassroomStudents',
            getClassroomGroups: 'getClassroomGroups',
        }),
        closeConfirmModal: function() {
            this.confirmModal.isOpen = false
        },
        openHidingModal: function() {
            if(this.$route.name === 'students') {
                this.$hiClass.toggleBodyClass('add', 'hidden')
                this.isOpenHidingStudentsModal = true
            } else {
                this.isOpenHidingGroupsModal = true
            }
        },
        closeHidingModal: async function() {
            if(this.$route.name === 'students') {
                await this.getClassroomStudents({classroomId: this.curClassroom.classroomId, isHidden: false, isIncludePoint: true, sort: this.sort === 'no' ? 'studentNo,asc' : 'point,desc'})
                this.isOpenHidingStudentsModal = false
                this.$hiClass.toggleBodyClass('remove', 'hidden')
            } else {
                await this.getClassroomGroups({classroomId: this.curClassroom.classroomId, isHidden: false})
                this.isOpenHidingGroupsModal = false
            }
            if(!this.isExpend) {
                this.$nextTick(() => this.setContentsCardWidth())
            }
        },
        changeSorting: function(sort) {
            this.sort = sort
        },
        changeViewMode: function(isExpend) { 
            if(isExpend) {
                const behaviorCharaterContentCardEl = document.getElementById("behavior-charater-content-card")
                const cardEls = behaviorCharaterContentCardEl.querySelectorAll(".card")
                for(const cardEl of cardEls) {
                    cardEl.setAttribute("style", "")
            
                    const basicEl = cardEl.querySelector(".basic")
                    const rewardEl = cardEl.querySelector(".rewardNew")
                    if(!basicEl === false) {
                        const nameEl = basicEl.querySelector('.name')
                        
                        if(this.$route.name === 'students') {
                            const numEl = basicEl.querySelector('.num')
                            numEl.setAttribute("style", "")
                        }
                        nameEl.setAttribute("style", "")

                        const rewardSpanEl = rewardEl.querySelector('span')
                        rewardSpanEl.setAttribute("style", "")
                    }
                }
                behaviorCharaterContentCardEl.setAttribute("style", "")
            } else {
                this.setContentsCardWidth()
            }
            
            this.isExpend = isExpend
        },
        setContentsCardWidth: function() {
            const viewPortHeight = window.innerHeight
            const behaviorCharaterContentCardEl = document.getElementById("behavior-charater-content-card")
            const cardEls = behaviorCharaterContentCardEl.querySelectorAll(".card")

            if(cardEls.length <= 18) {
                for(const cardEl of cardEls) {
                    cardEl.setAttribute("style", "width: 245px; height: 245px; margin: 7px;")
        
                    const basicEl = cardEl.querySelector(".basic")
                    const rewardEl = cardEl.querySelector(".rewardNew")
                    if(!basicEl === false) {
                        const nameEl = basicEl.querySelector('.name')
                        const rewardSpanEl = rewardEl.querySelector('span')
                        
                        const nameFSize = (viewPortHeight / 100) * 5
                        const rewardFSize = (viewPortHeight / 100) * 5
                        
                        if(this.$route.name === 'students') {
                            const numEl = basicEl.querySelector('.num')
                            const numFSize = (viewPortHeight / 100) * 3
                            if(numFSize<=28) {
                                numEl.setAttribute("style", "height: 28px; font-size: 28px;")
                            } else {
                                numEl.setAttribute("style", "height: 33px; font-size: 3vh")
                            }
                        }

                        if(nameFSize<=34) {
                            nameEl.setAttribute("style", "height: 76px; line-height: 38px; font-size: 38px;")
                        } else {
                            nameEl.setAttribute("style", "height: 6.8vh; line-height: 3.4vh; font-size: 3.4vh;")
                        }
                        
                        if(rewardFSize<=34) {
                            rewardSpanEl.setAttribute("style", "line-height: 50px; font-size: 50px;")
                        } else {
                            rewardSpanEl.setAttribute("style", "line-height: 5vh; font-size: 5vh;")
                        }
                    }
                }
                behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(6, minmax(auto, 259px))"
            } else if(cardEls.length >= 19 && cardEls.length <= 21) {
                for(const cardEl of cardEls) {
                    cardEl.setAttribute("style", "width: 207px; height: 207px; margin: 7px; margin-bottom: 26px; margin-top: 26px;")
        
                    const basicEl = cardEl.querySelector(".basic")
                    const rewardEl = cardEl.querySelector(".rewardNew")
                    if(!basicEl === false) {
                        const nameEl = basicEl.querySelector('.name')
                        const rewardSpanEl = rewardEl.querySelector('span')
                        
                        const nameFSize = (viewPortHeight / 100) * 5
                        const rewardFSize = (viewPortHeight / 100) * 5
                        
                        if(this.$route.name === 'students') {
                            const numEl = basicEl.querySelector('.num')
                            const numFSize = (viewPortHeight / 100) * 2.2
                            if(numFSize<=22) {
                                numEl.setAttribute("style", "height: 20px; font-size: 20px;")
                            } else {
                                numEl.setAttribute("style", "height: 22px; font-size: 2.2vh;")
                            }
                        }

                        if(nameFSize<=32) {
                            nameEl.setAttribute("style", "height: 68px; font-size: 34px; line-height: 34px;")
                        } else {
                            nameEl.setAttribute("style", "height: 6.4vh; line-height: 3.2vh; font-size: 3.2vh;")
                        }

                        if(rewardFSize<=34) {
                            rewardSpanEl.setAttribute("style", "line-height: 44px; font-size: 44px;")
                        } else {
                            rewardSpanEl.setAttribute("style", "line-height: 4.4vh; font-size: 4.4vh;")
                        }
                    }
                }
                behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(7, minmax(auto, 221px))"
            } else {
                for(const cardEl of cardEls) {
                    if(cardEls.length<=24) {
                        cardEl.setAttribute("style", "width: 179px; height: 179px; margin: 7px; margin-bottom: 40px; margin-top: 40px;")
                    } else {
                        cardEl.setAttribute("style", "width: 179px; height: 179px; margin: 7px;")
                    }

                    const basicEl = cardEl.querySelector(".basic")
                    const rewardEl = cardEl.querySelector(".rewardNew")
                    if(!basicEl === false) {
                        const nameEl = basicEl.querySelector('.name')
                        const rewardSpanEl = rewardEl.querySelector('span')
                        
                        const nameFSize = (viewPortHeight / 100) * 5
                        const rewardFSize = (viewPortHeight / 100) * 5
                        
                        if(this.$route.name === 'students') {
                            const numEl = basicEl.querySelector('.num')
                            const numFSize = (viewPortHeight / 100) * 2
                            if(numFSize<=20) {
                                numEl.setAttribute("style", "height: 20px; font-size: 20px;")
                            } else {
                                numEl.setAttribute("style", "height: 2vh; font-size: 2vh;")
                            }
                        }

                        if(nameFSize<=34) {
                            nameEl.setAttribute("style", "height: 56px; font-size: 28px; line-height: 28px;")
                        } else {
                            nameEl.setAttribute("style", "height: 5.6vh; line-height: 2.8vh; font-size: 2.8vh;")
                        }

                        if(rewardFSize<=34) {
                            rewardSpanEl.setAttribute("style", "line-height: 34px; font-size: 34px;")
                        } else {
                            rewardSpanEl.setAttribute("style", "line-height: 3.4vh; font-size: 3.4vh;")
                        }
                    }
                }
                behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(8, minmax(auto, 193px))"
            }
        },
        setContentsCardWidth2: function() {
            const viewPortHeight = window.innerHeight
            const behaviorCharaterContentCardEl = document.getElementById("behavior-charater-content-card")
            const cardEls = behaviorCharaterContentCardEl.querySelectorAll(".card")

            if(cardEls.length <= 18) {
                for(const cardEl of cardEls) {
                    cardEl.setAttribute("style", "width: 250px; height: 250px; margin: 7px;")
        
                    const basicEl = cardEl.querySelector(".basic")
                    if(!basicEl === false) {
                        const nameEl = basicEl.querySelector('.name')
                        const nameFSize = (viewPortHeight / 100) * 3
                    
                        if(this.$route.name === 'students') {
                            const numEl = basicEl.querySelector('.num')
                            const numFSize = (viewPortHeight / 100) * 4
                            if(numFSize <= 38) {
                                numEl.setAttribute("style", "height: 38px; font-size: 38px;")
                            } else {
                                numEl.setAttribute("style", "height: 44px; font-size: 4vh")
                            }
                        }
                        
                        if(nameFSize <= 24) {
                            nameEl.setAttribute("style", "font-size: 24px;")
                        } else {
                            nameEl.setAttribute("style", "font-size: 3vh;")
                        }
                    }
                }
                behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(6, minmax(auto, 264px))"


                for(const cardEl of cardEls) {
                        cardEl.classList.remove("type02", "type03")
                        cardEl.classList.add("type01")
                        cardEl.setAttribute("style", "width: 245px; height: 245px; margin: 7px;")
            
                        const basicEl = cardEl.querySelector(".basic")
                        const rewardEl = cardEl.querySelector(".rewardNew")
                        if(!basicEl === false) {
                            const numEl = basicEl.querySelector('.num')
                            const nameEl = basicEl.querySelector('.name')
                            const rewardSpanEl = rewardEl.querySelector('span')
                            
                            const numFSize = (viewPortHeight / 100) * 3
                            const nameFSize = (viewPortHeight / 100) * 5
                            const rewardFSize = (viewPortHeight / 100) * 5
                            
                            if(this.$route.name === 'students') {
                                if(numFSize<=28) {
                                    numEl.setAttribute("style", "height: 28px; font-size: 28px;")
                                } else {
                                    numEl.setAttribute("style", "height: 33px; font-size: 3vh")
                                }
                            }
        
                            if(nameFSize<=34) {
                                nameEl.setAttribute("style", "height: 76px; line-height: 38px; font-size: 38px;")
                            } else {
                                nameEl.setAttribute("style", "height: 6.8vh; line-height: 3.4vh; font-size: 3.4vh;")
                            }
                            
                            if(rewardFSize<=34) {
                                rewardSpanEl.setAttribute("style", "line-height: 50px; font-size: 50px;")
                            } else {
                                rewardSpanEl.setAttribute("style", "line-height: 5vh; font-size: 5vh;")
                            }
                        }
                    }
                    behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(6, minmax(auto, 259px))"
            } else if(cardEls.length >= 19 && cardEls.length <= 21) {
                for(const cardEl of cardEls) {
                    cardEl.setAttribute("style", "width: 212px; height: 212px; margin: 7px; margin-bottom: 26px; margin-top: 26px;")
        
                    const basicEl = cardEl.querySelector(".basic")
                    if(!basicEl === false) {
                        const nameEl = basicEl.querySelector('.name')
                        const nameFSize = (viewPortHeight / 100) * 2.6
                        
                        if(this.$route.name === 'students') {
                            const numEl = basicEl.querySelector('.num')
                            const numFSize = (viewPortHeight / 100) * 3.6
                            if(numFSize <= 32) {
                                numEl.setAttribute("style", "height: 32px; font-size: 32px;")
                            } else {
                                numEl.setAttribute("style", "height: 32px; font-size: 3.6vh;")
                            }
                        }
                        
                        if(nameFSize <= 24) {
                            nameEl.setAttribute("style", "font-size: 24px;")
                        } else {
                            nameEl.setAttribute("style", "font-size: 2.6vh;")
                        }
                    }
                }
                behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(7, minmax(auto, 226px))"
            } else {
                for(const cardEl of cardEls) {
                    if(cardEls.length<=24) {
                        cardEl.setAttribute("style", "width: 184px; height: 184px; margin: 7px; margin-bottom: 40px; margin-top: 40px;")
                    } else {
                        cardEl.setAttribute("style", "width: 184px; height: 184px; margin: 7px;")
                    }

                    const basicEl = cardEl.querySelector(".basic")
                    if(!basicEl === false) {
                        const nameEl = basicEl.querySelector('.name')
                        const nameFSize = (viewPortHeight / 100) * 2.4
                    
                        if(this.$route.name === 'students') {
                            const numEl = basicEl.querySelector('.num')
                            const numFSize = (viewPortHeight / 100) * 3
                            if(numFSize<=30) {
                                numEl.setAttribute("style", "height: 30px; font-size: 30px;")
                            } else {
                                numEl.setAttribute("style", "height: 30px; font-size: 3vh;")
                            }
                        }
                        

                        if(nameFSize<=24) {
                            nameEl.setAttribute("style", "font-size: 24px;")
                        } else {
                            nameEl.setAttribute("style", "font-size: 2.4vh;")
                        }
                    }
                }
                behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(8, minmax(auto, 198px))"
            }
        },
        showPointRewardsPopup: async function (flag) {
            this.isOpenPointRewardsModal = flag

            if(this.isOpenPointRewardsModal === true) {
                this.$hiClass.toggleBodyClass('add', 'hidden')
            } else {
                this.$hiClass.toggleBodyClass('remove', 'hidden')
            }
            if(this.$route.name === 'students') {
                await this.getClassroomStudents({classroomId: this.curClassroom.classroomId, isHidden: false, isIncludePoint: true, sort: this.sort === 'no' ? 'studentNo,asc' : 'point,desc'})
            }
        },
        showStudentViewSettingPopup: function(flag) {
            this.isOpenStudentViewSettingModal = flag

            if(this.isOpenStudentViewSettingModal === true) {
                this.$hiClass.toggleBodyClass('add', 'hidden')
            } else {
                this.$hiClass.toggleBodyClass('remove', 'hidden')
            }
        },
    },
}
</script>

<style>

</style>