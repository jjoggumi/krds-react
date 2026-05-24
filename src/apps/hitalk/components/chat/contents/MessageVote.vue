<template>
  <div class="chatting-bubble vote">
    <div class='header' :class="{ closed: voteContent.status === 'CLOSED' }">
      <span v-if="voteContent.status === 'PUBLISHED'">투표</span>
      <span v-if="voteContent.status === 'CLOSING_SOON'">투표가 <span class="red">30분 후</span> 종료됩니다.</span>
      <span v-if="voteContent.status === 'CLOSED'">투표가 마감되었습니다.</span>
    </div>
    <div class='thumbnail-wrapper' v-if="voteContent.status !== 'CLOSED'">
      <div class='thumbnail'/>
    </div>
    <div v-if="voteContent.status === 'PUBLISHED' || voteContent.status === 'CLOSING_SOON'" class='content'>
      <p class='question-title'>{{ voteContent.questions[0]?.question }}</p>
      <p v-if="voteContent.questions.length === 1" class='description'>{{ voteContent.questions[0]?.description }}</p>
      <p v-if="voteContent.questions.length > 1" class='question-title'>{{ voteContent.questions[1]?.question }}</p>
      <p v-if="voteContent.questions.length > 2" class='question-title'>{{ voteContent.questions[2]?.question }}</p>
      <button class='vote-button' @click="openVoteEditor">투표하러 가기</button>
    </div>
    <div v-if="voteContent.status === 'CLOSED'" class='content'>
      <div v-for="question in voteContent.questions" :key="question.id" class="result-wrapper">
        <p class='question-title'>{{ question.question }}</p>
        <div v-if="!question.isNoAnswer" class="score"><span>1위</span></div>
        <span v-if="question.description" class='result-description txt-center'>{{ question.description }}</span>
        <span v-if="question.isNoAnswer" class='result-description'>응답 내역이 없습니다.</span>
      </div>
      
      <button class='vote-button' @click="openVoteEditor">투표 결과 확인하기</button>
    </div>
  </div>
</template>

<script>
import { Hitalks } from '@/apis/Hitalks'

const apis = { hitalks: new Hitalks() }

export default {
  name: "message-vote",
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  computed: {
    voteContent () {
      return JSON.parse(this.message.content)
    },
  },
  data() {
    return {
      isVoteOpen: false
    }
  },
  methods: {
    async openVoteEditor() {
      const messageId = this.voteContent.messageId || this.message.currentId
      console.log('openVoteEditor', this.voteContent, this.voteContent.messageId, this.message.currentId, messageId)
      const voteDetail = (await apis.hitalks.getVoteMessageId(messageId)).data
      if (!voteDetail || voteDetail.isDel) {
        return this.$hiClass.alert('삭제된 투표입니다.')
      }
      this.$emit('open', messageId)
    }
  }
}
</script>

<style scoped lang="scss">
.chatting-bubble.vote {
  display: inline-flex;
  flex-direction: column;
  width: 250px;
  /* height: 324px; */
  border-radius: 16px;
  background-color: #fff !important;
  overflow: hidden;
  padding: 0px;
}

// header
.header {
  width: 100%;
  height: 30px;
  background-color: #70CAFF;
  color: #fff;
  display: flex;
  align-items: left;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: var(--font-body);
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 21px; /* 150% */
  letter-spacing: -0.2px;
  padding-left: 16px;
  padding-top: 5px;
  user-select: none;

  &.closed {
    background-color: #666;
  }

  span {
    font-feature-settings: 'liga' off, 'clig' off;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    line-height: 21px; /* 150% */
    letter-spacing: -0.2px;
    span.red {
      color: #EF2B2A;
    }
  }
}

// thumbnail
.thumbnail-wrapper {
  width: 100%;
  height: 104px;
  background-color: #F8F9FB;
  display: flex;
  justify-content: center;
  align-items: center;
  .thumbnail {
    width: 52px;
    height: 52px;
    background: url('~@/assets/img/ic_menu_vote.svg') no-repeat center center;
  }
}

//content
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  /* height: 190px; */
  padding-top: 15px;
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 20px;
  background-color: white;

  // 질문 제목과 설명
  > p{
    text-align: left;
  }
  .question-title {
    height: 24px;
    margin-bottom: 8px;
    color: #222;
    font-feature-settings: 'liga' off, 'clig' off;
  
    /* web/Text-l/Bold */
    font-family: var(--font-body);
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 24px; /* 150% */
    letter-spacing: -0.2px;
    text-align: left;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .description {
    /* height: 69px; */
    width: 100%;
    margin-bottom: 15px;
  
    color: #616161;
    font-feature-settings: 'liga' off, 'clig' off;
  
    /* web/Text-m/Regular */
    font-family: var(--font-body);
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 23px; /* 153.333% */
    letter-spacing: -0.2px;  
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  //결과
  .result-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
    .score {
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center; 
      margin-top: 10px;
      > span{
        height: 100%;
        width: 44px;
        border-radius: 24px;
        background-color: #70CAFF;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center; 
        font-size: 13px;
      }
    }   
    
    .result-description {
      margin-top: 10px;
      height: 16px;
      font-size: 14px;
    
      color: #616161;
      text-align: left;
      font-feature-settings: 'liga' off, 'clig' off;
      
      /* app/Text-s/Regular */
      font-family: var(--font-body);
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 153%;

      // white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;

      max-height: 65px;
      height: 100%;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
  }
  
  // 투표 버튼
  .vote-button {
    width: 220px;
    height: 39px;
    background-color: #f3f3f3;
    margin-top: auto;
    border-radius: 8px;
  }
}



</style>