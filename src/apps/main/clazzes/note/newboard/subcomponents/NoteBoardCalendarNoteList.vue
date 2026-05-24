<template>
  <div
    class="note-list-wrap"
    @mouseover="$emit('offVco')"
    @mouseleave="$emit('onVco')"
  >
    <div v-if="isNoteList">
      <div class="note-list-title">{{ $store.state.curClazzNote.name }} 목록</div>
      <ul>
        <li
          v-for="item in item.dayPosts"
          :key="item.currentId"
          :class="{
            'temporary-save':
              item.postStatus === 'TEMPORARY' || item.postStatus === 'RESERVE'
          }"
          @click="setPosts(item)"
        >
          <a href="javascript:void(0)" v-text="getPostContentText(item)"></a>
        </li>
      </ul>
    </div>
    <button class="new-note-btn icon" v-if="isNewNote" @click="onClickNewNote">
      <span>새 {{ $store.state.curClazzNote.name }} 쓰기</span>
    </button>
  </div>
</template>

<script>
import { eventBus } from '@/main'

export default {
  name: 'note-board-calendar-note-list',
  props: {
    option: {
      type: Object,
      required: true
    },
    item: {
      type: Object,
      required: true
    },
    isSendComplete: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    isNoteList() {
      return this.item.dayPosts.length > 0
    },
    isNewNote() {
      if (this.isSendComplete) return false
      else if (this.option.curDate) {
        let selectDate = this.$moment(
          `${this.option.curDate.year}-${this.option.curDate.month + 1}-${
            this.option.curDate.date
          }`,
          'YYYY-MM-DD'
        )
        return this.$moment().diff(selectDate, 'days') <= 0
      }

      return false
    }
  },
  watch: {},
  mounted() {},
  methods: {
    getPostContentText(item) {
      let prefix = ''
      if (item.postStatus === 'TEMPORARY') prefix = '[임시저장] '
      else if (item.postStatus === 'RESERVE') prefix = '[예약] '

      return `${prefix}${(item.postContent || '')
        .replace(/(<([^>]+)>)/gi, '')
        .replace(/&[n]bsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')}`
    },
    setPosts(item) {
      if(item) {
        const post = {
          postURI: item && item._links && item._links.self.href,
          folder: item.folder,
          posted: this.$moment(
            `${this.option.curDate.year}-${this.option.curDate.month + 1}-${
              this.option.curDate.date
            }`,
            'YYYY-MM-DD'
          )
            .add(this.option.selectedTime.hour, 'hour')
            .add(this.option.selectedTime.minute, 'minutes')
            .valueOf()
        }
        eventBus.$emit('note-board-change-posted', post)
      }
    },
    onClickNewNote() {
      eventBus.$emit('note-board-new')
    }
  }
}
</script>

<style scoped></style>
