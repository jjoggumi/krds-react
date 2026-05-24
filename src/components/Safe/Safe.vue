<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="safeModal"
      style="display: block"
  >
    <div class="modal-cont-wrap" ref="scrollArea">
      <div class="modal-cont">
        <div class="modal-cont-inner"
          v-click-outside="vcoConfig"
          @mouseover="offVco"
          @mouseleave="onVco">
          <div class="safe-modal">
            <div class="container">
              <div class="title-wrap">
                <h2>안전 수칙 문구 관리</h2>
                <i class="info" @click="openTitleInfoShow"></i>
                <div class="title-info-show" v-if="isTitleInfoShow === true">
                  <div class="message-box">
                    <span class="message">
                      아래 등록된 문구가 자동 노출됩니다.<br/>
                    원하시는 문구를 직접 추가하거나, 엑셀로 한번에 업로드 하실 수 있습니다.
                    </span>
                    <i class="close" @click="openTitleInfoShow"></i>
                  </div>
                </div>
              </div>

              <div class="content-wrap">
                <div class="category-wrap">
                  <div class="top">
                    <span class="title">카테고리</span>
                    <span class="add" @click="addCategory">
                      <i class="plus"></i>
                      카테고리 추가
                    </span>
                  </div>
                  <div class="list" ref="categoryList">
                    <ul>
                      <li  v-for="(item, idx) in categories" :key="`categories-${idx}`"
                        :class="{
                          selected: item.categoryId === categorySelect.categoryId
                        }"
                      >
                        <p class="content">
                          <template v-if="item.categoryId !== '' && item.edit === false">
                            <span class="text" @click="selectCategory(item)" @dblclick="item.categoryType !== 'default' ? editCategory(item) : null">{{ item.categoryName }}</span>
                          </template>

                          <template v-else>
                            <label>
                              <input type="text" 
                                v-model="item.categoryName" maxlength="20" 
                                @blur="updateCategory(item, $event)"
                                @keydown="onChangeCategoryName($event, item)"
                                />
                              <span>{{ item.categoryName.length }}/20</span>
                            </label>
                          </template>
                          <i v-if="item.categoryType !== 'default'" class="delete" @click="deleteCategory(item)"></i>
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="list-wrap">
                  <div class="top">
                    <div class="input">
                      <label>
                        <input type="text" 
                          ref="searchWord"
                          v-model="searchWord" 
                          @keyup.enter="searchWords" 
                          placeholder="검색어 입력" />
                        <i class="btn-delete hi-ico ico-white ico-bg-gray ico-size-14 ico-rounded ico-close3" v-if="searchWord.trim() !== ''" @click="searchWordsDelete"></i>
                        <i class="btn-search" @click="searchWords"></i>
                      </label>
                    </div>
                    <div class="btn-group">
                      <button class="btn-download-excel" @click="downloadSample"><i class="icon-excel"></i>엑셀 양식 다운로드</button>
                      <button class="btn-register" @click="selectExcelFile"><i class="icon-upload"></i>안전 수칙 일괄 등록</button>
                      <input ref="safeExcelFileUpload" type="file" accept=".xls,.xlsx" @change="addExcelFile" style="display: none;" />
                    </div>
                  </div>
                  <div class="list" ref="wordsList">
                    <ul v-if="words.length > 0">
                      <li v-for="(item, idx) in words" :key="`words-${idx}`">
                        <template v-if="item.edit === false">
                          <span class="text" @click="item.safetyType !== 'default' ? editWords(item) : null">{{ item.message }}</span>
                        </template>

                        <template v-else>
                          <label>
                            <input type="text" 
                              v-model="item.message" maxlength="100"
                              @keydown="onChangeWord($event, item)" 
                              @blur="updateWords(item)"
                            />
                            <span>{{ item.message.length }}/100</span>
                          </label>
                        </template>

                        <p class="btn-group"> 
                          <i class="delete" v-if="item.safetyType !== 'default'" @click="deleteWords(item)"></i>
                          <i class="copy" @click="copyWords(item)"></i>
                        </p>
                      </li>
                    </ul>
                    <div v-else class="no-data">
                      <p v-if="searchWord === ''">등록된 문구가 없습니다.</p>
                      <p v-else>검색결과가 없습니다.</p>
                    </div>
                  </div>
                  
                  <p class="copy" v-if="isCopyShow">
                    문구가 복사되었습니다. 원하시는 곳에 붙여 넣으세요.
                  </p>

                  <div class="register">
                    <div class="input">
                      <label>
                        <input type="text" 
                          ref="add_word" 
                          v-model="addWord"
                          maxlength="100"
                          @keydown="onChangeWord" 
                          placeholder="문구를 입력해주세요."
                        />
                        <span>{{ addWord.length }}/100</span>
                      </label>
                    </div>
                    <button class="reg" :class="{ dis: disabledWords}" 
                      :disabled="disabledWords"
                      @click="updateWords(null)">등록</button>
                  </div>
                </div>
              </div>

              <div class="modal-close-btn" @click="close"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import axios from "@/plugins/axios";

export default {
  name: "safe",
  props: {
    mode: String,
    userIdFromNote: String
  },
  data() {
    return {
      isTitleInfoShow: true,
      categories: [],
      categorySelect: {},
      words: [],
      addWord: "",
      searchWord: "",
      userId: "",
      isCopyShow: false,
      isWait: false,
      vcoConfig: {
        handler: this.handler,
        events: ['click'],
        // Note: The default value is true, but in case you want to activate / deactivate
        //       this directive dynamically use this attribute.
        isActive: true
      },
      alertConfirmDialog: false
    }
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    disabledWords() {
      return !(this.addWord.trim().length > 0)
    }
  },
  mounted() {
    const check = JSON.parse(localStorage.getItem("safeIsTitleInfoShow"))
    if(check === false) {
      this.isTitleInfoShow = false
    }

    if(this.mode === 'NOTE') {
      this.userId = this.userIdFromNote
    } else {
      this.userId = this.user.currentId
    }

    this.getCategories("init")
  },
  methods: {
    async getCategories(data = null) {
      try {
        const res = await axios({
          method: 'GET',
          url: `/safetyRoles/categories?userId=${this.userId}`
        })

        this.categories = res.data._embedded.categories
    
        this.categories = this.categories.map(item => {
          return {
            ...item,
            edit: false,
            oriCategoryName: item.categoryName
          }
        })

        if(data === "init") {
          this.categorySelect = this.categories[0]
          this.getWords(this.categorySelect)
        }
      } catch(err) {
        this.$log.debug('safetyRoles categories GET() error => ', err)
      }
    },
    selectCategory(item) {
      this.searchWord = ""
      this.$refs.searchWord.value = ""
      this.categorySelect = item
      this.getWords(this.categorySelect)
      this.wordsListScroll("top")
    },
    addCategory() {
      const length = this.categories.filter(v => v.categoryType !== 'default').length
      
      if(length < 20) {
        const obj = {
          categoryId: "",
          categoryType: "",
          categoryName: "",
          edit: false
        }
        this.categories.push(obj)
        setTimeout(() => {
          const el = this.$refs.categoryList
          const els = el.querySelectorAll("input")
          els[els.length-1].focus()
        }, 100)
        this.categoryListScroll()
      } else {
        this.$hiClass.alert("카테고리 추가는 20개까지 가능합니다.", 'error')
        this.alertConfirmDialog = true
      }
    },
    categoryListScroll() {
      setTimeout(() => {
        const list = this.$refs.categoryList
        list.scrollTo({
          top: list.scrollHeight,
          behavior: "smooth" 
        })
      }, 100)
    },
    editCategory(item) {
      if(item.categoryType !== 'default') {
        item.edit = true
      }
    },
    async updateCategory(item) {
      if(item.categoryName.trim() !== '') {
        // 등록 
        if(item.categoryId === "") {
          if(this.isWait === false) {
            this.isWait = true
            const obj = {
              userId: this.userId,
              categoryName: item.categoryName
            }
            try {
              const res = await axios({
                method: 'POST',
                url: `/safetyRoles/categories`,
                data: obj
              })

              const list = this.categories.filter(v => v.categoryId === "" && v !== item)
              await this.getCategories()

              const index = this.categories.findIndex(v => v.categoryId === res.data.categoryId)

              if(index > -1) {
                this.categories = [...this.categories, ...list]
                this.refreshCategory()
              } else {
                item.categoryId = res.data.categoryId
                item.categoryName = res.data.categoryName
                item.categoryType = res.data.categoryType
                item.oriCategoryName = res.data.categoryName
                item.edit = false

                this.categories = [
                  ...this.categories.filter(v => v.categoryId !== "" && v !== item), 
                  item,
                  ...list
                ]
                this.refreshCategory('add', item)
              }
              
              // item.categoryId = res.data.categoryId
              // item.categoryName = res.data.categoryName
              // item.categoryType = res.data.categoryType
              // item.oriCategoryName = res.data.categoryName
              // item.edit = false
            } catch(err) {
              this.$log.debug('safetyRoles categories post() error => ', err)

              if(err.response.status === 428) {
                if(err.response.data.error === 'limit20') {
                  this.$hiClass.alert("카테고리 추가는 20개까지 가능합니다.", 'error')
                  this.alertConfirmDialog = true
                } else if (err.response.data.error === 'duplicateName') {
                  this.$hiClass.alert("동일한 카테고리가 있습니다.", 'error')
                  this.alertConfirmDialog = true
                }
              }
            } finally {
              this.isWait = false
            }
          }
        // 수정 
        } else { 
          if(item.categoryName !== item.oriCategoryName) {
            if(this.isWait === false) {
              this.isWait = true
              const obj = {
                userId: this.userId,
                categoryName: item.categoryName
              }
              try {
                const res = await axios({
                  method: 'PATCH',
                  url: `/safetyRoles/categories/${item.categoryId}`,
                  data: obj
                })
                
                item.oriCategoryName = item.categoryName
                item.edit = false

                this.refreshCategory()
              } catch(err) {
                this.$log.debug('safetyRoles categories PATCH() error => ', err)

                if(err.response.status === 428) {
                  if (err.response.data.error === 'duplicateName') {
                    this.$hiClass.alert("동일한 카테고리가 있습니다.", 'error')
                    this.alertConfirmDialog = true
                  } else if(err.response.data.error === 'isDelCategory') {
                    this.$hiClass.alert("이미 삭제된 카테고리입니다.", 'error')
                    this.alertConfirmDialog = true
                    this.getCategories()
                    if(this.categorySelect.categoryId === item.categoryId) {
                      this.selectCategory(this.categories[0])
                    }
                  }
                }
              } finally {
                this.isWait = false
              }
            }
          } else {
              item.edit = false
          }
        }
      }
    },
    async deleteCategory(item) {
      const opts = {
        cancelButtonText: '취소',
        reverseButtons: true
      }
      
      this.$hiClass.confirm('선택하신 카테고리를 삭제하시겠어요?<br/>카테고리를 삭제하시면 등록된 문구도 함께 삭제됩니다.', null, opts)
        .then(async() => {
          if(item.categoryId) {
            try {
              await axios({
                method: 'DELETE',
                url: `/safetyRoles/categories/${item.categoryId}`,
              })

              this.refreshCategory('del', item)

              // this.categories = this.categories.filter(v => v.categoryId !== item.categoryId)

              this.getCategories()

              if(this.categorySelect.categoryId === item.categoryId) {
                this.selectCategory(this.categories[0])
              }
            } catch(err) {
              this.$log.debug('safetyRoles categories DELETE() error => ', err)
            
              if(err.response.status === 428) {
                if(err.response.data.error === 'isDelCategory') {
                  this.$hiClass.alert("이미 삭제된 카테고리입니다.", 'error')
                  this.getCategories()
                  if(this.categorySelect.categoryId === item.categoryId) {
                    this.selectCategory(this.categories[0])
                  }
                }
              }
            }
          } else {
            this.categories = this.categories.filter(v => v !== item)
          }
        })
        .catch(() => {})

      this.alertConfirmDialog = true
    },
    async getWords(item) {
      try {
        const res = await axios({
          method: 'GET',
          url: `/safetyRoles/categories/${item.categoryId}?userId=${this.userId}`
        })

        if(res.data._embedded) {
          this.words = res.data._embedded.safeRoles
          this.words = this.words.map(item => {
            return {
              ...item,
              edit: false,
              oriMessage: item.message
            }
          })
        } else {
          this.words = []
        }
      } catch(err) {
        this.$log.debug('getWords random GET() error => ', err)
      }
    },
    editWords(item) {
      if(item.safetyType !== 'default') {
        item.edit = true
      }
    },
    async updateWords(item = null) {
      if(item === null) {
        if(this.addWord.trim() !== "") {
          if(this.isWait === false) {
            this.isWait = true
            const obj = {
              categoryId: this.categorySelect.categoryId,
              userId: this.userId,
              message: this.addWord
            }
            try {
              await axios({
                method: 'POST',
                url: `/safetyRoles`,
                data: obj
              })
              // this.words.push({...res.data, edit: false})
              this.wordsListScroll("bottom")
            } catch(err) {
              this.$log.debug('safetyRoles post() error => ', err)

              if(err.response.status === 428) {
                if(err.response.data.error === 'duplicateMessage') {
                  this.$hiClass.alert("동일한 문구가 있습니다.", 'error')
                  this.alertConfirmDialog = true
                } else if(err.response.data.error === 'noSafetyRoles') {
                  this.$hiClass.alert("이미 삭제된 문구입니다.", 'error')
                  this.alertConfirmDialog = true
                }
              }
            } finally {
              this.getWords(this.categorySelect)
              this.addWord = ""
              this.$refs.add_word.value = ""
              this.isWait = false
            }
          }
        }
      } else {
        if(item.message.trim() !== "") {
          if(item.message !== item.oriMessage) {
            try {
              const obj = {
                categoryId: item.categoryId,
                userId: this.userId,
                message: item.message
              }
              const res = await axios({
                method: 'PATCH',
                url: `/safetyRoles/${item.safetyId}`,
                data: obj
              })
              this.$log.debug('safetyRoles PATCH() res => ', res)

              item.oriMessage = item.message
              item.edit = false
            } catch(err) {
              this.$log.debug('safetyRoles PATCH() error => ', err)

              if(err.response.status === 428) {
                if(err.response.data.error === 'duplicateMessage') {
                  this.$hiClass.alert("동일한 문구가 있습니다.", 'error')
                  this.alertConfirmDialog = true
                } else if(err.response.data.error === 'noSafetyRoles') {
                  this.$hiClass.alert("이미 삭제된 문구입니다.", 'error')
                  this.alertConfirmDialog = true
                  this.getWords(this.categorySelect)
                }
              }
            }
          } else {
            item.edit = false
          }
        }
      }
    },
    wordsListScroll(data) {
      setTimeout(() => {
        const list = this.$refs.wordsList
        list.scrollTo({
          top: data === "top" ? 0 : list.scrollHeight,
          behavior: "smooth" 
        })
      }, 100)
    },
    async deleteWords(item) {
      const opts = {
        cancelButtonText: '취소',
        reverseButtons: true
      }
      
      this.$hiClass.confirm('선택하신 문구를 삭제하시겠어요?', null, opts)
        .then(async() => {
          if(item.safetyId) {
            try {
              await axios({
                method: 'DELETE',
                url: `/safetyRoles/${item.safetyId}`,
              })

              // this.words = this.words.filter(v => v.safetyId !== item.safetyId)
              this.getWords(this.categorySelect)
            } catch(err) {
              this.$log.debug('safetyRoles DELETE() error => ', err)

              if(err.response.status === 428) {
                if(err.response.data.error === 'noSafetyRoles') {
                  this.$hiClass.alert("이미 삭제된 문구입니다.", 'error')
                  this.getWords(this.categorySelect)
                }
              }
            }
          }
        })
        .catch(() => {})

      this.alertConfirmDialog = true
    },
    copyWords(item) {
      window.navigator.clipboard.writeText(item.message)
      this.isCopyShow = true

      setTimeout(() => {
        this.isCopyShow = false
      }, 3000)
    },
    onChangeCategoryName(event, item) {
      item.categoryName = event.target.value.substring(0, 20)
      
      if(event.keyCode === 13) {
        this.updateCategory(item, event)
      }
    },
    onChangeWord(event, item = null) {
      if(item === null) {
        this.addWord = event.target.value.substring(0, 100)
        
        if(event.keyCode === 13) this.updateWords(item)
      } else {
        item.message = event.target.value.substring(0, 100)

        if(event.keyCode === 13) this.updateWords(item)
      }
    },
    openTitleInfoShow() {
      localStorage.setItem("safeIsTitleInfoShow", JSON.stringify(false))
      this.isTitleInfoShow = !this.isTitleInfoShow
    },
    searchWordsDelete() {
      this.searchWord = ""
      this.getWords(this.categorySelect)
    },
    async searchWords() {
      await this.getWords(this.categorySelect)
      if(this.searchWord !== "") {
        this.words = this.words.filter(item => {
          return item.message.search(this.searchWord) > -1
        })
      }
    },
    selectExcelFile(e) {
      e.stopPropagation()
      this.$refs.safeExcelFileUpload.click()
    },
    addExcelFile(e) {
      const files = e.target.files

      if(files[0].type.indexOf("sheet") > -1 && (files[0].name.indexOf("xlsx") > -1 || files[0].name.indexOf("xls") > -1)) {
        this.uploadExcelFile(files[0])
      } else {
        this.$hiClass.alert("엑셀파일을 등록해주세요.", 'error')
        this.alertConfirmDialog = true
      }

      this.$refs.safeExcelFileUpload.value = ""
    },
    async uploadExcelFile(file) {
      this.$hiClass.excels.safeCategoryAndWords(file)
        .then(res => {
          if(res.data.length > 0) {
            this.getCategories()
            this.getWords(this.categorySelect)
            this.$hiClass.alert("엑셀 등록이 완료되었습니다.", 'info')
            this.refreshCategory()
            this.alertConfirmDialog = true
            this.categoryListScroll()
          } else {
            this.$hiClass.alert("등록할 카테고리와 문구를 엑셀파일에 입력해주세요.", 'error')
            this.alertConfirmDialog = true
          }
        })
        .catch(err => {
          if(err.response.status === 428) {
            if(err.response.data.error === 'limit20') {
              this.$hiClass.alert("카테고리 추가는 20개까지 가능합니다.", 'error')
              this.alertConfirmDialog = true
            } else if (err.response.data.error === 'InvalidExcelFormat' || err.response.data.error === 'DeprecatedExcelVersion') {
              this.$hiClass.alert('지원하지 않는 파일 양식입니다.<br>등록 양식을 다운로드 받아 다시 업로드해주세요.', 'error')
            }
          } else {
            this.$hiClass.alert('업로드를 실패하였습니다.<br>파일을 다시 확인해주세요.', 'error')
          }
        })
    },
    refreshCategory(data = null, categoryId) {
      this.$emit("refreshCategory", data, categoryId)
    },
    downloadSample() {
      const samplePath = 'https://download.hiclass.net/static/document/safe_categorywords_sample.xlsx'
      this.$comn.download(samplePath,'안전수칙일괄등록양식.xlsx')
    },
    close() {
      localStorage.setItem("safeIsTitleInfoShow", JSON.stringify(false))
      this.$emit("close")
    },
    onVco() {
      // Modal in new Modal 대응
      const hiModalCommons = document.getElementsByClassName('hi-modal-common')
      if (hiModalCommons && hiModalCommons.length > 0) return false

      const modals = document.getElementsByClassName('modal')
      const sweetAlerts = document.querySelectorAll('.swal2-container')
      if (modals.length < 2 && sweetAlerts.length < 1) {
        this.vcoConfig.isActive = true
      }
    },
    offVco() {
      this.vcoConfig.isActive = false
    },
    handler() {
      this.$log.debug(
          `handler this.vcoConfig.isActive attendance => `,
          this.vcoConfig.isActive, this.alertConfirmDialog
      )

      if(this.vcoConfig.isActive === true && this.alertConfirmDialog === false) {
        this.close()
      }
      
      if(this.alertConfirmDialog === true) this.alertConfirmDialog = false
    },
  }
}
</script>

<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
  right: 20px;
  z-index: 9999;
}
</style>