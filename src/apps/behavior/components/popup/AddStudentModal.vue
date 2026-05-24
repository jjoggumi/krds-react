<template>
      <div
        class="modal normal-modal slick-modal view-main-detail-modal ofy"
        id="addStudentModal"
        style="display: block"
        >
        <div class="modal-cont-wrap">
            <div class="modal-cont">
                <!-- <div class="modal-cont-inner"
                v-click-outside="vcoConfig"
                @mouseover="offVco"
                @mouseleave="onVco"> -->
                <div class="modal-cont-inner">
                    <div class="behavior-modal-student-list">
                        <div class="title-wrap">
                            <h2>학생 추가하기</h2>
                        </div>
                        <div class="message-wrap">
                            번호순으로 학생을 입력하세요.
                        </div>
                        <div class="list-wrap" ref="scrollArea">
                            <ul>
                                <li
                                    v-for="(name, index) of studentNames"
                                    :key="index"
                                >
                                    <label>
                                        <input 
                                            :ref="`studentName${index}`"
                                            :class="{'error-name': errorIndex.includes(index)}" 
                                            maxlength="20" 
                                            type="text" 
                                            @input="validate" @keyup="validate" @keydown="validate"
                                            @blur="validateAllNames"
                                            v-model="studentNames[index]"
                                            @keyup.enter="addStudent(index, $event)" 
                                        />
                                        <i v-if="index > 0" @click="removeStudent(index)" class="bh-icon-minus-circle-fill-24 cursor-pointer"></i>    
                                    </label>
                                </li>
                            </ul>
                            <span @click="addStudent(studentNames.length -1, $event)">ENTER 키로 다음 칸으로 이동하세요.</span>
                        </div>
                        <div class="btn">
                            <button @click="closeModal(false)" class="esc">취소</button>
                            <button :disabled="isDisabled" :class="{dis: isDisabled}" @click="regStudents" class="reg on">등록</button>
                        </div>

                        <toast-type01 
                            v-if="toastMessageModal.open === true"
                            :item="toastMessageModal"
                        />
                    </div>
                </div>
            </div>
        </div>

        <confirm-modal
            v-if="confirmModal.isOpen"
            :title="confirmModal.title"
            :isAlert="true"
            @closeConfirmDialog="closeConfirmModal"
        /> 
    </div>
</template>

<script>
import {mapActions} from 'vuex'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue'
export default {
    name: 'add-student-modal',
    components: {ConfirmModal, ToastType01},
    props: {
        curClassroomId: String
    },
    data() {
        return {
            studentNames: [''],
            confirmModal: {
                isOpen: false,
                title: '학생은 500명까지 등록 가능합니다.'
            },
            errorIndex: [],
            toastMessageModal: {
                open: false,
                message: '등록 불가한 학생명이 있습니다.',
                top: null,
                bottom: 0,
                left: null,
                right: null,
                width: null, // null = 420px 
                height: null, // null = 66px
                align: "center" // 텍스트정렬 - 가운데:center, 좌측:left , 우측:right 
            }
        }
    },
    computed: {
        isDisabled: function() {
            return this.studentNames.filter(n => n.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '').trim()).length === 0
        }
    },
    watch: {
        'toastMessageModal.open': {
            handler: function(value) {
                if(value) {
                    setTimeout(() => {
                        this.toastMessageModal.open = false
                    }, 1300)
                }
            }
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            addClassroomStudents: 'addClassroomStudents',
            getClassroomStudents: 'getClassroomStudents'
        }),
        validate: function(e) {
            e.target.value = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '').trim()
            e.target.value = e.target.value.substr(0, 20)
        },
        // focusout 시 한글 자음/모음만 입력된 경우 체크
        validateAllNames: function() {
            const replaceNotFullKorean = /[ㄱ-ㅎㅏ-ㅣ]/gi
            this.errorIndex = []
            this.studentNames.forEach((v, i) => {
                if(v.match(replaceNotFullKorean)) {
                    this.errorIndex.push(i)
                }
            })
            return this.errorIndex.length === 0
        },
        addStudent: function(idx, e) {
            e.preventDefault()
            this.studentNames[idx] = this.studentNames[idx].replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '').trim()
            if(idx === this.studentNames.length -1) {
                this.studentNames.push('')
                if (this.$refs.scrollArea) {
                    this.$nextTick(() => {
                        this.$refs.scrollArea.scrollTop = this.$refs.scrollArea.scrollHeight
                    }, 10)
                }
            }
            
            this.moveFocus(idx + 1)
        },
        removeStudent: function(index) {
            this.studentNames.splice(index, 1)
            this.validateAllNames()
        },
        closeModal: function(isReload) {
            this.$emit('close', isReload)
        },
        closeConfirmModal: function() {
            this.confirmModal.isOpen = false
        },
        regStudents: async function() {
            this.toastMessageModal.open = false
            
            if(!this.validateAllNames()) {
                this.toastMessageModal.open = true
                return;
            } 

            const studentNames = this.studentNames.map(n => n.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '').trim())
                .filter(o => o)
            const students = await this.getClassroomStudents({classroomId: this.curClassroomId})

            if(studentNames.length + students.length > 500) {
                this.confirmModal.isOpen = true
                return
            }
            
            if(studentNames.length > 0) {
                await this.addClassroomStudents({
                    classroomId: this.curClassroomId,
                    studentNames
                })
                this.closeModal(true)
            }
        },
        moveFocus: function(idx) {
            this.$nextTick(() => this.$refs[`studentName${idx}`][0].focus())
        }
    },
    created() {
        this.moveFocus(0)
    }
}
</script>

<style>
.dis {
  color: #fff !important;
  background: #D6D6D6 !important;
}
.error-name {
    border-color: #F04F59 !important;
}
</style>