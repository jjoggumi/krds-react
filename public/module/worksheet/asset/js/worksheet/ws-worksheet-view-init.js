/* eslint-disable */
/**
 * worksheet ws-worksheet-view-init.js
 * ver 0.1
 * 2021. 9. 24
 */
$(document).ready(function () {
  
  if (!$("#quizIdx").val()) {
    // let testQuizIdx = '1013262'
    let errMsg = 'quizIdx is null !'  // + `\ninit ${testQuizIdx} worksheet`
    
    try {
      const quizIdx = getParam('quizIdx')
      
      if (quizIdx)
        $("#quizIdx").val(quizIdx)
      else
        throw new Error(errMsg)
      
      $("#idToken").val(getParam('idToken'))
  
      $("#hideMakeHeader").val(getParam('hideMakeHeader') || 'false')
  
      if ($("#hideMakeHeader").val() === 'true') {
        $("header.make-header").remove()
        $("div.preview-tooltip").remove()
        $("section.make-view").css('padding-top', '0')
      } else {
        $("header.make-header").css('display', 'block')
        $("div.preview-tooltip").css('display', 'block')
      }
      
    } catch (e) {
      alert(e.message || errMsg)
      // $("#quizIdx").val(testQuizIdx)
    }
  }
  
  if ($("#quizIdx").val()) {
  
    try {
      $axios({
        url: `${apiUrl}/sheets/${$("#quizIdx").val()}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${$("#idToken").val()}` }
      })
        .then(res => {
          const resData = res.data
          const sheetMedias = resData.sheetMedias.filter(data => data.mediaCd === 'ISIMG')
          const sheetTools = resData.sheetTools
  
          // create component
          if ($("#hideMakeHeader").val() === 'false') {
            Vue.component('make-header-title', {
              template: `
              <div>
                <div class="make-header-title">
                  <span class="title">{{ title }}</span>
                </div>
                <div class="right-wrap">
                  <input type="text" placeholder="텍스트 입력" v-model="example" @keyup.enter="toggleExample">
                  <button class="btn-bg-c ani" @click="toggleExample">텍스트 적용하기</button>
                  <button class="btn-bg-w2" @click="reloadPage">새로고침</button>
                </div>
              </div>
            `,
              data() {
                return {
                  title: resData.title,
                  isViewExample: false,
                  example: '00000'
                }
              },
              methods: {
                setExample() {
                  const selectorArr = document.querySelectorAll('textarea.essay-textbox') || []
                  selectorArr.forEach(item => { item.value = this.example })
                },
                removeExample() {
                  const selectorArr = document.querySelectorAll('textarea.essay-textbox') || []
                  selectorArr.forEach(item => { item.value = '' })
                },
                toggleExample() {
                  this.isViewExample = !this.isViewExample
                  this.isViewExample ? this.setExample() : this.removeExample()
                },
                reloadPage() {
                  window.location.reload()
                }
              }
            })
          }
        
          // create component
          Vue.component('quiz-worksheet-vo', {
            template: `
              <div>
                <template
                  v-for="(item, index) of sheetMedias"
                >
                  <div
                    :key="index"
                    :data-page-index="index + 1"
                    class="editor-layer"
                    :class="{
                        ['editor-seq-' + (index + 1)]: true
                      }"
                    style="width:990px;height:1152px;background-size: contain; background-position:center center; background-repeat: no-repeat"
                    :style="getBgImageStyle(item)"
                  >
                    <svg xmls="http://www.w3.org/2000/svg" height="1152" width="990">
                    </svg>
                    <div class="content-layer"></div>
                  </div>
                  
                  <br>
  
                </template>
              </div>
            `,
            data() {
              return {
                sheetMedias: sheetMedias
              }
            },
            methods: {
              getBgImageStyle(item) {
                return `background-image: url('${item.filePath}')`
              }
            }
          })
  
          // init Vue
          if ($("#hideMakeHeader").val() === 'false') {
            new Vue({
              el: '#makeHeaderTitle',
              render(createElement, /*context*/) {
                return createElement('make-header-title')
              }
            })
          }
          
          // init Vue
          new Vue({
            el: '#quizWorksheetVO',
            mounted() {
              getWorksheetToolList(sheetTools)
            },
            render(createElement, /*context*/) {
              return createElement('quiz-worksheet-vo')
            }
          })
          
        })
    } catch (e) {
      console.warn(e)
    }
    
  }
  // -- 초기화
});

/**
 * 워크시트 저작도구 불러오기
 */
function getWorksheetToolList(sheetTools) {
  try {
    objectArr = sheetTools;
    renderingAll(objectArr, 's');
    // getScore(objectArr);
  } catch (e) {
    console.warn('getWorksheetToolList() e => ', e)
  }
}

// ie 호환성을위해 변경
function getParam(name) {
  var curr_url = location.search.substr(location.search.indexOf("?") + 1);
  var svalue = "";
  var temp = "";
  curr_url = curr_url.split("&");
  for (var i = 0; i < curr_url.length; i++) {
    temp = curr_url[i].split("=");
    if ([temp[0]] == name) {
      svalue = temp[1];
    }
  }
  return svalue;
}