<template>
    <div class="content">
        <div class="l-top">
            <span class="title">모둠 구성원</span>
            <p v-if="!isEdit">
                <button @click="changeEditMode">편집</button>
            </p>
            <p v-else>
                <button @click="changeEditMode">취소</button>
                <button @click="petchGroupStudent" class="reg">저장</button>
            </p>
        </div>
        <div class="list">
            <div
                v-for="student of visibleStudents"
                :key="student.studentId"
                @click="isEdit ? clickItem(student) : null"
                 class="card"
            >
                <p class="photo" :class="{select: isEdit && getSelected(student.studentId)}">
                    <img src="https://download.hiclass.net/7e70/8970/a570/c370/bdd23d26-c249-405b-be91-50c63b0b6026.gif" />
                </p>
                <p class="name"><strong>{{ student.studentNo }}</strong> {{ student.studentName}}</p>
            </div>
        </div>
    </div>  
</template>

<script>
import {mapActions} from 'vuex'
export default {
    name: 'group-students',
    props: {
        classroomId: String,
        groupId: String,
        groupStudents: Array
    },
    data() {
        return {
            isEdit: false,
            students: [],
            selectedStudents: []
        }
    },
    computed: {
        activeStudents: function() {
            return this.groupStudents.filter(s => !s.isHidden)
        },
        visibleStudents: function() {
            return this.isEdit ? this.students : this.activeStudents
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomStudents: 'getClassroomStudents',
            petchClassroomGroupStudents: 'petchClassroomGroupStudents'
        }),
        changeEditMode: async function() {
            if(!this.isEdit) {
                this.selectedStudents = [...this.groupStudents]
                this.students = await this.getClassroomStudents({classroomId: this.classroomId, isHidden: false})
            }
            this.isEdit = !this.isEdit
        },
        getSelected: function(id) {
            return this.selectedStudents.filter(s => s.studentId === id).length > 0
        },
        clickItem: function(item) {
            if(this.getSelected(item.studentId)) {
                this.selectedStudents = this.selectedStudents.filter(s => s.studentId !== item.studentId)
            } else {
                this.selectedStudents.push(item)
            }
        },
        petchGroupStudent: async function() {
            const params = {
                classroomId: this.classroomId,
                groupId: this.groupId,
                studentIds: this.selectedStudents.map(s => s.studentId)
            }
            const group = await this.petchClassroomGroupStudents(params)
            this.$emit('changeGroup', group)
            this.changeEditMode()
        }
    }
}
</script>

<style>

</style>