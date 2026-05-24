<template>
<div class="class__wrap">    
    <div class="class__content" :class="{expand: expanded}" id="behavior-charater-content">
        <div class="class__content__card" id="behavior-charater-content-card">
            <div
                v-for="group of groups"
                :key="group.groupId"
                class="card view cursor-pointer"
                @click="openUpdateGroupDetailModal(group.groupId)"
            >
                <div class="basic">
                    <!--span class="num">{{student.studentNo }}</span-->
                    <span class="name">{{ group.groupName }}</span>
                </div>
                <div class="reward">
                    <span class="bh-bg-num-reward">123</span>
                </div>
                <div class="character">
                    <img class="test-chracter" />
                </div>
            </div>
            <div class="card add cursor-pointer" @click="clickAddButton">
                <i class="bh-icon-plus-circle-fill-72"></i>
                <span>모둠추가</span>
            </div>
        </div>
    </div>
    <div class="class__badge">
        <button class="reset"><i class="bh-refresh-32"></i>뱃지 초기화</button>
        <button class="give"><i class="bh-reward-32"></i>뱃지 지급</button>
    </div>
    <add-group v-if="isOpenGroupModal" @close="closeAddGroupModal" />
    <update-group-detail-modal 
        v-if="isOpenGroupDetailModal"
        :classroomId="classroomId"
        :groupId="selectedGroupId" 
        @close="closeUpdateGroupDetailModal" />
</div>  
</template>

<script>
import {mapActions, mapState} from 'vuex'
import AddGroup from '@/apps/behavior/components/popup/AddGroup.vue'
import UpdateGroupDetailModal from '@/apps/behavior/components/popup/UpdateGroupDetailModal.vue'
export default {
    name: 'groups',
    components: {AddGroup, UpdateGroupDetailModal},
    props: {
        expanded: Boolean
    },
    data() {
        return {
            isOpenGroupModal: false,
            isOpenGroupDetailModal: false,
            selectedGroupId: null
        }
    },
    computed: {
        ...mapState('storeBehavior', {
            curClassroom: 'curClassroom',
            groups: 'groups'
        }),
        classroomId: function() {
            return this.curClassroom.classroomId
        }
    },
    watch:{
        classroomId: {
            handler: async function (newVal, oldVal) {
                if(newVal && newVal !== oldVal){
                    await this.getClassroomGroups({classroomId: newVal, isHidden: false})
                    if(!this.expanded) {
                        this.$nextTick(() => {
                            this.contentCardSizing()
                            this.setContentsCardWidth()
                        })
                    }
                }
            }
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomGroups: 'getClassroomGroups'
        }),
        clickAddButton: function() {
            this.isOpenGroupModal = true
        },
        closeAddGroupModal: async function(isReload) {
            this.isOpenGroupModal = false
            if(isReload) {
                await this.getClassroomGroups({classroomId: this.classroomId, isHidden: false})
            }
        },
        openUpdateGroupDetailModal: function(selectedGroupId) {
            this.selectedGroupId = selectedGroupId
            this.isOpenGroupDetailModal = true
        },
        closeUpdateGroupDetailModal: async function(isReload) {
            this.isOpenGroupDetailModal = false
            if(isReload) {
                await this.getClassroomGroups({classroomId: this.classroomId, isHidden: false})
                if(!this.expanded) {
                    this.$nextTick(() => this.setContentsCardWidth())
                }
            }
        },
        contentCardSizing: function() {
            const behaviorCharaterContentEl = document.getElementById("behavior-charater-content")
            const behaviorCharaterContentCardEl = document.getElementById("behavior-charater-content-card")
            const width = behaviorCharaterContentEl.clientWidth
            const height = behaviorCharaterContentEl.clientHeight
            let zoom = 1

            if((width / 1584) >= (height / 792)) {
                zoom = (height / 792)
            } else {
                zoom = (width / 1584)
            }

            behaviorCharaterContentCardEl.style.zoom = zoom
        },
        setContentsCardWidth: function() {
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

                        if(nameFSize <= 24) {
                            nameEl.setAttribute("style", "font-size: 24px;")
                        } else {
                            nameEl.setAttribute("style", "font-size: 3vh;")
                        }
                    }
                }
                behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(6, minmax(auto, 264px))"
            } else if(cardEls.length >= 19 && cardEls.length <= 21) {
                for(const cardEl of cardEls) {
                    cardEl.setAttribute("style", "width: 212px; height: 212px; margin: 7px; margin-bottom: 26px; margin-top: 26px;")
        
                    const basicEl = cardEl.querySelector(".basic")
                    if(!basicEl === false) {
                        const nameEl = basicEl.querySelector('.name')
                        const nameFSize = (viewPortHeight / 100) * 2.6

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

                        if(nameFSize<=24) {
                            nameEl.setAttribute("style", "font-size: 24px;")
                        } else {
                            nameEl.setAttribute("style", "font-size: 2.4vh;")
                        }
                    }
                }
                behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(8, minmax(auto, 198px))"
            }
        }
    },
    async created() {
        if(this.classroomId) {
            await this.getClassroomGroups({classroomId: this.classroomId, isHidden: false})
        }
    },
    mounted() {
        const groups = this
        window.addEventListener(`resize`, function() {
            if(!groups.expanded) {
                groups.contentCardSizing()
                groups.setContentsCardWidth()
            }
        })
    },
    updated() {
        if(!this.expanded) {
            this.contentCardSizing()
            this.setContentsCardWidth()
        }
    }
}
</script>

<style>

</style>