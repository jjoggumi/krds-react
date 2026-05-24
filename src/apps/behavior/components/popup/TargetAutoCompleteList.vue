<template>
    <div class="search-student-list">
        <drop-down-wrapper
            :totalElements="students.length"
            itemTag="li.drop-item"
            @enter="dropdownEnter"
        >
            <template slot-scope="scopeProps"> 
                <ul>
                    <template v-if="students.length !== 0">
                        <li
                            v-for="(student, index) of students"
                            :key="student.studentId"
                            class="drop-item"
                            :class="{'on': scopeProps.selected === index}"
                            @mousedown.stop="onClick(student, $event)"
                        >
                            <span class="image">
                                <img :class="{'is-photo': isPhoto(student)}" :src="selectedImageSrc(student)" />
                            </span>
                            <span class="num">{{ student.studentNo }}</span>
                            <span class="name">{{ student.studentName }}</span>
                        </li>
                    </template>
                    <template v-else>
                        <li style="color: #9E9E9E;">일치하는 학생이 없습니다.</li>
                    </template>
                </ul>
            </template>
        </drop-down-wrapper>
    </div>
</template>

<script>
import DropDownWrapper from '@/apps/behavior/components/common/DropDownWrapper.vue'
export default {
    name: 'target-auto-complete-list',
    props: {
        students: Array
    },
    components: {DropDownWrapper},
    methods: {
        isPhoto: function(student) {
            return student.studentPhoto !== null
        },
        selectedImageSrc: function(student) {
            return this.isPhoto(student) 
                ? student.studentPhoto
                : `https://download.hiclass.net/static/classroom/student/${student.studentCharacter}_head.png`
        },
        onClick: function(student, e){
            e.preventDefault()
            this.$emit('close', student)
        },
        dropdownEnter: function(idx) {
            if(idx !== null) {
                this.$emit('close', this.students[idx])
            }
        },
    }
}
</script>

<style>

</style>