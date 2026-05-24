<template>
  <div
    v-if="post.currentId && post.event && post.event.eventId"
    class="event-temp-item"
    >
      <div class="editor-wrap" v-html="topImage" />

      <div v-if="post.event.eventDetailType === 'QUIZ' || post.event.eventDetailType === 'SURVEY'" class="event-temp-wrap">
        <div v-if="post.displayStatus === 'EXPECTED'" class="event-temp-wrap" v-html="beforeOpenImage">
          <div class="event-temp-inner">
            <div class="editor-wrap" v-html="beforeOpenImage" />
          </div>
        </div>
        <div
          v-else
          class="event-temp-inner"
          v-for="(question, qidx) in post.event.eventQuestions"
          :key="qidx"
        >
          <div class="box">
            <p class="question">{{ question.question }}</p>
          </div>
          <div
            v-if="!((post.event.showResultType === 'JOIN' && !canJoin)
              || (post.event.showResultType === 'EVENT_END' && post.displayStatus === 'CLOSED')
              || post.event.showResultType === 'ALWAYS')"
            class="item-list"
          >
            <div
              class="item"
              v-for="(choiceQuestion, cidx) in question.choiceQuestions"
              :key="cidx"
            >
              <input :id="'a-0' + choiceQuestion.choiceQuestionNo" type="radio" name="item"
                      :disabled="post.displayStatus !== 'PROGRESSING'"
                      v-model="replies[qidx].choiceReply"
                      @change="changeBtn(qidx, replies[qidx].choiceReply, question.choiceQuestions.length)"
                      :value="choiceQuestion.choiceQuestionNo">
              <label :for="'a-0' + choiceQuestion.choiceQuestionNo"><span>{{ choiceQuestion.choiceQuestion }}</span></label>
            </div>
            <!-- <div class="item" v-if="question.questionType === 'WRITE' || (question.questionType === 'MIX' && replies[qidx].choiceReply === question.choiceQuestions.length)">
              <textarea v-model="replies[qidx].writeReply" placeholder="최대 100자까지 입력해주세요."></textarea>
            </div> -->
          </div>
          <div v-else class="bar-item-list">
            <div
              v-for="(choiceQuestion, cidx) in question.choiceQuestions"
              :key="cidx"
              :class="selectedNums[qidx] === cidx + 1 ? 'item selected' : 'item'"
            >
              <span class="value">{{ choiceQuestion.choiceQuestion }}</span>
              <span class="per">{{ getPercentage(choiceQuestion.pickCount, totalPickCount[qidx]) }} %</span>
              <span class="bar" :style="{ width: getPercentage(choiceQuestion.pickCount, totalPickCount[qidx]) + '%'}"></span>
            </div>
          </div>
          <div class="btn-wrap">
            <button v-if="post.displayStatus === 'CLOSED'" disabled>이벤트 종료</button>
            <button v-else-if="canJoin" @click="play">참여하기</button>
            <button v-else-if="!canJoin" @click="$hiClass.alert('이미 참여하셨습니다', 'warning', true)">참여완료</button>
          </div>

          <div class="bottom">
            <div class="item">
              <p class="text-ref">휴대폰번호 오기재 등으로 인해 오발송 되는 경품은<br>재발송이 불가합니다. 반드시 휴대폰번호를 확인해주세요.</p>
              <a class="btn-white" :href="`${$webUrl}/main/mypage/info`">내 정보 변경하기</a>
            </div>
            <div class="item">
              <p class="text-ref">이벤트 참여 현황을 확인 하실 수 있습니다.</p>
              <button class="btn-gray" v-if="qidx === 0" @click="isModalViewed = true">나의 참여 현황</button>
            </div>
          </div>
        </div>
      </div>
      <div class="editor-wrap" v-html="bottomImage" />

      <EventModalView :eventUsers="post.event.eventUsers" v-if="isModalViewed" @close-modal="isModalViewed = false"/>
    </div>

  <!-- <div
    v-if="$route.query.uuid"
    class="m-wrap"
  >
    <div class="m-container">
      이벤트 웹뷰 본문
    </div>
  </div>
  <div v-else>
    <main-loading-new-tab-dim></main-loading-new-tab-dim>
  </div> -->
</template>

<script>
import EventModalView from '@/components/DetailPost/DetailPostItemBodyPostContentEventPopUp.vue'
import {mapActions} from "vuex";

export default {
  name: 'mobile-event',
  components: {EventModalView},
  data() {
    return {
      postId: null,
      post: {},
      isModalViewed: false,
      topImage: '',
      bottomImage: '',
      canJoin: false,
      textData: {},
      replies: [],
      totalPickCount: [],
      selectedNums: []
    }
  },
  methods: {
    ...mapActions({
      // openTermsView: "openTermsView",
    }),
    setQuery(keys) {
      for (const key of keys) {
        if (this.$route.query[key] !== undefined)
          localStorage.setItem(key, this.$route.query[key])
      }
    },
    getPost(uri) {
      this.$hiClass.posts
        .read(uri)
        .then(async res => {
          this.post = res.data;
          this.getEvents(this.post);          
        })        
        .catch(r => {
          this.$log.debug("getPosts Error => ", r);
        });
    },

    getEvents(post) {
      this.$hiClass.events
        .read(post.currentId)
        .then(r => {
          this.$set(post, "event", r.data);          
          this.settings()
        })
        .catch(r => {
          this.$log.debug("getEvents Error => ", r);
        });
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
      let isCompleted = true;
      this.selectedNums = [];
      
      await this.replies.forEach(reply => {
        if (reply.writeReply === "" && reply.choiceReply === "")
          isCompleted = false;
        else if (reply.choiceReply !== "")
          this.selectedNums.push(reply.choiceReply);
      });

      if (isCompleted) {
        this.$hiClass.confirm("이벤트에 응모하시겠습니까?").then(async () => {
          let requestReplies = { "replies": this.replies };
          this.$hiClass.events.play(this.post.event.eventId, requestReplies)
            .then(async () => {
              if (this.post.event.noticeResultType === 'NONE')
                await this.$hiClass.alert(this.textData['APPLY'], 'success', true);
              else
                await this.$hiClass.alert(this.textData['WINNING'], 'success', true);

              if (this.post.event.eventDetailType === 'QUIZ' || this.post.event.eventDetailType === 'SURVEY') {
                await this.$hiClass.events.read(this.post.currentId).then(r => {
                  this.post.event = r.data;
                  this.calcTotalPickCount();
                });
              }

              this.canJoin = false;
            }).catch(r => {
              this.$log.debug("DetailPostItemBodyPostContentEvent - play => ", r);
              this.$hiClass.alert('이벤트 응모 도중 오류가 발생했습니다.', 'warning', true);
            });
          });
      } else
          this.$hiClass.alert("모두 작성해주세요!", 'warning', true);
    },
    changeBtn(qidx, selectBtnNo, writeBtnNo) {
      if (selectBtnNo !== writeBtnNo) 
        this.replies[qidx].writeReply = '';
    },
    calcTotalPickCount() {
      this.totalPickCount = [];
      this.post.event.eventQuestions.forEach(question => {
        let sum = 0;
        question.choiceQuestions.forEach(choiceQuestion => {
          sum += choiceQuestion.pickCount;
        });
        this.replies.push({ questionNo: question.questionNo, choiceReply: null, writeReply: null });
        this.totalPickCount.push(sum);
      });
    },
    getPercentage(pickCount, totalCount) {
      return Math.round(pickCount * 100 / totalCount);
    },
    settings() {      
      let postContentEvent = this.post.postContent
      const parser = new DOMParser();

      const html = parser.parseFromString(postContentEvent, "text/html");
      this.topImage = html.body.querySelector("#top") === null ? '' : html.body.querySelector("#top").innerHTML;
      this.beforeOpenImage = html.body.querySelector("#beforeOpen") === null ? '' : html.body.querySelector("#beforeOpen").innerHTML;
      this.bottomImage = html.body.querySelector("#bottom") === null ? '' : html.body.querySelector("#bottom").innerHTML;

      this.post.event.eventTexts.forEach(text => {
        Object.assign(this.textData, { [text.eventTextType]: text.text });
      });

      this.calcTotalPickCount();

      if (this.post.event.eventDetailType !== 'LANDING')
        this.checkJoin(this.post.event.eventId);
    }
  },
  created() {
    const keys = ['uuid', 'idToken', 'userType']
    this.setQuery(keys)

    if (this.$route.params.id) {
      this.postId = this.$route.params.id;

      this.getPost(`${process.env.VUE_APP_BASE_API_URI}/posts/${this.postId}`);
    }

    document.body.className = ''
  },
  mounted() {
  },
  destroyed() {
    this.$authentication.clear()
  }
}
</script>

<!--<style scoped src="../../../assets/css/m-customer.css" />-->
