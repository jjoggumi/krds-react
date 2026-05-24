<template>
    <div class="hi-modal-common modal-flex" style="display: block;">
        <div class="modal__dim"></div>
        <div class="behavior-modal01">
            <div class="behavior-modal-student-add01">
                <div class="title-wrap">
                    <h2>새 교실 만들기</h2>
                </div>
                <div class="message-wrap">
                    학급기록의 모든 정보는<br/><em>작성하신 선생님만 열람</em>하실 수 있습니다.
                </div>
                <div class="input-wrap">
                    <input 
                        type="text" 
                        maxlength="20" 
                        @input="validate" 
                        @keyup="validate" 
                        @keydown="validate"
                        placeholder="교실명" 
                        v-model="classroomName"
                    />
                </div>
                <div class="btn">
                    <button class="btn01" @click="closeModal()">취소</button>
                    <button class="btn02" :class="{on: classroomName}" @click="createClassroom">등록</button>
                </div>
            </div>
        </div>
    </div>  
</template>

<script>
import {mapActions} from 'vuex'
export default {
    name: 'add-classroom',
    data() {
        return {
            classroomName: ''
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            addClassroom: 'addClassroom'
        }),
        validate: function(e) {
            // e.target.value = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '').trim()
            //e.target.value = e.target.value.trim()
            if(e.target.value.trim().length === 0) {
                e.target.value = ''
            }
            e.target.value = e.target.value.substr(0, 20)
        },
        createClassroom: async function() {
            if(this.classroomName.trim()) {
                const classroom = await this.addClassroom(this.classroomName)
                this.closeModal(classroom)
            }
        },
        closeModal: function(classroom) {
            this.$emit('close', classroom)
        }
    }
}
</script>

<style>

</style>