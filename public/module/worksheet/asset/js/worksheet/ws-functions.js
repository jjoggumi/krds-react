/* eslint-disable */
/**
 *  각종 함수 모음 js
 */
// 객체 깊은 복사
function cloneObject(obj) {
    if(obj == null || typeof obj != 'object') {
        return obj;
    }

    var result = Array.isArray(obj) ? [] : {};

    for(var key of Object.keys(obj)) {
        result[key] = cloneObject(obj[key])
    }

    return result;
}

// 도구 수정시
function objChange(obj){
    wsRendering(obj);
    $(objectArr).each(function(idx, data){
        if(data["toolSeq"] == obj["toolSeq"]){
            objectArr[idx] = obj;
        }
    });
    historyPush();  // 이력 삽입
}

// 도구 선택시
function objSelect(toolSeq){
    $(objectArr).each(function(idx, data){
        if(data["toolSeq"] == toolSeq){
            selectedObj = data;
            fnSelectedOption();
        }
    });
}

// 도구 등록시
function objPush(obj){
    wsRendering(obj);
    objectArr.push(obj);
    historyPush();  // 이력 삽입
}

// 도구 삭제시
function objPop(obj){
    $(objectArr).each(function(idx, data){
        if(data["toolSeq"] == obj["toolSeq"]){
            objectArr.splice(idx, 1);
        }
    });
    historyPush();  // 이력 삽입
}

// 신규 도구번호 구하기
function getNextWsToolSeq(){
    var maxWsToolSeq = 0;
    var rtnMaxWsToolSeq = 0;
    $(objectArr).each(function(idx, data){
        if(maxWsToolSeq < parseInt(data["toolSeq"])){
            maxWsToolSeq = parseInt(data["toolSeq"]);
        }
    });
    rtnMaxWsToolSeq = ++maxWsToolSeq
    
    return rtnMaxWsToolSeq;
}

// 문항번호 구하기
function autoNumbering(){
    $(".ques-number").each(function(index){
        $(this).text(index + 1);
    });
}

// 문항도구인지 확인하는 함수
function isQuestion(obj){
    var flag = false;
    switch(obj["toolCd"]){
        case "textbox":
        case "essay":
        case "radio":
        case "check":
        case "select":
        case "linematch":
        case "toggle":
        case "fx": flag = true;
                   break;
    }
    return flag;
}

// 총점 및 문제수 표기 - 설정 박스 포함
function makeScore(){
    var len = $(".ques-number").length;
    
    if(len == 0) {
    	 $(".question-num").hide();
    } else {
    	$(".question-num").show();
    }
    
    $(".naviQuestion").text(len);
    var score = 0;
    var j = 0;
    $(".question-box").empty();

    // 100점 만점 자동 배분
    if(allotShareFlag){
        var cnt = $(".ques-number").length;
        allotScore = Math.floor(100 / cnt);
        var latScore = 100 % cnt;
        for(var i in objectArr) {
            if (isQuestion(objectArr[i])) {
                if(i == 0){
                	objectArr[i]["allot"] = allotScore + latScore;
                } else {
                	objectArr[i]["allot"] = allotScore;
                }
            }
        }
    }

    for(var i in objectArr){
        if(isQuestion(objectArr[i])){
            var name;
            switch(objectArr[i]["toolCd"]){
                case "textbox": name = "단답형"; break;
                case "essay": name = "텍스트"; break;
                case "radio": name = "단일선택형"; break;
                case "check": name = "복수선택형"; break;
                case "select": name = "드롭다운"; break;
                case "linematch": name = "선잇기"; break;
                case "toggle": name = "O/X"; break;
                case "fx": name = "수식"; break;
            }

            if(typeof objectArr[i]["allot"] == "undefined"){
            	objectArr[i]["allot"] = 1;
            }
            
            score += parseInt(objectArr[i]["allot"]);
            j++;
            
            var optionAdd = "";
            if(allotShareFlag){
            	optionAdd = '<option value="' + objectArr[i]["allot"] + '">' + objectArr[i]["allot"] + '</option>';
            }
            
            var html = '<tr data-role="btnSelectItem">' +
                '<td>' +
                '<input type="hidden" name="toolCd" value="' + objectArr[i]["toolCd"] + '">' +
                '<label class="hdn-txt"><input type="checkbox" name="checkAlloc" value="' + objectArr[i]["toolSeq"] + '"></label>' +
                '</td>' +
                '<td>' + j + '</td>' +
                '<td>' + name + '</td>' +
                '<td>' +
                '<select name="selectAllot">' +
                '<option value="0">없음</option>' +
                '<option value="1">1</option>' +
                '<option value="2">2</option>' +
                '<option value="3">3</option>' +
                '<option value="4">4</option>' +
                '<option value="5">5</option>' +
                '<option value="6">6</option>' +
                '<option value="7">7</option>' +
                '<option value="8">8</option>' +
                '<option value="9">9</option>' +
                '<option value="10">10</option>' +
                '<option value="11">11</option>' +
                '<option value="12">12</option>' +
                '<option value="13">13</option>' +
                '<option value="14">14</option>' +
                '<option value="15">15</option>' +
                '<option value="16">16</option>' +
                '<option value="17">17</option>' +
                '<option value="18">18</option>' +
                '<option value="19">19</option>' +
                '<option value="20">20</option>' +
                '<option value="21">21</option>' +
                '<option value="22">22</option>' +
                '<option value="23">23</option>' +
                '<option value="24">24</option>' +
                '<option value="25">25</option>' +
                '<option value="26">26</option>' +
                '<option value="27">27</option>' +
                '<option value="28">28</option>' +
                '<option value="29">29</option>' +
                '<option value="30">30</option>' +
                '<option value="31">31</option>' +
                '<option value="32">32</option>' +
                '<option value="33">33</option>' +
                '<option value="34">34</option>' +
                '<option value="35">35</option>' +
                '<option value="36">36</option>' +
                '<option value="37">37</option>' +
                '<option value="38">38</option>' +
                '<option value="39">39</option>' +
                '<option value="40">40</option>' +
                '<option value="41">41</option>' +
                '<option value="42">42</option>' +
                '<option value="43">43</option>' +
                '<option value="44">44</option>' +
                '<option value="45">45</option>' +
                '<option value="46">46</option>' +
                '<option value="47">47</option>' +
                '<option value="48">48</option>' +
                '<option value="49">49</option>' +
                '<option value="50">50</option>' +
                '<option value="51">51</option>' +
                '<option value="52">52</option>' +
                '<option value="53">53</option>' +
                '<option value="54">54</option>' +
                '<option value="55">55</option>' +
                '<option value="56">56</option>' +
                '<option value="57">57</option>' +
                '<option value="58">58</option>' +
                '<option value="59">59</option>' +
                '<option value="60">60</option>' +
                '<option value="61">61</option>' +
                '<option value="62">62</option>' +
                '<option value="63">63</option>' +
                '<option value="64">64</option>' +
                '<option value="65">65</option>' +
                '<option value="66">66</option>' +
                '<option value="67">67</option>' +
                '<option value="68">68</option>' +
                '<option value="69">69</option>' +
                '<option value="70">70</option>' +
                '<option value="71">71</option>' +
                '<option value="72">72</option>' +
                '<option value="73">73</option>' +
                '<option value="74">74</option>' +
                '<option value="75">75</option>' +
                '<option value="76">76</option>' +
                '<option value="77">77</option>' +
                '<option value="78">78</option>' +
                '<option value="79">79</option>' +
                '<option value="80">80</option>' +
                '<option value="81">81</option>' +
                '<option value="82">82</option>' +
                '<option value="83">83</option>' +
                '<option value="84">84</option>' +
                '<option value="85">85</option>' +
                '<option value="86">86</option>' +
                '<option value="87">87</option>' +
                '<option value="88">88</option>' +
                '<option value="89">89</option>' +
                '<option value="90">90</option>' +
                '<option value="91">91</option>' +
                '<option value="92">92</option>' +
                '<option value="93">93</option>' +
                '<option value="94">94</option>' +
                '<option value="95">95</option>' +
                '<option value="96">96</option>' +
                '<option value="97">97</option>' +
                '<option value="98">98</option>' +
                '<option value="99">99</option>' +
                optionAdd +
                '</select>' +
                '</td>' +
                '</tr>'

            $(".question-box").append(html);
            $(".question-box tr:last-child select[name=selectAllot]").val(parseInt(objectArr[i]["allot"]));
            if(allotShareFlag){
                $(".question-box tr:last-child select[name=selectAllot]").prop("disabled", true);
            }
        }
    }
    
    score = Math.round(score);
    
    $(".naviScore").text(score);
}

// 이력 삽입
function historyPush(){
    if(historyArr.length != (pointerIdx + 1)){
        historyArr = historyArr.slice(0, pointerIdx + 1);
        pointerIdx = historyArr.length;
    }

    if(historyArr.length == maxLength){
        historyArr = historyArr.slice(1, pointerIdx + 1);
    }

    historyArr.push(JSON.stringify(objectArr));
    pointerIdx = historyArr.length - 1;
}

// 뒤로가기
function undo(){
    if(pointerIdx == 0){
        var msgHtml = '<div class="alert"><div class="msg">더 이상 진행이 불가능합니다.</div></div>';
        $(msgHtml).appendTo('body').fadeOut(2000).delay(2000).queue(function () {
            $(this).remove();
        });
        return;
    }
    pointerIdx--;
    objectArr = JSON.parse(historyArr[pointerIdx]);
    renderingAll(objectArr);
    makeScore();
    $(".selected").removeClass("selected");
}

// 앞으로 가기
function redo(){
    if(pointerIdx >= historyArr.length - 1){
        var msgHtml = '<div class="alert"><div class="msg">더 이상 진행이 불가능합니다.</div></div>';
        $(msgHtml).appendTo('body').fadeOut(2000).delay(2000).queue(function () {
            $(this).remove();
        });
        return;
    }
    pointerIdx++;
    objectArr = JSON.parse(historyArr[pointerIdx]);
    renderingAll(objectArr);
    makeScore();
    $(".selected").removeClass("selected");
}

// 양식삭제
function deleteform() {
    if (objectArr.length === 0) {
        var msgHtml = '<div class="alert"><div class="msg">삭제할 양식이 없습니다.</div></div>';
        $(msgHtml).appendTo('body').fadeOut(2000).delay(2000).queue(function () {
            $(this).remove();
        });
        return false
    }
    
    historyPush();  // 이력 삽입
    pointerIdx++
    
    objectArr = [];
    renderingAll(objectArr);
    makeScore();
    $(".selected").removeClass("selected");
    
    var msgHtml = '<div class="alert"><div class="msg">양식이 모두 삭제되었습니다.</div></div>';
    $(msgHtml).appendTo('body').fadeOut(2000).delay(2000).queue(function () {
        $(this).remove();
    });
}

// 텍스트 드래그 방지 시작
function blockUI(){
    $("body").addClass("stop-dragging");
}

// 텍스트 드래그 방지 종료
function unBlockUI(){
    $("body").removeClass("stop-dragging");
}

// 서버이미지 로딩
function getServerImageList(searchText, pageNo){
	$.ajax({
		url: "/user/content/make/worksheetServerImage.json",
		dataType: "JSON",
		data: {
			dlSearchText: searchText,
			currentPageNo: pageNo
		},
		type: "POST",
		success: function(res){
			$(".album > ul").empty();
			$("#dlPage").text(res.paginationInfo.currentPageNo + "/" + res.paginationInfo.totalPageCount);
			$("#dlSICnt").text(res.paginationInfo.totalRecordCount);
			$("input[name=dlCurPage]").val(res.paginationInfo.currentPageNo);
			$("input[name=dlLastPage]").val(res.paginationInfo.totalPageCount);
			$(res.mediaList).each(function(idx, data){
				var html = '<li><a href="#" data-role="btnDlImageSelect" data-src="' + data.servicePath + '"><img src="' + data.thumbPath + '" alt="' + data.objectNameKor +'"></a></li>'
				$(".album > ul").append(html);
			});
		}
	});
}

// 설정 공통
function settingPopup(e){
	switch(selectedObj["toolCd"]){
    case "textbox":
        $("#dialog-textbox").dialog({
            width: '600px',
            modal: true,
            position: {
            	of: ".selected",
            	at: "center bottom",
            	my: "center bottom+300"
            },
            open: function(){
            	$(".answer-inputbox").val("");
                if(allotFlag){
                    $("#dialog-textbox input[name=allotFlag]").prop("checked", true).trigger("change");
                } else {
                    $("#dialog-textbox input[name=allotFlag]").prop("checked", false).trigger("change");
                }

                if(typeof selectedObj["allot"] !== "undefined"){
                    $("#dialog-textbox select[name=allot]").val(selectedObj["allot"]).selectmenu("refresh");
                }

                $(".answer-list").empty();
                var answerList = selectedObj["answerList"];
                if(typeof answerList !== "undefined"){
                    for(var i in answerList){
                        var html = '<li><input type="hidden" value="' + answerList[i]["answer"] + '" /><span>' + answerList[i]["answer"] + '</span><button type="button" data-role="btnRemoveItem"><i class="fal fa-times-circle"></i></button></li>';
                        $(".answer-list").append(html);
                    }
                }
            },
            buttons: {
                cancel: {
                    click: function() { $(this).dialog('close'); },
                    text: "취소",
                    class: "btn-38 btn-cancel"
                },
                Ok: {
                    click: function() {
                    	if($(".answer-inputbox").val().trim() != ""){
                    		$("[data-role=btnTextboxConfirm]").click();
                    	}
                    	
                        selectedObj["answerList"] = [];
                        $(".answer-list input").each(function(idx, data){
                            var o = {
                                "toolSeq": selectedObj["toolSeq"],
                                "sheetPage": selectedObj["sheetPage"],
                                "answerSeq": (idx + 1),
                                "answer": $(this).val()
                            }
                            selectedObj["answerList"].push(o);
                        });

                        if($("#dialog-textbox input[name=allotFlag]:checked").val() === "Y"){
                            var allot = $("#dialog-textbox select[name=allot]").val();
                            for(var i in objectArr){
                                if(isQuestion(objectArr[i])){
                                    objectArr[i]["allot"] = allot;
                                }
                                allotScore = allot;
                            }
                            allotFlag = true;
                        } else {
                            allotScore = 1;
                            allotFlag = false;
                            selectedObj["allot"] = $("#dialog-textbox select[name=allot]").val();
                        }

                        objChange(selectedObj);
                        makeScore();
                        $(this).dialog("close");
                    },
                    text: "저장",
                    class: "btn-38 spot"
                }
            }
        });
        break;
    case "essay":
        $("#dialog-essay").dialog({
            width: '480px',
            modal: true,
            position: {
            	of: ".selected",
            	at: "center bottom",
            	my: "center bottom+300"
            },
            open: function(){
            	$(".essay-txt").val(selectedObj["txt"]);
    
              // 필수입력 체크박스 설정
              $("#dialog-essay input[name=essential]").prop("checked", selectedObj["essential"] || false)
            },
            buttons: {
                cancel: {
                    click: function() { $(this).dialog('close'); },
                    text: "취소",
                    class: "btn-38 btn-cancel"
                },
                Ok: {
                    click: function() {
                        try {
                            selectedObj["essential"] = $("#dialog-essay input[name=essential]").is(":checked") === true
                        } catch (e) { console.error(e) }
                        selectedObj["txt"] = $(".essay-txt").val();
                        
                        objChange(selectedObj);
                        $(this).dialog("close");
                    },
                    text: "저장",
                    class: "btn-38 spot"
                }
            }
        });
        break;
    case "radio":
        $("#dialog-radio").dialog({
            width: '365px',
            modal: true,
            position: {
            	of: ".selected",
            	at: "center bottom",
            	my: "center bottom+300"
            },
            open: function(){
                // 다이얼로그 오픈시 동작

                // 전역변수 allotFlag(배점 플래그) 플래그값에 따라 "모든 문항에 동일하게 적용" 설정
                // if(allotFlag){
                //     $("#dialog-radio input[name=allotFlag]").prop("checked", true).trigger("change");
                // } else {
                //     $("#dialog-radio input[name=allotFlag]").prop("checked", false).trigger("change");
                // }

                // 선택된 객체의 배점값 설정
                // if(typeof selectedObj["allot"] !== "undefined"){
                //     $("#dialog-radio select[name=allot]").val(selectedObj["allot"]).selectmenu("refresh");
                // }

                // 선택된 객체의 보기 개수 설정
                $("#dialog-radio select[name=exampleNumber]").val(selectedObj["exampleList"].length).selectmenu("refresh");
    
                // 필수입력 체크박스 설정
                $("#dialog-radio input[name=essential]").prop("checked", selectedObj["essential"] || false)
            },
            buttons: {
                cancel: {
                    click: function() { $(this).dialog('close'); },
                    text: "취소",
                    class: "btn-38 btn-cancel"
                },
                Ok: {
                    click: function() {
                        // 다이얼로그 저장시 동작
                        
                        // 필수입력 저장
                        try {
                            selectedObj["essential"] = $("#dialog-radio input[name=essential]").is(":checked") === true
                        } catch (e) { console.error(e) }

                        // 보기개수를 변경 했을 경우
                        if(parseInt(selectedObj["exampleList"].length) !== parseInt($("#dialog-radio select[name=exampleNumber]").val())){
                            // 정답 초기화
                            selectedObj["answerList"] = [];

                            // 보기개수 초기화
                            var exampleList = [];
                            for(var i=0; i<$("#dialog-radio select[name=exampleNumber]").val(); i++){
                                var o = {
                                    "wsQuesExamSeq": i+1,
                                    "toolSeq": selectedObj["toolSeq"],
                                    "sheetPage": selectedObj["sheetPage"],
                                    "toolCd": selectedObj["toolCd"],
                                    "x": 15,
                                    "y": i * (parseInt($("input[name=fontSize]").val()) + 15),
                                    "width": null,
                                    "height": null,
                                    "fontFamily": null,
                                    "fontSize": null,
                                    "fontStyle": null,
                                    "fontColor": "#000",
                                    "borderSize": 1,
                                    "borderColor": "#000",
                                    "backgroundColor": "#FFF",
                                    "opacity": "1"
                                }
                                exampleList.push(o);
                            }
                            selectedObj["exampleList"] = exampleList;
                        }

                        // 배점 "모든 문항에 동일하게 적용" 설정
                        if($("#dialog-radio input[name=allotFlag]:checked").val() === "Y"){
                            // 모든 문항 적용시 모든 문항 배점 업데이트
                            var allot = $("#dialog-radio select[name=allot]").val();
                            for(var i in objectArr){
                                if(isQuestion(objectArr[i])){
                                    objectArr[i]["allot"] = allot;
                                }
                                allotScore = allot;
                            }

                            // 전역변수 변경
                            allotFlag = true;
                        } else {
                            allotScore = 1;
                            allotFlag = false;
                            selectedObj["allot"] = $("#dialog-radio select[name=allot]").val();
                        }

                        objChange(selectedObj);         // 객체 변경
                        makeScore();                    // 점수 업데이트
                        $(this).dialog("close");        // 다이얼로그 닫기
                    },
                    text: "저장",
                    class: "btn-38 spot"
                }
            }
        });
        break;
    case "check":
        $("#dialog-check").dialog({
            width: '365px',
            modal: true,
            position: {
            	of: ".selected",
            	at: "center bottom",
            	my: "center bottom+300"
            },
            open: function(){
                // 다이얼로그 오픈시 동작

                // 전역변수 allotFlag(배점 플래그) 플래그값에 따라 "모든 문항에 동일하게 적용" 설정
                // if(allotFlag){
                //     $("#dialog-check input[name=allotFlag]").prop("checked", true).trigger("change");
                // } else {
                //     $("#dialog-check input[name=allotFlag]").prop("checked", false).trigger("change");
                // }

                // 선택된 객체의 배점값 설정
                // if(typeof selectedObj["allot"] !== "undefined"){
                //     $("#dialog-check select[name=allot]").val(selectedObj["allot"]).selectmenu("refresh");
                // }

                // 선택된 객체의 보기 개수 설정
                $("#dialog-check select[name=exampleNumber]").val(selectedObj["exampleList"].length).selectmenu("refresh");
    
                // 필수입력 체크박스 설정
                $("#dialog-check input[name=essential]").prop("checked", selectedObj["essential"] || false)
            },
            buttons: {
                cancel: {
                    click: function() { $(this).dialog('close'); },
                    text: "취소",
                    class: "btn-38 btn-cancel"
                },
                Ok: {
                    click: function() {
                        // 다이얼로그 저장시 동작
                        
                        try {
                            selectedObj["essential"] = $("#dialog-check input[name=essential]").is(":checked") === true
                        } catch (e) { console.error(e) }

                        // 보기개수를 변경 했을 경우
                        if(parseInt(selectedObj["exampleList"].length) !== parseInt($("#dialog-check select[name=exampleNumber]").val())){
                            // 정답 초기화
                            selectedObj["answerList"] = [];

                            // 보기개수 초기화
                            var exampleList = [];
                            for(var i=0; i<$("#dialog-check select[name=exampleNumber]").val(); i++){
                                var o = {
                                    "wsQuesExamSeq": i+1,
                                    "toolSeq": selectedObj["toolSeq"],
                                    "sheetPage": selectedObj["sheetPage"],
                                    "toolCd": selectedObj["toolCd"],
                                    "x": 15,
                                    "y": i * (parseInt($("input[name=fontSize]").val()) + 15),
                                    "width": null,
                                    "height": null,
                                    "fontFamily": null,
                                    "fontSize": null,
                                    "fontStyle": null,
                                    "fontColor": "#000",
                                    "borderSize": 1,
                                    "borderColor": "#000",
                                    "backgroundColor": "#FFF",
                                    "opacity": "1"
                                }
                                exampleList.push(o);
                            }
                            selectedObj["exampleList"] = exampleList;
                        }

                        // 배점 "모든 문항에 동일하게 적용" 설정
                        if($("#dialog-check input[name=allotFlag]:checked").val() === "Y"){
                            // 모든 문항 적용시 모든 문항 배점 업데이트
                            var allot = $("#dialog-check select[name=allot]").val();
                            for(var i in objectArr){
                                if(isQuestion(objectArr[i])){
                                    objectArr[i]["allot"] = allot;
                                }
                                allotScore = allot;
                            }

                            // 전역변수 변경
                            allotFlag = true;
                        } else {
                            allotScore = 1;
                            allotFlag = false;
                            selectedObj["allot"] = $("#dialog-check select[name=allot]").val();
                        }

                        objChange(selectedObj);         // 객체 변경
                        makeScore();                    // 점수 업데이트
                        $(this).dialog("close");        // 다이얼로그 닫기
                    },
                    text: "저장",
                    class: "btn-38 spot"
                }
            }
        });
        break;
    case "select":
        $("#dialog-select").dialog({
            width: '600px',
            modal: true,
            position: {
            	of: ".selected",
            	at: "center bottom",
            	my: "center bottom+500"
            },
            open: function(){
                // 다이얼로그 오픈시 동작
                $("#boxDlSelectWarning").text("");
                $(".ex-add").remove();
                $("input[name=dltext]").val("");

                if(typeof selectedObj["exampleList"] != "undefined"){
                    var exampleLength = selectedObj["exampleList"].length;
                    
                    for(var i=0; i< exampleLength - 2; i++){
                        var item = '<div class="item ex-add">' +
                            '<label>' +
                            '<input type="radio" name="dlselect" value="' + (i + 3) + '">' +
                            '<input type="text" name="dltext" class="box-style" placeholder="보기를 입력하세요." style="margin-left: 8px;display:inline-block;width:70%">' +
                            '<button type="button" class="btn-sm" data-role="btnDlSelectExampleDelete"><i class="fa fa-times"></i></button>' +
                            '</label>' +
                            '</div>';
                        $("#boxDlSelectExample").append(item);
                    }

                    for(var i=0; i< exampleLength; i++){
                        $("input[name=dltext]").eq(i).val(selectedObj["exampleList"][i]["text"]);
                    }

                    $("input[name=dlselect]:input[value=" + selectedObj["answerList"][0]["answer"] + "]").prop("checked", true);
                } else {
                	
                	//$("input[name=dltext]:eq(0)").val("1");
                    //$("input[name=dltext]:eq(1)").val("2");
                    $("input[name=dltext]:eq(0)").val(getCircleNumber(1));
                    $("input[name=dltext]:eq(1)").val(getCircleNumber(2));
                    $("input[name=dlselect]:eq(0)").prop("checked", false);
                    $("input[name=dlselect]:eq(1)").prop("checked", false);
                    
                	 for(var i=0; i< 3; i++){
                         var item = '<div class="item ex-add">' +
                             '<label>' +
                             '<input type="radio" name="dlselect" value="' + (i + 3) + '">' +
                             //'<input type="text" name="dltext" class="box-style" placeholder="보기를 입력하세요." style="margin-left: 8px;display:inline-block;width:70%" value="' + (i + 3) + '">' +
                             '<input type="text" name="dltext" class="box-style" placeholder="보기를 입력하세요." style="margin-left: 8px;display:inline-block;width:70%" value="' + getCircleNumber((i + 3)) + '">' +
                             '<button type="button" class="btn-sm" data-role="btnDlSelectExampleDelete"><i class="fa fa-times"></i></button>' +
                             '</label>' +
                             '</div>';
                         $("#boxDlSelectExample").append(item);
                     }
                }

                // 전역변수 allotFlag(배점 플래그) 플래그값에 따라 "모든 문항에 동일하게 적용" 설정
                if(allotFlag){
                    $("#dialog-select input[name=allotFlag]").prop("checked", true).trigger("change");
                } else {
                    $("#dialog-select input[name=allotFlag]").prop("checked", false).trigger("change");
                }

                // 선택된 객체의 배점값 설정
                if(typeof selectedObj["allot"] !== "undefined"){
                    $("#dialog-select select[name=allot]").val(selectedObj["allot"]).selectmenu("refresh");
                }
            },
            buttons: {
                cancel: {
                    click: function() { $(this).dialog('close'); },
                    text: "취소",
                    class: "btn-38 btn-cancel"
                },
                Ok: {
                    click: function() {
                        // 다이얼로그 저장시 동작

                        // 보기 빈값 유효성 검사
                        var exampleFlag = true;
                        $("#dialog-select input[name=dltext]").each(function(idx, data){
                            if($(this).val().trim() == ""){
                                exampleFlag = false;
                            }
                        });

                        if(!exampleFlag){
                            $("#boxDlSelectWarning").text("보기를 모두 입력해주세요.");
                            return;
                        }

                        // 정답 유효성 검사
                        if(typeof $("#dialog-select input[name=dlselect]:checked").val() == "undefined"){
                            $("#boxDlSelectWarning").text("정답을 선택하세요.");
                            return;
                        }

                        // 보기 저장
                        var exampleList = [];
                        for(var i=0; i<$("#dialog-select input[name=dltext]").length; i++){
                            var o = {
                                "wsQuesExamSeq": i+1,
                                "toolSeq": selectedObj["toolSeq"],
                                "sheetPage": selectedObj["sheetPage"],
                                "toolCd": selectedObj["toolCd"],
                                "x": 15,
                                "y": i * 15,
                                "width": null,
                                "height": null,
                                "fontFamily": null,
                                "fontSize": null,
                                "fontStyle": null,
                                "fontColor": "#000",
                                "borderSize": 1,
                                "borderColor": "#000",
                                "backgroundColor": "#FFF",
                                "opacity": "1",
                                "text": $("#dialog-select input[name=dltext]").eq(i).val()
                            }
                            exampleList.push(o);
                        }
                        selectedObj["exampleList"] = exampleList;

                        // 정답 저장
                        var o = {
                            "toolSeq": selectedObj["toolSeq"],
                            "sheetPage": selectedObj["sheetPage"],
                            "answerSeq": 1,
                            "answer": $("#dialog-select input[name=dlselect]:checked").val()
                        }
                        selectedObj["answerList"] = [];
                        selectedObj["answerList"].push(o);

                        // 배점 "모든 문항에 동일하게 적용" 설정
                        if($("#dialog-select input[name=allotFlag]:checked").val() === "Y"){
                            // 모든 문항 적용시 모든 문항 배점 업데이트
                            var allot = $("#dialog-select select[name=allot]").val();
                            for(var i in objectArr){
                                if(isQuestion(objectArr[i])){
                                    objectArr[i]["allot"] = allot;
                                }
                                allotScore = allot;
                            }

                            // 전역변수 변경
                            allotFlag = true;
                        } else {
                            allotScore = 1;
                            allotFlag = false;
                            selectedObj["allot"] = $("#dialog-select select[name=allot]").val();
                        }

                        objChange(selectedObj);         // 객체 변경
                        makeScore();                    // 점수 업데이트
                        $(this).dialog("close");        // 다이얼로그 닫기

                    },
                    text: "저장",
                    class: "btn-38 spot"
                }
            }
        });
        break;
    case "linematch":
        $("#dialog-linematch").dialog({
            width: '600px',
            modal: true,
            position: {
            	of: ".selected",
            	at: "center bottom",
            	my: "center bottom+300"
            },
            open: function(){
                // 전역변수 allotFlag(배점 플래그) 플래그값에 따라 "모든 문항에 동일하게 적용" 설정
                if(allotFlag){
                    $("#dialog-linematch input[name=allotFlag]").prop("checked", true).trigger("change");
                } else {
                    $("#dialog-linematch input[name=allotFlag]").prop("checked", false).trigger("change");
                }

                // 선택된 객체의 배점값 설정
                if(typeof selectedObj["allot"] !== "undefined"){
                    $("#dialog-linematch select[name=allot]").val(selectedObj["allot"]).selectmenu("refresh");
                }
            },
            buttons: {
                cancel: {
                    click: function() { $(this).dialog('close'); },
                    text: "취소",
                    class: "btn-38 btn-cancel"
                },
                Ok: {
                    click: function() {
                        // 다이얼로그 저장시 동작

                        // 배점 "모든 문항에 동일하게 적용" 설정
                        if($("#dialog-linematch input[name=allotFlag]:checked").val() === "Y"){
                            // 모든 문항 적용시 모든 문항 배점 업데이트
                            var allot = $("#dialog-linematch select[name=allot]").val();
                            for(var i in objectArr){
                                if(isQuestion(objectArr[i])){
                                    objectArr[i]["allot"] = allot;
                                }
                                allotScore = allot;
                            }

                            // 전역변수 변경
                            allotFlag = true;
                        } else {
                            allotScore = 1;
                            allotFlag = false;
                            selectedObj["allot"] = $("#dialog-linematch select[name=allot]").val();
                        }

                        objChange(selectedObj);         // 객체 변경
                        makeScore();                    // 점수 업데이트
                        $(this).dialog("close");        // 다이얼로그 닫기

                    },
                    text: "저장",
                    class: "btn-38 spot"
                }
            }
        });
        break;
    case "toggle":
        $("#dialog-toggle").dialog({
            width: '600px',
            modal: true,
            position: {
            	of: ".selected",
            	at: "center bottom",
            	my: "center bottom+300"
            },
            open: function(){
                // 다이얼로그 오픈시 동작
                $("#dialog-toggle select[name=quesType]").val(selectedObj["quesNo"]).selectmenu("refresh");

                // 전역변수 allotFlag(배점 플래그) 플래그값에 따라 "모든 문항에 동일하게 적용" 설정
                if(allotFlag){
                    $("#dialog-toggle input[name=allotFlag]").prop("checked", true).trigger("change");
                } else {
                    $("#dialog-toggle input[name=allotFlag]").prop("checked", false).trigger("change");
                }

                // 선택된 객체의 배점값 설정
                if(typeof selectedObj["allot"] !== "undefined"){
                    $("#dialog-toggle select[name=allot]").val(selectedObj["allot"]).selectmenu("refresh");
                }
            },
            buttons: {
                cancel: {
                    click: function() { $(this).dialog('close'); },
                    text: "취소",
                    class: "btn-38 btn-cancel"
                },
                Ok: {
                    click: function() {
                        // 다이얼로그 저장시 동작

                        // 배점 "모든 문항에 동일하게 적용" 설정
                        if($("#dialog-toggle input[name=allotFlag]:checked").val() === "Y"){
                            // 모든 문항 적용시 모든 문항 배점 업데이트
                            var allot = $("#dialog-toggle select[name=allot]").val();
                            for(var i in objectArr){
                                if(isQuestion(objectArr[i])){
                                    objectArr[i]["allot"] = allot;
                                }
                                allotScore = allot;
                            }

                            // 전역변수 변경
                            allotFlag = true;
                        } else {
                            allotScore = 1;
                            allotFlag = false;
                            selectedObj["allot"] = $("#dialog-toggle select[name=allot]").val();
                        }

                        selectedObj["quesNo"] = $("#dialog-toggle select[name=quesType]").val();

                        objChange(selectedObj);         // 객체 변경
                        makeScore();                    // 점수 업데이트
                        $(this).dialog("close");        // 다이얼로그 닫기

                    },
                    text: "저장",
                    class: "btn-38 spot"
                }
            }
        });
        break;
    case "fx":
        $("#dialog-fx").dialog({
            width: '600px',
            modal: true,
            position: {
            	of: ".selected",
            	at: "center bottom",
            	my: "center bottom+300"
            },
            open: function(){
                // 다이얼로그 오픈시 동작
                if(selectedObj["quesNo"] === "A"){
                    $(".fx-option-b").hide();
                } else {
                    $(".fx-option-b").show();
                }

                if(selectedObj["answerList"].length !== 0){
                    var str = selectedObj["answerList"][0]["answer"].split(",");
                    $("input[name=fxFirst]").val(str[0]);
                    $("input[name=fxSecond]").val(str[1]);
                    $("input[name=fxThird]").val(str[2]);
                } else {
                    $("input[name=fxFirst]").val("");
                    $("input[name=fxSecond]").val("");
                    $("input[name=fxThird]").val("");
                }

                // 전역변수 allotFlag(배점 플래그) 플래그값에 따라 "모든 문항에 동일하게 적용" 설정
                if(allotFlag){
                    $("#dialog-fx input[name=allotFlag]").prop("checked", true).trigger("change");
                } else {
                    $("#dialog-fx input[name=allotFlag]").prop("checked", false).trigger("change");
                }

                // 선택된 객체의 배점값 설정
                if(typeof selectedObj["allot"] !== "undefined"){
                    $("#dialog-fx select[name=allot]").val(selectedObj["allot"]).selectmenu("refresh");
                }
            },
            buttons: {
                cancel: {
                    click: function() { $(this).dialog('close'); },
                    text: "취소",
                    class: "btn-38 btn-cancel"
                },
                Ok: {
                    click: function() {
                        // 다이얼로그 저장시 동작

                        // 배점 "모든 문항에 동일하게 적용" 설정
                        if($("#dialog-fx input[name=allotFlag]:checked").val() === "Y"){
                            // 모든 문항 적용시 모든 문항 배점 업데이트
                            var allot = $("#dialog-fx select[name=allot]").val();
                            for(var i in objectArr){
                                if(isQuestion(objectArr[i])){
                                    objectArr[i]["allot"] = allot;
                                }
                                allotScore = allot;
                            }

                            // 전역변수 변경
                            allotFlag = true;
                        } else {
                            allotScore = 1;
                            allotFlag = false;
                            selectedObj["allot"] = $("#dialog-fx select[name=allot]").val();
                        }

                        // 정답 저장
                        var f = $("input[name=fxFirst]").val();
                        var s = $("input[name=fxSecond]").val();
                        var t = $("input[name=fxThird]").val();
                        var answer = f + "," + s + "," + t;
                        var o = {
                            "toolSeq": selectedObj["toolSeq"],
                            "sheetPage": selectedObj["sheetPage"],
                            "answerSeq": 1,
                            "answer": answer
                        }
                        selectedObj["answerList"] = [];
                        selectedObj["answerList"].push(o);

                        objChange(selectedObj);         // 객체 변경
                        makeScore();                    // 점수 업데이트
                        $(this).dialog("close");        // 다이얼로그 닫기

                    },
                    text: "저장",
                    class: "btn-38 spot"
                }
            }
        });
        break;
	}
}

// 도구 선택한 색상 등 찾아주는 함수
function fnSelectedOption(){
	//$("#selectedFontFamily").text(selectedObj["fontFamily"]);
	$("#selectedFontFamily").text(getFontFamilyName(selectedObj["fontFamily"]));
    $("#selectedFontSize").text(selectedObj["fontSize"]);
    
    var fontStyle = selectedObj["fontStyle"];
    
    if(fontStyle != null){
        var fontWeight = fontStyle.substring(0, 1);
        var fontItalic = fontStyle.substring(1, 2);
        var fontUnderline = fontStyle.substring(2, 3);
        
        $("#selectedFontBold").removeClass("active");
        $("#selectedFontItalic").removeClass("active");
        $("#selectedFontUnderline").removeClass("active");
        if(fontWeight == "1"){ $("#selectedFontBold").addClass("active"); }
        if(fontItalic == "1"){ $("#selectedFontItalic").addClass("active"); }
        if(fontItalic == "1"){ $("#selectedFontUnderline").addClass("active"); }
    }
    
    $("#selectedFontColor").css("background", selectedObj["fontColor"]);
    
    $("#selectedArrowStart").removeClass("fa-horizontal-rule");
    $("#selectedArrowStart").removeClass("fa-long-arrow-alt-left");
    if(selectedObj["lineStartType"] == "arrow"){
        $("#selectedArrowStart").removeClass("fa-long-arrow-alt-left");
    } else {
    	$("#selectedArrowStart").removeClass("fa-horizontal-rule");
    }
    
    $("#selectedArrowEnd").removeClass("fa-horizontal-rule");
    $("#selectedArrowEnd").removeClass("fa-long-arrow-alt-left");
    if(selectedObj["lineStartType"] == "arrow"){
        $("#selectedArrowEnd").removeClass("fa-long-arrow-alt-left");
    } else {
    	$("#selectedArrowEnd").removeClass("fa-horizontal-rule");
    }
    
    $("#selectedBorderColor").css("border-color", selectedObj["borderColor"]);
    $("#selectedRectFill").css("background", selectedObj["backgroundColor"]);
}

//원형 숫자 문자열 반환
function getCircleNumber(num){
	var circleNumber = "";
	switch(num) {
		case 1:
			circleNumber = "①";
			break;
		case 2 :
			circleNumber = "②";
			break;
		case 3 :
			circleNumber = "③";
			break;
		case 4 :
			circleNumber = "④";
			break;
		case 5 :
			circleNumber = "⑤";
			break;
		case 6 :
			circleNumber = "⑥";
			break;
		case 7 :
			circleNumber = "⑦";
			break;
		case 8 :
			circleNumber = "⑧";
			break;
		case 9 :
			circleNumber = "⑨";
			break;
		case 10 :
			circleNumber = "⑩";
			break;
		default:
			circleNumber = num;
			break;
	}
	
	return circleNumber;
}

//서체명 표시이름으로 반환(하이픈 제거, 단어 앞글자 대문자)
function getFontFamilyName(fontFamily){
	if(fontFamily == null){
		return;
	}
	var words = fontFamily.replace(/\-/gi, ' ').split(' ');
	for(var i = 0; i <= words.length -1; i++){
		words[i] = words[i][0].toUpperCase() + words[i].slice(1);
	}
	var fontFamilyName = words.join(' ');	
	
	return fontFamilyName;
}

function deleteObjKeys(object, keys) {
    if (keys) {
        for (const key of keys) {
            delete object[key]
        }
    }
}