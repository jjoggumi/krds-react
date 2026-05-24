<template>
  <!-- 1. 이벤트 상세 요청 완료. 이벤트 상세 정보 존재 -->
  <div
      v-if="event.eventId && getEventsFinish"
      :key="componentKey"
  >
    <!-- 공유하기 페이지에서 호출하는 경우 이미지만 노출 -->
    <div
        v-if="event.eventDetailType === 'SAME_GRADE' && isSharePost"
        style="margin: 0 -24px; width: calc(100% + 48px);"
    >
      <figure class="image">
        <img
            src="https://download.hiclass.net/static/assets/img/event/event_welcome_2024_preview.png?ver=20240221-1"
            alt=""
            @click="goRouteEventDetail"
        >
        <!--        <img src="https://download.hiclass.net/static/assets/img/event/event_20230206_samegrade_share_01.png?ver=20230206-1" alt="">-->
        <!--        <img src="https://download.hiclass.net/static/assets/img/event/event_20230206_samegrade_share_02.png?ver=20230206-1" alt="">-->
        <!--        <img-->
        <!--          src="https://download.hiclass.net/static/assets/img/event/event_20230206_samegrade_share_03.png?ver=20230206-1"-->
        <!--          alt=""-->
        <!--          @click="goRouteEventDetail"-->
        <!--        >-->
        <!--        <img-->
        <!--          src="https://download.hiclass.net/static/assets/img/event/event_20230206_samegrade_share_04.png?ver=20230206-1"-->
        <!--          alt=""-->
        <!--          @click="goRouteEventDetail"-->
        <!--        >-->
      </figure>
    </div>

    <div v-else-if="getEventByPostId(post.currentId) && getEventByPostId(post.currentId).iframeSrc">
      <iframe
          id="eventFrame"
          class="iframe"
          :src="getEventByPostId(post.currentId).iframeSrc"
          credentialless
          style="border: 0; width: 100%; height: 100%;"
      />
    </div>

    <div
        v-else-if="(event.eventDetailType === 'RECOMMEND_CODE') && isSharePost"
        style="margin: 0 -24px; width: calc(100% + 48px);"
    >
      <figure class="image">
        <img src="https://download.hiclass.net/static/assets/img/event/event_recommendCode_detail.png" alt="">
      </figure>
    </div>

    <div
        v-else-if="(event.eventDetailType === 'PARENT_TO_TEACHER') && isSharePost"
        style="margin: 0 -24px; width: calc(100% + 48px);"
    >
      <figure class="image">
        <img src="https://download.hiclass.net/static/assets/img/event/event_parentToTeacher_detail.png" alt="">
      </figure>
    </div>

    <div
        v-else-if="(event.eventDetailType === 'TEACHER_VERIFICATION') && isSharePost"
        style="margin: 0 -24px; width: calc(100% + 48px);"
    >
      <figure class="image">
        <img src="https://download.hiclass.net/static/assets/img/event/event_teacherVerification_detail.png" alt="">
      </figure>
    </div>

    <event-same-grade
        v-else-if="event.eventDetailType === 'SAME_GRADE'"
        :postId="post.currentId"
    />

    <recommend-code-detail
        v-else-if="event.eventDetailType === 'RECOMMEND_CODE'"
        :postId="post.currentId"
    />

    <parent-to-teacher-detail
        v-else-if="event.eventDetailType === 'PARENT_TO_TEACHER'"
        :postId="post.currentId"
    />

    <teacher-verification-detail
        v-else-if="event.eventDetailType === 'TEACHER_VERIFICATION'"
        :postId="post.currentId"
    />

    <div v-else>
      <div
          class="v1-editor-view"
          :inner-html.prop="topImage"
      ></div>

      <div v-if="isShowEventTemplate">
        <div
            v-if="post.displayStatus === 'EXPECTED'"
        >
          <div class="event-temp-wrap">
            <div class="event-temp-inner">
              <div
                  class="v1-editor-view"
                  :inner-html.prop="beforeOpenImage"
              />
            </div>
          </div>
        </div>
        <div v-else>
          <div class="event-temp-wrap" v-if="event.eventDetailType === 'QUIZ' || event.eventDetailType === 'SURVEY'">
            <div
                class="event-temp-inner"
                v-for="(question, qidx) in event.eventQuestions"
                :key="qidx"
            >
              <div class="box">
                <p class="question">{{ question.question }}</p>
              </div>
              <div
                  v-if="!((event.showResultType === 'JOIN' && !canJoin)
              || (event.showResultType === 'EVENT_END' && post.displayStatus === 'CLOSED')
              || event.showResultType === 'ALWAYS') || auth.uuid === undefined"
                  class="item-list"
              >
                <div
                    class="item"
                    v-for="(choiceQuestion, cidx) in question.choiceQuestions"
                    :key="cidx"
                >
                  <input v-if="auth.uuid !== undefined"
                         :id="'a-' + qidx + choiceQuestion.choiceQuestionNo" type="radio" :name="'item' + qidx"
                         :disabled="post.displayStatus !== 'PROGRESSING' || !canJoin"
                         v-model="replies[qidx].choiceReply"
                         @change="changeBtn(qidx, replies[qidx].choiceReply, question.choiceQuestions.length)"
                         :value="choiceQuestion.choiceQuestionNo">
                  <input v-else disabled
                         :id="'a-' + qidx + choiceQuestion.choiceQuestionNo" type="radio" :name="'item' + qidx">
                  <label :for="'a-' + qidx + choiceQuestion.choiceQuestionNo"><span>{{ choiceQuestion.choiceQuestion }}</span></label>
                </div>
                <div
                    class="item"
                    v-if="question.questionType === 'WRITE' ||
                    (question.questionType === 'MIX'
                      && replies[qidx].choiceReply === question.choiceQuestions.length
                      && question.choiceQuestions[question.choiceQuestions.length - 1].choiceQuestion === '기타 (직접입력)')"
                >
                  <textarea v-if="post.displayStatus !== 'PROGRESSING'" v-model="replies[qidx].writeReply" disabled />
                  <textarea v-else v-model="replies[qidx].writeReply" placeholder="최대 500자까지 입력해주세요." />
                </div>
              </div>

              <div
                  v-else
                  class="bar-item-list"
              >
                <div
                    v-for="(choiceQuestion, cidx) in question.choiceQuestions"
                    :key="cidx"
                    :class="selectedNums[qidx] === cidx + 1 ? 'item selected' : 'item'"
                >
                  <span class="value">{{ choiceQuestion.choiceQuestion }}</span>
                  <span class="per">{{ getPercentage(choiceQuestion.pickCount, totalPickCount[qidx]) }} %</span>
                  <span class="bar" :style="{ width: getPercentage(choiceQuestion.pickCount, totalPickCount[qidx]) + '%'}"></span>
                </div>
                <div
                    class="item"
                    v-if="replies[qidx]
                && (question.questionType === 'WRITE'
                      || (question.questionType === 'MIX'
                      && replies[qidx].choiceReply === question.choiceQuestions.length
                      && question.choiceQuestions[question.choiceQuestions.length - 1].choiceQuestion === '기타 (직접입력)'))"
                >
                  <textarea :value="replies[qidx].writeReply" disabled />
                </div>
              </div>

              <div v-if="qidx === event.eventQuestions.length - 1" class="btn-wrap">
                <button v-if="post.displayStatus === 'CLOSED'" disabled>이벤트 종료</button>
                <button v-else-if="canJoin || auth.uuid === undefined" @click="play">참여하기</button>
                <button v-else-if="!canJoin" disabled>참여완료</button>
              </div>

              <div class="bottom" v-if="auth.uuid !== undefined">
                <div v-if="qidx === event.eventQuestions.length - 1" class="item">
                  <p class="text-ref">휴대폰번호 오기재 등으로 인해 오발송 되는 경품은<br>재발송이 불가합니다. 반드시 휴대폰번호를 확인해주세요.</p>
                  <a class="btn-white" @click="goRoute('/main/mypage')">내 정보 변경하기</a>
                </div>
                <div v-if="event.showCurrentJoinType === 'JOIN' && !canJoin" class="item">
                  <p class="text-ref">이벤트 참여 현황을 확인 하실 수 있습니다.</p>
                  <button class="btn-gray" @click="isModalViewed = true">나의 참여 현황</button>
                </div>
              </div>

            </div>
          </div>
          <div v-else-if="event.eventDetailType === 'AWARDS' && event.awards2020" class="event-temp-award-wrap">
            <div class="event-temp-award-inner">
              <div class="top-wrap">
                <em class="title-top"><span class="data">{{ userName || getUserName() }}</span>&nbsp;<span>선생님</span>의 기록</em>
                <span class="date-top">기간 : 2022년 1월 1일 - 11월 30일</span>
              </div>

              <ul class="record-list">
                <li
                    class="item"
                    v-for="idx in [0,1,2,3]"
                    :key="idx"
                >
                  <strong class="title-item">{{ awardsTitles[idx][0] }}<br />{{ awardsTitles[idx][1] }}</strong>
                  <div class="data-wrap">
                    <span class="title-data">{{ (idx === 3 ? "시간" : "건수") }}</span>
                    <span class="data">{{ getCountStr(awards[idx][0], idx) }}</span>
                    <span class="title-data">등수</span>
                    <span class="data">{{ getRankStr(awards[idx][1], awards[idx][0]) }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      <div
          class="v1-editor-view"
          :inner-html.prop="bottomImage"
      ></div>

      <event-modal-view
          v-if="isModalViewed"
          :eventUsers="event.eventUsers"
          @close-modal="isModalViewed = false"
      />
    </div>

  </div>

  <!-- 2. 이벤트 상세 요청 완료. 이벤트 상세 정보 없음 -->
  <div
      v-else-if="isRequestFinish"
      :key="componentKey"
      class="v1-editor-view"
  >
    <p
        v-autolinker:[$className]="post.postContent"
        @click="handleClick($event, post)"
    ></p>
  </div>

  <!-- 0. 이벤트 상세 요청 전. 여백 채움 -->
  <div v-else>
    <div style="min-height: 800px"></div>
  </div>
</template>

<script>
import EventSameGrade from "@/apps/events/EventSameGrade.vue"
import EventModalView from '@/components/DetailPost/DetailPostItemBodyPostContentEventPopUp.vue'

import {mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";
import RecommendCodeDetail from "@/apps/events/recommendCode/Detail";
import ParentToTeacherDetail from "@/apps/events/parentToTeacher/Detail.vue";
import TeacherVerificationDetail from "@/apps/events/teacherVerification/Detail.vue";
import EventMixin from "@/apps/events/mixins/EventMixin";
import { handleShare } from '@/plugins/utils';

export default {
  name: "detail-post-item-body-post-content-event",
  components: {TeacherVerificationDetail, ParentToTeacherDetail, RecommendCodeDetail, EventSameGrade, EventModalView},
  props: {
    post: {
      type: Object,
    }
  },
  mixins: [EventMixin],
  data() {
    return {
      isRequestFinish: false,
      isModalViewed: false,
      isSharePost: false,
      topImage: '',
      beforeOpenImage: '',
      bottomImage: '',
      canJoin: false,
      textData: {},
      replies: [],
      totalPickCount: [],
      selectedNums: [],
      auth: {},
      componentKey: 0,
      event: {},
      userName: null,
      awards: [],
      awardsTitles: [
        ["올해의", "게시글 작성"],
        ["피드백", "댓글 작성"],
        ["하이톡", "발송 건수"],
        ["올해의", "통화 시간"]
      ],
      getEventsFinish: false
    }
  },
  computed: {
    ...mapState({
      user: 'user',
    }),
    isShowEventTemplate() {
      return this.event && this.event.eventId
    }
  },
  created() {
    if (
        (this.event.eventDetailType === 'RECOMMEND_CODE' ||
            this.event.eventDetailType === 'PARENT_TO_TEACHER' ||
            this.event.eventDetailType === 'TEACHER_VERIFICATION')
        && this.isSharePost
    ) {
      return false
    }

    this.getFullScreenEvents()

    const postContentEvent = this.post.postContent
    const parser = new DOMParser();

    const html = parser.parseFromString(postContentEvent, "text/html");
    const htmlBody = html.body
    const topImage = htmlBody.querySelector("#top")
    const beforeOpenImage = htmlBody.querySelector("#beforeOpen")
    const bottomImage = htmlBody.querySelector("#bottom")

    this.topImage = topImage !== null ? topImage.innerHTML : '';
    this.beforeOpenImage = beforeOpenImage !== null ? beforeOpenImage.innerHTML : '';
    this.bottomImage = bottomImage !== null ? bottomImage.innerHTML : '';

    this.auth = this.$authentication.load();
    this.setIsLoading(true)
    this.getEvents();
  },
  beforeMount() {
    if (this.$route.name === 'share-post') {
      this.isSharePost = true
    }
  },
  mounted() {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.eventFrameHeight) {
        const iframe = document.getElementById('eventFrame');
        iframe.style.height = event.data.eventFrameHeight + 'px';
      }
      if (event.data && event.data.shareData) {
        handleShare(event.data.shareData, '링크가 복사되었습니다.');
      }
    });
  },
  methods: {
    ...mapMutations({
      setIsLoading: 'setIsLoading',
      setIsShowDetailPostLayer: 'setIsShowDetailPostLayer',
      setItemDetailObj: 'setItemDetailObj',
    }),
    async getEvents() {
      const postId = this.post.currentId

      await this.$hiClass.events
          .read(postId)
          .then(async r => {
            this.event = await r.data;

            if (this.event.awards2020) {
              this.awards.push([this.event.awards2020.postCount, this.event.awards2020.postRank]);
              this.awards.push([this.event.awards2020.feedbackCount, this.event.awards2020.feedbackRank]);
              this.awards.push([this.event.awards2020.messageCount, this.event.awards2020.messageRank]);
              this.awards.push([this.event.awards2020.callTime, this.event.awards2020.callRank]);
            }

            eventBus.$emit(`set-comment-timestamp-type-by-post-id|${postId}`, this.event.commentTimestampType)

            if ((this.event.eventDetailType === 'QUIZ' || this.event.eventDetailType === 'SURVEY') && this.auth.uuid !== undefined) {
              await this.event.eventQuestions.sort(function(a, b) {
                return a.questionNo > b.questionNo ? 1 : -1;
              });

              await this.calcTotalPickCount(true);
              await this.checkJoin(this.event.eventId);

              if (!this.canJoin) {
                this.event.eventUsers.forEach(e => {
                  if (this.event.eventId === e.eventId) {
                    e.eventReplies.forEach(r => {
                      Object.assign(this.replies[r.questionNo - 1], { questionNo: r.questionNo, choiceReply: r.choiceReply, writeReply: r.writeReply });
                      this.selectedNums.push(r.choiceReply);
                    });
                  }
                });
              }
            }

            // this.$nextTick(() => {
            //   this.componentKey++
            // })
          })
          .catch(r => {
            this.$log.debug("DetailPostItemBodyPostContentEvent - getEvents Error => ", r);
          })
          .finally(() => {
            this.setIsLoading(false)
            this.isRequestFinish = true
            this.getEventsFinish = true
          })
    },
    checkJoin(eventId) {
      this.$hiClass.events.checkJoin(eventId)
          .then(r => {
            this.canJoin = r.data;
          })
          .catch(r => {
            this.$log.error("catch : ", r)
          });
    },
    async play() {
      if (this.auth.uuid === undefined)
        this.goRoute('/main');
      else {
        let isCompleted = true;
        this.selectedNums = [];

        await this.replies.forEach(reply => {
          if ((reply.writeReply === null || reply.writeReply === "") && (reply.choiceReply === null || reply.choiceReply === ""))
            isCompleted = false;
          else if (reply.choiceReply !== "")
            this.selectedNums.push(reply.choiceReply);
        });

        if (isCompleted) {
          this.$hiClass.confirm("이벤트에 응모하시겠습니까?").then(async () => {
            let requestReplies = {"replies": this.replies};
            this.$hiClass.events.play(this.event.eventId, requestReplies)
                .then(async r => {
                  await this.$hiClass.alert(r.data.text, 'success', false);
                  // if (this.event.noticeResultType === 'NONE')
                  //   await this.$hiClass.alert(this.textData['APPLY'], 'success', true);
                  // else
                  //   await this.$hiClass.alert(this.textData['WINNING'], 'success', true);

                  if (this.event.eventDetailType === 'QUIZ' || this.event.eventDetailType === 'SURVEY') {
                    await this.$hiClass.events.read(this.post.currentId).then(r => {
                      this.event = r.data;
                      this.calcTotalPickCount(false);
                    });

                    await this.event.eventQuestions.sort(function(a, b) {
                      return a.questionNo > b.questionNo ? 1 : -1;
                    });
                  }

                  this.canJoin = false;
                }).catch(r => {
              this.$log.debug("DetailPostItemBodyPostContentEvent - play => ", r);
              this.$hiClass.alert('이벤트 응모 도중 오류가 발생했습니다.', 'warning', false);
            });
          });
        } else
          this.$hiClass.alert("모두 작성해주세요!", 'warning', false);
      }
    },
    changeBtn(qidx, selectBtnNo, writeBtnNo) {
      if (selectBtnNo !== writeBtnNo)
        this.replies[qidx].writeReply = '';
    },
    async calcTotalPickCount(created) {
      this.totalPickCount = [];

      await this.event.eventQuestions.sort(function(a, b) {
        return a.questionNo > b.questionNo ? 1 : -1;
      });

      this.event.eventQuestions.forEach(question => {
        let sum = 0;
        question.choiceQuestions.forEach(choiceQuestion => {
          sum += choiceQuestion.pickCount;
        });
        if (created)
          this.replies.push({ questionNo: question.questionNo, choiceReply: null, writeReply: "" });
        this.totalPickCount.push(sum);
      });
    },
    goRoute(path) {
      this.setIsShowDetailPostLayer(false);
      this.setItemDetailObj({});

      if (path === this.$route.path) this.$router.go();
      else this.$router.push(path, () => {});
    },
    getPercentage(pickCount, totalCount) {
      return Math.round(pickCount * 100 / totalCount);
    },
    getCountStr(count, i) {
      if (count == undefined || count == null)
        count = 0;

      return i == 3 ? count.toString().concat("초") : count.toString().concat("건");
    },
    getRankStr(rank, count) {
      if (rank == undefined || rank == null || count == undefined || count == null || count == 0)
        return '-';

      return rank.toString().concat("등");
    },
    getUserName() {
      if (this.user && this.user.userName) {
        this.userName = this.user.userName

      } else {
        const userId = localStorage.uuid
        const url = `/users/${userId}`
        if (userId) {
          this.$hiClass.users.read(url)
              .then(res => {
                this.userName = res.data.userName
              })
        }
      }
    },
    handleClick($event, postItem) {
      this.$hiClass.handleImageClick($event, postItem);
      this.$hiClass.handleVideoClick($event, postItem);
    },
    goRouteEventDetail() {
      this.$router.push({
        path: '/main/education/event',
        query: {
          postId: this.post.currentId
        }
      })

    }
  }
}
</script>

<style scoped>

</style>