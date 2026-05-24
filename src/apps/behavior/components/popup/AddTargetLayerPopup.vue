<template>
    <div @click.stop="protect($event)" id="search-student-list-add" class="search-student-list-add">
        <div class="search-student-list-add__wrap">
            <div class="title-wrap">
                <h2>기록 대상 추가</h2>
            </div>
            <div class="list">
                <p @click="allCheck($event)">
                    <input type="checkbox" :checked="isAllChecked">
                    <label><span>전체</span></label>
                </p>
                <ul>
                    <li
                        v-for="student of students"
                        :key="student.studentId"
                        @click="toggleItem(student.studentId, $event)"
                    >
                        <input @click="toggleItem(student.studentId, $event)" type="checkbox" :checked="getIsChecked(student.studentId)">
                        <label>
                            <span class="image">
                                <img :class="{'is-photo': isPhoto(student)}" :src="selectedImageSrc(student)" />
                            </span>
                            <span class="num">{{ student.studentNo }}</span>
                            <span class="name">{{ student.studentName }}</span>
                        </label>
                    </li>
                </ul>
            </div>
            <div class="btn-wrap">
                <button :disabled="isDisalbed" :class="{dis: isDisalbed}" @click.stop="close(returnData, $event)">{{ sendButtonString }}</button>
            </div>

            <div @click.stop="close(null, $event)" class="modal-close-btn"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'add-target-layer-popup',
    props: {
        students: Array,
        selected: Array
    },
    data() {
        return {
            returnData: []
        }
    },
    computed: {
        isAllChecked: function() {
            return this.returnData.filter(r => !this.selected.includes(r)).length > 0 && this.returnData.filter(r => !this.selected.includes(r)).length === this.students.length
        },
        sendButtonString: function() {
            return this.returnData.filter(r => !this.selected.includes(r)).length === 0 ? '추가' : `${this.returnData.filter(r => !this.selected.includes(r)).length}명 추가`
        },
        isDisalbed: function() {
            return this.returnData.filter(r => !this.selected.includes(r)).length === 0
        },
    },
    methods: {
        isPhoto: function(student) {
            return student.studentPhoto !== null
        },
        selectedImageSrc: function(student) {
            return this.isPhoto(student) 
                ? student.studentPhoto
                : `https://download.hiclass.net/static/classroom/student/${student.studentCharacter}_head.png`
        },
        toggleItem: function(id, e) {
            e.preventDefault()
            if(this.returnData.includes(id)) {
                this.returnData = this.returnData.filter(r => r !== id)
            } else {
                this.returnData.push(id)
            }
        },
        getIsChecked: function(id) {
            return this.returnData.includes(id)
        },
        allCheck: function(e) {
            e.preventDefault()
            if(this.isAllChecked) {
                this.returnData = []
            } else {
                this.returnData = this.students.map(s => s.studentId) || []
            }
        },
        protect: function(e) {
            e.preventDefault()
            return false
        },
        close: function(send, e) {
            e.preventDefault()
            if(send) {
                const res = this.students.filter(s => send.includes(s.studentId))
                this.$emit('close', res)
            } else {
                this.$emit('close')
            }
        } 
    },
    created() {
        this.returnData = [...this.selected]
    }
}
</script>

<style scoped>
.dis {
  color: #fff !important;
  background: #D6D6D6 !important;
}
.is-photo {
    width: 100% !important;
    height: 100% !important;
}
</style>