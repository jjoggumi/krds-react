<!--
@File(Method): MobileHelpQuestion.vue
@Date Created: -
@Description: 1:1문의하기
@Modified: 2024-12-17 - #70648 1:1문의하기 웹뷰 :  main화면 추가
-->
<template>
<div class="question-wrap">
  <div class="question-inner">
    <div class="m-wrap">
      <header class="m-header">
        <HiButton class="m-btn-left" color="link" @click="showMain">
          <HiIcon name="ico-prev" size="24" class="p-05"/>
        </HiButton>
      </header>
      <div class="m-container question-main">
        <div class="tit">
          <profile-item :user="user" :showImage="false" :inline="true" :attachSir="true"/>
          <br>무엇을 도와드릴까요?
        </div>
        <HiButton color="default" size="lg" block bitrounded @click="onClickSearch" class="search-btn"> 
          궁금한 점을 검색해보세요 <HiIcon name="ico-search" size="24"/> 
        </HiButton>
        <div class="tit-wrap">
          <div class="tit">자주 묻는 질문</div>
        </div>
        <MobileHelpSearchAndCategory
          :items="faqItems" 
          @setFaqCategoriId="setFaqCategoriId"
        />
        <div class="btn-fix-bt">
          <HiButton color="primary" outline size="xl" block bitrounded 
            @click="showList" 
            @touchend.prevent="showList">나의 문의 이력</HiButton>
          <HiButton color="primary" size="xl" block bitrounded 
            @click="showWrite" 
            @touchend.prevent="showWrite">1:1문의하기</HiButton>
        </div>
      </div>
    </div>
    <help-question-list v-if="items.limit > 0" class="subX" :class="{shownX: option.isList}"
      :items='items.questions'
      @close="closeSub"
      @is-Write="showWrite"
    />
    <help-question-not-found v-if="items.limit === 0" class="subX" :class="{shownX: option.isList}"
      @close="closeSub"
      @is-Write="showWrite"
    />
    <help-question-write ref='questionWrite' class="subY" :class="{shownY: option.isWrite}"
      @close="closeSub"
      @is-result="childEvent"
    />
    <help-question-alert v-if="invalidAccess"/>
  </div>
  <mobile-help-faq ref="faq" class="subX" :class="{ shownX: option.isFaq}" 
    @close="option.isFaq = false"/>
</div>
</template>

<script>
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";
import MobileHelpSearchAndCategory from "@/apps/mobile/help2/faq/MobileHelpSearchAndCategory.vue";
import helpQuestionList from './MobileHelpQuestionList.vue';
import ProfileItem from '@/components/Profile/List/Item.vue';
import MobileHelpFaq from '@/apps/mobile/help2/faq/MobileHelpFaq.vue';

const helpQuestionNotFound = () => ({
  component: import('./MobileHelpQuestionNotFound'),
  error: ErrorLoadFailAsyncComponent,
})
const helpQuestionWrite = () => ({
  component: import('./MobileHelpQuestionWrite'),
  error: ErrorLoadFailAsyncComponent,
})
// const helpQuestionList = () => ({
//   component: import('./MobileHelpQuestionList'),
//   error: ErrorLoadFailAsyncComponent,
// })
const helpQuestionAlert = () => ({
  component: import('./MobileHelpQuestionAlert'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'MobileHelpQuestion',
  components: {
    helpQuestionNotFound,
    helpQuestionWrite,
    MobileHelpSearchAndCategory,  // #70648 faq 검색박스와 카테고리 컴포넌트
    helpQuestionList,  // #70648 문의하기 리스트
    helpQuestionAlert,
    ProfileItem,
    MobileHelpFaq
  },
  props: {
    parent: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      option: {
        isWrite: false,
        isList: false, // #70648 문의하기 리스트 상태
        isLoad: true,
        isFaq: false
      },
      items: {
        questions: [],
        limit: 0
      },
      // #70648 faq 검색박스와 카테고리 컴포넌트 데이터
      faqItems: {
        categories: [],
      },
      user: {}
    }
  },
  computed: {
    editMode() {
      if (!this.option.isLoad) {
        return null
      }

      if (this.option.isWrite) {
        return 'helpQuestionWrite'
      } else {
        if (this.items.limit > 0) {
          return 'helpQuestionList'
        } else {
          return 'helpQuestionNotFound'
        }
      }
    },
    invalidAccess() {
      return !localStorage.uuid || !localStorage.idToken
    }
  },
  async mounted() {
    this.getQuestions()
    // #70648 faq 카테고리 가져오기
    this.getFaqCategories() 
  },
  methods: {
    async loadUser() {
      try {
        const res = await this.$hiClass.users.read(localStorage.uuid);
        this.user = res.data;
      } catch (err) {
        this.$log.debug(this.$options.name, ' loadUser() error => ', err);
      }
    },
    async getQuestions() {
      if (!localStorage.idToken) {
        this.option.isLoad = true
        return;
      }
      
      try {
        await this.loadUser();
        const res = await this.$hiClass.helpChats.search(this.searchForm);
        this.items.questions = (res.data._embedded.helpChats || []).sort((a, b) => b.insertedTimestamp - a.insertedTimestamp);
        this.items.limit = res.data.page.totalElements || 0;
      } catch (err) {
        this.$log.debug(this.$options.name, ' getQuestions() error => ', err);
      }

      this.option.isLoad = true;
    },
    // #70648 faq 카테고리 가져오기
    getFaqCategories() {
      this.$hiClass.helpFaqCategories
        .search({
          _used: true,
          size: 100
        })
        .then(res => {
          this.faqItems.categories = res.data._embedded.helpFaqCategories || []
          const item = this.faqItems.categories[0]
        })
        .catch(err => {
          this.$log.debug(
            this.$options.name,
            ' getFaqCategories() error => ',
            err
          )
        })
    },
    childEvent(type) {
      this.option.isWrite = type
      this.getQuestions()
    },
    showList() {
      this.option.isList = true;
      this.option.isWrite = false;
    },    
    showWrite() {
      this.$refs.questionWrite?.clearModel()
      this.option.isWrite = true;
      this.option.isList = false;
    },    
    closeSub() {
      this.option.isWrite = false;
      this.option.isList = false;
    },
    showMain() {
      this.closeSub()
      this.parent.back();
    },
    async setFaqCategoriId(item) {
      this.$refs.faq.setFaqCategoriId(item)
      await this.$nextTick()
      this.option.isFaq = true
    },
    async onClickSearch() {
      this.option.isFaq = true
      await this.$nextTick()
      this.$refs.faq.setFocus()
    }
  }
}
</script>
<style lang="scss">
html, body {
  overscroll-behavior-y: none;
}

div {
  overscroll-behavior: none;
}

.question-wrap .question-inner{
  height:100%;
  overflow: hidden;
  background: #fff;  
  .m-header{border: 0;}
  .question-main{
    padding:35px 20px;
    > .tit{
      font-size: 22px;  
      font-weight: 700;
      line-height: 1.5; 
      margin-bottom: 16px;
      span{
        font-size: 22px;  
        display: inline-block;
        width: calc(100% - 80px);
        vertical-align: text-bottom;
        font-weight: 700;
        line-height: 1.2;
      }
      & + .hi-btn{
        display: flex;
        align-items: center;
        justify-content: space-between;
        text-align: left;
        height: 48px;
        color:#888;
        background: #F2F3F6;
        border-color: #F2F3F6;
        i::after{
          background-color: #9E9E9E;
        }
      }
    }
  }
  .tit-wrap{
    position: relative;
    margin: 30px 0 16px;
    .tit{
      font-size:18px;
      color:#000;
      font-weight: 700;
    }
  }
  .btn-fix-bt{
    position:fixed;
    left: 20px;
    right:20px;
    bottom:20px;
    display: flex;
    gap:8px;
    
    .hi-btn {
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
  }
}

[class *='sub']{
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0px;
  top: 0px; 
}
.subX {
  display: block;
  transform: translateX(100%);
  z-index: 999;
  transition: transform 0.3s ease-in-out; 
}
.subY {
  display: block;
  transform: translateY(100%);
  z-index: 999;
  transition: transform 0.3s ease-in-out; 
}
.shownX { 
  transform: translateX(0); 
}
.shownY {
  transform: translateY(0);
}
</style>