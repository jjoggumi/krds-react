<template>
    <div class="modal event-temp-modal" ref="eventModal">
        <div class="modal-wrap">
            <div class="modal-inner">
                <div class="modal-title-wrap">
                    <p class="title"><img src="@/assets/img/event_modal_title_my_participation_status.png" alt=""></p>
                    <p class="text">내가 참여한 이벤트 현황을 확인하세요.</p>
                </div>

                <div class="box">
                    <p>퀴즈 응모 완료  <em class="num">{{ getJoinCount }}회</em></p>
                </div>

                <ul class="relay-list">
                    <li
                        v-for="(eventUser, idx) in eventUsers"
                        :key="idx"
                        :class="eventUser.joinStatus ? 'on' : ((eventUser.eventStartTimeStamp <= $moment().valueOf()) && ($moment().valueOf() < eventUser.eventEndTimeStamp) ? 'none' : '')"
                    >
                        <div class="img-wrap">
                            <img :src="eventUser.stampImagePath === null || eventUser.stampImagePath === '' ? '' : eventUser.stampImagePath" alt="">
                            <span class="num">{{ idx + 1 }}회차</span>
                        </div>

                        <span v-if="eventUser.joinStatus" class="status">
                            참여 완료
                        </span>
                        <span v-else-if="$moment().valueOf() < eventUser.eventStartTimeStamp" class="status">
                            참여 전
                        </span>
                        <span v-else class="status">
                            미참여
                        </span>

                        <span v-if="eventUser.joinStatus" class="date">
                            {{ $moment(eventUser.joinTimeStamp).format("YYYY.MM.DD HH:mm") }}
                        </span>
                        <span v-else-if="$moment().valueOf() < eventUser.eventStartTimeStamp" class="date">
                            {{ $moment(eventUser.eventStartTimeStamp).format("MM월DD일") }} 참여가능
                        </span>
                        <span v-else class="date">
                            -
                        </span>
                    </li>
                </ul>
            </div>
            <button class="modal-close-btn modal-close-icon" @click="$emit('close-modal')"></button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        eventUsers: {
            type: Array
        }
    },
    computed: {
        getJoinCount() {
            let joinCount = 0;

            this.eventUsers.forEach(e => {
                if (e.joinStatus)
                    ++joinCount;
            });

            return joinCount;
        }
    }
}
</script>

<style scoped>
.event-temp-modal {
  display: table;
}
</style>