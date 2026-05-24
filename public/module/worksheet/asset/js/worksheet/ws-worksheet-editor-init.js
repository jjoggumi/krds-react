/**
 * worksheet ws-worksheet-editor-init.js
 * ver 0.1
 * 2021. 9. 17
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
      
    } catch (e) {
      alert(e.message || errMsg)
      // $("#quizIdx").val(testQuizIdx)
    }
  }
  
  if ($("#quizIdx").val() != "") {

    try {
      $axios({
        method: 'GET',
        url: apiUrl + "/sheets/" + $("#quizIdx").val(),
        headers: { Authorization: 'Bearer ' + $("#idToken").val() }
      })
        .then(res => {
          const resData = res.data
  
          const sheetMedias = resData.sheetMedias.filter(data => data.mediaCd === 'ISIMG')
          const sheetTools = resData.sheetTools
          // const sheetTools = resData.sheetTools.sort((a, b) => {
          //   return a.toolSeq - b.toolSeq
          // })

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

                <div
                  v-if="index + 1 < sheetMedias.length"
                  class="space-row"
                  style="padding-bottom:21px;background-color:#F4F5F9;z-index:99"
                ></div>
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
  
          // create component
          Vue.component('quick-view', {
            template: `
              <div
                v-if="isShowQuickView"
                id="quickView"
                class="no-print"
              >
                <a href="#" class="toggler">이동 <i class="fal fa-angle-up"></i></a>
                <ul>
                  <li
                    v-for="(item, index) of sheetMedias"
                    class="page-navigation"
                    :class="{
                      'active': index === 0
                    }"
                    :data-page-index="index + 1"
                  >
                    <button type="button">{{ index + 1 }}</button>
                  </li>
                </ul>
              </div>
            `,
            data() {
              return {
                sheetMedias: sheetMedias
              }
            },
            computed: {
              sheetMediasLength() {
                return this.sheetMedias.length
              },
              isShowQuickView() {
                return this.sheetMediasLength > 1
              }
            },
            methods: {}
          })
  
          // init quick-view
          new Vue({
            el: '#quickView',
            data() {
              return {}
            },
            computed: {},
            methods: {},
            created() {
            },
            mounted() {
              
              // 페이지 이동 네비게이션 클릭시 페이지 이동
              $("li.page-navigation").click(function () {
                var index = $(this).index();
                var top = $(".editor-layer").eq(index).offset().top - 161;
                $("html, body").animate({scrollTop: top}, 400);
              });
  
              // 페이지 이동 네비게이션 접기 / 펼치기
              $("#quickView .toggler").click(function (e) {
                e.preventDefault();
                $(this).closest("#quickView").find("ul").slideToggle();
                $(this).find("i").toggleClass("fa-rotate-180");
              });
  
              // 페이지 이동 네비게이션 클릭시 페이지 이동
              $("li.page-navigation").click(function () {
                var index = $(this).index();
                var top = $(".editor-layer").eq(index).offset().top - 50;
                $("html, body").animate({scrollTop: top}, 400);
              });
  
              // 페이지 이동 네비게이션 접기 / 펼치기
              $(".page-navigation-toggle-switch").click(function () {
                var self = $(this);
                if (self.find("i").hasClass("fa-chevron-up")) {
                  self.closest("#quickView").find("ul").slideUp();
                  self.find("i").removeClass("fa-chevron-up");
                  self.find("i").addClass("fa-chevron-down");
                } else {
                  self.closest("#quickView").find("ul").slideDown();
                  self.find("i").removeClass("fa-chevron-down");
                  self.find("i").addClass("fa-chevron-up");
                }
              });
              
            },
            destroyed() {
            },
            render(createElement, /*context*/) {
              return createElement('quick-view')
            }
          })
          
          // init Vue
          new Vue({
            el: '#quizWorksheetVO',
            data() {
              return {}
            },
            computed: {},
            methods: {},
            created() {
            },
            mounted() {
              const script = document.createElement('script')
              const script2 = document.createElement('script')
              
              script.src = "../asset/js/worksheet/ws-mouse-draw.js"
              document.body.appendChild(script)
              
              script2.src = "../asset/js/worksheet/ws-keyboard-draw.js"
              document.body.appendChild(script2)
  
              // 최초 이력 삽입
              initHistory(sheetTools)
              
              getWorksheetToolList(sheetTools)
            },
            destroyed() {
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
 * 워크시트 저작도구 최초 이력 초기화
 * @param sheetTools
 */
function initHistory(sheetTools) {
  historyArr = []
  pointerIdx = -1
  objectArr = sheetTools
  historyPush()
}

/**
 * 워크시트 저작도구 불러오기
 */
function getWorksheetToolList(sheetTools) {
  try {
    objectArr = sheetTools;
    
    renderingAll(objectArr);
    makeScore();
    
    $(".selected").removeClass("selected");
    
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

// 부모창 invisible loading control
function toggleParentInvisibleLoading(value) {
  const message = {
    command: 'toggle-invisible-loading',
    value: value
  }
  if (window.parent)
    window.parent.postMessage(message, '*');
}