<!--
@File(Method): ManageClassroomItem.vue
@Author: -
@Date Created: -
@Description: 학급기록 > 교실관리
@Modified: 2024-09-30 - #68110 상용이슈 : draggable 순서 변경시 텍스트, 이미지 등 요소들이 함께 선택 드래그 되는 문제 대응 
-->
<template>
    <li class="draggable-area">
        <i class="bh-icon-listmove-24 cursor-pointer"></i>
        <input 
            type="text" 
            maxlength="20" 
            @focusout="changeName(item)" 
            :disabled="!classroom.isUsed" 
            :class="{dis2: !classroom.isUsed}" 
            v-model="item.classroomName" 
            @input="validate" @keyup="validate"
            @keydown="validate"
        />
        <div class="hi-selectbox" :class="{'is-opened': isOpenSelect}" v-click-outside="closeSelectBox">
            <button class="selected" @click="toggleSelectBox"><span :style="classroom.isUsed ? 'color: #3987F8;': ''">{{ classroom.isUsed ? '사용' : '보관' }}</span></button>
            <div class="option__layer">
                <button class="option" :class="{'is-selected': classroom.isUsed}" @click="changeStatus('used', classroom)"><span style="color: #3987F8;">사용</span></button>
                <button class="option" :class="{'is-selected': !classroom.isUsed}" @click="changeStatus('not-used', classroom)"><span>보관</span></button>
                <button class="option" @click="changeStatus('delete', classroom)"><span style="color: #F04F59;">삭제</span></button>
            </div>
        </div>
    </li>
</template>

<script>
export default {
    name: 'manage-classroom-item',
    props: {
        classroom: Object
    },
    data() {
        return {
            isOpenSelect: false,
            item: {}
        }
    },
    methods: {
        validate: function(e) {
            if(e.target.value.trim().length === 0){
                e.target.value = ''
            }
            e.target.value = e.target.value.substr(0, 20)
            this.item.classroomName = e.target.value
        },
        toggleSelectBox: function() {
            this.isOpenSelect = !this.isOpenSelect
        },
        closeSelectBox: function() {
            if(this.isOpenSelect) {
                this.isOpenSelect = false
            }
        },
        changeName: async function(classroom) {
            const classroomName = classroom.classroomName.trim()
            if(classroomName && classroomName) {
                this.item = {...classroom, classroomName}
                this.$emit('changeName', {...classroom, classroomName})
            } else {
                this.item.classroomName = this.classroom.classroomName
            }
        },
        changeStatus: function(action, item) {
            this.$emit('change', action, item)
        }
    },
    created() {
        this.item = {...this.classroom}
    }
}
</script>

<style>

</style>