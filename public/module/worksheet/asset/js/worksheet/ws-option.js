/* eslint-disable */
/**
 * 옵션버튼 & 자동조절 js
 */
$(document).ready(function(){

    // 설명 요소 > 텍스트 박스 높이 조절
    $(document).on("keyup", ".text-layer textarea", function () {
        var target = $(this).closest(".layer")

        if(!target.hasClass("selected")){
            var itemType = target.data("itemType");
            $(".tool-sub .option").hide();
            $(".option-" + itemType).show();
            $(".selected").removeClass("selected");
            target.addClass("selected");

            targetElement = target;
            var toolSeq = targetElement.data("toolSeq");
            objSelect(toolSeq);
        }

        var self = $(this);
        if(target.height() > self.prop('scrollHeight')) return;
        self.height(self.prop('scrollHeight'));
        self.closest("div.text-layer").height(self.height());
        selectedObj["height"] = self.height();
        selectedObj["txt"] = self.val();
    });

    // 글꼴 변경 버튼
    $("a[data-role=btnFontFamily]").click(function(e){
        e.preventDefault();
        selectedObj["fontFamily"] = $(this).data("value");
        $("input[name=fontFamily]").val($(this).data("value"));
        objChange(selectedObj);
    });

    // 글자 크기 변경 버튼
    $("a[data-role=btnFontSize]").click(function(e){
        e.preventDefault();
        selectedObj["fontSize"] = $(this).data("value");
        $("input[name=fontSize]").val($(this).data("value"));
        objChange(selectedObj);
    });

    // 글자 굵기 변경 버튼
    $("div[data-role=btnFontWeight] a").click(function(e){
        e.preventDefault();
        var self = $(this);
        var fontStyle = selectedObj["fontStyle"];
        if(self.hasClass("active")){
            self.removeClass("active");
            selectedObj["fontStyle"] = "0" + fontStyle.substring(1, 3);
            $("input[name=fontStyle]").val("0" + fontStyle.substring(1, 3));
        } else {
            self.addClass("active");
            selectedObj["fontStyle"] = "1" + fontStyle.substring(1, 3);
            $("input[name=fontStyle]").val("1" + fontStyle.substring(1, 3));
        }
        objChange(selectedObj);
    });

    // 글자 이탤릭 변경 버튼
    $("div[data-role=btnFontItalic] a").click(function(e){
        e.preventDefault();
        var self = $(this);
        var fontStyle = selectedObj["fontStyle"];
        if(self.hasClass("active")){
            self.removeClass("active");
            selectedObj["fontStyle"] = fontStyle.substring(0, 1) + "0" + fontStyle.substring(2, 3);
            $("input[name=fontStyle]").val(fontStyle.substring(0, 1) + "0" + fontStyle.substring(2, 3));
        } else {
            self.addClass("active");
            selectedObj["fontStyle"] = fontStyle.substring(0, 1) + "1" + fontStyle.substring(2, 3);
            $("input[name=fontStyle]").val(fontStyle.substring(0, 1) + "1" + fontStyle.substring(2, 3));
        }
        objChange(selectedObj);
    });

    // 글자 밑즐 변경 버튼
    $("div[data-role=btnFontUnderline] a").click(function(e){
        e.preventDefault();
        var self = $(this);
        var fontStyle = selectedObj["fontStyle"];
        if(self.hasClass("active")){
            self.removeClass("active");
            selectedObj["fontStyle"] = fontStyle.substring(0, 2) + "0";
            $("input[name=fontStyle]").val(fontStyle.substring(0, 2) + "0");
        } else {
            self.addClass("active");
            selectedObj["fontStyle"] = fontStyle.substring(0, 2) + "1";
            $("input[name=fontStyle]").val(fontStyle.substring(0, 2) + "1");
        }
        objChange(selectedObj);
    });

    // 선시작 스타일 버튼
    $("a[data-role=btnArrowStart]").click(function(e){
        e.preventDefault();
        var val = $(this).data("value");
        $("input[name=arrowStart]").val(val);
        selectedObj["lineStartType"] = val;
        objChange(selectedObj);
    });

    // 선 끝 스타일 버튼
    $("a[data-role=btnArrowEnd]").click(function(e){
        e.preventDefault();
        var val = $(this).data("value");
        $("input[name=arrowEnd]").val(val);
        selectedObj["lineEndType"] = val;
        objChange(selectedObj);
    });

    // 선 굵기 변경 버튼
    $("a[data-role=btnLineWeight]").click(function(e){
        e.preventDefault();
        var val = $(this).data("value");
        $("input[name=lineWeight]").val(val);
        selectedObj["borderSize"] = val;
        objChange(selectedObj);
    });

    // 선 종류 변경 버튼
    $("a[data-role=btnLineType]").click(function(e){
        e.preventDefault();
        var val = $(this).data("value");
        $("input[name=lineType]").val(val);
        selectedObj["lineType"] = val;
        objChange(selectedObj);
    });

    // 테두리 굵기 변경
    $("a[data-role=btnBorderWeight]").click(function(e){
        e.preventDefault();
        $("input[name=borderSize]").val($(this).data("value"));
        selectedObj["borderSize"] = $(this).data("value");
        objChange(selectedObj);
    });

    // 설정버튼
    $("div[data-role=btnElementSetting] a").click(function(e){
        e.preventDefault();
        settingPopup();
    });

    // 복사 버튼
    $("div[data-role=btnElementCopy] a").click(function(e){
    	e.preventDefault();
    	
    	var toolCd = selectedObj["toolCd"];
    	if(toolCd == "image"){
    		if($(".image-layer").length == 25){
        		alert("이미지는 25개까지만 등록할 수있습니다.");
        		$("input[name=tempFile]").val("");
        		return;
        	}
    	}
    	
    	if(toolCd == "sound"){
    		if($(".sound-layer").length == 25){
        		alert("사운드는 25개까지만 등록할 수있습니다.");
        		$("input[name=soundFile]").val("");
        		return;
        	}
    	}
        // 도구가 위치한 페이지 번호를 가져옴
        var selectedItem = $(".selected")
        var selectedPage = selectedItem.closest('div.editor-layer').data('pageIndex')
        selectedItem.removeClass("selected");
      
        var object = cloneObject(selectedObj);
        var toolSeq = getNextWsToolSeq();
        object["toolSeq"] = toolSeq;
        
        if(object["toolCd"] == "line"){
        	object["height"]++;
        	object["height"]++;
        	object["height"]++;
        	object["height"]++;
        	object["height"]++;
        	object["y"]++;
	        object["y"]++;
	        object["y"]++;
	        object["y"]++;
	        object["y"]++;
        } else {
	        object["x"]++;
	        object["x"]++;
	        object["x"]++;
	        object["x"]++;
	        object["x"]++;
	        object["y"]++;
	        object["y"]++;
	        object["y"]++;
	        object["y"]++;
	        object["y"]++;
        }
    
        // 캔버스가 위치한 스크롤 값으로 페이지를 정하므로 정확한 페이지를 찾을 수 없음
        // var scrollTop = $(window).scrollTop();
        // var selectedPage = Math.ceil(scrollTop / 1163);
        
        if(!selectedPage || selectedPage === 0){
        	selectedPage = 1;
        }
        
        object["sheetPage"] = selectedPage;
        if(Array.isArray(object["answerList"])){
        	for(var i=0; i<object["answerList"].length; i++){
        		object["answerList"][i]["toolSeq"] = toolSeq;
        		object["answerList"][i]["sheetPage"] = selectedPage;
        	}
        }
        
        if(Array.isArray(object["exampleList"])){
        	for(var i=0; i<object["exampleList"].length; i++){
        		object["exampleList"][i]["toolSeq"] = toolSeq;
        		object["exampleList"][i]["sheetPage"] = selectedPage;
        	}
        }
        
        const deleteKeys = ['sheetId', 'insertedTimestamp', 'updatedTimestamp']
        deleteObjKeys(object, deleteKeys)
        objPush(object);
        objSelect(object["toolSeq"]);
        makeScore();
    });

    // 삭제 버튼
    $("div[data-role=btnElementDelete] a").click(function(e){
        e.preventDefault();
        objPop(selectedObj);
        $(".linematch-" + selectedObj["toolSeq"]).remove();
        $(".selected").remove();
        autoNumbering();
        makeScore();
        $(".tool-sub .option").hide();
        selectedObj = "";
    });
    
    $("[data-role=btnTextboxConfirm]").click(function(e){
        if($(".answer-list li").length == 5){
            var msgHtml = '<div class="alert"><div class="msg">정답은 5개까지만 등록 가능합니다.</div></div>';
            $(msgHtml).appendTo('body').fadeOut(1500).delay(1500).queue(function() { $(this).remove(); });
            return;
        }
        var value = $(".answer-inputbox").val().trim();
        if(value == ""){
            var msgHtml = '<div class="alert"><div class="msg">빈 값은 입력하실수 없습니다.</div></div>';
            $(msgHtml).appendTo('body').fadeOut(1500).delay(1500).queue(function() { $(this).remove(); });
            return;
        }
        
        if(value.length > 30){
        	var msgHtml = '<div class="alert"><div class="msg">30자 이상은 입력하실수 없습니다.</div></div>';
            $(msgHtml).appendTo('body').fadeOut(1500).delay(1500).queue(function() { $(this).remove(); });
            return;
        }

        var flag = true;
        $(".answer-list li").each(function(){
            if(value == $(this).find("input").val()){
                var msgHtml = '<div class="alert"><div class="msg">동일한 정답은 입력하실 수 없습니다.</div></div>';
                $(msgHtml).appendTo('body').fadeOut(1500).delay(1500).queue(function() { $(this).remove(); });
                flag = false;
            }
        });

        if(!flag){
            return;
        }

        var html = '<li><input type="hidden" value="' + value + '" /><span>' + value + '</span><button type="button" data-role="btnRemoveItem"><i class="fal fa-times-circle"></i></button></li>';
        $(".answer-list").append(html);
        $(".answer-inputbox").val("");
    });

    // 단답형 옵션 정답 처리 (엔터키 입력)
    $(".answer-inputbox").keyup(function(e){
    	var value = $(this).val();
    	if(value.length > 30){
        	var msgHtml = '<div class="alert"><div class="msg">30자 이상은 입력하실수 없습니다.</div></div>';
            $(msgHtml).appendTo('body').fadeOut(1500).delay(1500).queue(function() { $(this).remove(); });
            return;
        }

        if(downKey == 13){
            if($(".answer-list li").length == 5){
                var msgHtml = '<div class="alert"><div class="msg">정답은 5개까지만 등록 가능합니다.</div></div>';
                $(msgHtml).appendTo('body').fadeOut(1500).delay(1500).queue(function() { $(this).remove(); });
                return;
            }
            var value = $(this).val().trim();
            if(value == ""){
                var msgHtml = '<div class="alert"><div class="msg">빈 값은 입력하실수 없습니다.</div></div>';
                $(msgHtml).appendTo('body').fadeOut(1500).delay(1500).queue(function() { $(this).remove(); });
                return;
            }
            
            var flag = true;
            $(".answer-list li").each(function(){
                if(value == $(this).find("input").val()){
                    var msgHtml = '<div class="alert"><div class="msg">동일한 정답은 입력하실 수 없습니다.</div></div>';
                    $(msgHtml).appendTo('body').fadeOut(1500).delay(1500).queue(function() { $(this).remove(); });
                    flag = false;
                }
            });

            if(!flag){
                return;
            }

            var html = '<li><input type="hidden" value="' + value + '" /><span>' + value + '</span><button type="button" data-role="btnRemoveItem"><i class="fal fa-times-circle"></i></button></li>';
            $(".answer-list").append(html);
            $(this).val("");
        }
    });

    // 단답형 옵션 정답 처리 (포커스 아웃)
    /*
    $(".answer-inputbox").focusout(function(e){
        var value = $(this).val().trim();
        if(value != "") {
            if ($(".answer-list li").length == 5) {
                var msgHtml = '<div class="alert"><div class="msg">정답은 5개까지만 등록 가능합니다.</div></div>';
                $(msgHtml).appendTo('body').fadeOut(1500).delay(1500).queue(function () {
                    $(this).remove();
                });
                $(this).val("");
                return;
            }
            
            if(value.length > 30){
            	var msgHtml = '<div class="alert"><div class="msg">30자 이상은 입력하실수 없습니다.</div></div>';
                $(msgHtml).appendTo('body').fadeOut(1500).delay(1500).queue(function() { $(this).remove(); });
                return;
            }

            var flag = true;
            $(".answer-list li").each(function () {
                if (value == $(this).find("input").val()) {
                    var msgHtml = '<div class="alert"><div class="msg">동일한 정답은 입력하실 수 없습니다.</div></div>';
                    $(this).val("");
                    $(msgHtml).appendTo('body').fadeOut(1500).delay(1500).queue(function () {
                        $(this).remove();
                    });
                    flag = false;
                }
            });

            if (!flag) {
                return;
            }

            var html = '<li><input type="hidden" value="' + value + '" /><span>' + value + '</span><button type="button" data-role="btnRemoveItem"><i class="fal fa-times-circle"></i></button></li>';
            $(".answer-list").append(html);
            $(this).val("");
        }
    });
    */

    // 단답형 옵션 정답 항목 제거
    $(document).on("click", "button[data-role=btnRemoveItem]", function(){
        $(this).closest("li").remove();
    });
    
    // 라디오 박스, 체크 박스 클릭 이벤트 중단 처리
    $(document).on("click", ".radio-layer input[type=radio], .editor-layer input[type=checkbox]", function(e) {
        e.preventDefault()
    });

    // 라디오 박스 변경 이벤트 (단일선택, 토글)
    $(document).on("change", ".radio-layer input[type=radio], .toggle-layer input[type=radio]", function(){
        var target = $(this).closest(".layer");
        targetElement = target;
        var itemType = target.data("itemType");
        $(".tool-sub .option").hide();
        $(".option-" + itemType).show();
        $(".selected").removeClass("selected");
        target.addClass("selected");
        var toolSeq = targetElement.data("toolSeq");
        objSelect(toolSeq);
        var o = {
            "toolSeq": toolSeq,
            "sheetPage": selectedObj["sheetPage"],
            "answerSeq": 1,
            "answer": $(this).val()
        }
        
        
        selectedObj["answerList"] = [];
        selectedObj["answerList"].push(o);
        
        if(selectedObj["answerList"].length == 0){
        	// target.find(".ques-number").css({"background-color": "crimson", "color": "#FFF"});
        } else {
        	target.find(".ques-number").css({"background-color": "transparent", "color": "#000"});
        }
    });

    // 체크 박스 변경 이벤트
    $(document).on("change", ".editor-layer input[type=checkbox]", function(){
        var target = $(this).closest(".layer");
        targetElement = target;
        var itemType = target.data("itemType");
        $(".tool-sub .option").hide();
        $(".option-" + itemType).show();
        $(".selected").removeClass("selected");
        target.addClass("selected");
        var toolSeq = targetElement.data("toolSeq");
        objSelect(toolSeq);
        selectedObj["answerList"] = [];
        $(this).closest(".layer").find("input:checked").each(function(idx, data){
            var o = {
                "toolSeq": toolSeq,
                "sheetPage": selectedObj["sheetPage"],
                "answerSeq": (idx + 1),
                "answer": $(this).val()
            }
            selectedObj["answerList"].push(o);
        });
        
        if(selectedObj["answerList"].length == 0){
        	// target.find(".ques-number").css({"background-color": "crimson", "color": "#FFF"});
        } else {
        	target.find(".ques-number").css({"background-color": "transparent", "color": "#000"});
        }
    });

    // 드롭다운 옵션설정 - 보기 추가 버튼
    $(document).on("click", "button[data-role=btnDlSelectAddExample]", function(){
        var length = $("#boxDlSelectExample .item").length + 1;
        if(length != 11) {
            var item = '<div class="item ex-add">' +
                '<label>' +
                '<input type="radio" name="dlselect" value="' + length + '">' +
                //'<input type="text" name="dltext" class="box-style" placeholder="보기를 입력하세요." style="margin-left:8px;display:inline-block;width:70%" value="' + length + '">' +
                '<input type="text" name="dltext" class="box-style" placeholder="보기를 입력하세요. (30자 제한)" maxlength="30" style="margin-left:8px;display:inline-block;width:70%" value="' + getCircleNumber(length) + '">' +
                '<button type="button" class="btn-sm" data-role="btnDlSelectExampleDelete"><i class="fa fa-times"></i></button>' +
                '</label>' +
                '</div>';
            $("#boxDlSelectExample").append(item);
        } else {
            $("#boxDlSelectWarning").text("보기는 최대 10개까지 생성 가능합니다.");
        }
    });

    // 드롭다운 옵션설정 - 보기 삭제 버튼
    $(document).on("click", "button[data-role=btnDlSelectExampleDelete]", function(){
        $(this).closest(".item").remove();
        $("#boxDlSelectExample input[name=dlselect]").each(function(idx, data){
            $(this).val(idx + 1);
        });
    });

    // 설정 - 선택시 포커스 이동
    $(document).on("click", "tr[data-role=btnSelectItem]", function(){
        var self = $(this);
        var toolSeq = self.find("input[name=checkAlloc]").val();
        var item = self.find("input[name=toolCd]").val();
        $(".selected").removeClass("selected");
        objSelect(parseInt(toolSeq));               // 객체 선택
        $(".layer.tool-seq-" + toolSeq).addClass("selected");
        $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
        $(".option-" + item).show();// 텍스트에만 사용하는 버튼 보이기
        if(!$("a[data-role=btnPointer]").closest(".item").hasClass("active")){
            btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
        }
    });

    // 설정 - 전체선택 & 해제
    $(document).on("change", "input[name=dlSettingCheckAll]", function(){
        if($(this).is(":checked")){
            $(".question-box input[type=checkbox]").prop("checked", true);
        } else {
            $(".question-box input[type=checkbox]").prop("checked", false);
        }
    });

    // O/X - 라디오박스
    $(document).on("change", ".ox-radio-box", function(e){
        $(this).closest(".group").find("label").removeClass("active");
        $(this).closest("label").addClass("active");
    });

    // 선잇기 - 빠른생성 버튼
    $(document).on("click", "a[data-role=btnLinematch]", function(e){
        e.preventDefault();
        selectedCnt = $(this).data("itemValue");
        $(".line-connect").hide();
    });

    // 선잇기 - 생성 버튼
    $(document).on("click", "button[data-role=btnLineMatchCreate]", function(){
        selectedCnt = $("select[name=linematch]:eq(0)").val() + "," + $("select[name=linematch]:eq(1)").val() + "," + $("select[name=linematch]:eq(2)").val();
        $(".line-connect").hide();
    });

    // 선잇기 - 선 긋기
    $(document).on("click", "input[type=radio].line-match", function(){
        var self = $(this);
        var parent = self.closest("div.linematch-layer");
        var selectedValue = parseInt(parent.find("input[name=selectedValue]").val());
        var thisValue = parseInt(self.val());
        var lineMatchFlag = parent.find("input[name=lineMatchFlag]").val();

        targetElement = parent;
        var itemType = parent.data("itemType");
        $(".tool-sub .option").hide();
        $(".option-" + itemType).show();
        $(".selected").removeClass("selected");
        parent.addClass("selected");
        objSelect(parent.data("toolSeq"));

        var startValue = selectedValue;
        var endValue = thisValue;

        if(selectedValue < thisValue){
            startValue = selectedValue;
            endValue = thisValue;
        } else if (selectedValue > thisValue){
            startValue = thisValue;
            endValue = selectedValue;
        }

        if(lineMatchFlag == "true"){
            $(".linematch-" + selectedObj["toolSeq"] + ".linestart-" + startValue).remove();
            $(".linematch-" + selectedObj["toolSeq"] + ".lineend-" + endValue).remove();

            var arr = [];
            $(".linematch-" + selectedObj["toolSeq"]).each(function(){
               var start = parseInt($(this).attr("dataStart"));
               var end = parseInt($(this).attr("dataEnd"));
               arr.push([start, end]);
            });
            
            if(startValue != endValue){
	            arr.push([startValue, endValue]);
	            arr.sort(function(a, b) {
	                return (a[0] - b[0]) || (a[1] - b[1]);
	            });
	            
	            selectedObj["answerList"] = [{
		            "toolSeq": selectedObj["toolSeq"],
		            "sheetPage": selectedObj["sheetPage"],
		            "answerSeq": 1,
		            "answer": JSON.stringify(arr)
	            }];
            }

            parent.find("input[name=selectedValue]").val("");
            parent.find("input[name=lineMatchFlag]").val("false");
            parent.find("input[type=radio]:input[value=" + startValue + "]").prop("checked", false).trigger("change");
            parent.find("input[type=radio]:input[value=" + endValue + "]").prop("checked", false).trigger("change");
            objChange(selectedObj);
        } else {
            parent.find("input[name=selectedValue]").val(self.val());
            parent.find("input[name=lineMatchFlag]").val("true");
        }
    });
    
    // 수식설정 - 엔터키 입력시
    $("input[name=fxFirst]").keyup(function(e){
        if(downKey == 13){
        	$("input[name=fxSecond]").focus();
        }
    });
    $("input[name=fxSecond]").keyup(function(e){
    	if(downKey == 13){
    		$("input[name=fxThird]").focus();
    	}
    });
    
    // 선택문항 변경시 점수 적용
    $(document).on("change", "select[name=selectAllot]", function(){
    	if($(this).closest("tr").find("input[name=checkAlloc]").is(":checked")){
    		var toolSeq = $(this).closest("tr").find("input[name=checkAlloc]").val();
    	        
	        var val = $(this).val();
	        $(objectArr).each(function(idx, data){
	            if(data["toolSeq"] == toolSeq){
	                objectArr[idx]["allot"] = val;
	            }
	        });
	        makeScore();
    	}
    });

});