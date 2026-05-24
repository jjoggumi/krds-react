<template>
  <div class="m-wrap version-1">
    <div class="m-container">
      <div class="m-area-list m-write-list">
        <div class="customer-notice-cont-wrap">
          <div class="accordion-wrap boundary-box">
            <div class="accordion-item"
                 v-for="item in items"
                 :key="item.currentId"
                 :class="{ on: item.currentId === option.currentId }">
              <div class="accordion-title-wrap" @click="setOpen(item)">
                <div class="title-wrap">
                  <div
                    class="title-num-wrap"
                    :class="{
                      'q-answer': isQuestionComplete(item.proceedStatus),
                      'q-receipt': !isQuestionComplete(item.proceedStatus)
                      }">
                    {{ isQuestionComplete(item.proceedStatus) ? '답변' : '접수' }}
                  </div>
                  <div class="title-text-wrap">
                    <strong>[{{ item.helpChatCategory.categoryTitle }}]</strong>
                    <p/>
                    <pre
                      v-if="option.currentId === item.currentId"
                      v-autolinker:[$className]="item.contentQuestion"
                    ></pre>
                    <pre v-else>{{ getSliceText(item) }}</pre>
                    <p/>
                    <span class="date">{{$moment(item.insertedTimestamp).format('YYYY.MM.DD')}}</span>

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

                  </div>
                </div>
                <div class="accordion-oc-btn-wrap">
                  <button></button>
                </div>
              </div>
              <div class="accordion-cont-wrap" v-if="isQuestionComplete(item.proceedStatus)">
                <div class="accordion-cont-inner-q">
                  <div class="accordion-cont accordion-cont-q">
                    <span class="date">{{$moment(item.updatedTimestamp).format('YYYY.MM.DD')}}</span>
                    <p class="mt-10">
                    <pre
                      v-html="item.contentAnswer"
                      v-autolinker:[$className]="item.contentAnswer"
                      ></pre>
                    <p/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button class="m-new-write" @click="$emit('is-Write', true)">새글쓰기</button>
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
  data: () => ({
    option: {
      currentId: ''
    }
  }),  
  mounted() {},
  methods: {
    setOpen(item) {
      this.option.currentId = this.option.currentId === item.currentId
        ? ''
        : this.option.currentId = item.currentId
    },
    download(file) {
      try {
        this.$comn.downloadForDoc(file.fileOriginalPath, file.fileName)
      } catch (error) {
        this.$log.debug('download error => ', error)
      }
    },
    isQuestionComplete(proceedStatus) {
      let completeArray = ['COMPLETE', 'CSRECOMPLETE', 'ALLCOMPLETE']
      return completeArray.includes(proceedStatus)
    },
    getSliceText(item) {
      return [...item.contentQuestion].length > 30 ? `${[...item.contentQuestion].slice(0, 30).join('')}...` : item.contentQuestion
    }
  }
}
</script>
<!--<style scoped src="../../../../assets/css/m-customer.css" />-->