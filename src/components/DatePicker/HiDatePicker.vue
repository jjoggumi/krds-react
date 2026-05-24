<template>
  <div :class="[className[0], {'is-err': isError}]">
    <!-- 2022-12-23 lang, append-to-body 추가 -->
    <Date-picker
      ref="date_picker"
      v-model="currentDate"
      :range="range"
      :disabled-date="disabledDate"
      :placeholder="placeholder"
      :input-attr="{id, title}"
      :value-type="valueType || format"
      @change="onChange"
      @pick="onClickPicker"
      :editable="editable"
      :disabled="disabled"
      :clearable="clearable === true ? true : false"
      :format="format"
      :popup-class="className[0]"
      :lang="lang"
      :append-to-body="appendToBody"
      :type="type"
      :minuteStep="minuteStep"
    >
      <template v-slot:header="{ emit }">
        <button class="btn-today" @click="emit(new Date())">오늘</button>
      </template>
      <template
        v-if="range"
        v-slot:header
      >
        <div>시작시간</div>
        <div>종료시간</div>
      </template>
    </Date-picker>
  </div>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
import 'vue2-datepicker/locale/ko.js';

export default {
  name: 'hi-date-picker',
  components: { DatePicker },
  props: {
    /**
     * 설문 응답 시 'type-counsel' 추가
     */
    className: {type: Array, default: () => ['hi-datepicker']},
    value: {
      type: [Array, String],
      default: () => ('')
    },
    range: {type: Boolean, default: false},
    disabledDate: {type: Function, default: () => {}},
    isError: {type: Boolean, default: false},
    placeholder: {type: String, default: ''},
    id: {type: String, default: null},
    title: {type: String, default: null},

    format: {type: String, default: null},
    editable: {type: Boolean, default: false}, // 2022-12-23 수정
    appendToBody: {type: Boolean, default: true}, // 2022-12-23 추가
    valueType: {type: String, default: null},
    disabled: {type: Boolean, default: false},
    clearable: Boolean,
    /**
     * time-picker
     */
    type: {type: String, default: null},
    minuteStep: {type: Number, default: null}
  },
  data() {
    return {
      lang: {
        yearFormat: "YYYY년" // 2022-12-23 추가
      },
      currentDate: [],
    }
  },
  watch: {
    value: {
      immediate: false,
      handler(v) {
        this.setValue(v)
      }
    }
  },
  created() {
    this.setValue(this.value)
  },
  methods: {
    onChange(e) {
      if (this.range) {
        this.$emit('change', [e[0], e[1]])
      } else {
        this.$emit('change', e)
      }
    },
    onClickPicker(e) {
      this.$emit('onClickPicker', e)
    },
    setValue(v) {
      if (this.range) {
        this.currentDate = [v[0], v[1]]
      } else {
        this.currentDate = v
      }
    },
    onClosePicker() {
      this.$refs.date_picker.closePopup()
    }
  }
}
</script>
