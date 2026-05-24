/* eslint-disable */
/**
 * worksheet ws-worksheet-editor.js
 * ver 0.1
 * 2020. 12. 16
 */
let prevObjectArr = []
let paramsObjectArr = []

$(document).ready(function () {
  
  // 워크시트 초기화
  if (!$("#idToken").val()) {
    try {
      $("#idToken").val(getParam('idToken'))
    } catch (e) {
      alert(e.message)
    }
  }
  
  // TODO: 20211103 PC 기준 탭,창 새로고침 일 경우에만 이벤트 발생. 지정 메시지 반환 X
  $(window).on("beforeunload", function () {
    if (checkload == true) return "이전 페이지로 이동할 경우 현재 작업중인 내용은 저장되지 않습니다.\n 이동하시겠습니까?";
  });
  
  $("select").selectmenu();
  
  $('.tool [data-toggle="tooltip"]').each(function () {
    $(this).attr('title', $(this).find('.hidden').text());
  });
  
  $('[data-toggle="tooltip"]').tooltip({
    trigger: 'hover'
  });
  
  $('.custom-select').mCustomScrollbar({
    theme: "dark-2"
  });
  
  $('.tool-sub').draggable({
    start: function () {
      $(this).css({transform: "none", top: $(this).offset().top + "px", left: $(this).offset().left + "px"});
    }
  });
  $(".fa-arrows").disableSelection();
  
  $(document).on("mousedown", "div.ui-dialog", function (e) {
    moveFlag = true;
    moveSize = {
      "innerWidth": $(this).outerWidth(),
      "innerHeight": $(this).outerHeight(),
      "positionLeft": e.pageX - $(this).position().left,
      "positionTop": e.pageY - $(this).position().top
    };
  });
  $(document).on("mousemove", "div.ui-dialog", function (e) {
    if (moveFlag) {
      $("div.ui-dialog").css({
        left: e.pageX - moveSize["positionLeft"],
        top: e.pageY - moveSize["positionTop"]
      });
    }
  });
  $(document).on("mouseup", "div.ui-dialog", function (e) {
    moveFlag = false;
  });
  
  $(document).on("mouseleave", "div.ui-dialog", function (e) {
    moveFlag = false;
  });
  
  $(window).scroll(function (e) {
    if ($(window).scrollTop() > 80) {
      $('html').addClass('tool-fixed');
    } else {
      $('html').removeClass('tool-fixed');
    }
  });
  
  // 페이지 이동 네비게이션 클릭시 페이지 이동
  // 20210927 moved to ws-worksheet-editor-init.js mounted lifeCycle
  /*$("li.page-navigation").click(function () {
    var index = $(this).index();
    var top = $(".editor-layer").eq(index).offset().top - 161;
    $("html, body").animate({scrollTop: top}, 400);
  });*/
  
  // 페이지 이동 네비게이션 접기 / 펼치기
  // 20210927 moved to ws-worksheet-editor-init.js mounted lifeCycle
  /*$("#quickView .toggler").click(function (e) {
    e.preventDefault();
    $(this).closest("#quickView").find("ul").slideToggle();
    $(this).find("i").toggleClass("fa-rotate-180");
  });*/
  
  // 윈도우 스크롤시 스크롤에 해당하는 페이지 표시
  $(window).scroll(function () {
    var scrollTop = $(window).scrollTop();
    var page = Math.ceil(scrollTop / 1163);
    if (page == 0) {
      page = 1;
    }
    
    if (!$("li.page-navigation").eq(page - 1).hasClass("active")) {
      $(".page-navigation.active").removeClass("active");
      $("li.page-navigation").eq(page - 1).addClass("active");
    }
  });
  
  // 커스텀 셀렉트 오픈
  $('.tool-select .on').on('click', function (e) {
    e.preventDefault();
    if ($(this).siblings('.custom-select').is(':visible')) {
      $(this).siblings('.custom-select').hide();
      $(this).closest('.tool-select').removeClass('active');
      return false;
    }
    $('.custom-select').hide();
    $(this).siblings('.custom-select').show();
    $('.tool-sub').css("z-index", 9);
    //$("body").removeClass("pointer");
    //$(this).closest('.tool-select').addClass('active');
  });
  
  // 커스텀 셀렉트 아이템 선택
  $('.tool-select li a').on('click', function (e) {
    e.preventDefault();
    if (!$(this).closest('.tool-select').hasClass('no-change')) {
      $(this).closest('.tool-select').find('.on').empty();
      $(this).closest('.tool-select').find('.on').append($(this).html());
    }
    //$(this).closest('.tool-select').removeClass('active');
    $(this).closest('.custom-select').hide();
    $('.tool-sub').css("z-index", 999);
  });
  
  // 바깥 클릭
  $(document).click(function (e) {
    if (!$('.tool-select').has(e.target).length) {
      if ($('.custom-select').is(':visible')) {
        $('.custom-select').hide();
        $('.tool-select').removeClass('active');
        $('.tool-sub').css("z-index", 999);
      }
    }
  });
  
  // 페이지 이동 네비게이션 클릭시 페이지 이동
  // 20210927 moved to ws-worksheet-editor-init.js mounted lifeCycle
  /*$("li.page-navigation").click(function () {
    var index = $(this).index();
    var top = $(".editor-layer").eq(index).offset().top - 50;
    $("html, body").animate({scrollTop: top}, 400);
  });*/
  
  // 페이지 이동 네비게이션 접기 / 펼치기
  // 20210927 moved to ws-worksheet-editor-init.js mounted lifeCycle
  /*$(".page-navigation-toggle-switch").click(function () {
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
  });*/
  
  // 윈도우 스크롤시 스크롤에 해당하는 페이지 표시
  $(window).scroll(function () {
    var scrollTop = $(window).scrollTop();
    var page = Math.ceil(scrollTop / 1163);
    if (page == 0) {
      page = 1;
    }
    
    if (!$("li.page-navigation").eq(page - 1).hasClass("active")) {
      $(".page-navigation.active").removeClass("active");
      $("li.page-navigation").eq(page - 1).addClass("active");
    }
  });
  
  // 컬러픽커 이벤트 발생
  $(".font-colorpicker").spectrum({
    allowEmpty: true,
    showInitial: true,
    showInput: true,
    showButtons: false,
    preferredFormat: "rgb",
    show: function (color) {
      if (selectedObj["fontColor"] == null) selectedObj["fontColor"] = "rgba(0,0,0)";
      $(this).spectrum("set", selectedObj["fontColor"]);
    },
  });
  
  $(".font-colorpicker").on('move.spectrum', function (e, tinycolor) {
    if (tinycolor == null) {
      $("input[name=fontColor]").val("rgba(0,0,0)");
      selectedObj["fontColor"] = "rgba(0,0,0)";
    } else {
      $("input[name=fontColor]").val("rgba(0,0,0)");
      $(this).data("color", tinycolor.toString());
      selectedObj["fontColor"] = tinycolor.toString();
      $("[data-role=btnFontColor] span").css("background-color", tinycolor.toString());
    }
    objChange(selectedObj);
    //$(".font-colorpicker").spectrum("hide");
  }).on('hide.spectrum', function (e, tinycolor) {
    /*
    if(tinycolor == null) {
      $("input[name=fontColor]").val("rgba(255,255,255,0)");
      selectedObj["fontColor"] = "rgba(255,255,255,0)";
    } else {
      $(this).data("color", tinycolor.toString());
          selectedObj["fontColor"] = tinycolor.toString();
          $("input[name=fontColor]").val(tinycolor.toString());
          $("[data-role=btnFontColor] span").css("background-color", tinycolor.toString());
    }
      objChange(selectedObj);
      */
  });
  
  // 컬러픽커 이벤트 발생
  $(".border-colorpicker").spectrum({
    allowEmpty: true,
    showInitial: true,
    showInput: true,
    showButtons: false,
    preferredFormat: "rgb",
    show: function (color) {
      if (selectedObj["borderColor"] == null) selectedObj["borderColor"] = "rgba(255,255,255,0)";
      $(this).spectrum("set", selectedObj["borderColor"]);
    },
  });
  
  $(".border-colorpicker").on('move.spectrum', function (e, tinycolor) {
    if (tinycolor == null) {
      $("input[name=borderColor]").val("rgba(255,255,255,0)");
      selectedObj["borderColor"] = "rgba(255,255,255,0)";
      $("[data-role=borderColor] i").css("border-color", "rgba(255,255,255,0)");
    } else {
      $(this).data("color", tinycolor.toString());
      selectedObj["borderColor"] = tinycolor.toString();
      $("[data-role=btnBorderColor] i").css("border-color", tinycolor.toString());
      $("input[name=borderColor]").val(tinycolor.toString());
    }
    objChange(selectedObj);
    //$(".border-colorpicker").spectrum("hide");
  }).on('hide.spectrum', function (e, tinycolor) {
    /*
    if(tinycolor == null) {
      $("input[name=borderColor]").val("rgba(255,255,255,0)");
      selectedObj["borderColor"] = "rgba(255,255,255,0)";
      $("[data-role=borderColor] i").css("border-color", "rgba(255,255,255,0)");
    } else {
      $(this).data("color", tinycolor.toString());
          selectedObj["borderColor"] = tinycolor.toString();
          $("[data-role=btnBorderColor] i").css("border-color", tinycolor.toString());
          $("input[name=borderColor]").val(tinycolor.toString());
    }
      objChange(selectedObj);
      */
  });
  
  // 컬러픽커 이벤트 발생
  $(".rectfill-colorpicker").spectrum({
    allowEmpty: true,
    showInitial: true,
    showInput: true,
    showButtons: false,
    showAlpha: true,
    preferredFormat: "rgb",
    show: function (color) {
      if (selectedObj["backgroundColor"] == null) selectedObj["backgroundColor"] = "rgba(255,255,255,0)";
      console.log(selectedObj["backgroundColor"]);
      $(this).spectrum("set", selectedObj["backgroundColor"]);
    },
  });
  
  $(".rectfill-colorpicker").on('move.spectrum', function (e, tinycolor) {
    if (tinycolor == null) {
      $("input[name=rectFill]").val("rgba(255,255,255,0)");
      selectedObj["backgroundColor"] = "rgba(255,255,255,0)";
      $("[data-role=btnRectFill] i").css("background-color", "rgba(255,255,255,0)");
    } else {
      $(this).data("color", tinycolor.toString());
      selectedObj["backgroundColor"] = tinycolor.toString();
      $("[data-role=btnRectFill] i").css("background-color", tinycolor.toString());
      $("input[name=rectFill]").val(tinycolor.toString());
    }
    objChange(selectedObj);
    //$(".rectfill-colorpicker").spectrum("hide");
  }).on('hide.spectrum', function (e, tinycolor) {
    /*
    if(tinycolor == null) {
      $("input[name=rectFill]").val("rgba(255,255,255,0)");
      selectedObj["backgroundColor"] = "rgba(255,255,255,0)";
      $("[data-role=btnRectFill] i").css("background-color", "rgba(255,255,255,0)");
    } else {
        $(this).data("color", tinycolor.toString());
        selectedObj["backgroundColor"] = tinycolor.toString();
        $("[data-role=btnRectFill] i").css("background-color", tinycolor.toString());
        $("input[name=rectFill]").val(tinycolor.toString());
    }
    objChange(selectedObj);
    */
  });
  
  // 컬러픽커 이벤트 발생
  $(".line-colorpicker").spectrum({
    allowEmpty: true,
    showInitial: true,
    showInput: true,
    showButtons: false,
    showAlpha: true,
    preferredFormat: "rgb",
    show: function (color) {
      if (selectedObj["lineColor"] == null) selectedObj["lineColor"] = "rgba(255,255,255,0)";
      $(this).spectrum("set", selectedObj["lineColor"]);
    },
  });
  
  $(".line-colorpicker").on('move.spectrum', function (e, tinycolor) {
    if (tinycolor == null) {
      $("input[name=lineColor]").val("rgba(255,255,255,0)");
      selectedObj["lineColor"] = "rgba(255,255,255,0)";
      $("[data-role=lineColor] i").css("border-color", "rgba(255,255,255,0)");
    } else {
      $(this).data("color", tinycolor.toString());
      selectedObj["lineColor"] = tinycolor.toString();
      $("[data-role=btnLineColor] i").css("border-color", tinycolor.toString());
      $("input[name=lineColor]").val(tinycolor.toString());
    }
    objChange(selectedObj);
    //$(".line-colorpicker").spectrum("hide");
  }).on('hide.spectrum', function (e, tinycolor) {
    /*
    if(tinycolor == null) {
      $("input[name=lineColor]").val("rgba(255,255,255,0)");
      selectedObj["lineColor"] = "rgba(255,255,255,0)";
      $("[data-role=lineColor] i").css("border-color", "rgba(255,255,255,0)");
    } else {
      $(this).data("color", tinycolor.toString());
          selectedObj["lineColor"] = tinycolor.toString();
          $("[data-role=btnLineColor] i").css("border-color", tinycolor.toString());
          $("input[name=lineColor]").val(tinycolor.toString());
    }
      objChange(selectedObj);
      */
  });
  
  // 투명도 조절
  $("input[name=opacity]").change(function () {
    selectedObj["opacity"] = $(this).val() / 100;
    $("input[name=opacity]").val($(this).val());
    objChange(selectedObj);
  });
  
  // 툴 박스 클릭시
  $(".tool-button").click(function(e){
    e.preventDefault();
    $(".line-connect").hide();
    var self = $(this);
    var parent = self.closest(".item");
    $("body").removeClass(selectedItem);
    
    if(parent.hasClass("active")){
      selectedItem = "";
      parent.removeClass("active");
    } else {
      selectedItem = self.data("roleId");
      selectedCnt = self.data("itemValue");
      $("body").addClass(selectedItem);
      $(".item.active").removeClass("active");
      parent.addClass("active");
      
      if(selectedItem === "image"){
        $("input[name=tempFile]").trigger("click");
      } else if(selectedItem === "sound"){
        $("input[name=soundFile]").trigger("click");
      } else if(selectedItem === "pointer"){
        $(".tool-sub .option").hide();
        if(typeof selectedObj != "undefined" && selectedObj != null){
          $(".tool-sub").show();
          $(".option-" + selectedObj["toolCd"]).show();
        } else {
          //$(".tool-sub").hide();
        }
      } else if(selectedItem === "linematch"){
        selectedCnt = "2,2,";
        $(".tool-sub .option").hide();
        $(".line-connect").show();
      } else if(selectedItem === "serverimage"){
        $(".tool-sub .option").hide();
        parent.removeClass("active");
        $("#dialog-serverimage").dialog({
          width: '940px',
          modal: true,
          open: function(){
            getServerImageList(null, 1);
          },
          buttons: {
            cancel: {
              click: function() {
                $(this).dialog('close');
              },
              text: "취소",
              class: "btn-38"
            }
          }
        });
      } else if(selectedItem === "youtube"){
        $(".tool-sub .option").hide();
        parent.removeClass("active");
        $("#dialog-youtube").dialog({
          width: '940px',
          modal: true,
          open: function(){
            $("input[name=dlYoutubeText]").val("");
            $("#youtubeAlert").hide();
          },
          buttons: {
            cancel: {
              click: function() {
                $(this).dialog('close');
              },
              text: "취소",
              class: "btn-38"
            }
          }
        });
      } else if(selectedItem === "setting"){
        $("#dialog-setting").dialog({
          width: '480px',
          modal: true,
          open: function(){
            // makeScore();
            
            // 다이얼로그 오픈시 동작
            $("#dialog-setting input[name=dlSettingCheckAll]").prop("checked", false).trigger("change");
            
            let html = ''
            const toolCds = ['essay','radio', 'check', 'esign', 'approvalsign']
            const toolCdTitle = {
              essay: '텍스트',
              radio: '단일선택',
              check: '복수선택',
              esign: '(학부모) 전자서명',
              approvalsign: '(선생님) 결재서명'
            }
            objectArr.forEach(obj => {
              if (toolCds.includes(obj.toolCd)) {
                switch (obj.toolCd) {
                  case 'esign': {
                    html += `
                      <tr>
                        <td>-</td>
                        <td>${toolCdTitle[obj.toolCd]}</td>
                        <td><label class="hdn-txt"><input type="checkbox" checked disabled></label></td>
                      </tr>
                    `
                    break
                  }
                  case 'approvalsign': {
                    html += `
                      <tr>
                        <td>-</td>
                        <td>${toolCdTitle[obj.toolCd]}</td>
                        <td>-</td>
                      </tr>
                    `
                    break
                  }
                  default: {
                    const quesNumber = $("div." + obj.toolCd + "-layer.layer.tool-seq-" + obj.toolSeq + " .ques-number").text()
                    html += `
                      <tr>
                        <td>${quesNumber}</td>
                        <td>${toolCdTitle[obj.toolCd]}</td>
                        <td><label class="hdn-txt"><input type="checkbox" name="settingEssential" value="${obj.toolSeq}" ${obj.essential ?  'checked' : ''}></label></td>
                      </tr>
                    `
                  }
                } // end switch-case
              } // end if
            })
  
            $("#dialog-setting .tbl-list .table-body").html(html)
          },
          close: function () {
            $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
            $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
            btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
          },
          buttons: {
            cancel: {
              click: function() {
                $(this).dialog('close');
                $("[data-role-id=setting]").closest(".item").removeClass("active");
              },
              text: "취소",
              class: "btn-38"
            },
            Ok: {
              click: function() {
                // 다이얼로그 저장시 동작
                
                $("input[name=settingEssential]").each(function(){
                  const toolSeq = parseInt(this.value, 10)
                  const isChecked = this.checked || false
                  
                  $(objectArr).each(function(idx, data){
                    if(data["toolSeq"] === toolSeq){
                      data["essential"] = isChecked
                    }
                  });
                });
                
                $("[data-role-id=setting]").closest(".item").removeClass("active");
                $(this).dialog("close");        // 다이얼로그 닫기
              },
              text: "저장",
              class: "btn-38 spot"
            }
          }
        });
      }
    }
  });
  
  // 앞으로 가기 버튼
  $("a[data-role=btnRedo]").click(function (e) {
    e.preventDefault();
    redo();
  });
  
  // 뒤로가기 버튼
  $("a[data-role=btnUndo]").click(function (e) {
    e.preventDefault();
    undo();
  });
  
  // 양식삭제 버튼
  $("a[data-role=btnDeleteform]").click(function (e) {
    e.preventDefault();
    deleteform();
  });
  
  // 줌 변경 버튼
  $("a[data-role=btnChangeZoom]").click(function (e) {
    e.preventDefault();
    
    const transformValue = prompt("변경할 zoom 배율을 입력해주세요.\n(% 단위 숫자만 입력)", "100");
    console.warn(`transformValue => `, transformValue)
    if (!transformValue) {
      return false
    }
  
    const transformValueInt = parseInt(transformValue, 10)
    if (transformValueInt < 100 || transformValueInt > 300) {
      alert('100 ~ 300 의 값을 입력해주세요.')
      return false
    }
    
    try {
      const heightVh = Math.floor((100 / transformValueInt) * 100) - 1
      const toolPixel = Math.floor(76 * (heightVh / 100))
  
      const message = {
        command: 'set-iframe-transform-value',
        value: transformValueInt / 100,
        height: `calc(${heightVh}vh - ${toolPixel}px)`
      }
      if (window.parent)
        window.parent.postMessage(message, '*');
      
    } catch (e) {
      alert('잘못된 배율입니다.')
      console.warn(e)
      
    }
  });
  
  // 워크시트 완료 버튼
  $("button[data-role=btnSaveWorksheet]").click(function () {
    saveWorksheet();
  });
  
  // 워크시트 임시저장 버튼
  $("button[data-role=btnTempSaveWorksheet]").click(function () {
    tempSaveWorksheet();
  });
  
  // 미리보기 버튼
  $("a[data-role=btnPreview]").click(function (e) {
    e.preventDefault();
    previewSaveWorksheet();
  });
  
  // 유튜브 추가 버튼
  $("button[data-role=btnDlYoutubeSearch]").click(function (e) {
    e.preventDefault();
    
    var text = $("input[name=dlYoutubeText]").val();
    var id;
    if (text.indexOf("watch?v=") > -1) {
      id = text.substr(text.lastIndexOf("=") + 1);
    } else if (text.indexOf("youtu.be") > -1) {
      id = text.substr(text.lastIndexOf('/') + 1);
    } else if (text.indexOf("embed") > -1) {
      id = text.substr(text.lastIndexOf("/") + 1);
    }
    text = "https://www.youtube.com/embed/" + id;
    
    var scrollTop = $(window).scrollTop();
    var selectedPage = Math.ceil(scrollTop / 1163);
    if (selectedPage === 0) {
      selectedPage = 1;
    }
    
    var toolSeq = getNextWsToolSeq();
    var obj = {
      "toolSeq": toolSeq,
      "sheetPage": selectedPage,
      "toolCd": selectedItem,
      "quesNo": text,
      "x": 990 / 2 - 200,
      "y": 80,
      "width": 400,
      "height": 300,
      "fontFamily": null,
      "fontSize": null,
      "fontStyle": null,
      "fontColor": "#000",
      "borderSize": 0,
      "borderColor": "#000",
      "backgroundColor": "transparent",
      "opacity": "1",
      "lineStartType": null,
      "lineEndType": null,
      "lineType": null,
      "lineColor": null,
    };
    
    $(".selected").removeClass("selected");
    objPush(obj);                       // 객체 등록
    objSelect(toolSeq);               // 객체 선택
    
    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
    $("#dialog-youtube").dialog("close");
  });
  
  /**
   * TODO: 이미지 업로드 처리 변경 필요!
   */
  // 이미지 업로드 구현
  $("input[name=tempFile]").change(function (e) {
    var fileSize = $("input[name=tempFile]")[0].files[0].size;
    if (fileSize > 5000000) {
      alert("5MB 이하 이미지 파일만 등록할 수있습니다.");
      $("input[name=tempFile]").val("");
      return;
    }
    
    if ($(".image-layer").length == 25) {
      alert("이미지는 25개까지만 등록할 수있습니다.");
      $("input[name=tempFile]").val("");
      return;
    }
    
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["gif", "jpg", "jpeg", "png", "bmp"]) === -1) {
      alert("이미지 파일만 업로드 해주세요.");
      $("input[name=tempFile]").val("");
      return;
    }
    
    if (!$(this)[0].files[0]) return;
    
    var form = new FormData();
    form.append("file", $(this)[0].files[0]);
    
    var file = this.files[0];
    var url = window.URL || window.webkitURL;
    var img = new Image();
    
    img.src = url.createObjectURL(file);
    img.onload = function () {
      // $.ajax({
      //   url: '/user/content/make/worksheetUploadImage.json',
      //   type: 'POST',
      //   dataType: 'json',
      //   async: false, cache: false, contentType: false, processData: false,
      //   data: form,
      //   success: function (result) {
      //
      //     var scrollTop = $(window).scrollTop();
      //     var selectedPage = Math.ceil(scrollTop / 1163);
      //     if (selectedPage === 0) {
      //       selectedPage = 1;
      //     }
      //
      //     console.log($(window).scrollTop() + 400);
      //
      //     var toolSeq = getNextWsToolSeq();
      //     var obj = {
      //       "toolSeq": toolSeq,
      //       "sheetPage": selectedPage,
      //       "toolCd": selectedItem,
      //       "quesNo": result.resultMap.src,
      //       "x": 990 / 2 - 225,
      //       "y": (scrollTop % 1163) + 200,
      //       //"width": img.width, 		// 이미지 원본 사이즈
      //       //"height": img.height,		// 이미지 원본 사이즈
      //       "width": 450,
      //       "height": 450,
      //       "fontFamily": null,
      //       "fontSize": null,
      //       "fontStyle": null,
      //       "fontColor": "#000",
      //       "borderSize": 0,
      //       "borderColor": "#000",
      //       "backgroundColor": "transparent",
      //       "opacity": "1",
      //       "lineStartType": null,
      //       "lineEndType": null,
      //       "lineType": null,
      //       "lineColor": null,
      //     };
      //
      //     $(".selected").removeClass("selected");
      //     objPush(obj);                       // 객체 등록
      //     objSelect(toolSeq);               // 객체 선택
      //
      //     $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
      //     $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
      //     btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
      //
      //     $("input[name=tempFile]").val("");
      //   },
      //   error: function (e) {
      //     alert("이미지 업로드가 실패하였습니다.");
      //   },
      //   beforeSend: function (e) {
      //     var msgHtml = '<div class="alert"><div class="msg">파일 업로드 중</br><small> 이미지크기에 따라 시간이 소요될 수 있습니다.</small><div class="alertLoading" style="height: 50px"></div></div></div>';
      //     $(msgHtml).appendTo('body');
      //   },
      //   complete: function (e) {
      //     $(".alert").fadeOut(2000).queue(function () {
      //       $(this).remove();
      //     });
      //   }
      // });
    }
  });
  
  // 사운드 업로드 구현
  $("input[name=soundFile]").change(function (e) {
    var fileSize = $("input[name=soundFile]")[0].files[0].size;
    if (fileSize > 11000000) {
      alert("10MB 이하 사운드 파일만 등록할 수있습니다.");
      $("input[name=soundFile]").val("");
      return;
    }
    
    if ($(".sound-layer").length == 25) {
      alert("사운드는 25개까지만 등록할 수있습니다.");
      $("input[name=soundFile]").val("");
      return;
    }
    
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["mp3", "wma"]) === -1) {
      alert("MP3 파일만 업로드 해주세요.");
      $("input[name=soundFile]").val("");
      return;
    }
    
    if (!$(this)[0].files[0]) return;
    
    var form = new FormData();
    form.append("file", $(this)[0].files[0]);
    
    // $.ajax({
    //   url: '/user/content/make/worksheetUploadImage.json',
    //   type: 'POST',
    //   dataType: 'json',
    //   async: false, cache: false, contentType: false, processData: false,
    //   data: form,
    //   headers: {
    //     Authorization: 'Bearer ' + $("#idToken").val()
    //   },
    //   success: function (result) {
    //
    //     var scrollTop = $(window).scrollTop();
    //     var selectedPage = Math.ceil(scrollTop / 1163);
    //     if (selectedPage === 0) {
    //       selectedPage = 1;
    //     }
    //
    //     var toolSeq = getNextWsToolSeq();
    //     var obj = {
    //       "toolSeq": toolSeq,
    //       "sheetPage": selectedPage,
    //       "toolCd": selectedItem,
    //       "quesNo": result.resultMap.src,
    //       "x": 990 / 2 - 150,
    //       "y": 80,
    //       "width": 300,
    //       "height": 40,
    //       "fontFamily": null,
    //       "fontSize": null,
    //       "fontStyle": null,
    //       "fontColor": "#000",
    //       "borderSize": 0,
    //       "borderColor": "#000",
    //       "backgroundColor": "transparent",
    //       "opacity": "1",
    //       "lineStartType": null,
    //       "lineEndType": null,
    //       "lineType": null,
    //       "lineColor": null,
    //     };
    //
    //     $(".selected").removeClass("selected");
    //     objPush(obj);                       // 객체 등록
    //     objSelect(toolSeq);               // 객체 선택
    //
    //     $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
    //     $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
    //     btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
    //
    //     $("input[name=soundFile]").val("");
    //   },
    //   error: function (e) {
    //     alert("사운드 업로드가 실패하였습니다.");
    //   },
    //   beforeSend: function (e) {
    //     var msgHtml = '<div class="alert"><div class="msg">파일 업로드 중</br><small> 사운드 크기에 따라 시간이 소요될 수 있습니다.</small><div class="alertLoading" style="height: 50px"></div></div></div>';
    //     $(msgHtml).appendTo('body');
    //   },
    //   complete: function (e) {
    //     $(".alert").fadeOut(2000).queue(function () {
    //       $(this).remove();
    //     });
    //   }
    // });
  });
  
  // 서버 이미지 텍스트 검색
  $("button[data-role=btnDlSearch]").click(function () {
    var searchText = $("input[name=dlSearchText]").val().trim();
    $("input[name=searchText]").val(searchText);
    getServerImageList(searchText, "1");
  });
  
  // 서버 이미지 Prev
  $("a[data-role=btnDlImagePrev]").click(function () {
    var searchText = $("input[name=searchText]").val().trim();
    var curpage = $("input[name=dlCurPage]").val();
    var lastpage = $("input[name=dlLastPage]").val();
    
    if (curpage == 1) {
      alert("첫 페이지 입니다.");
      return;
    }
    
    getServerImageList(searchText, parseInt(curpage) - 1);
  });
  
  // 서버 이미지 Next
  $("a[data-role=btnDlImageNext]").click(function () {
    var searchText = $("input[name=searchText]").val().trim();
    var curpage = $("input[name=dlCurPage]").val();
    var lastpage = $("input[name=dlLastPage]").val();
    
    if (lastpage == curpage) {
      alert("마지막 페이지 입니다.");
      return;
    }
    
    getServerImageList(searchText, parseInt(curpage) + 1);
  });
  
  // 서버 이미지 붙여넣기
  $(document).on("click", "a[data-role=btnDlImageSelect]", function (e) {
    e.preventDefault();
    var scrollTop = $(window).scrollTop();
    var selectedPage = Math.ceil(scrollTop / 1163);
    if (selectedPage === 0) {
      selectedPage = 1;
    }
    
    var src = $(this).data("src");
    var img = new Image();
    img.src = src;
    img.onload = function () {
      var toolSeq = getNextWsToolSeq();
      var obj = {
        "toolSeq": toolSeq,
        "sheetPage": selectedPage,
        "toolCd": selectedItem,
        "quesNo": src,
        "x": 990 / 2 - img.width,
        "y": 80,
        "width": img.width, 		// 이미지 원본 사이즈
        "height": img.height,		// 이미지 원본 사이즈
        "fontFamily": null,
        "fontSize": null,
        "fontStyle": null,
        "fontColor": "#000",
        "borderSize": 0,
        "borderColor": "#000",
        "backgroundColor": "transparent",
        "opacity": "1",
        "lineStartType": null,
        "lineEndType": null,
        "lineType": null,
        "lineColor": null,
      };
      
      $(".selected").removeClass("selected");
      objPush(obj);                       // 객체 등록
      objSelect(toolSeq);               // 객체 선택
      
      $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
      $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
      btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
      $("#dialog-serverimage").dialog("close");
    };
  });
  
  // 워크시트 단축키
  $(document).on("keyup", function (e) {
    if (e.which == 17) isCtrl = false;
    if (e.which == 18) isAlt = false;
    downKey = "";
  });
  
  $(document).on("keydown", function (e) {
    downKey = e.keyCode;
    if (e.which == 17) isCtrl = true;
    if (e.which == 18) isAlt = true;
    
    var focusedType = Object.prototype.toString.call(document.activeElement);
    
    // 포커싱된 HTML 타입 체크
    if ((focusedType == "[object HTMLInputElement]") || (focusedType == "[object HTMLTextAreaElement]") || (focusedType == "undefined")) {
      return;
    }
    
    if (isCtrl) {
      e.preventDefault();
    }
    
    if (isAlt) {
      e.preventDefault();
    }
    
    if (isAlt && e.which == 49) {
      // ALT + 1
      // $("a[data-role-id=textbox]").trigger("click");
      $("a[data-role-id=essay]").trigger("click");
    } else if (isAlt && e.which == 50) {
      // ALT + 2
      $("a[data-role-id=radio]:eq(0)").closest(".custom-select").prev().trigger("click");
    } else if (isAlt && e.which == 51) {
      // ALT + 3
      $("a[data-role-id=check]:eq(0)").closest(".custom-select").prev().trigger("click");
    } else if (isAlt && e.which == 52) {
      // ALT + 4
      $("a[data-role-id=esign]").trigger("click");
    } else if (isAlt && e.which == 53) {
      // ALT + 5
      $("a[data-role-id=approvalsign]").trigger("click");
      // $("a[data-role-id=select]").trigger("click");
    } else if (isAlt && e.which == 54) {
      // ALT + 6
      // $("a[data-role-id=linematch]").trigger("click");
    } else if (isAlt && e.which == 55) {
      // ALT + 7
      // $("a[data-role-id=toggle]:eq(0)").closest(".custom-select").prev().trigger("click");
    } else if (isAlt && e.which == 56) {
      // ALT + 8
      // $("a[data-role-id=fx]:eq(0)").closest(".custom-select").prev().trigger("click");
    } else if (isCtrl && e.which == 86) {
      // CTRL + V
      if (typeof selectedObj != "undefined" && selectedObj != null && selectedObj != "") {
        $("div[data-role=btnElementCopy] a").trigger("click");
      }
    } else if (isCtrl && e.which == 90) {
      // CTRL + Z
      $("a[data-role=btnUndo]").trigger("click");
    } else if (isCtrl && e.which == 89) {
      // CTRL + Y
      $("a[data-role=btnRedo]").trigger("click");
    } else if (e.which == 46) {
      // DEL
      if (typeof selectedObj != "undefined" && selectedObj != null && selectedObj != "") {
        $("div[data-role=btnElementDelete] a").trigger("click");
      }
    }
  });
  
  // 홈으로
  $("button[data-role=btnClose]").click(function () {
    goQuizHome();
  });
});

function toggleSaving(flag) {
  if (flag) {
    var msgHtml = '<div class="alert"><div class="msg">저장 중...</div></div>';
    $(msgHtml).appendTo('body');
    toggleParentInvisibleLoading(flag)
  } else {
    $("div.alert").remove()
    toggleParentInvisibleLoading(false)
  }
}

// 워크시트 저장
function saveWorksheet() {
  if (!isSaving) {
    isSaving = true
    toggleSaving(isSaving)
  
    checkload = false;
    saveWorksheetAjax("Y");
  }
}

// 워크시트 임시 저장
function tempSaveWorksheet() {
  if (!isSaving) {
    isSaving = true
    toggleSaving(isSaving)
  
    saveWorksheetAjax("N");
  }
}

// 워크시트 미리 보기
function previewSaveWorksheet() {
  if (!isSaving) {
    isSaving = true
    toggleSaving(isSaving)
  
    saveWorksheetAjax("A");
  }
}

// 워크시트 저장 Ajax
function saveWorksheetAjax(completeYn) {
  
  // 정답 및 배점 설정 유효성검사
  var flag = true;
  $(objectArr).each(function (idx, data) {
    if (isQuestion(data)) {
      if (data["allot"] == null || typeof data["allot"] == "undefined") {
        flag = false;
      }
      
      // if (data["answerList"] == null || data["answerList"].length == 0) {
      //   flag = false;
      // }
    }
    
    // TEXT 포커싱 인 상태일 경우 데이터 저장
    if (data["toolCd"] == "text") {
      data["txt"] = $(".tool-seq-" + data["toolSeq"] + " textarea").val();
    }
  });
  
  /*if (!flag) {
    // alert("정답 혹은 배점 설정을 하지 않아 저장할 수 없습니다.\n빨간색 배경 처리 된 문항 번호를 확인해주세요.");
    alert("저장 실패")
    return;
  }*/
  
  if (!localStorage.idToken || localStorage.idToken !== $('#idToken').val()) {
    isSaving = false
    toggleSaving(isSaving)
    
    const message = {
      command: 'alert',
      msgData: {
        message: '로그인 정보가 변경되었습니다.<br>인덱스 페이지로 이동합니다.',
        icon: 'warning'
      },
      additionalProcess: 'goto|home'
    }
    window.parent.postMessage(message, '*')
    return false
  }
  
  if (completeYn === 'Y') {}
  
  const sheetId = $("input[id=quizIdx]").val()
  
  $axios({
    url: `${apiUrl}/sheets/${sheetId}`,
    method: 'GET',
    headers: { Authorization: 'Bearer ' + $("#idToken").val() }
  })
    .then(res => {
      const data = res.data
      let sheetStatus
  
      if (data.sheetStatus === 'TEMP') {
        switch (completeYn) {
          case 'Y':
            sheetStatus = 'NOT_USED'
            break
          case 'N':
            sheetStatus = 'TEMP'
            break
        }
      }
  
      /**
       * 20211026 저장 전 양식 데이터 및 요소 수정 정보 백업
       */
      prevObjectArr = JSON.parse(JSON.stringify(objectArr))
      paramsObjectArr = JSON.parse(JSON.stringify(objectArr))
  
      paramsObjectArr.forEach(o => {
    
        o.x = Math.floor(o.x)
        o.y = Math.floor(o.y)
    
        if (o.exampleList) {
          o.exampleList.forEach(e => {
            e.x = Math.floor(e.x)
            e.y = Math.floor(e.y)
          })
        }
        if (o.answerList) {
          o.answerList.forEach(a => {
            a.x = Math.floor(a.x)
            a.y = Math.floor(a.y)
          })
        }
      })
      
      data.sheetStatus = sheetStatus ? sheetStatus : data.sheetStatus
      data.sheetTools = paramsObjectArr
      return data
    })
    .then(data => {
  
      $axios({
        url: apiUrl + '/sheets/' + sheetId,
        method: 'PATCH',
        data: data,
        headers: {
          Authorization: 'Bearer ' + $("#idToken").val()
        },
      })
        .then(res => {
          const result = res.data

          // 임시저장
          if (completeYn === 'N') {
            var msgHtml = '<div class="alert"><div class="msg">콘텐츠 임시 저장 완료</div></div>';
            $(msgHtml).appendTo('body').fadeOut(2000).delay(2000).queue(function () {
              $(this).remove();
            });
        
            // 미리보기
          } else if (completeYn === 'A') {
            const sheetId = $("input[id=quizIdx]").val()
            const parentId = data.parentId
            window.open(
              `/worksheets/${parentId}/${sheetId}/preview`,
              'worksheetPreview',
              `height=${screen.availHeight},width=${screen.availWidth},top=0,left=0,resizable,scrollbars=1`
            )
            // 저장
          } else {
            const message = {
              command: 'alert',
              msgData: {
                message: '저장되었습니다.',
                icon: 'success'
              },
              additionalProcess: 'goto|clazzesFormSheetList'
            }
            window.parent.postMessage(message, '*')
            return false
          }
      
          // console.log('1. objectArr.length, prevObjectArr.length, result.sheetTools.length => ',
          //   objectArr.length, prevObjectArr.length, result.sheetTools.length,
          //   objectArr, prevObjectArr, result.sheetTools,
          // )

          // const newSheetTools = [...result.sheetTools].sort((a, b) => {
          //   return a.toolSeq - b.toolSeq
          // })

          // 워크시트 저작도구 불러오기
          // getWorksheetToolList(newSheetTools)
          getWorksheetToolList(result.sheetTools)
      
          setTimeout(() => {
            console.warn('2. objectArr.length, prevObjectArr.length, result.sheetTools.length => ',
              objectArr.length, prevObjectArr.length, result.sheetTools.length
            )
        
            try {
              const beforeSaveObjectArr = prevObjectArr
              const afterSaveObjectArr = result.sheetTools
              let beforeSaveExampleListLength = 0
              let afterSaveExampleListLength = 0
          
              let isChangedLength = beforeSaveObjectArr.length !== afterSaveObjectArr.length
          
              for (const beforeSaveObject of beforeSaveObjectArr) {
                if (beforeSaveObject.exampleList)
                  beforeSaveExampleListLength += beforeSaveObject.exampleList.length
              }
              for (const afterSaveObject of afterSaveObjectArr) {
                if (afterSaveObject.exampleList)
                  afterSaveExampleListLength += afterSaveObject.exampleList.length
              }
          
              console.log('beforeSaveExampleListLength, afterSaveExampleListLength: ', beforeSaveExampleListLength, afterSaveExampleListLength)
          
              if (beforeSaveExampleListLength !== afterSaveExampleListLength)
                isChangedLength = true
          
              if (isChangedLength) {
                const msgData = {
                  message: '작성중인 내용이 반영되지 않았습니다.<br>다시 한번 확인해주세요.',
                  icon: 'warning'
                }
                const message = {
                  command: 'alert',
                  msgData: msgData
                }
                window.parent.postMessage(message, '*')
              }
          
              isSaving = false
              toggleSaving(isSaving)
          
            } catch (e) {
              console.warn(e)
              isSaving = false
              toggleSaving(isSaving)
            }
          }, 500)
      
        })
        .catch(err => {
          console.warn('error => ', err)
          alert(err.message)
      
          /**
           * 20211026 저장 전 백업한 양식 데이터 및 요소 롤백 후 새로 고침
           */
          // 워크시트 저작도구 불러오기
          objectArr = JSON.parse(JSON.stringify(prevObjectArr))
          getWorksheetToolList(objectArr)
      
          isSaving = false
          toggleSaving(isSaving)
        })
      
    })
    .catch(err => {
      console.warn('err => ', err)
      isSaving = false
      toggleSaving(isSaving)
    })

}

function goQuizHome() {
  var isWriting = false
  var isCancel = false
  
  if (curSheetStatus && curSheetStatus === 'TEMP' || historyArr.length > 1) {
    isWriting = true
  }
  
  if (isWriting) {
    const message = {
      command: 'confirm',
      msgData: {
        message: `작성 중인 내용이 있습니다.<br>저장하지 않고 돌아가시겠습니까?`,
        // icon: 'warning'
      },
      additionalProcess: 'goto|back'
    }
    window.parent.postMessage(message, '*')
    return false
    
  } else {
    isCancel = true;
  }
  
  if (isCancel) {
    window.parent.postMessage('goto|back', '*')
  }
  
}

function getSheets(sheetId) {
  return $axios({
      method: "GET",
      url: apiUrl + '/sheets/' + sheetId,
      headers: {
        Authorization: 'Bearer ' + $("#idToken").val()
      }
    })
      .then(res => res.data)
      .catch(err => {
        console.warn(err)
      })
}