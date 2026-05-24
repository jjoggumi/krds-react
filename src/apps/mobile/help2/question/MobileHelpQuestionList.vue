<!--
@File(Method): MobileHelpQuestionList.vue
@Date Created: -
@Description: 1:1문의하기 > 리스트
@Modified: 2024-12-17 - #70648 1:1문의하기 웹뷰
-->
<template>
  <div class="m-wrap">  
    <!-- #70648 header 추가 -->
    <header class="m-header">
      <HiButton class="m-btn-left" color="link" @click="$emit('close')">
        <HiIcon name="ico-prev" size="24" class="p-05"/>
      </HiButton>
      <h1>나의 문의 이력</h1>
      <HiButton class="m-btn-right" color="link" @click="$emit('is-Write')">문의하기</HiButton>
    </header>
    <div class="m-container">
      <div class="m-area-list">
        <div class="accordion-wrap">
          <transition-group
              name="accordion-item-fade"
              tag="div"
              class="accordion-list"
            >
          <div class="accordion-item"
            v-for="(item, i) in innerItems"
            :key="item.currentId"
            :class="{ on: item.currentId === option.currentId }"            
            :style="{ transitionDelay: `${i * 0.1}s` }" >
            <div class="accordion-title-wrap" @click="setOpen(item)">
              <div class="title-wrap">  
                <!-- #70648 위치이동 
                <div
                    class="title-num-wrap"
                    :class="{
                      'q-answer': isQuestionComplete(item.proceedStatus),
                      'q-receipt': !isQuestionComplete(item.proceedStatus)
                      }">
                    {{ isQuestionComplete(item.proceedStatus) ? '답변' : '접수' }}
                  </div>                 -->
                <div class="title-text-wrap">
                  <strong>{{ item.helpChatCategory.categoryTitle.replace('문의', '').trim() }} 문의</strong>
                  <pre
                    v-autolinker:[$className]="item.contentQuestion"
                  ></pre>
                  <!-- #70648 1:1문의하기 웹뷰 - 문의 말줄임 삭제 <pre
                    v-if="option.currentId === item.currentId"
                    v-autolinker:[$className]="item.contentQuestion"
                  ></pre>
                  <pre v-else>{{ getSliceText(item) }}</pre> -->
                  
                  <!-- 문의 첨부 파일 -->
                  <div
                    v-if="item.files.length > 0"
                    class="attach-file-wrap question-attach"
                  >
                    <div
                      v-for="(file, index) of item.files"
                      :key="`${file.currentId}-${index}`"
                      class="attaching-file q-attach-file"
                      @click="download(file)"
                    >
                      <span>{{ file.fileName }}</span>
                    </div>
                  </div>
                  <!-- 문의 첨부 파일 -->
                  <div class="info-etc-wrap">
                    <span
                      class="q-status"
                      :class="{
                        'q-answer': isQuestionComplete(item.proceedStatus),
                        'q-receipt': !isQuestionComplete(item.proceedStatus)
                        }">
                      {{ isQuestionComplete(item.proceedStatus) ? '답변완료' : '접수' }}
                    </span>
                    <span class="date">{{$moment(item.insertedTimestamp).format('YYYY.MM.DD')}}</span>
                  </div>
                </div>
              </div>
              <div class="accordion-oc-btn-wrap" v-if="isQuestionComplete(item.proceedStatus)"><button></button></div>
            </div>              
            <div class="accordion-cont-wrap" v-if="isQuestionComplete(item.proceedStatus)"            
            :style="{
                height: item.currentId === option.currentId
                  ? contentHeights[item.currentId] + 'px'
                  : '0px',
              }"
              :ref="'accordion-' + item.currentId"
              >
              <div class="accordion-cont-inner-q">
                <div class="accordion-cont accordion-cont-q">
                  <span class="date">{{$moment(item.updatedTimestamp).format('YYYY.MM.DD')}}</span>
                  <p class="mt-10">
                  <pre
                    v-html="item.contentAnswer"
                    v-autolinker:[$className]="item.contentAnswer"
                    ></pre>
                  </p>
                  <!-- 답변 첨부 파일  : 기능 개발 필요한 부분.  -->
                  <div v-if="(item.answerFiles || []).length > 0" class="attach-file-wrap question-attach mb-00 mt-05">
                    <div class="attaching-file q-attach-file" @click="">
                      <span>파일명</span>
                    </div>
                  </div>
                  <!-- 답변 첨부 파일 -->
                </div>
              </div>
            </div> 
          </div>
          </transition-group>
        </div>
      </div>
    </div>
    <!-- #70648 header로 이동 <button class="m-new-write" @click="$emit('is-Write', true)">새글쓰기</button> -->
  </div>
</template>

<script>
export default {
  name: 'MobileHelpQuestionList',
  components: {},
  props: {
    items: {
      type: Array
    }
  },
  watch: {
    items: {
      handler() {
        this.innerItems = JSON.parse(JSON.stringify(this.items || []));
      },
      immediate: true
    }
  },
  data() {
    return {
      innerItems: [],
      option: {
        currentId: ''
      },
      searchForm: {
        _user: `${process.env.VUE_APP_BASE_API_URI}/users/${this.$route.query.uuid}`,
        sort: 'insertedTimestamp,desc',
        page: parseInt(process.env.VUE_APP_BASE_PAGE_START, 10),
        size: 100
      },      
      contentHeights: {},// 각 accordion의 높이 저장
    }
},
  mounted() {
    if ((this.items || []).length == 0) {
      this.loadQuestions();
    }
    
    this.updateAccordionHeight(); // 처음 로드 시 높이 설정
  },
  
  methods: {
    async loadQuestions() {
      try {
        const res = await this.$hiClass.helpChats.search(this.searchForm);
        this.innerItems = res.data._embedded.helpChats || [];
      } catch (err) {
        this.$log.debug(this.$options.name, ' getQuestions() error => ', err);
      } finally {
        this.option.isLoad = true;
      }
    },
    setOpen(item) {
      this.option.currentId = this.option.currentId === item.currentId
        ? ''
        : this.option.currentId = item.currentId      
      this.updateAccordionHeight(); // 처음 로드 시 높이 설정
    },
    download(file) {
      try {
        this.$comn.downloadForDoc(file.fileTranscodePath || file.fileOriginalPath, file.fileName)
      } catch (error) {
        this.$log.debug('download error => ', error)
      }
    },
    isQuestionComplete(proceedStatus) {
      let completeArray = ['COMPLETE', 'CSRECOMPLETE', 'ALLCOMPLETE']
      return completeArray.includes(proceedStatus)
    },
    // #70648 1:1문의하기 웹뷰 - 문의 말줄임 삭제 
    // getSliceText(item) {
    //   return [...item.contentQuestion].length > 30 ? `${[...item.contentQuestion].slice(0, 30).join('')}...` : item.contentQuestion
    // }
    updateAccordionHeight() {
      this.$nextTick(() => {
        this.innerItems.forEach((item) => {
          const refs = this.$refs[`accordion-${item.currentId}`];
          const element = Array.isArray(refs) ? refs[0] : refs;
          if (element) {
            this.$set(this.contentHeights, item.currentId, element.scrollHeight);
            console.log('item.currentId', this.contentHeights);
          }
        });
      });
    },
  }
}
</script>

<style scoped>
.question-wrap .question-inner .m-header {
  border-bottom: 1px solid #ececec;
}
.accordion-item-fade-enter{
  opacity: 0;
  transform: translateY(5px);
}
.accordion-item-fade-enter-active {
  transition: opacity 5s ease, transform 5s ease;
}
.accordion-item-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.accordion-item-fade-leave-active {transition-delay: 0s !important;}
</style>