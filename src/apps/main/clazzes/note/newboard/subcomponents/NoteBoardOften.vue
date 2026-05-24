<template>
  <div class="often-use-phrases-popup boundary-box" style="display: block">
    <!-- <div class="top-wrap">
      <hc-select
        :model.sync="model.clazzPhraseCategory"
        selectLabel="value"
        selectValue="key"
        :isFocusMode="false"
        :item="items.phraseCategories"
        @is-click="changeCategory"
      />
      <div class="input-cont-wrap">
        <div class="input-box-wrap">
          <input
            type="text"
            ref="phraseContent"
            placeholder="내용을 입력해주세요."
            maxlength="100"
            v-model="model.content"
            @keydown.enter.prevent.stop="addPhrase"
          />
        </div>
        <button class="add-btn" @click="addPhrase"></button>
      </div>
    </div>
    <div class="btm-wrap scrollbar-outer">
      <ul>
        <li
          v-for="item in items.phrase"
          :key="item.currentId"
          style="cursor: pointer"
          @click="setContents(item)"
        >
          <div
            class="inner"
            :class="{ 'type-green': item.phraseType === 'PERSON' }"
          >
            <div>{{ item.content }}</div>
            <button
              class="delete-btn"
              v-if="item.phraseType === 'PERSON'"
              @click.stop="deletePhrase(item)"
            ></button>
          </div>
        </li>
      </ul>
    </div> -->
    <div class="top-wrap">
      <div class="modal-close-btn" @click="close"></div>
      <p class="title">자주 쓰는 문구 관리</p>
      <p class="title-info-message">인성, 생활 지도에 필요한 다양한 문구를 알림장에 추가할 수 있습니다.</p>
    </div>
    <div class="select-wrap">
      <hc-select
        :model.sync="model.clazzPhraseCategory"
        selectLabel="value"
        selectValue="key"
        :isFocusMode="false"
        :item="items.phraseCategories"
        @is-click="changeCategory"
      />
    </div>
    <div class="btm-wrap">
      <ul>
        <li
          v-for="item in items.phrase"
          :key="item.currentId"
          style="cursor: pointer"
          @click="setContents(item)"
        >
          <div
            class="inner"
            :class="{ 'type-green': item.phraseType === 'PERSON' }"
          >
            <div>{{ item.content }}</div>
            <button
              class="delete-btn"
              v-if="item.phraseType === 'PERSON'"
              @click.stop="deletePhrase(item)"
            ></button>
          </div>
        </li>
      </ul>
    </div>
    <div class="register-wrap">
      <div class="input-cont-wrap">
        <div class="input-box-wrap">
          <input
            type="text"
            ref="phraseContent"
            placeholder="내용을 입력해주세요."
            maxlength="100"
            v-model="model.content"
            @keydown.enter.prevent.stop="addPhrase"
          />
        </div>
        <button class="add-btn" @click="addPhrase"></button>
      </div>
    </div>
  </div>
</template>

<script>
import HcSelect from '../../../../../../components/Form/HcSelect'

export default {
  name: 'NoteBoardOften',
  components: {
    HcSelect
  },
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      items: {
        phraseCategories: [],
        phrase: []
      },
      model: {
        clazzPhraseCategory: '',
        content: '',
        phraseType: 'PERSON',
        user: ''
      }
    }
  },
  computed: {},
  created() {
    if (this.userId !== '') {
      this.model.user = `${process.env.VUE_APP_BASE_API_URI}/users/${this.userId}`
    }
  },
  mounted() {
    if (this.model.user === '') {
      this.$hiClass.alert('회원정보를 찾을 수 없습니다.')
    } else {
      this.getClazzPhraseCategories()
      this.focus()
    }

    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar()
    })
  },
  methods: {
    getClazzPhraseCategories() {
      this.$hiClass.clazzPhraseCategories
        .search({
          size: 500
        })
        .then(res => {
          // res.data._embedded.clazzPhraseCategories.map(item => {
          //   this.items.phraseCategories.push({
          //     key: item._links.self.href,
          //     value: item.title
          //   })
          // })

          const list = [
            ...res.data._embedded.clazzPhraseCategories.filter(v => v.currentId === 3),
            ...res.data._embedded.clazzPhraseCategories.filter(v => v.currentId !== 3)
          ]
          
          list.map(item => {
            this.items.phraseCategories.push({
              key: item._links.self.href,
              value: item.title
            })
          })

          if (this.items.phraseCategories.length > 0) {
            this.model.clazzPhraseCategory = this.items.phraseCategories[0].key
          }

          this.getClazzPhrase()
        })
        .catch(err => {
          this.$log.debug(
            this.$options.name,
            ' getClazzPhraseCategories() error => ',
            err
          )
        })
    },
    getClazzPhrase() {
      this.$hiClass.clazzPhrases
        .search({
          _clazzPhraseCategory: this.model.clazzPhraseCategory,
          _user: this.model.user,
          _phraseType: this.model.phraseType,
          sort: ['phraseType,desc', 'insertedTimestamp,desc'],
          size: 500
        })
        .then(res => {
          this.items.phrase = res.data._embedded.clazzPhrases || []
        })
        .catch(err => {
          this.$log.debug(
            this.$options.name,
            ' getClazzPhrase() error => ',
            err
          )
        })
    },
    changeCategory() {
      this.getClazzPhrase()
    },
    addPhrase() {
      if (this.model.content.trim() === '') {
        alert('문구가 입력되지 않았습니다.')
        this.oftenPhrases = ''
        return
      }

      if (this.model.content.trim().length > 100) {
        alert('문구는 최대 100글자까지 입력 가능합니다.')
        return
      }

      if (
        this.items.phrase.filter(item => {
          return (
            item.content === this.model.content && item.phraseType === 'PERSON'
          )
        }).length > 0
      ) {
        alert('이미 등록된 문구가 있습니다.')
        return
      }

      if (confirm('등록 하시겠습니까?')) {
        this.$hiClass.clazzPhrases
          .create(this.model)
          .then(res => {
            if (res) {
              this.model.content = ''
              this.getClazzPhrase()
            }
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' addPhrase() error => ', err)
          })
      }
    },
    deletePhrase(item) {
      if (confirm('삭제 하시겠습니까?')) {
        this.$hiClass.clazzPhrases
          .delete(item)
          .then(() => {
            this.getClazzPhrase()
          })
          .catch(err => {
            this.$log.debug(
              this.$options.name,
              ' deletePhrase() error => ',
              err
            )
          })
      }
    },
    setContents(item) {
      this.$emit('is-click', item)
    },
    focus() {
      this.$refs.phraseContent.focus()
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>
