<template>
    <div
        class="modal normal-modal slick-modal view-main-detail-modal ofy"
        style="display: block"
    >
      <div class="modal-cont-wrap">
        <div class="modal-cont">
            <div class="modal-cont-inner">
                <div class="attendance-neis-modal-container">
                    <div class="submit">
                        <div class="title-wrap">
                            <h2>제출내역을 선택해주세요.</h2>
                        </div>

                        <div class="info-wrap">
                            <span>{{ targetStudent.date }}</span>
                            <span>{{ targetStudent.name }}</span>
                        </div>

                        <div class="list-wrap">
                            <div 
                                class="list-data" 
                                v-for="(item, idx) in attendanceList" 
                                :key="`neis-target-${idx}`"
                                @click="setSelcted(item.attendanceId)"
                            >
                                <span class="info">
                                    <input type="radio" name="select-attendance" :value="item.attendanceId" v-model="selectedId">
                                    <label>
                                        <span>{{ getAttendanceTypeName(item.attendanceType) }}</span>
                                        <span v-if="item.attendanceConfirmType">
                                            ({{ getAttendanceConfirmTypeName(item.attendanceConfirmType) }})
                                        </span>

                                        <span class="no-ok" v-else>
                                            미확인
                                        </span>
                                    </label>
                                </span>

                                <span class="date">{{$moment(item.insertedTimestamp).format('MM.DD HH:mm')}}</span>
                            </div>
                        </div>

                        <div class="btn-wrap"> 
                            <button class="hi-btn btn-lg btn-line s1" @click="close"><strong>취소</strong></button>
                            
                            <button class="hi-btn btn-lg" @click="openAttendanceDetailModal"><strong>확인</strong></button>
                        </div>
                        
                        <div class="modal-close-btn" @click="close"></div>
                    </div>
                    </div>
                </div>
            </div>
      </div>
    </div>
</template>

<script>
export default {
    name: "attendance-neis-target-modal",
    props: {
        targetStudent: Object,
        attendanceList: Array
    },
    data() {
        return {
            selectedId: null
        }
    },
    methods: {
        getAttendanceTypeName(attendanceType) {
            switch (attendanceType) {
                case 'ABSENCE':
                    return '결석';
                case 'EARLY_LEAVE':
                    return '조퇴';
                case 'LATENESS':
                    return '지각';
                case 'OUT':
                    return '외출';
                default:
                    return ''
            }
        },
        getAttendanceConfirmTypeName(attendanceConfirmType) {
            switch (attendanceConfirmType) {
                case 'ILLNESS':
                    return '질병';
                case 'NOT_ACCEPT':
                    return '미인정';
                case 'ETC':
                    return '기타';
                case 'ATTENDANCE':
                    return '출석인정';
                default:
                    return ''
            }
        },
        setSelcted(id) {
            this.selectedId = id
        },
        openAttendanceDetailModal: function() {
            this.$emit('close', this.selectedId)
        },
        close() {
            this.$emit('close')
        }
    }
}
</script>

<style scoped>
.attendance-neis-modal-container .submit .modal-close-btn {
  right: 20px;
}
</style>