/* eslint-disable */
/**
 * 마우스 그리기 관련 js
 */
$(document).ready(function(){
    $(".editor-layer").mousedown(function(e){
        if(e.which !== 1) return;
        if(!selectedItem) {
        	btnPointer.trigger("click");
        }
        
        var self = $(this);
        var target = $(e.target);
        createTime = new Date().getTime();
        blockUI();
        dragFlag = true;

        // 선택된 페이지 구하기
        var elementsMouseIsOver;
        if (typeof document.msElementsFromPoint === "function") {
            elementsMouseIsOver = document.msElementsFromPoint(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset); // IE 대응
        } else {
            elementsMouseIsOver = document.elementsFromPoint(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset);
        }

        for(var idx in elementsMouseIsOver){
            if($(elementsMouseIsOver[idx]).is("div.editor-layer")){
                selectedPage = $(elementsMouseIsOver[idx]).data("pageIndex");
            }
        }
        
        // 생성된 오브젝트 클릭시 오브젝트 선택되도록 수정
        if(selectedItem != "pointer" && target.hasClass("line") && !target.hasClass("selected")) {
        	btnPointer.trigger("click");
        } else if(selectedItem != "pointer" && target.hasClass("layer")){
        	btnPointer.trigger("click");
        }

        switch (selectedItem) {
            case "pointer":
            	if(target.closest(".layer").length != 0 && !target.closest(".layer").hasClass("selected")){
                    target = target.closest(".layer");
                } else if (target.closest(".layer").length != 0 && target.closest(".layer").hasClass("selected")){
                	//console.log(event.srcElement.tagName);
                	if(event.srcElement.tagName != "BUTTON"
                		&& event.srcElement.tagName != "INPUT"
                		&& event.srcElement.tagName != "TEXTAREA"
                		&& event.srcElement.tagName != "I"
                		&& event.srcElement.tagName != "LABEL"
                		&& event.srcElement.tagName != "SPAN"){
                		if(!target.hasClass("line-resize")
                				&& !target.hasClass("dot")
                				&& !target.hasClass("select2-selection__rendered")){
                			target = target.closest(".layer");
                		}
                	}
                }
            	
            	// 더블클릭 감지
                clicks++;
                setTimeout(function() {
                    clicks = 0;
                }, delay);
                
                if (clicks === 2) {
                	if(target.hasClass("selected")){
                		settingPopup(e);
                	}
                    clicks = 0;
                }
                
                var parent = target.closest(".editor-layer");
                startObj = {
                    "positionLeft": e.offsetX,
                    "positionTop": e.offsetY,
                    "layerLeft": parent.position().left,
                    "layerTop": parent.position().top
                };
            	
                if(target.hasClass("line-resize")) {
                	// select 삭제
                    $(".select2-dropdown").hide();
                    
                    dragElement = $(target);
                } else if(target.hasClass("line") && !target.hasClass("selected")) {
                    var itemType = target.attr("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                    $(".selected").removeClass("selected");
                    $(".tool-sub").show();
                    var index = parseInt(target.attr("index"));
                    $(".line-start-" + index + ", .line-end-" + index).addClass("selected");
                    $(".line-" + index).addClass("selected");
                    objSelect(index);
                } else if(target.hasClass("line") && target.hasClass("selected")){
                    // 라인 이동
                    dragElement = target;
                    var x1 = parseFloat(dragElement.attr("x1"));
                    var x2 = parseFloat(dragElement.attr("x2"));
                    var y1 = parseFloat(dragElement.attr("y1"));
                    var y2 = parseFloat(dragElement.attr("y2"));
                    /*
                    startObj = {
                        "x1": Math.abs(e.pageX - x1 - self.offset().left),
                        "x2": Math.abs(e.pageX - x2 - self.offset().left),
                        "y1": Math.abs(e.pageY - y1 - self.offset().top),
                        "y2": Math.abs(e.pageY - y2 - self.offset().top)
                    }*/
                    
                    console.log({x1:x1, x2:x2, y1:y1, y2:y2});
                    
                    if(x1 <= x2 && y1 <= y2){
                    	startObj = {
                    		"x1": x1,
                    		"x2": x2,
                    		"y1": y1,
                    		"y2": y2,
                    		"dx1": e.pageX - x1 - self.offset().left,
                            "dx2": e.pageX - x2 - self.offset().left,
                            "dy1": e.pageY - y1 - self.offset().top,
                            "dy2": e.pageY - y2 - self.offset().top
                        }
                    }
                    
                    if(x1 <= x2 && y1 > y2){
                    	startObj = {
                    		"x1": x2,
                    		"x2": x1,
                    		"y1": y2,
                    		"y2": y1,
                    		"dx1": e.pageX - x2 - self.offset().left,
                            "dx2": e.pageX - x1 - self.offset().left,
                            "dy1": e.pageY - y2 - self.offset().top,
                            "dy2": e.pageY - y1 - self.offset().top
                        }
                    }
                    
                    if(x1 > x2 && y1 <= y2){
                    	startObj = {
                			"x1": x2,
                			"x2": x1,
                			"y1": y2,
                			"y2": y1,
                			"dx1": e.pageX - x2 - self.offset().left,
                            "dx2": e.pageX - x1 - self.offset().left,
                            "dy1": e.pageY - y2 - self.offset().top,
                            "dy2": e.pageY - y1 - self.offset().top
                    	}
                    }
                    
                    if(x1 > x2 && y1 > y2){
                    	startObj = {
                			"x1": x1,
                			"x2": x2,
                			"y1": y1,
                			"y2": y2,
                			"dx1": e.pageX - x1 - self.offset().left,
                            "dx2": e.pageX - x2 - self.offset().left,
                            "dy1": e.pageY - y1 - self.offset().top,
                            "dy2": e.pageY - y2 - self.offset().top
                    	}
                    }
                    
                    console.log(startObj);
                } else if(target.hasClass("image-layer") && !target.hasClass("selected")){
                	var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                    $(".selected").removeClass("selected");
                    $(".tool-sub").show();
                    dragElement = target;
                    target.addClass("selected");
                    targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                } else if(target.hasClass("serverimage-layer") && !target.hasClass("selected")){
                	var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                	$(".selected").removeClass("selected");
                	$(".tool-sub").show();
                	dragElement = target;
                	target.addClass("selected");
                	targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                } else if(target.hasClass("sound-layer") && !target.hasClass("selected")){
                	var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                	$(".selected").removeClass("selected");
                	$(".tool-sub").show();
                	dragElement = target;
                	target.addClass("selected");
                	targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                } else if(target.hasClass("youtube-layer") && !target.hasClass("selected")){
                	var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                	$(".selected").removeClass("selected");
                	$(".tool-sub").show();
                	dragElement = target;
                	target.addClass("selected");
                	targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                } else if(target.hasClass("eraser-layer") && !target.hasClass("selected")){
                	var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                	$(".selected").removeClass("selected");
                	$(".tool-sub").show();
                	dragElement = target;
                	target.addClass("selected");
                	targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                // 20211018 추가
                } else if(target.hasClass("esign-layer") && !target.hasClass("selected")){
                    var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                    $(".selected").removeClass("selected");
                    $(".tool-sub").show();
                    dragElement = target;
                    target.addClass("selected");
                    targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                // //20211018 추가
                } else if(target.hasClass("text-layer") && !target.hasClass("selected")){
                    var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                    $(".selected").removeClass("selected");
                    $(".tool-sub").show();
                    dragElement = target;
                    target.addClass("selected");
                    targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                } else if(target.hasClass("textbox-layer") && !target.hasClass("selected")){
                    var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                    $(".selected").removeClass("selected");
                    $(".tool-sub").show();
                    dragElement = target;
                    target.addClass("selected");
                    targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                    // 설정창 닫기
                    $(".btn-cancel").click();
                    $(".font-colorpicker").spectrum("hide");
                    $(".border-colorpicker").spectrum("hide");
                    $(".rectfill-colorpicker").spectrum("hide");
                    $(".line-colorpicker").spectrum("hide");
                } else if(target.hasClass("essay-layer") && !target.hasClass("selected")){
                    var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                    $(".selected").removeClass("selected");
                    $(".tool-sub").show();
                    dragElement = target;
                    target.addClass("selected");
                    targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                    // 설정창 닫기
                    $(".btn-cancel").click();
                    $(".font-colorpicker").spectrum("hide");
                    $(".border-colorpicker").spectrum("hide");
                    $(".rectfill-colorpicker").spectrum("hide");
                    $(".line-colorpicker").spectrum("hide");
                } else if(target.hasClass("radio-layer") && !target.hasClass("selected")){
                    var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                    $(".selected").removeClass("selected");
                    $(".tool-sub").show();
                    dragElement = target;
                    target.addClass("selected");
                    targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                    // 설정창 닫기
                    $(".btn-cancel").click();
                    $(".font-colorpicker").spectrum("hide");
                    $(".border-colorpicker").spectrum("hide");
                    $(".rectfill-colorpicker").spectrum("hide");
                    $(".line-colorpicker").spectrum("hide");
                } else if(target.hasClass("check-layer") && !target.hasClass("selected")){
                    var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                    $(".selected").removeClass("selected");
                    $(".tool-sub").show();
                    dragElement = target;
                    target.addClass("selected");
                    targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                    // 설정창 닫기
                    $(".btn-cancel").click();
                    $(".font-colorpicker").spectrum("hide");
                    $(".border-colorpicker").spectrum("hide");
                    $(".rectfill-colorpicker").spectrum("hide");
                    $(".line-colorpicker").spectrum("hide");
                } else if(target.hasClass("select-layer") && !target.hasClass("selected")){
                	// select 삭제
                    $(".select2-dropdown").hide();
                	
                    var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                    $(".selected").removeClass("selected");
                    $(".tool-sub").show();
                    dragElement = target;
                    target.addClass("selected");
                    targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                    // 설정창 닫기
                    $(".btn-cancel").click();
                    $(".font-colorpicker").spectrum("hide");
                    $(".border-colorpicker").spectrum("hide");
                    $(".rectfill-colorpicker").spectrum("hide");
                    $(".line-colorpicker").spectrum("hide");
                } else if(target.hasClass("toggle-layer") && !target.hasClass("selected")){
                    var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                    $(".selected").removeClass("selected");
                    $(".tool-sub").show();
                    dragElement = target;
                    target.addClass("selected");
                    targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                    // 설정창 닫기
                    $(".btn-cancel").click();
                    $(".font-colorpicker").spectrum("hide");
                    $(".border-colorpicker").spectrum("hide");
                    $(".rectfill-colorpicker").spectrum("hide");
                    $(".line-colorpicker").spectrum("hide");
                } else if(target.hasClass("fx-layer") && !target.hasClass("selected")){
                    var itemType = target.data("itemType");
                    $(".tool-sub .option").hide();
                    $(".option-" + itemType).show();
                    $(".selected").removeClass("selected");
                    $(".tool-sub").show();
                    dragElement = target;
                    target.addClass("selected");
                    targetElement = target;
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                    // 설정창 닫기
                    $(".btn-cancel").click();
                    $(".font-colorpicker").spectrum("hide");
                    $(".border-colorpicker").spectrum("hide");
                    $(".rectfill-colorpicker").spectrum("hide");
                    $(".line-colorpicker").spectrum("hide");
                } else if(target.hasClass("layer")) {
                	// select 삭제
                    $(".select2-dropdown").hide();
                    
                    dragElement = target;
                    targetElement = target;
                    var parent = target.closest(".editor-layer");
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                    startObj = {
                        "positionLeft": e.offsetX,
                        "positionTop": e.offsetY,
                        "layerLeft": parent.position().left,
                        "layerTop": parent.position().top
                    };
                } else if(target.hasClass("dot")){
                    dragElement = target;
                    targetElement = target.closest(".layer");
                    var parent = target.closest(".editor-layer");
                    var toolSeq = targetElement.data("toolSeq");
                    objSelect(toolSeq);
                    startObj = {
                        "innerWidth": targetElement.outerWidth(),
                        "innerHeight": targetElement.outerHeight(),
                        "positionLeft": targetElement.position().left,
                        "positionTop": targetElement.position().top,
                        "layerLeft": parent.position().left,
                        "layerTop": parent.position().top
                    };
                } else if(target.hasClass("fa-arrows")){
                    dragElement = target;
                    var parent = target.closest(".editor-layer");
                    targetElement = target.closest(".label");
                    startObj = {
                        "innerWidth": targetElement.outerWidth(),
                        "innerHeight": targetElement.outerHeight(),
                        "positionLeft": targetElement.closest(".layer").position().left,
                        "positionTop": targetElement.closest(".layer").position().top,
                        "layerLeft": parent.position().left,
                        "layerTop": parent.position().top
                    };
                } else {
                  if(target.closest(".layer").length == 0){
                		if(selectedObj && selectedObj["toolCd"] === "text"){
                			selectedObj["txt"] = $(".tool-seq-" + selectedObj["toolSeq"] + " textarea").val();
                		}
                		
                        $(".tool-sub .option").hide();
                        $(".selected").removeClass("selected");
                        selectedObj = null;
                        // 설정창 닫기
                        $(".btn-cancel").click();
                        $(".font-colorpicker").spectrum("hide");
                        $(".border-colorpicker").spectrum("hide");
                        $(".rectfill-colorpicker").spectrum("hide");
                        $(".line-colorpicker").spectrum("hide");
                    }
                }
                break;
            case "line":
                var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                var obj = {
                    "id": "lineTemp",
                    "index": createTime,
                    "class": "line line-temp",
                    "x1": e.pageX - self.offset().left,
                    "x2": e.pageX - self.offset().left,
                    "y1": e.pageY - self.offset().top,
                    "y2": e.pageY - self.offset().top,
                    "stroke": "#000",
                    "stroke-width": 5,
                }
                $(line).attr(obj);
                self.find("svg").append(line);
                dragElement = $(line);
                break;
            case "text":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
            case "eraser":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
            // 20211018 추가
            case "esign":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
            case "approvalsign":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
            // //20211018 추가
            case "textbox":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
            case "essay":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
            case "radio":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
            case "check":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
            case "select":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
            case "linematch":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
            case "toggle":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
            case "fx":
                var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                $(rect).attr({
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top,
                    width: 0,
                    height: 0,
                    fill: "transparent",
                    stroke: "rgba(33, 33, 33, 1)",
                    "stroke-width": 1,
                    "stroke-dasharray": "10, 10"
                });
                startObj = {
                    x: e.pageX - self.offset().left,
                    y: e.pageY - self.offset().top
                };
                target.closest("svg").append(rect);
                dragElement = rect;
                break;
        }
    }).mousemove(function(e){
        if(e.which !== 1) return;
        var self = $(this);
        if(dragFlag){
            if(!selectedItem) return;
            switch (selectedItem) {
                case "pointer":
                    if(dragElement == null || typeof dragElement == "undefined") return;

                    if(dragElement.hasClass("line-resize") && dragElement.hasClass("selected")){
                        var x = e.pageX - self.offset().left;
                        var y = e.pageY - self.offset().top;
                        var moveType = dragElement.attr("move-type");
                        var index = dragElement.attr("index");
                        var line = $("#line" + index);
                        var obj = {};

                        if (moveType === "start") {
                            obj = {x1: x, y1: y};
                        } else if(moveType === "end"){
                            obj = {x2: x, y2: y};
                        }

                        line.attr(obj);
                        $(".line-start-" + index).attr({x: line.attr("x1") - 4, y: line.attr("y1") - 4});
                        $(".line-end-" + index).attr({x: line.attr("x2") - 4, y: line.attr("y2") - 4});
                    } else if(dragElement.hasClass("line") && dragElement.hasClass("selected")){
                        var index = dragElement.attr("index");
                        
                        var x1, x2, y1, y2;
                        
                        var disX1 = 0 - Math.abs(e.pageX - parseFloat(dragElement.attr("x1")) - self.offset().left);
                        var disX2 = 0 - Math.abs(e.pageX - parseFloat(dragElement.attr("x2")) - self.offset().left);
                        
                    	x1 = e.pageX - self.offset().left - startObj["dx1"];
                    	x2 = e.pageX - self.offset().left - startObj["dx2"];
                        
                        var disY1 = 0 - Math.abs(e.pageY - parseFloat(dragElement.attr("y1")) - self.offset().top);
                        var disY2 = 0 - Math.abs(e.pageY - parseFloat(dragElement.attr("y1")) - self.offset().top);
                    	y1 = e.pageY - self.offset().top - startObj["dy1"];
                    	y2 = e.pageY - self.offset().top - startObj["dy2"];
                    	
                        dragElement.attr({x1: x1, x2: x2, y1: y1, y2: y2});
                        $(".line-start-" + index).attr({x: dragElement.attr("x1") - 4, y: dragElement.attr("y1") - 4});
                        $(".line-end-" + index).attr({x: dragElement.attr("x2") - 4, y: dragElement.attr("y2") - 4});
                    } else if(dragElement.hasClass("layer") && targetElement.hasClass("selected")){
                    	// 21.05.16 - 크로니움 버그 발생하여 borderSize * 2 추가 (패치영향?)
                        targetElement.css({
                            left: e.pageX - startObj["positionLeft"] - startObj["layerLeft"] - selectedObj["borderSize"] * 2,
                            top: e.pageY - startObj["positionTop"] - startObj["layerTop"] - selectedObj["borderSize"] * 2
                        });
                    } else if(dragElement.hasClass("fa-arrows")){
                        targetElement.css({
                            left: e.pageX - startObj["positionLeft"] - startObj["layerLeft"],
                            top: e.pageY - startObj["positionTop"] - startObj["layerTop"]
                        });
                    } else if (dragElement.hasClass("dot") && targetElement.hasClass("selected")){
                        if(dragElement.hasClass("dot-left-middle")){
                            var width = startObj["innerWidth"] + startObj["positionLeft"] + startObj["layerLeft"] - e.pageX;
                            var left = e.pageX - startObj["layerLeft"]
                            if(width <= 15) return;
                            targetElement.css({
                                width: width,
                                left: left
                            });
                        } else if(dragElement.hasClass("dot-left-top")){
                            var width = startObj["innerWidth"] + startObj["positionLeft"] + startObj["layerLeft"] - e.pageX;
                            var height = startObj["innerHeight"] + startObj["positionTop"] + startObj["layerTop"] - e.pageY;
                            var left = e.pageX - startObj["layerLeft"];
                            var top = e.pageY - startObj["layerTop"]
                            if(width <= 15) return;
                            if(height <= 15) return;
                            targetElement.css({
                                width: width,
                                height: height,
                                left: left,
                                top: top
                            });
                        } else if(dragElement.hasClass("dot-center-top")){
                            var height = startObj["innerHeight"] + startObj["positionTop"] + startObj["layerTop"] - e.pageY;
                            var top = e.pageY - startObj["layerTop"]
                            if(height <= 15) return;
                            targetElement.css({
                                height: height,
                                top: top
                            });
                        } else if(dragElement.hasClass("dot-right-middle")){
                            var width = e.pageX - startObj["positionLeft"] - startObj["layerLeft"];
                            var left = startObj["positionLeft"];
                            if(width <= 15) return;
                            targetElement.css({
                                width: width,
                                left: left
                            });
                        } else if(dragElement.hasClass("dot-right-top")){
                            var width = e.pageX - startObj["positionLeft"] - startObj["layerLeft"];
                            var height = startObj["innerHeight"] + startObj["positionTop"] + startObj["layerTop"] - e.pageY;
                            var left = startObj["positionLeft"];
                            var top = e.pageY - startObj["layerTop"];
                            if(width <= 15) return;
                            if(height <= 15) return;
                            targetElement.css({
                                width: width,
                                height: height,
                                left: left,
                                top: top
                            });
                        } else if(dragElement.hasClass("dot-left-bottom")){
                            var width = startObj["positionLeft"] + startObj["innerWidth"] + startObj["layerLeft"] - e.pageX;
                            var height = e.pageY - startObj["positionTop"] - startObj["layerTop"];
                            var left = e.pageX - startObj["layerLeft"];
                            var top = startObj["positionTop"];
                            if(width <= 15) return;
                            if(height <= 15) return;
                            targetElement.css({
                                width: width,
                                height: height,
                                left: left,
                                top: top
                            });
                        } else if(dragElement.hasClass("dot-center-bottom")){
                            var height = e.pageY - startObj["positionTop"] - startObj["layerTop"];
                            var top = startObj["positionTop"];
                            if(height <= 15) return;
                            targetElement.css({
                                width: width,
                                height: height,
                                left: left,
                                top: top
                            });
                        } else if(dragElement.hasClass("dot-right-bottom")){
                            var width = e.pageX - startObj["positionLeft"] - startObj["layerLeft"];
                            var height = e.pageY - startObj["positionTop"] - startObj["layerTop"];
                            var left = startObj["positionLeft"];
                            var top = startObj["positionTop"];
                            if(width <= 15) return;
                            if(height <= 15) return;
                            targetElement.css({
                                width: width,
                                height: height,
                                left: left,
                                top: top
                            });
                        }
                    }
                    break;
                case "line":
                    dragElement.attr({
                        x2: e.pageX - self.offset().left,
                        y2: e.pageY - self.offset().top,
                    });
                    break;
                case "text":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
                case "eraser":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
                // 20211018 추가
                case "esign":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
                case "approvalsign":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
                // //20211018 추가
                case "textbox":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
                case "essay":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
                case "radio":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
                case "check":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
                case "select":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
                case "linematch":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
                case "toggle":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
                case "fx":
                    var width = Math.abs((e.pageX - self.offset().left) - startObj["x"]);
                    var height = Math.abs((e.pageY - self.offset().top) - startObj["y"]);
                    var x = (e.pageX - self.offset().left) > startObj["x"] ? startObj["x"] : (e.pageX - self.offset().left);
                    var y = (e.pageY - self.offset().top) > startObj["y"] ? startObj["y"] : (e.pageY - self.offset().top);

                    $(dragElement).attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    });
                    break;
            }
        }
    }).mouseup(function(e){
        if(e.which !== 1) return;
        var self = $(this);
        if(dragFlag){
            dragFlag = false;
            unBlockUI();
            if(!selectedItem) return;
            switch (selectedItem) {
                case "pointer":
                    if(typeof dragElement == "undefined") return;
                    if(dragElement === null) return;
                    if(dragElement.hasClass("line-resize") && dragElement.hasClass("selected")){
                        var index = dragElement.attr("index");
                        var line = $("#line" + index);
                        selectedObj["x"] = line.attr("x1");
                        selectedObj["width"] = line.attr("x2");
                        selectedObj["y"] = line.attr("y1");
                        selectedObj["height"] = line.attr("y2");
                        objChange(selectedObj);
                    } else if(dragElement.hasClass("line") && dragElement.hasClass("selected")){
                        selectedObj["x"] = dragElement.attr("x1");
                        selectedObj["width"] = dragElement.attr("x2");
                        selectedObj["y"] = dragElement.attr("y1");
                        selectedObj["height"] = dragElement.attr("y2");
                        objChange(selectedObj);
                    } else if (dragElement.hasClass("layer") && targetElement.hasClass("selected")){
                    	var diffX = selectedObj["x"] - targetElement.css("left").replace("px", "");
                    	var diffY = selectedObj["y"] - targetElement.css("top").replace("px", "");
                        selectedObj["width"] = targetElement.outerWidth(),
                        selectedObj["height"] = targetElement.outerHeight(),
                        selectedObj["x"] = targetElement.css("left").replace("px", "");
                        selectedObj["y"] = targetElement.css("top").replace("px", "");
                        
                        // 좌측 영역밖으로 벗어났을시에 처리
                        if(selectedObj["x"] < 0) selectedObj["x"] = 0;
                        if(selectedObj["y"] < 0) selectedObj["y"] = 0;
                        
                        // 우측 영역밖으로 벗어났을시에 처리
                        if(parseInt(selectedObj["x"]) + parseInt(selectedObj["width"]) > 990) selectedObj["x"] = 990 - parseInt(selectedObj["width"]);
                        if(parseInt(selectedObj["y"]) + parseInt(selectedObj["height"]) > 1152) selectedObj["y"] = 1152 - parseInt(selectedObj["height"]);
                        
                        objChange(selectedObj);
                    } else if (dragElement.hasClass("dot") && targetElement.hasClass("selected")){
                        selectedObj["width"] = targetElement.outerWidth(),
                            selectedObj["height"] = targetElement.outerHeight(),
                            selectedObj["x"] = targetElement.css("left").replace("px", "");
                        selectedObj["y"] = targetElement.css("top").replace("px", "");
                        
                        // 좌측 영역밖으로 벗어났을시에 처리
                        if(selectedObj["x"] < 0) selectedObj["x"] = 0;
                        if(selectedObj["y"] < 0) selectedObj["y"] = 0;
                        
                        // 우측 영역밖으로 벗어났을시에 처리
                        if(parseInt(selectedObj["x"]) + parseInt(selectedObj["width"]) > 990) selectedObj["x"] = 990 - parseInt(selectedObj["width"]);
                        if(parseInt(selectedObj["y"]) + parseInt(selectedObj["height"]) > 1152) selectedObj["y"] = 1152 - parseInt(selectedObj["height"]);
                        
                        objChange(selectedObj);
                    } else if(dragElement.hasClass("fa-arrows")){
                        var exampleList = selectedObj["exampleList"];
                        targetElement.closest(".layer").find("div.label").each(function(idx, data){
                            var layer = $(this);
                            exampleList[idx]["x"] = layer.css("left").replace("px", "");
                            exampleList[idx]["y"] = layer.css("top").replace("px", "");
                        });
                        selectedObj["exampleList"] = exampleList;
                        objChange(selectedObj);
                    }
                    break;
                case "line":
                    var x1 = dragElement.attr("x1");
                    var x2 = dragElement.attr("x2");
                    var y1 = dragElement.attr("y1");
                    var y2 = dragElement.attr("y2");

                    var dis_x = x1 - x2;
                    var dix_y = y1 - y2;
                    var result1 = Math.sqrt(Math.abs(dis_x * dis_x) + Math.abs(dix_y * dix_y));

                    if(result1 < 20){
                        dragElement.remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": x1,
                        "y": y1,
                        "width": x2,
                        "height": y2,
                        "fontFamily": "sans-serif",
                        "fontSize": 11,
                        "fontStyle": "000",
                        "fontColor": "#000",
                        "borderSize": "5",
                        "borderColor": null,
                        "backgroundColor": "transparent",
                        "opacity": "1",
                        "lineStartType": "",
                        "lineEndType": "",
                        "lineType": "",
                        "lineColor": "#000"
                    };

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    objSelect(toolSeq);               // 객체 선택

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    $(".line-temp").remove();
                    break;
                case "text":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
                        "fontFamily": "sans-serif",
                        "fontSize": 18,
                        "fontStyle": "000",
                        "fontColor": "#000",
                        "borderSize": "2",
                        "borderColor": "#000",
                        "backgroundColor": "rgba(255,255,255,0)",
                        "opacity": "1",
                        "lineStartType": null,
                        "lineEndType": null,
                        "lineType": null,
                        "lineColor": null,
                        "txt": null
                    };

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동

                    break;
                case "eraser":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
                        "fontFamily": null,
                        "fontSize": null,
                        "fontStyle": null,
                        "fontColor": "#000",
                        "borderSize": 0,
                        "borderColor": "#000",
                        "backgroundColor": "#FFF",
                        "opacity": $("input[name=opacity]").val(),
                        "lineStartType": null,
                        "lineEndType": null,
                        "lineType": null,
                        "lineColor": null
                    };

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    break;
                // 20211018 추가
                case "esign":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": "150",
                        "height": "85",
                        "fontFamily": null,
                        "fontSize": null,
                        "fontStyle": null,
                        "fontColor": "#000",
                        "borderSize": 0,
                        "borderColor": "#000",
                        "backgroundColor": "transparent",
                        "opacity": $("input[name=opacity]").val(),
                        "lineStartType": null,
                        "lineEndType": null,
                        "lineType": null,
                        "lineColor": null
                    };

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    break;
                case "approvalsign":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
                        "fontFamily": null,
                        "fontSize": null,
                        "fontStyle": null,
                        "fontColor": "#000",
                        "borderSize": 0,
                        "borderColor": "#000",
                        "backgroundColor": "transparent",
                        "opacity": $("input[name=opacity]").val(),
                        "lineStartType": null,
                        "lineEndType": null,
                        "lineType": null,
                        "lineColor": null
                    };

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    break;
                // //20211018 추가
                case "textbox":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
                        "fontFamily": "sans-serif",
                        "fontSize": 18,
                        "fontStyle": null,
                        "fontColor": null,
                        "borderSize": "2",
                        "borderColor": "#000",
                        "backgroundColor": "rgba(255,255,255,0)",
                        "opacity": "1",
                        "lineStartType": null,
                        "lineEndType": null,
                        "lineType": null,
                        "lineColor": null,
                        "allot": allotScore,
                        "answerList": []
                    };
                    
                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택
                    makeScore();

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    settingPopup(e);
                    break;
                case "essay":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "quesNo": null,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
                        "fontFamily": "sans-serif",
                        "fontSize": 18,
                        "fontStyle": null,
                        "fontColor": "#000",
                        "borderSize": "2",
                        "borderColor": "#000",
                        "backgroundColor": "rgba(255,255,255,0)",
                        "opacity": "1",
                        "lineStartType": null,
                        "lineEndType": null,
                        "lineType": null,
                        "lineColor": null,
                        "txt": "",
                        "allot": null,
                        "answerList": []
                    };
                    
                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택
                    makeScore();

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    settingPopup(e);
                    break;
                case "radio":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
                        "fontFamily": null,
                        "fontSize": "18",
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
                        "allot": allotScore,
                        "answerList": []
                    };
                    
                    var exampleList = [];
                    for(var i=0; i<selectedCnt; i++){
                        var o = {
                            "wsQuesExamSeq": i+1,
                            "toolSeq": toolSeq,
                            "sheetPage": selectedPage,
                            "toolCd": selectedItem,
                            "x": 15,
                            "y": i * (parseInt(18) + 15),
                            "width": null,
                            "height": null,
                            "fontFamily": null,
                            "fontSize": null,
                            "fontStyle": null,
                            "fontColor": "#000",
                            "borderSize": 0,
                            "borderColor": "#000",
                            "backgroundColor": "transparent",
                            "opacity": "1"
                        }
                        exampleList.push(o);
                    }
                    obj["exampleList"] = exampleList;

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택
                    makeScore();

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    break;
                case "check":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
                        "fontFamily": null,
                        "fontSize": 18,
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
                        "allot": allotScore,
                        "answerList": []
                    };

                    var exampleList = [];
                    for(var i=0; i<selectedCnt; i++){
                        var o = {
                            "wsQuesExamSeq": i+1,
                            "toolSeq": toolSeq,
                            "sheetPage": selectedPage,
                            "toolCd": selectedItem,
                            "x": 15,
                            "y": i * (parseInt(18) + 15),
                            "width": null,
                            "height": null,
                            "fontFamily": null,
                            "fontSize": null,
                            "fontStyle": null,
                            "fontColor": "#000",
                            "borderSize": 0,
                            "borderColor": "#000",
                            "backgroundColor": "transparent",
                            "opacity": "1"
                        }
                        exampleList.push(o);
                    }
                    obj["exampleList"] = exampleList;

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택
                    makeScore();

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    break;
                case "select":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
                        "fontFamily": "sans-serif",
                        "fontSize": 18,
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
                        "allot": allotScore,
                        "answerList": []
                    };

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택
                    makeScore();

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    settingPopup(e);
                    break;
                case "linematch":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
                        "fontFamily": null,
                        "fontSize": 16,
                        "fontStyle": null,
                        "fontColor": "#000",
                        "borderSize": 1,
                        "borderColor": "#000",
                        "backgroundColor": "transparent",
                        "opacity": "1",
                        "lineStartType": null,
                        "lineEndType": null,
                        "lineType": null,
                        "lineColor": null,
                        "allot": allotScore,
                        "answerList": []
                    };

                    var exampleList = [];

                    var selectedCntArr = selectedCnt.split(",");
                    var idx = 1;

                    for(var i=0; i<selectedCntArr[0]; i++){
                        var o = {
                            "wsQuesExamSeq": idx++,
                            "toolSeq": toolSeq,
                            "sheetPage": selectedPage,
                            "toolCd": selectedItem,
                            "x": 15,
                            "y": i * 28,
                            "width": null,
                            "height": null,
                            "fontFamily": null,
                            "fontSize": null,
                            "fontStyle": null,
                            "fontColor": "#000",
                            "borderSize": 0,
                            "borderColor": "#000",
                            "backgroundColor": "transparent",
                            "opacity": "1"
                        }
                        exampleList.push(o);
                    }

                    for(var i=0; i<selectedCntArr[1]; i++){
                        var o = {
                            "wsQuesExamSeq": idx++,
                            "toolSeq": toolSeq,
                            "sheetPage": selectedPage,
                            "toolCd": selectedItem,
                            "x": 115,
                            "y": i * 28,
                            "width": null,
                            "height": null,
                            "fontFamily": null,
                            "fontSize": null,
                            "fontStyle": null,
                            "fontColor": "#000",
                            "borderSize": 0,
                            "borderColor": "#000",
                            "backgroundColor": "transparent",
                            "opacity": "1"
                        }
                        exampleList.push(o);
                    }

                    if(selectedCntArr[2] != ""){
                        for(var i=0; i<selectedCntArr[2]; i++){
                            var o = {
                                "wsQuesExamSeq": idx++,
                                "toolSeq": toolSeq,
                                "sheetPage": selectedPage,
                                "toolCd": selectedItem,
                                "x": 215,
                                "y": i * 28,
                                "width": null,
                                "height": null,
                                "fontFamily": null,
                                "fontSize": null,
                                "fontStyle": null,
                                "fontColor": "#000",
                                "borderSize": 0,
                                "borderColor": "#000",
                                "backgroundColor": "transparent",
                                "opacity": "1"
                            }
                            exampleList.push(o);
                        }
                    }

                    obj["exampleList"] = exampleList;

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택
                    makeScore();

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    break;
                case "toggle":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "quesNo": selectedCnt,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
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
                        "allot": allotScore,
                        "answerList": []
                    };

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택
                    makeScore();

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    break;
                case "fx":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "quesNo": selectedCnt,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
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
                        "allot": allotScore,
                        "answerList": []
                    };

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택
                    makeScore();

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    settingPopup(e);
                    break;
            }

            dragElement = null;
            targetElement = null;
        }
    }).mouseleave(function(e){
        var self = $(this);
        if(dragFlag){
            var elementsMouseIsOver = document.elementsFromPoint(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset);
            for(var idx in elementsMouseIsOver){
                if($(elementsMouseIsOver[idx]).is("svg")){
                    return;
                }
            }

            dragFlag = false;
            unBlockUI();
            if(!selectedItem) return;
            switch (selectedItem) {
	            case "pointer":
	                if(typeof dragElement == "undefined") return;
	                if(dragElement === null) return;
	                if(dragElement.hasClass("line-resize") && dragElement.hasClass("selected")){
	                    var index = dragElement.attr("index");
	                    var line = $("#line" + index);
	                    selectedObj["x"] = line.attr("x1");
	                    selectedObj["width"] = line.attr("x2");
	                    selectedObj["y"] = line.attr("y1");
	                    selectedObj["height"] = line.attr("y2");
	                    objChange(selectedObj);
	                } else if(dragElement.hasClass("line") && dragElement.hasClass("selected")){
	                    selectedObj["x"] = dragElement.attr("x1");
	                    selectedObj["width"] = dragElement.attr("x2");
	                    selectedObj["y"] = dragElement.attr("y1");
	                    selectedObj["height"] = dragElement.attr("y2");
	                    objChange(selectedObj);
	                } else if (dragElement.hasClass("layer") && targetElement.hasClass("selected")){
	                	var diffX = selectedObj["x"] - targetElement.css("left").replace("px", "");
	                	var diffY = selectedObj["y"] - targetElement.css("top").replace("px", "");
	                    selectedObj["width"] = targetElement.outerWidth(),
	                    selectedObj["height"] = targetElement.outerHeight(),
	                    selectedObj["x"] = targetElement.css("left").replace("px", "");
	                    selectedObj["y"] = targetElement.css("top").replace("px", "");
	                    
	                    // 좌측 영역밖으로 벗어났을시에 처리
	                    if(selectedObj["x"] < 0) selectedObj["x"] = 0;
	                    if(selectedObj["y"] < 0) selectedObj["y"] = 0;
	                    
	                    // 우측 영역밖으로 벗어났을시에 처리
	                    if(parseInt(selectedObj["x"]) + parseInt(selectedObj["width"]) > 990) selectedObj["x"] = 990 - parseInt(selectedObj["width"]);
	                    if(parseInt(selectedObj["y"]) + parseInt(selectedObj["height"]) > 1152) selectedObj["y"] = 1152 - parseInt(selectedObj["height"]);
	                    
	                    objChange(selectedObj);
	                } else if (dragElement.hasClass("dot") && targetElement.hasClass("selected")){
	                    selectedObj["width"] = targetElement.outerWidth(),
	                        selectedObj["height"] = targetElement.outerHeight(),
	                        selectedObj["x"] = targetElement.css("left").replace("px", "");
	                    selectedObj["y"] = targetElement.css("top").replace("px", "");
	                    
	                    // 좌측 영역밖으로 벗어났을시에 처리
	                    if(selectedObj["x"] < 0) selectedObj["x"] = 0;
	                    if(selectedObj["y"] < 0) selectedObj["y"] = 0;
	                    
	                    // 우측 영역밖으로 벗어났을시에 처리
	                    if(parseInt(selectedObj["x"]) + parseInt(selectedObj["width"]) > 990) selectedObj["x"] = 990 - parseInt(selectedObj["width"]);
	                    if(parseInt(selectedObj["y"]) + parseInt(selectedObj["height"]) > 1152) selectedObj["y"] = 1152 - parseInt(selectedObj["height"]);
	                    
	                    objChange(selectedObj);
	                } else if(dragElement.hasClass("fa-arrows")){
	                    var exampleList = selectedObj["exampleList"];
	                    targetElement.closest(".layer").find("div.label").each(function(idx, data){
	                        var layer = $(this);
	                        exampleList[idx]["x"] = layer.css("left").replace("px", "");
	                        exampleList[idx]["y"] = layer.css("top").replace("px", "");
	                    });
	                    selectedObj["exampleList"] = exampleList;
	                    objChange(selectedObj);
	                }
	                break;
	            case "line":
	                var x1 = dragElement.attr("x1");
	                var x2 = dragElement.attr("x2");
	                var y1 = dragElement.attr("y1");
	                var y2 = dragElement.attr("y2");
	
	                var dis_x = x1 - x2;
	                var dix_y = y1 - y2;
	                var result1 = Math.sqrt(Math.abs(dis_x * dis_x) + Math.abs(dix_y * dix_y));
	
	                if(result1 < 20){
	                    dragElement.remove();
	                    return;
	                }
	
	                var toolSeq = getNextWsToolSeq();
	                var obj = {
	                    "toolSeq": toolSeq,
	                    "sheetPage": selectedPage,
	                    "toolCd": selectedItem,
	                    "x": x1,
	                    "y": y1,
	                    "width": x2,
	                    "height": y2,
	                    "fontFamily": "sans-serif",
	                    "fontSize": 11,
	                    "fontStyle": "000",
	                    "fontColor": "#000",
	                    "borderSize": "5",
	                    "borderColor": null,
	                    "backgroundColor": "transparent",
	                    "opacity": "1",
	                    "lineStartType": "",
	                    "lineEndType": "",
	                    "lineType": "",
	                    "lineColor": "#000"
	                };
	
	                $(".selected").removeClass("selected");
	                objPush(obj);                       // 객체 등록
	                objSelect(toolSeq);               // 객체 선택
	
	                $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
	                $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
	                btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
	                $(".line-temp").remove();
	                break;
	            case "text":
	                var de = $(dragElement);
	
	                // 15 x 15 이하면 요소 만들지 않음
	                if(de.attr("width") <= 15 || de.attr("height") <= 15){
	                    $(dragElement).remove();
	                    return;
	                }
	
	                var toolSeq = getNextWsToolSeq();
	                var obj = {
	                    "toolSeq": toolSeq,
	                    "sheetPage": selectedPage,
	                    "toolCd": selectedItem,
	                    "x": de.attr("x"),
	                    "y": de.attr("y"),
	                    "width": de.attr("width"),
	                    "height": de.attr("height"),
	                    "fontFamily": "sans-serif",
	                    "fontSize": 18,
	                    "fontStyle": "000",
	                    "fontColor": "#000",
	                    "borderSize": "2",
	                    "borderColor": "#000",
	                    "backgroundColor": "rgba(255,255,255,0)",
	                    "opacity": "1",
	                    "lineStartType": null,
	                    "lineEndType": null,
	                    "lineType": null,
	                    "lineColor": null,
	                    "txt": null
	                };
	
	                $(".selected").removeClass("selected");
	                objPush(obj);                       // 객체 등록
	                de.remove();                        // 드래그 한 SVG 요소 삭제
	                objSelect(toolSeq);               // 객체 선택
	
	                $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
	                $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
	                btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
	
	                break;
	            case "eraser":
	                var de = $(dragElement);
	
	                // 15 x 15 이하면 요소 만들지 않음
	                if(de.attr("width") <= 15 || de.attr("height") <= 15){
	                    $(dragElement).remove();
	                    return;
	                }
	
	                var toolSeq = getNextWsToolSeq();
	                var obj = {
	                    "toolSeq": toolSeq,
	                    "sheetPage": selectedPage,
	                    "toolCd": selectedItem,
	                    "x": de.attr("x"),
	                    "y": de.attr("y"),
	                    "width": de.attr("width"),
	                    "height": de.attr("height"),
	                    "fontFamily": null,
	                    "fontSize": null,
	                    "fontStyle": null,
	                    "fontColor": "#000",
	                    "borderSize": 0,
	                    "borderColor": "#000",
	                    "backgroundColor": "#FFF",
	                    "opacity": $("input[name=opacity]").val(),
	                    "lineStartType": null,
	                    "lineEndType": null,
	                    "lineType": null,
	                    "lineColor": null
	                };
	
	                $(".selected").removeClass("selected");
	                objPush(obj);                       // 객체 등록
	                de.remove();                        // 드래그 한 SVG 요소 삭제
	                objSelect(toolSeq);               // 객체 선택
	
	                $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
	                $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
	                btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
	                break;
                // 20211018 추가
                case "esign":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": "150",
                        "height": "85",
                        "fontFamily": null,
                        "fontSize": null,
                        "fontStyle": null,
                        "fontColor": "#000",
                        "borderSize": 0,
                        "borderColor": "#000",
                        "backgroundColor": "transparent",
                        "opacity": $("input[name=opacity]").val(),
                        "lineStartType": null,
                        "lineEndType": null,
                        "lineType": null,
                        "lineColor": null
                    };

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    break;
                case "approvalsign":
                    var de = $(dragElement);

                    // 15 x 15 이하면 요소 만들지 않음
                    if(de.attr("width") <= 15 || de.attr("height") <= 15){
                        $(dragElement).remove();
                        return;
                    }

                    var toolSeq = getNextWsToolSeq();
                    var obj = {
                        "toolSeq": toolSeq,
                        "sheetPage": selectedPage,
                        "toolCd": selectedItem,
                        "x": de.attr("x"),
                        "y": de.attr("y"),
                        "width": de.attr("width"),
                        "height": de.attr("height"),
                        "fontFamily": null,
                        "fontSize": null,
                        "fontStyle": null,
                        "fontColor": "#000",
                        "borderSize": 0,
                        "borderColor": "#000",
                        "backgroundColor": "transparent",
                        "opacity": $("input[name=opacity]").val(),
                        "lineStartType": null,
                        "lineEndType": null,
                        "lineType": null,
                        "lineColor": null
                    };

                    $(".selected").removeClass("selected");
                    objPush(obj);                       // 객체 등록
                    de.remove();                        // 드래그 한 SVG 요소 삭제
                    objSelect(toolSeq);               // 객체 선택

                    $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
                    $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
                    btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
                    break;
                // //20211018 추가
	            case "textbox":
	                var de = $(dragElement);
	
	                // 15 x 15 이하면 요소 만들지 않음
	                if(de.attr("width") <= 15 || de.attr("height") <= 15){
	                    $(dragElement).remove();
	                    return;
	                }
	
	                var toolSeq = getNextWsToolSeq();
	                var obj = {
	                    "toolSeq": toolSeq,
	                    "sheetPage": selectedPage,
	                    "toolCd": selectedItem,
	                    "x": de.attr("x"),
	                    "y": de.attr("y"),
	                    "width": de.attr("width"),
	                    "height": de.attr("height"),
	                    "fontFamily": "sans-serif",
	                    "fontSize": 18,
	                    "fontStyle": null,
	                    "fontColor": null,
	                    "borderSize": "2",
	                    "borderColor": "#000",
	                    "backgroundColor": "rgba(255,255,255,0)",
	                    "opacity": "1",
	                    "lineStartType": null,
	                    "lineEndType": null,
	                    "lineType": null,
	                    "lineColor": null,
	                    "allot": allotScore,
	                    "answerList": []
	                };
	                
	                $(".selected").removeClass("selected");
	                objPush(obj);                       // 객체 등록
	                de.remove();                        // 드래그 한 SVG 요소 삭제
	                objSelect(toolSeq);               // 객체 선택
	                makeScore();
	
	                $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
	                $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
	                btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
	                settingPopup(e);
	                break;
	            case "essay":
	                var de = $(dragElement);
	
	                // 15 x 15 이하면 요소 만들지 않음
	                if(de.attr("width") <= 15 || de.attr("height") <= 15){
	                    $(dragElement).remove();
	                    return;
	                }
	
	                var toolSeq = getNextWsToolSeq();
	                var obj = {
	                    "toolSeq": toolSeq,
	                    "sheetPage": selectedPage,
	                    "toolCd": selectedItem,
	                    "quesNo": null,
	                    "x": de.attr("x"),
	                    "y": de.attr("y"),
	                    "width": de.attr("width"),
	                    "height": de.attr("height"),
	                    "fontFamily": "sans-serif",
	                    "fontSize": 18,
	                    "fontStyle": null,
	                    "fontColor": "#000",
	                    "borderSize": "2",
	                    "borderColor": "#000",
	                    "backgroundColor": "rgba(255,255,255,0)",
	                    "opacity": "1",
	                    "lineStartType": null,
	                    "lineEndType": null,
	                    "lineType": null,
	                    "lineColor": null,
	                    "txt": "",
	                    "allot": null,
	                    "answerList": []
	                };
	                
	                $(".selected").removeClass("selected");
	                objPush(obj);                       // 객체 등록
	                de.remove();                        // 드래그 한 SVG 요소 삭제
	                objSelect(toolSeq);               // 객체 선택
	                makeScore();
	
	                $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
	                $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
	                btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
	                settingPopup(e);
	                break;
	            case "radio":
	                var de = $(dragElement);
	
	                // 15 x 15 이하면 요소 만들지 않음
	                if(de.attr("width") <= 15 || de.attr("height") <= 15){
	                    $(dragElement).remove();
	                    return;
	                }
	
	                var toolSeq = getNextWsToolSeq();
	                var obj = {
	                    "toolSeq": toolSeq,
	                    "sheetPage": selectedPage,
	                    "toolCd": selectedItem,
	                    "x": de.attr("x"),
	                    "y": de.attr("y"),
	                    "width": de.attr("width"),
	                    "height": de.attr("height"),
	                    "fontFamily": null,
	                    "fontSize": "18",
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
	                    "allot": allotScore,
	                    "answerList": []
	                };
	                
	                var exampleList = [];
	                for(var i=0; i<selectedCnt; i++){
	                    var o = {
	                        "wsQuesExamSeq": i+1,
	                        "toolSeq": toolSeq,
	                        "sheetPage": selectedPage,
	                        "toolCd": selectedItem,
	                        "x": 15,
	                        "y": i * (parseInt(18) + 15),
	                        "width": null,
	                        "height": null,
	                        "fontFamily": null,
	                        "fontSize": null,
	                        "fontStyle": null,
	                        "fontColor": "#000",
	                        "borderSize": 0,
	                        "borderColor": "#000",
	                        "backgroundColor": "transparent",
	                        "opacity": "1"
	                    }
	                    exampleList.push(o);
	                }
	                obj["exampleList"] = exampleList;
	
	                $(".selected").removeClass("selected");
	                objPush(obj);                       // 객체 등록
	                de.remove();                        // 드래그 한 SVG 요소 삭제
	                objSelect(toolSeq);               // 객체 선택
	                makeScore();
	
	                $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
	                $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
	                btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
	                break;
	            case "check":
	                var de = $(dragElement);
	
	                // 15 x 15 이하면 요소 만들지 않음
	                if(de.attr("width") <= 15 || de.attr("height") <= 15){
	                    $(dragElement).remove();
	                    return;
	                }
	
	                var toolSeq = getNextWsToolSeq();
	                var obj = {
	                    "toolSeq": toolSeq,
	                    "sheetPage": selectedPage,
	                    "toolCd": selectedItem,
	                    "x": de.attr("x"),
	                    "y": de.attr("y"),
	                    "width": de.attr("width"),
	                    "height": de.attr("height"),
	                    "fontFamily": null,
	                    "fontSize": 18,
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
	                    "allot": allotScore,
	                    "answerList": []
	                };
	
	                var exampleList = [];
	                for(var i=0; i<selectedCnt; i++){
	                    var o = {
	                        "wsQuesExamSeq": i+1,
	                        "toolSeq": toolSeq,
	                        "sheetPage": selectedPage,
	                        "toolCd": selectedItem,
	                        "x": 15,
	                        "y": i * (parseInt(18) + 15),
	                        "width": null,
	                        "height": null,
	                        "fontFamily": null,
	                        "fontSize": null,
	                        "fontStyle": null,
	                        "fontColor": "#000",
	                        "borderSize": 0,
	                        "borderColor": "#000",
	                        "backgroundColor": "transparent",
	                        "opacity": "1"
	                    }
	                    exampleList.push(o);
	                }
	                obj["exampleList"] = exampleList;
	
	                $(".selected").removeClass("selected");
	                objPush(obj);                       // 객체 등록
	                de.remove();                        // 드래그 한 SVG 요소 삭제
	                objSelect(toolSeq);               // 객체 선택
	                makeScore();
	
	                $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
	                $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
	                btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
	                break;
	            case "select":
	                var de = $(dragElement);
	
	                // 15 x 15 이하면 요소 만들지 않음
	                if(de.attr("width") <= 15 || de.attr("height") <= 15){
	                    $(dragElement).remove();
	                    return;
	                }
	
	                var toolSeq = getNextWsToolSeq();
	                var obj = {
	                    "toolSeq": toolSeq,
	                    "sheetPage": selectedPage,
	                    "toolCd": selectedItem,
	                    "x": de.attr("x"),
	                    "y": de.attr("y"),
	                    "width": de.attr("width"),
	                    "height": de.attr("height"),
	                    "fontFamily": "sans-serif",
	                    "fontSize": 18,
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
	                    "allot": allotScore,
	                    "answerList": []
	                };
	
	                $(".selected").removeClass("selected");
	                objPush(obj);                       // 객체 등록
	                de.remove();                        // 드래그 한 SVG 요소 삭제
	                objSelect(toolSeq);               // 객체 선택
	                makeScore();
	
	                $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
	                $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
	                btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
	                settingPopup(e);
	                break;
	            case "linematch":
	                var de = $(dragElement);
	
	                // 15 x 15 이하면 요소 만들지 않음
	                if(de.attr("width") <= 15 || de.attr("height") <= 15){
	                    $(dragElement).remove();
	                    return;
	                }
	
	                var toolSeq = getNextWsToolSeq();
	                var obj = {
	                    "toolSeq": toolSeq,
	                    "sheetPage": selectedPage,
	                    "toolCd": selectedItem,
	                    "x": de.attr("x"),
	                    "y": de.attr("y"),
	                    "width": de.attr("width"),
	                    "height": de.attr("height"),
	                    "fontFamily": null,
	                    "fontSize": 16,
	                    "fontStyle": null,
	                    "fontColor": "#000",
	                    "borderSize": 1,
	                    "borderColor": "#000",
	                    "backgroundColor": "transparent",
	                    "opacity": "1",
	                    "lineStartType": null,
	                    "lineEndType": null,
	                    "lineType": null,
	                    "lineColor": null,
	                    "allot": allotScore,
	                    "answerList": []
	                };
	
	                var exampleList = [];
	
	                var selectedCntArr = selectedCnt.split(",");
	                var idx = 1;
	
	                for(var i=0; i<selectedCntArr[0]; i++){
	                    var o = {
	                        "wsQuesExamSeq": idx++,
	                        "toolSeq": toolSeq,
	                        "sheetPage": selectedPage,
	                        "toolCd": selectedItem,
	                        "x": 15,
	                        "y": i * 28,
	                        "width": null,
	                        "height": null,
	                        "fontFamily": null,
	                        "fontSize": null,
	                        "fontStyle": null,
	                        "fontColor": "#000",
	                        "borderSize": 0,
	                        "borderColor": "#000",
	                        "backgroundColor": "transparent",
	                        "opacity": "1"
	                    }
	                    exampleList.push(o);
	                }
	
	                for(var i=0; i<selectedCntArr[1]; i++){
	                    var o = {
	                        "wsQuesExamSeq": idx++,
	                        "toolSeq": toolSeq,
	                        "sheetPage": selectedPage,
	                        "toolCd": selectedItem,
	                        "x": 115,
	                        "y": i * 28,
	                        "width": null,
	                        "height": null,
	                        "fontFamily": null,
	                        "fontSize": null,
	                        "fontStyle": null,
	                        "fontColor": "#000",
	                        "borderSize": 0,
	                        "borderColor": "#000",
	                        "backgroundColor": "transparent",
	                        "opacity": "1"
	                    }
	                    exampleList.push(o);
	                }
	
	                if(selectedCntArr[2] != ""){
	                    for(var i=0; i<selectedCntArr[2]; i++){
	                        var o = {
	                            "wsQuesExamSeq": idx++,
	                            "toolSeq": toolSeq,
	                            "sheetPage": selectedPage,
	                            "toolCd": selectedItem,
	                            "x": 215,
	                            "y": i * 28,
	                            "width": null,
	                            "height": null,
	                            "fontFamily": null,
	                            "fontSize": null,
	                            "fontStyle": null,
	                            "fontColor": "#000",
	                            "borderSize": 0,
	                            "borderColor": "#000",
	                            "backgroundColor": "transparent",
	                            "opacity": "1"
	                        }
	                        exampleList.push(o);
	                    }
	                }
	
	                obj["exampleList"] = exampleList;
	
	                $(".selected").removeClass("selected");
	                objPush(obj);                       // 객체 등록
	                de.remove();                        // 드래그 한 SVG 요소 삭제
	                objSelect(toolSeq);               // 객체 선택
	                makeScore();
	
	                $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
	                $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
	                btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
	                break;
	            case "toggle":
	                var de = $(dragElement);
	
	                // 15 x 15 이하면 요소 만들지 않음
	                if(de.attr("width") <= 15 || de.attr("height") <= 15){
	                    $(dragElement).remove();
	                    return;
	                }
	
	                var toolSeq = getNextWsToolSeq();
	                var obj = {
	                    "toolSeq": toolSeq,
	                    "sheetPage": selectedPage,
	                    "toolCd": selectedItem,
	                    "quesNo": selectedCnt,
	                    "x": de.attr("x"),
	                    "y": de.attr("y"),
	                    "width": de.attr("width"),
	                    "height": de.attr("height"),
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
	                    "allot": allotScore,
	                    "answerList": []
	                };
	
	                $(".selected").removeClass("selected");
	                objPush(obj);                       // 객체 등록
	                de.remove();                        // 드래그 한 SVG 요소 삭제
	                objSelect(toolSeq);               // 객체 선택
	                makeScore();
	
	                $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
	                $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
	                btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
	                break;
	            case "fx":
	                var de = $(dragElement);
	
	                // 15 x 15 이하면 요소 만들지 않음
	                if(de.attr("width") <= 15 || de.attr("height") <= 15){
	                    $(dragElement).remove();
	                    return;
	                }
	
	                var toolSeq = getNextWsToolSeq();
	                var obj = {
	                    "toolSeq": toolSeq,
	                    "sheetPage": selectedPage,
	                    "toolCd": selectedItem,
	                    "quesNo": selectedCnt,
	                    "x": de.attr("x"),
	                    "y": de.attr("y"),
	                    "width": de.attr("width"),
	                    "height": de.attr("height"),
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
	                    "allot": allotScore,
	                    "answerList": []
	                };
	
	                $(".selected").removeClass("selected");
	                objPush(obj);                       // 객체 등록
	                de.remove();                        // 드래그 한 SVG 요소 삭제
	                objSelect(toolSeq);               // 객체 선택
	                makeScore();
	
	                $(".tool-sub .option").hide();      // 서브 박스 버튼 리셋
	                $(".option-" + selectedItem).show();// 텍스트에만 사용하는 버튼 보이기
	                btnPointer.trigger("click");        // 선택 버튼을 클릭하여 선택으로 이동
	                settingPopup(e);
	                break;
	        }

            dragElement = null;
            targetElement = null;
        }
    });
});