<template>
  <div>
    <div class="school-class-cont-top mt-30">
      <button class="new-btn btn-bg-c icon" @click="$emit('is-Write', true)">
        <span>문의 작성하기</span>
      </button>
    </div>

    <div class="customer-notice-cont-wrap">
      <div class="accordion-wrap boundary-box">
        <div
          v-for="item in items"
          :key="item.currentId"
          class="accordion-item"
          :class="{ on: item.currentId == option.currentId }"
        >
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
                <strong>
                  <pre style="line-height:20px;"
                    v-if="option.currentId == item.currentId"
                    v-autolinker:[$className]="item.contentQuestion"
                    ></pre>
                  <pre style="line-height:20px;"
                    v-else
                    :inner-html.prop="getSliceText(item)"></pre>
                </strong>
                <span class="date">{{$moment(item.insertedTimestamp).format('YYYY.MM.DD')}}</span>
                <!-- 문의 첨부 파일 -->
                <div
                  v-if="item.files.length > 0"
                  class="attach-file-wrap question-attach"
                >
                  <div                     
                    v-for="file in item.files" :key="file.currentId"
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
              <button />
            </div>
          </div>
          <div
            v-if="isQuestionComplete(item.proceedStatus)"
            class="accordion-cont-wrap">
            <div class="accordion-cont-inner-q">
              <div class="accordion-cont accordion-cont-q">
                <span class="date">{{$moment(item.updatedTimestamp).format('YYYY.MM.DD')}}</span>
                <p class="mt-10">
                  <pre style="line-height:20px"
                    v-autolinker:[$className]="item.contentAnswer"
                  ></pre>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelpQuestionList',
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
      if (this.option.currentId == item.currentId) {
        this.option.currentId = ''
      } else {
        this.option.currentId = item.currentId
      }
    },
    download(file) {
      try {
        this.$comn.download(file.fileOriginalPath, file.fileName)
      } catch (error) {
        this.$log.debug('download error => ', error)
      }
    },
    isQuestionComplete(proceedStatus) {
      const completeStatus = [
        { code: "COMPLETE", name: "상담 처리 완료" },
        { code: "CSRECOMPLETE", name: "상담 재확인 완료" },
        { code: "ALLCOMPLETE", name: "최종 처리 완료" }
      ]
      let completeArray = completeStatus.filter(d => {
        return d.code === proceedStatus
      })
      return completeArray.length > 0
    },
    getSliceText(item) {
      return [...item.contentQuestion].length > 30 ? `${[...item.contentQuestion].slice(0, 30).join('')}...` : item.contentQuestion
    }
  }
}
</script>
