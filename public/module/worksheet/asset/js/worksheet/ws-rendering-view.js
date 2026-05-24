/* eslint-disable */
/**
 * objectArr 객체에 담긴 에디터 요소를 화면에 렌더링
 * @param objectArr 에디터 요소를 담은 객체 배열
 * @param answerOption 'a': 수정 가능 | 's': 수정 불가능
 */
function renderingAll(objectArr, answerOption = "n"){
    // 순서대로 렌더링
    const sortKeys = ['eraser', 'text', 'others']
    const essayPositionArray = []
    let sortedRenderingObject = {}
    sortKeys.forEach(k => sortedRenderingObject[k] = [])
    
    objectArr.forEach(o => {
        if (sortKeys.includes(o.toolCd))
            sortedRenderingObject[o.toolCd].push(o)
        else
            sortedRenderingObject[sortKeys[sortKeys.length - 1]].push(o)
    })
    
    for (const values of Object.values(sortedRenderingObject)) {
        $(values).each(function(){
            // test log
            // if (sortKeys.includes($(this).attr('toolCd')))
            //     console.warn('sort rendering toolCd => ', $(this).attr('toolCd'))
            // else
            //     console.log('other rendering toolCd => ', $(this).attr('toolCd'))
            
            rendering(this, answerOption);
    
            if (this.toolCd === 'essay') {
                const essayPosition = {
                    toolSeq: this.toolSeq,
                    x: this.x,
                    y: this.y,
                    sheetPage: this.sheetPage
                }
                essayPositionArray.push(essayPosition)
            }
        });
    }
    
    let tabIndex = 0
    if (essayPositionArray.length > 0) {
        essayPositionArray.sort(function(a, b){
            /**
             * 1px 단위 절삭한 a와 b의 Y좌표가 같은 경우 X좌표로 정렬하도록 함
             */
            const aY = Math.floor(a.y / 10) * 10
            const bY = Math.floor(b.y / 10) * 10
            
            if (aY === bY)
                return a.x - b.x
            else
                return a.y - b.y
        });
        // essayPositionArray.sort((a, b) => {
        //     return a.toolSeq - b.toolSeq
        // })
        essayPositionArray.sort((a,b) => a.sheetPage - b.sheetPage).forEach(essayPosition => {
            $("textarea[name=essay-" + essayPosition.toolSeq + "]").attr("tabindex", ++tabIndex)
        })
    }
}

/**
 * answerOption
 * s - 정답표시
 * h - 정답복사후 숨기기 
 */
function rendering(object, opt){
    switch (object["toolCd"]){
        case "line":
        	
        	// 화살표 설정
            d3.select("svg defs").append("marker")
                .attr("id", "arrow" + object["toolSeq"])
                .attr("class", "line-" + object["toolSeq"])
                .attr("viewBox", "0 0 10 10")
                .attr("refX", "5")
                .attr("refY", "5")
                .attr("markerWidth", "15")
                .attr("markerHeight", "15")
                .attr("orient", "auto-start-reverse");

            d3.select("#arrow" + object["toolSeq"]).append("path")
                .attr("d", "M 0 0 L 10 5 L 0 10 z")
                .attr("fill", object["lineColor"]);

            // 라인 설정
            var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            var obj = {
                "id": "line" + object["toolSeq"],
                "index": object["toolSeq"],
                "class": "selected line line-" + object["toolSeq"],
                "itemType": "line",
                "x1": object["x"],
                "x2": object["width"],
                "y1": object["y"],
                "y2": object["height"],
                "stroke": object["lineColor"],
                "stroke-width": object["borderSize"],
                "stroke-dasharray": object["lineType"],
                "marker-start": object["lineStartType"] === "arrow" ? "url(" + "#arrow" + object["toolSeq"] + ")" : "",
                "marker-end": object["lineEndType"] === "arrow" ? "url(" + "#arrow" + object["toolSeq"] + ")" : ""
            }

            $(line).attr(obj); // 라인 속성값 주입
            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("svg").append(line); // 라인 추가 (SVG)

            break;
        case "text":
        	
        	// 텍스트 요소 생성
            var element = $("<div>");
            element.addClass("text-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "text");
            
            var fontStyle = object["fontStyle"];
            var fontWeight = fontStyle.substring(0, 1); // 텍스트 굵기 
            var fontItalic = fontStyle.substring(1, 2); // 텍스트 기울기
            var fontUnderline = fontStyle.substring(2, 3); // 텍스트 밑줄
            
            // 텍스트 박스 설정
            element.css({
                "width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"],
                /*"font-family": object["fontFamily"],
                "font-size": object["fontSize"] + "px",
                "line-height": object["fontSize"] + "px",
                "font-weight": fontWeight === "1" ? "bold" : "normal",
                "font-style": fontItalic === "1" ? "italic" : "",
                "text-decoration": fontUnderline === "1" ? "underline" : "",
                "color": object["fontColor"]*/
            });

            element.data("toolSeq", object["toolSeq"]);
            
            // 설명 요소 클릭 시 포커싱되지 않도록 처리
            // element.html("<textarea readonly='readonly'></textarea>");
            element.html("<textarea disabled='disabled'></textarea>");

            // 텍스트 설정
            element.find("textarea").css({
                "font-family": object["fontFamily"],
                "font-size": object["fontSize"] + "px",
                "font-weight": fontWeight === "1" ? "bold" : "normal",
                "font-style": fontItalic === "1" ? "italic" : "",
                "text-decoration": fontUnderline === "1" ? "underline" : "",
                "color": object["fontColor"]
            });
            
            element.find("textarea").val(object["txt"]); // 텍스트 문구
            // element.text(object["txt"]);
    
            if(opt === "s" || opt === "h"){
                const textareaElement = element.find("textarea")
                textareaElement.attr("disabled", true);
                textareaElement.css({
                    color: "inherit !important",
                    cursor: "default"
                })
            }

            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element); // 텍스트 추가
            
            break;
        case "eraser":
            var element = $("<div>");
            element.addClass("eraser-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "eraser");
            element.css({
            	"width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            
            break;
  
        // 20211018 추가
        case "esign":
            var element = $("<div>");
            element.addClass("esign-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "esign");
            element.css({
                "width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });
        
            element.data("toolSeq", object["toolSeq"]);
        
            element.html("<div class='text-esign'><div><strong>제출자 서명</strong>(자동기입)</div></div>");
        
            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
        
            break;
        case "approvalsign":
            var element = $("<div>");
            element.addClass("esign-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "approvalsign");
            element.css({
                "width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });
        
            element.data("toolSeq", object["toolSeq"]);
        
            element.html("<div class='text-esign'><div><strong>결재서명</strong>(자동기입)</div></div>");
            // element.html("<div class='return'></div>"); // 20211026 확인요청 도장 이미지
        
            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
        
            break;
        // //20211018 추가
        
        case "image":
        	var element = $("<div>");
            element.addClass("selected image-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "image");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background": "url(" + object["quesNo"] + ")",
                "background-size": "100% 100%",
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            break;
        case "serverimage":
        	var element = $("<div>");
            element.addClass("selected serverimage-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "serverimage");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background": "url(" + object["quesNo"] + ")",
                "background-size": "100% 100%",
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            break;
        case "sound":
        	var element = $("<div>");
            element.addClass("selected sound-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "sound");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background": "url(" + object["quesNo"] + ")",
                "background-size": "100% 100%",
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<audio preload='none' id='sound" + object["toolSeq"] + "' controls style='max-width:100%;min-height:100%'>" + 
                "<source src='" + object["quesNo"] + "' type='audio/mp3'>" +
                "</audio></div><div class='dot dot-left-top'></div>");

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            
            $('#sound' + object["toolSeq"]).mediaelementplayer({
            	pluginPath: '/asset/js/worksheet/mediaelement/build/',
        		success: function(media) {}
        	});
            break;
        case "youtube":
        	var element = $("<div>");
            element.addClass("selected youtube-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "youtube");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background": "url(" + object["quesNo"] + ")",
                "background-size": "100% 100%",
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<iframe width='100%' height='100%' src='" + object["quesNo"] + "' title='YouTube video player' frameborder='0'  allowfullscreen></iframe>");

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            break;
        case "textbox":
            var element = $("<div>");
            element.addClass("textbox-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "textbox");
            element.css({
            	"width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<input type='text' name='ques"+ object["toolSeq"] +"' style='width:100%; height:100%;' autocomplete='off' />");

            element.find("input").css({
                "font-family": object["fontFamily"],
                "font-size": object["fontSize"] + "px",
                "background-color": object["backgroundColor"],
                "color": object["fontColor"]
            });
            
            if(opt == "s"){
            	element.find("input").val(object["answerList"][0]["answer"]);
            	element.find("input").attr("readonly", true);
            } 
            
            if (opt == "h"){
            	var element2 = $("<div>");
                element2.addClass("textbox-layer layer tool-seq-clone-" + object["toolSeq"]);
                element2.css({
                	"width": object["width"] - object["borderSize"] * 2,
                    "height": object["height"] - object["borderSize"] * 2,
                    "position": "absolute",
                    "top": object["y"] + "px",
                    "left": object["x"] + "px",
                    "border": object["borderSize"] + "px solid " + object["borderColor"],
                    "background-color": object["backgroundColor"],
                    "opacity": object["opacity"],
                	"display": "none"
                });

                element2.html("<input type='text' style='width:100%; height:100%;' autocomplete='off' />");
                element2.find("input").css({
                    "font-family": object["fontFamily"],
                    "font-size": object["fontSize"] + "px",
                    "background-color": object["backgroundColor"],
                    "color": object["fontColor"]
                });
                element2.find("input").val(object["answerList"][0]["answer"]);
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element2);
            }
            
            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            
            break;
        case "essay":
            var element = $("<div>");
            element.addClass("essay-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "essay");
            element.css({
            	"width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<textarea maxlength='900' class='essay-textbox' name='essay-"
              + object["toolSeq"]
              + "' style='padding:2px!important; width:calc(100% - 4px); height:calc(100% - 4px);' placeholder='" + object["txt"] + "'"
              // add focus event
              + ` onfocus='focusSheetItem(this, "in")'`
              + ` onblur='focusSheetItem(this, "out")'`
              + ` onkeyup='changedValueSheetItem(this)'`
              + ` onchange='changedValueSheetItem(this)'`
              + " autocomplete='off'></textarea>");

            element.find("textarea").css({
                "font-family": object["fontFamily"],
                "font-size": object["fontSize"] + "px",
                "background-color": object["backgroundColor"],
                "color": object["fontColor"]
            });
            
            if(opt === "s" || opt === "h"){
                const textareaElement = element.find("textarea")
                textareaElement.attr("disabled", true);
                textareaElement.css({
                    color: "inherit !important",
                    cursor: "default"
                })
            }
            
            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
    
            // 잘라내기, 붙여넣기 이벤트 핸들링
            const textareaNode = document.querySelector(`textarea[name=essay-${object.toolSeq}]`)
            if (textareaNode) {
                ['cut', 'paste'].forEach(event => textareaNode.addEventListener(event, changedValueSheetItem))
            }
            
            break;
        case "radio":
            var element = $("<div>");
            element.addClass("radio-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "radio");
            element.css({
            	"width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            for (var i in object["exampleList"]){
                var checked = "";
                
                if(opt == "s"){
                	checked += " disabled";
                	
                  // [띵커벨] 라디오 응답 처리
                  for(var j in object["answerList"]){
                        if(parseInt(i)+1 == object["answerList"][j]["answer"]){
                            checked += " checked";
                        }
                    }
                }
    
                // [하이클래스] 라디오 응답 처리
                if (parseInt(i)+1 == object["txt"]) {
                    checked += " checked";
                }
                // 라디오 네임에 시트 넘버 추가 (박종철)
                element.append('<div class="label"><label style="display:block;height:100%"><input type="radio" name="radio-' + object["toolSeq"] + '-' + object["sheetPage"]+'" value="' + (parseInt(i) + 1) + '" ' + checked + ' /></div></label>');
                //element.append('<div class="label"><label style="display:block;height:100%"><input type="radio" name="radio-' + object["toolSeq"] + '" value="' + (parseInt(i) + 1) + '" ' + checked + ' /></div></label>');
                element.find("div.label").eq(i).css({
                    "width": object["exampleList"][i]["width"],
                    "height": object["fontSize"] + "px",
                    "position": "absolute",
                    "top": object["exampleList"][i]["y"] + "px",
                    "left": object["exampleList"][i]["x"] + "px",
                    "font-size": object["fontSize"] + "px",
                    "line-height": object["fontSize"] + "px",
                    "color": object["fontColor"]
                });
            }

            element.find("input").checkbox();
    
            // 라디오 버튼 토글 처리
            element.find("input").on('click', function() {
                // Get the storedValue
                var previousValue = $(this).data('storedValue');
                // if previousValue = true then
                //     Step 1: toggle radio button check mark.
                //     Step 2: save data-StoredValue as false to indicate radio button is unchecked.
                if (previousValue) {
                    $(this).prop('checked', !previousValue);
                    $(this).data('storedValue', !previousValue);
    
                    // radio checked -> unchecked
                    $(this).prev('i').removeClass('fa-circle').addClass('fa-circle-o')
                }
                  // If previousValue is other than true
                  //    Step 1: save data-StoredValue as true to for currently checked radio button.
                  //    Step 2: save data-StoredValue as false for all non-checked radio buttons.
                else {
                    // radio checked
                    // <i className="fa text-primary fa-circle" aria-hidden="true"></i>
                    // radio unchecked
                    // <i className="fa text-primary fa-circle-o" aria-hidden="true"></i>
                    $(this).data('storedValue', true);
                    element.find("input[type=radio]:not(:checked)").data("storedValue", false);
                }
            })
            
            if (opt =="h"){
            	var element2 = $("<div>");
                element2.addClass("radio-layer layer tool-seq-clone-" + object["toolSeq"]);
                element2.data("itemType", "radio");
                element2.css({
                	"width": object["width"] - object["borderSize"] * 2,
                    "height": object["height"] - object["borderSize"] * 2,
                    "position": "absolute",
                    "top": object["y"] + "px",
                    "left": object["x"] + "px",
                    "border": object["borderSize"] + "px solid " + object["borderColor"],
                    "background-color": object["backgroundColor"],
                    "opacity": object["opacity"],
                    "display": "none"
                });

                element2.data("toolSeq", object["toolSeq"]);

                for (var i in object["exampleList"]){
                    var checked = "";
                    
                	for(var j in object["answerList"]){
                        if(parseInt(i)+1 == object["answerList"][j]["answer"]){
                            checked = "checked";
                        }
                    }

                    element2.append('<div class="label"><label style="display:block;height:100%"><input type="radio" value="' + (parseInt(i) + 1) + '" ' + checked + ' /></div></label>');
                    element2.find("div.label").eq(i).css({
                        "width": object["exampleList"][i]["width"],
                        "height": object["fontSize"] + "px",
                        "position": "absolute",
                        "top": object["exampleList"][i]["y"] + "px",
                        "left": object["exampleList"][i]["x"] + "px",
                        "font-size": object["fontSize"] + "px",
                        "line-height": object["fontSize"] + "px",
                        "color": object["fontColor"]
                    });
                }
                element2.find("input").checkbox();
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element2);
            }

            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            break;
        case "check":
            var element = $("<div>");
            element.addClass("check-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "check");
            element.css({
            	"width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"]
            });

            element.data("toolSeq", object["toolSeq"]);

            for (var i in object["exampleList"]){
                var checked = "";
                
                if(opt == "s"){
                	checked += " disabled";
                    // [띵커벨] 체크박스 응답 처리
                	for(var j in object["answerList"]){
                        if(parseInt(i)+1 == object["answerList"][j]["answer"]){
                            checked += " checked";
                        }
                    }
                }
    
                // [하이클래스] 체크박스 응답 처리
                if (parseInt(i)+1 == object["txt"]) {
                    checked += " checked";
                }

                element.append('<div class="label"><label style="display:block;height:100%"><input type="checkbox" name="check-' + object["toolSeq"] + '" value="' + (parseInt(i) + 1) + '" ' + checked + ' /></div></label>');
                element.find("div.label").eq(i).css({
                    "width": object["exampleList"][i]["width"],
                    "height": object["fontSize"] + "px",
                    "position": "absolute",
                    "top": object["exampleList"][i]["y"] + "px",
                    "left": object["exampleList"][i]["x"] + "px",
                    "font-size": object["fontSize"] + "px",
                    "line-height": object["fontSize"] + "px",
                    "color": object["fontColor"]
                });
            }
            
            if (opt == "h"){
            	var element2 = $("<div>");
                element2.addClass("check-layer layer tool-seq-clone-" + object["toolSeq"]);
                element2.data("itemType", "check");
                element2.css({
                	"width": object["width"] - object["borderSize"] * 2,
                    "height": object["height"] - object["borderSize"] * 2,
                    "position": "absolute",
                    "top": object["y"] + "px",
                    "left": object["x"] + "px",
                    "border": object["borderSize"] + "px solid " + object["borderColor"],
                    "background-color": object["backgroundColor"],
                    "display": "none"
                });

                element2.data("toolSeq", object["toolSeq"]);

                for (var i in object["exampleList"]){
                    var checked = "";
                    
                	for(var j in object["answerList"]){
                        if(parseInt(i)+1 == object["answerList"][j]["answer"]){
                            checked = "checked";
                        }
                    }

                    element2.append('<div class="label"><label style="display:block;height:100%"><input type="checkbox" value="' + (parseInt(i) + 1) + '" ' + checked + ' /></div></label>');
                    element2.find("div.label").eq(i).css({
                        "width": object["exampleList"][i]["width"],
                        "height": object["fontSize"] + "px",
                        "position": "absolute",
                        "top": object["exampleList"][i]["y"] + "px",
                        "left": object["exampleList"][i]["x"] + "px",
                        "font-size": object["fontSize"] + "px",
                        "line-height": object["fontSize"] + "px",
                        "color": object["fontColor"]
                    });
                }
                
                element2.find("input").checkbox();

                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element2);
            }

            element.find("input").checkbox();

            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            break;
        case "select":
            var element = $("<div>");
            element.addClass("selected select-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "select");
            element.css({
            	"width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"]
            });

            element.data("toolSeq", object["toolSeq"]);
            element.html("<select name='select" + object["toolSeq"] + "'></select>");

            element.find("select").append("<option value=''></option>");
            for (var i in object["exampleList"]){
                var checked = "";
                
                if(opt == "s"){
                	element.find("select").attr("disabled", true);
                	for(var j in object["answerList"]){
                        if(parseInt(i)+1 == object["answerList"][j]["answer"]){
                            checked = "selected";
                        }
                    }
                }
                
                element.find("select").append("<option value='" + (parseInt(i) + 1)  + "' " + checked + ">" + object["exampleList"][i]["text"] + "</option>");
            }

            element.find("select").select2({
            	minimumResultsForSearch: Infinity
            });
            element.find(".select2").css({
            	"width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "lineHeight": object["height"] + "px",
                "font-size": object["fontSize"] + "px",
                "color": object["fontColor"],
                "font-family": object["fontFamily"]
            });
            
            if(opt == "h"){
            	var element2 = $("<div>");
                element2.addClass("selected select-layer layer tool-seq-clone-" + object["toolSeq"]);
                element2.data("itemType", "select");
                element2.css({
                	"width": object["width"] - object["borderSize"] * 2,
                    "height": object["height"] - object["borderSize"] * 2,
                    "position": "absolute",
                    "top": object["y"] + "px",
                    "left": object["x"] + "px",
                    "border": object["borderSize"] + "px solid " + object["borderColor"],
                    "background-color": object["backgroundColor"],
                    "display": "none"
                });

                element2.data("toolSeq", object["toolSeq"]);

                element2.html("<select></select>");

                for (var i in object["exampleList"]){
                    var checked = "";
                    
                	for(var j in object["answerList"]){
                        if(parseInt(i)+1 == object["answerList"][j]["answer"]){
                            checked = "selected";
                        }
                    }
                    element2.find("select").append("<option value='" + (parseInt(i) + 1)  + "' " + checked + ">" + object["exampleList"][i]["text"] + "</option>");
                }

                element2.find("select").select2({
                	minimumResultsForSearch: Infinity
                });
                element2.find(".select2").css({
                	"width": object["width"] - object["borderSize"] * 2,
                    "height": object["height"] - object["borderSize"] * 2,
                    "lineHeight": object["height"] + "px",
                    "font-size": object["fontSize"] + "px",
                    "color": object["fontColor"],
                    "font-family": object["fontFamily"]
                });
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element2);
            }

            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            break;
        case "linematch":
            var element = $("<div>");
            element.addClass("selected linematch-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "linematch");
            element.css({
            	"width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                //"border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });
            
            element.append('<input type="hidden" name="lineMatchResp-' + object["toolSeq"] + '" />')
            element.data("toolSeq", object["toolSeq"]);

            for (var i in object["exampleList"]){
            	var disabled = ""
                if(opt == "s"){
                	disabled = " disabled";
                }
            	
                var html = '<div class="label">' +
                    '<input type="hidden" name="selectedValue" />' +
                    '<input type="hidden" name="lineMatchFlag" />' +
                    '<label style="">' +
                    '<input type="radio" class="line-match" value="' + parseInt(i) + '" ' + disabled + '/></div></label>';

                element.append(html);
                element.find("div.label").eq(i).css({
                    "width": object["exampleList"][i]["width"],
                    "height": object["exampleList"][i]["height"],
                    "position": "absolute",
                    "top": object["exampleList"][i]["y"] + "px",
                    "left": object["exampleList"][i]["x"] + "px",
                    "font-size": object["fontSize"] + "px",
                    "color": object["fontColor"]
                });
            }

            var t = $("div.editor-layer.editor-seq-" + object["sheetPage"]);
            if(opt == "s"){
	            if(object["answerList"].length != 0){
	            	var data = JSON.parse(object["answerList"][0]["answer"]);
		            for (var i in data){
		                var answerArr = data[i];
		                var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		                $(line).attr({
		                    class: "linematch linematch-" + object["toolSeq"] + " linestart-" + answerArr[0] + " lineend-" + answerArr[1],
		                    dataStart: answerArr[0],
		                    dataEnd: answerArr[1],
		                    x1: parseInt(object["x"]) + parseInt(object["exampleList"][answerArr[0]]["x"]) + 6,
		                    x2: parseInt(object["x"]) + parseInt(object["exampleList"][answerArr[1]]["x"]) + 6,
		                    y1: parseInt(object["y"]) + parseInt(object["exampleList"][answerArr[0]]["y"]) + 12,
		                    y2: parseInt(object["y"]) + parseInt(object["exampleList"][answerArr[1]]["y"]) + 12,
		                    "stroke": object["borderColor"],
		                    "stroke-width": object["borderSize"],
		                });
		
		                t.find("svg").append(line);
		            }
	            }
            }

            element.find("input[type=radio]").checkbox();
            
            if(opt == "h"){
            	var element2 = $("<div>");
                element2.addClass("selected linematch-layer layer tool-seq-clone-" + object["toolSeq"]);
                element2.data("itemType", "linematch");
                element2.css({
                	"width": object["width"] - object["borderSize"] * 2,
                    "height": object["height"] - object["borderSize"] * 2,
                    "position": "absolute",
                    "top": object["y"] + "px",
                    "left": object["x"] + "px",
                    "background-color": object["backgroundColor"],
                    "opacity": object["opacity"],
                    "display": "none"
                });

                element2.data("toolSeq", object["toolSeq"]);

                for (var i in object["exampleList"]){
                    var html = '<div class="label">' +
                        '<label style="">' +
                        '<input type="radio" value="' + parseInt(i) + '"/></div></label>'

                    element2.append(html);
                    element2.find("div.label").eq(i).css({
                        "width": object["exampleList"][i]["width"],
                        "height": object["exampleList"][i]["height"],
                        "position": "absolute",
                        "top": object["exampleList"][i]["y"] + "px",
                        "left": object["exampleList"][i]["x"] + "px",
                        "font-size": object["fontSize"] + "px",
                        "color": object["fontColor"]
                    });
                }

                var t = $("div.editor-layer.editor-seq-" + object["sheetPage"]);
	            if(object["answerList"].length != 0){
	            	var data = JSON.parse(object["answerList"][0]["answer"]);
		            for (var i in data){
		                var answerArr = data[i];
		                var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		                $(line).attr({
		                    class: "linematch-clone linematch-clone-" + object["toolSeq"] + " linestart-" + answerArr[0] + " lineend-" + answerArr[1],
		                    dataStart: answerArr[0],
		                    dataEnd: answerArr[1],
		                    x1: parseInt(object["x"]) + parseInt(object["exampleList"][answerArr[0]]["x"]) + 6,
		                    x2: parseInt(object["x"]) + parseInt(object["exampleList"][answerArr[1]]["x"]) + 6,
		                    y1: parseInt(object["y"]) + parseInt(object["exampleList"][answerArr[0]]["y"]) + 12,
		                    y2: parseInt(object["y"]) + parseInt(object["exampleList"][answerArr[1]]["y"]) + 12,
		                    "stroke": object["borderColor"],
		                    "stroke-width": object["borderSize"],
		                });
		
		                t.find("svg").append(line);
		            }
	            }

                element2.find("input[type=radio]").checkbox();
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element2);
            }

            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            break;    
        case "toggle":
            var element = $("<div>");
            element.addClass("selected toggle-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "toggle");
            
            // 폰트사이즈 대응
            var fontSize = 14;
            if(object["width"] < 100 && object["width"] > 71){
            	fontSize = 9;
            } else if (object["width"] < 70 && object["width"] > 61){
            	fontSize = 5;
		    } else if (object["width"] < 60 && object["width"] > 51){
		    	fontSize = 3;
		    } else if (object["width"] < 50){
		    	fontSize = 1;
		    }
            
            element.css({
            	"width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "font-size": fontSize,
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            var disabled = "";
            if(opt == "s" || opt == "h"){
            	disabled = "disabled";
            }
            
            var html = '<div class="box-o-x">';
            html += '<div class="group">';
            html += '<div class="item item-yes slider-'+ object["quesNo"] + '"><label class="btn-select"><input type="radio" class="ox-radio-box" name="toggle' + object["toolSeq"] + '" value="Y"  ' + disabled + '/><span></span></label></div>';
            html += '<div class="item item-no slider-' + object["quesNo"] + '"><label class="btn-select"><input type="radio" class="ox-radio-box" name="toggle' + object["toolSeq"] + '" value="N"  ' + disabled + '/><span></span></label></div>';
            html += '</div>';
            html += '</div>';

            element.html(html);

            if(opt == "s"){
            	if(object["answerList"].length == 1){
            		element.find("input[name=toggle" + object["toolSeq"] + "]:input[value=" + object["answerList"][0]["answer"] + "]").prop("checked", true);
                    element.find("input[name=toggle" + object["toolSeq"] + "]:input[value=" + object["answerList"][0]["answer"] + "]").closest("label").addClass("active");
                }
            }
            
            if(opt == "h"){
            	var element2 = $("<div>");
                element2.addClass("selected toggle-layer layer tool-seq-clone-" + object["toolSeq"]);
                element2.data("itemType", "toggle");
                element2.css({
                	"width": object["width"] - object["borderSize"] * 2,
                    "height": object["height"] - object["borderSize"] * 2,
                    "position": "absolute",
                    "top": object["y"] + "px",
                    "left": object["x"] + "px",
                    "border": object["borderSize"] + "px solid " + object["borderColor"],
                    "font-size": fontSize,
                    "background-color": object["backgroundColor"],
                    "opacity": object["opacity"],
                    "display": "none"
                });

                element2.data("toolSeq", object["toolSeq"]);

                var html = '<div class="box-o-x">';
                html += '<div class="group">';
                html += '<div class="item item-yes slider-'+ object["quesNo"] + '"><label class="btn-select"><input type="radio" name="toggleClone' + object["toolSeq"] + '" class="ox-radio-box" value="Y"/><span></span></label></div>';
                html += '<div class="item item-no slider-' + object["quesNo"] + '"><label class="btn-select"><input type="radio" name="toggleClone' + object["toolSeq"] + '" class="ox-radio-box" value="N"/><span></span></label></div>';
                html += '</div>';
                html += '</div>';

                element2.html(html);
                
            	if(object["answerList"].length == 1){
            		element2.find("input[name=toggleClone" + object["toolSeq"] + "]:input[value=" + object["answerList"][0]["answer"] + "]").prop("checked", true);
                    element2.find("input[name=toggleClone" + object["toolSeq"] + "]:input[value=" + object["answerList"][0]["answer"] + "]").closest("label").addClass("active");
                }
            	
            	$("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element2);
            }

            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            break;
        case "fx":
            var element = $("<div>");
            element.addClass("selected fx-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "fx");
            element.css({
            	"width": object["width"] - object["borderSize"] * 2,
                "height": object["height"] - object["borderSize"] * 2,
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);


            var html = '<div>' +
                        '<div class="row align-items-center">' +
                        '<input type="text" name="fxFirst' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="border:1px solid #AAA!important;text-align:center;display:none;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                        '<div class="col-12">' +
                        '<input type="text" name="fxSecond' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="border:1px solid #AAA!important;text-align:center;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                        '<span class="bar"></span>' +
                        '<input type="text" name="fxThird' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="border:1px solid #AAA!important;text-align:center;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                        '</div>' +
                        '</div>' +
                        '</div>';

            if(object["quesNo"] === "B"){
                html = '<div>' +
                    '<div class="row align-items-center">' +
                    '<div class="col-6 p-0">' +
                    '<input type="text" name="fxFirst' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="border:1px solid #AAA!important;text-align:center;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                    '</div>' +
                    '<div class="col-6 p-0">' +
                    '<input type="text" name="fxSecond' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="border:1px solid #AAA!important;text-align:center;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                    '<span class="bar"></span>' +
                    '<input type="text" name="fxThird' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="border:1px solid #AAA!important;text-align:center;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }

            element.html(html);
            if(opt == "s"){
            	var answerArr = object["answerList"][0]["answer"].split(",");
            	element.find("input[name=fxFirst" + object["toolSeq"] + "]").val(answerArr[0]);
            	element.find("input[name=fxSecond" + object["toolSeq"] + "]").val(answerArr[1]);
            	element.find("input[name=fxThird" + object["toolSeq"] + "]").val(answerArr[2]);
            	element.find("input[name=fxFirst" + object["toolSeq"] + "]").attr("readonly", true);
            	element.find("input[name=fxSecond" + object["toolSeq"] + "]").attr("readonly", true);
            	element.find("input[name=fxThird" + object["toolSeq"] + "]").attr("readonly", true);
            }
            
            
            if(opt == "h"){
	            var element2 = $("<div>");
	            element2.addClass("selected fx-layer layer tool-seq-clone-" + object["toolSeq"]);
	            element2.data("itemType", "fx");
	            element2.css({
	            	"width": object["width"] - object["borderSize"] * 2,
                    "height": object["height"] - object["borderSize"] * 2,
	                "position": "absolute",
	                "top": object["y"] + "px",
	                "left": object["x"] + "px",
	                "border": object["borderSize"] + "px solid " + object["borderColor"],
	                "background-color": object["backgroundColor"],
	                "opacity": object["opacity"],
	                "display": "none"
	            });
	
	            element2.data("toolSeq", object["toolSeq"]);
	
	            var html = '<div>' +
	                        '<div class="row align-items-center">' +
	                        '<input type="text" name="fxFirstClone' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="display:none;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
	                        '<div class="col-12">' +
	                        '<input type="text" name="fxSecondClone' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
	                        '<span class="bar"></span>' +
	                        '<input type="text" name="fxThirdClone' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
	                        '</div>' +
	                        '</div>' +
	                        '</div>';
	
	            if(object["quesNo"] === "B"){
	                html = '<div>' +
	                    '<div class="row align-items-center">' +
	                    '<div class="col-6 p-0">' +
	                    '<input type="text" name="fxFirstClone' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
	                    '</div>' +
	                    '<div class="col-6 p-0">' +
	                    '<input type="text" name="fxSecondClone' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
	                    '<span class="bar"></span>' +
	                    '<input type="text" name="fxThirdClone' + object["toolSeq"] + '" class="box-style" placeholder="?" autocomplete="off" style="height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
	                    '</div>' +
	                    '</div>' +
	                    '</div>';
	            }
	
	            var answerArr = object["answerList"][0]["answer"].split(",");
	            element2.html(html);
	            element2.find("input[name=fxFirstClone" + object["toolSeq"] + "]").val(answerArr[0]);
	            element2.find("input[name=fxSecondClone" + object["toolSeq"] + "]").val(answerArr[1]);
	            element2.find("input[name=fxThirdClone" + object["toolSeq"] + "]").val(answerArr[2]);
	            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element2);
            }

            $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            break;
    }
}

function renderingAnswer(obj, wrongFlag){
	$(obj).each(function(idx, data){
		var object;
        $(objectArr).each(function(idx, dt){
            if(dt["toolSeq"] == data.toolSeq){
            	object = dt;
            }
        });
		
        if(data.result == "N" && wrongFlag){
			$(".tool-seq-" + data.toolSeq).addClass("wrong");
		}
        
		switch(data.toolCd){
			case "textbox":
				if(data.response != ""){
					$("input[name=ques" + data.toolSeq + "]").val(data.response);
				}
				break;
			case "essay":
				if(data.response != ""){
					$("textarea[name=essay-" + data.toolSeq + "]").val(data.response);
				}
				break;
			case "radio":
				if(data.response != ""){
					$("input[name=radio-" + data.toolSeq + "]:input[value=" + data.response + "]").prop("checked", true).trigger("change");
				}
				break;
			case "check":
				if(data.response != ""){
					var respArr = data.response.split(",");
					for(var i=0; i<respArr.length; i++){
						$("input[name=check-" + data.toolSeq + "]:input[value=" + respArr[i] + "]").prop("checked", true).trigger("change");
					}
				}
				break;
			case "select":
				if(data.response != ""){
					$("select[name=select" + data.toolSeq + "]").val(data.response).trigger('change.select2');
				}
				break;
			case "linematch":
				if(data.response != ""){
					$("input[name=lineMatchResp-" + data.toolSeq + "]").val(data.response);
					var t = $("div.editor-layer.editor-seq-" + data.sheetPage);
	            	var d = JSON.parse(data.response);
		            for (var i in d){
		                var answerArr = d[i];
		                var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		                $(line).attr({
		                    class: "linematch linematch-" + object["toolSeq"] + " linestart-" + answerArr[0] + " lineend-" + answerArr[1],
		                    dataStart: answerArr[0],
		                    dataEnd: answerArr[1],
		                    x1: parseInt(object["x"]) + parseInt(object["exampleList"][answerArr[0]]["x"]) + 6,
		                    x2: parseInt(object["x"]) + parseInt(object["exampleList"][answerArr[1]]["x"]) + 6,
		                    y1: parseInt(object["y"]) + parseInt(object["exampleList"][answerArr[0]]["y"]) + 12,
		                    y2: parseInt(object["y"]) + parseInt(object["exampleList"][answerArr[1]]["y"]) + 12,
		                    "stroke": object["borderColor"],
		                    "stroke-width": object["borderSize"],
		                });
		
		                t.find("svg").append(line);
		            }
				}
				break;
			case "toggle":
				if(data.response != ""){
					$("input[name=toggle" + data.toolSeq + "]:input[value=" + data.response + "]").prop("checked", true).trigger("change");
				}
				break;
			case "fx":
				if(data.response != ",,"){
					var respArr = data.response.split(",");
					$("input[name=fxFirst" + data.toolSeq + "]").val(respArr[0]);
					$("input[name=fxSecond" + data.toolSeq + "]").val(respArr[1]);
					$("input[name=fxThird" + data.toolSeq + "]").val(respArr[2]);
				}
				break;
		}
	});
}
// 라디오 시트 넘버 추가 (박종철)
function renderingAnswerHiClass(sheetResponses, sheetTools){
    $(sheetResponses).each(function(idx, data){
        const currentItem = objectArr.find(objectItem => objectItem.toolSeq === data.toolSeq)
        const toolCd = currentItem.toolCd || ''
    
        if (data.responseSeq)
            currentItem.responseSeq = data.responseSeq
        
        switch(toolCd){
            
            case "essay":
                if(data.response){
                    $("textarea[name=essay-" + data.toolSeq + "]").val(data.response);
                }
                break;
                
            case "radio":
                if(data.response){
                    // 라디오 시트 넘버 추가 (박종철)
                    let sheetPage = ''
                    if(sheetTools) {
                        const sheet =sheetTools.find(o => o.responseSeq === data.responseSeq)
                        if(sheet) {
                            sheetPage = sheet.sheetPage
                        }
                    }
                    // 라디오 시트 넘버 추가 (박종철)
                   const selector = $("input[name=radio-" + data.toolSeq + "-"+sheetPage+"]:input[value=" + data.response + "]")
                    //const selector = $("input[name=radio-" + data.toolSeq + "]:input[value=" + data.response + "]")
                    selector.prop("checked", true)
                      .data('storedValue', true)    // 라디오 버튼 토글 처리를 위해 데이터 set
                      .trigger("change");
                }
                break;
                
            case "check":
                if(data.response){
                    var respArr = data.response.split(",");
                    for(var i=0; i<respArr.length; i++){
                        $("input[name=check-" + data.toolSeq + "]:input[value=" + respArr[i] + "]").prop("checked", true).trigger("change");
                    }
                }
                break;
            
        }
    });
}

function renderingAnswerHiClassWithSheetPages(sheetResponses, objArr, sheetPages) {
    // 해당 페이지의 응답만 렌더링
    sheetPages.forEach(sheetPage => {
    
        $(sheetResponses).each(function(idx, data){
            const currentItem = objArr.find(objectItem => objectItem.toolSeq === data.toolSeq)
            if (!currentItem) return;
            
            const toolCd = currentItem.toolCd || ''
    
            if (data.responseSeq)
                currentItem.responseSeq = data.responseSeq
    
            switch(toolCd) {
                case "essay":
                    if(data.response){
                        $(`div.editor-seq-${sheetPage} ` + "textarea[name=essay-" + data.toolSeq + "]").val(data.response);
                    }
                    break;
                case "radio":
                    if(data.response){
                        // 라디오 네임에 시트 넘버 추가 (박종철)
                        const selector = $(`div.editor-seq-${sheetPage} ` + "input[name=radio-" + data.toolSeq + "-"+sheetPage+"]:input[value=" + data.response + "]")
                        //const selector = $(`div.editor-seq-${sheetPage} ` + "input[name=radio-" + data.toolSeq + "]:input[value=" + data.response + "]")
                        selector.prop("checked", true)
                          .data('storedValue', true)    // 라디오 버튼 토글 처리를 위해 데이터 set
                          .trigger("change");
                    }
                    break;
                case "check":
                    if(data.response){
                        var respArr = data.response.split(",");
                        for(var i=0; i<respArr.length; i++){
                            $(`div.editor-seq-${sheetPage} ` + "input[name=check-" + data.toolSeq + "]:input[value=" + respArr[i] + "]").prop("checked", true).trigger("change");
                        }
                    }
                    break;
            }
            
        });
        
    })
    
    
}

function renderingAnswerValidateHiClass(objectArr, responses){
    if (isReadonly) {
        return false
    }
    
    $(objectArr).each(function(idx, dt){
        switch (dt.toolCd) {
            case "essay":
            case "radio":
            case "check": {
                try {
                    const element = $("div.layer.tool-seq-" + dt.toolSeq)
                    const responseObj = responses && responses.length > 0
                      ? responses.find(response => response.toolSeq === dt.toolSeq)
                      : undefined
                    
                    if (!responseObj || responseObj && !responseObj.response) {
                        setRequiredClass(dt, element)
                    } else if (responseObj && responseObj.response) {
                        removeRequiredClass(dt, element)
                    }

                } catch (err) {
                  throw new Error(err)
                }
                break
            }
        }
    })
}

function renderingAnswerValidateSheetItem(changedData) {
    if (isReadonly) {
        return false
    }
    
    try {
        const itemId = parseInt(changedData.itemId, 10)
        const value = changedData.value
        
        const element = $("div.layer.tool-seq-" + itemId)
        const dt = objectArr.find(o => o.toolSeq === itemId)
    
        value ? removeRequiredClass(dt, element)
          : setRequiredClass(dt, element)
        
    } catch (e) {
        console.warn(e)
    }
    
}

function renderingAllUserSign(objArr, userSignObject) {
    $(objArr).each(function(idx, data){
        if (data.toolCd === 'esign')
            renderingUserSign(this, userSignObject);
    });
}

function renderingAllUserSignWithSignPages(objArr, userSignObject, signPages) {
    $(objArr).each(function(idx, data){
        if (data.toolCd === 'esign' && signPages.includes(data.sheetPage)) {
            renderingUserSign(this, userSignObject, data.sheetPage);
        }
    });
}

function renderingAllApprovalSign(objArr, userSignObject) {
    $(objArr).each(function(idx, data){
        if (data.toolCd === 'approvalsign')
            renderingUserSign(this, userSignObject);
    });
}

function renderingAllApprovalSignWithSignPages(objArr, userSignObject, signPages) {
    $(objArr).each(function(idx, data){
        if (data.toolCd === 'approvalsign' && signPages.includes(data.sheetPage)) {
            renderingUserSign(this, userSignObject, data.sheetPage);
        }
        
    });
}

function renderingUserSign(object, userSignObject, signPage) {
    const signElement = signPage
        ? document.querySelector(`div.editor-seq-${signPage} div.layer.tool-seq-${object.toolSeq} > div`)
        : document.querySelector(`div.layer.tool-seq-${object.toolSeq} > div`)
      
    if (signElement) {
        let signImagePath = ''
        
        switch (object.toolCd) {
            case 'esign': {
                signImagePath = userSignObject.userSignImagePath
                break
            }
            case 'approvalsign': {
                signImagePath = userSignObject.userApprovalSignImagePath
                break
            }
        }
    
        if (signImagePath) {
            signElement.innerHTML = ''
    
            signElement.style.backgroundSize = 'contain'
            signElement.style.backgroundRepeat = 'no-repeat'
            signElement.style.backgroundPosition = 'center'
            signElement.style.backgroundImage = `url('${signImagePath}')`
    
            const signImgElement = document.createElement('img')
            signImgElement.src = signImagePath
            signImgElement.style.width = 'inherit'
            signImgElement.style.height = 'inherit'
            signImgElement.style.objectFit = 'contain'
            signImgElement.addEventListener('load', () => {
                signImgElement.classList.add('loaded')
            })
            
            signElement.appendChild(signImgElement)
        }
        
    }
    
}

function renderingUnidentifiedSign(object) {
    const signElement = document.querySelector(`div.layer.tool-seq-${object.toolSeq} > div.text-esign`)
    if (signElement) {
        signElement.innerHTML = ''
        signElement.style = ''
        
        if (signElement.classList.contains('return'))
            signElement.classList.remove('return')
    
        const signDivElement = document.createElement('div')
        const signStrongElement = document.createElement('strong')
        signStrongElement.textContent = '결재서명'
        signDivElement.appendChild(signStrongElement)
        
        signDivElement.innerHTML = signDivElement.innerHTML + '(자동기입)'
        
        signElement.appendChild(signDivElement)
        // example: <div><strong>결재서명</strong>(자동기입)</div>
    }
}

function renderingRejectSign(object, signPage) {
    const signElement = signPage
      ? document.querySelector(`div.editor-seq-${signPage} div.layer.tool-seq-${object.toolSeq} > div.text-esign`)
      : document.querySelector(`div.layer.tool-seq-${object.toolSeq} > div.text-esign`)
    
    if (signElement) {
        signElement.innerHTML = ''
        signElement.style = ''
        
        if (!signElement.classList.contains('return'))
            signElement.classList.add('return')
    }
}

function hideApprovalUserSign(object, signPage) {
    const signElement = signPage
      ? document.querySelector(`div.editor-seq-${signPage} div.layer.tool-seq-${object.toolSeq} > div.text-esign`)
      : document.querySelector(`div.layer.tool-seq-${object.toolSeq} > div.text-esign`)
    
    if (signElement && !signElement.classList.contains('hide-approvalsign')) {
        signElement.classList.add('hide-approvalsign')
    }
}

function showApprovalUserSign(object, signPage) {
    const signElement = signPage
      ? document.querySelector(`div.editor-seq-${signPage} div.layer.tool-seq-${object.toolSeq} > div.text-esign`)
      : document.querySelector(`div.layer.tool-seq-${object.toolSeq} > div.text-esign`)
    
    if (signElement && signElement.classList.contains('hide-approvalsign')) {
        signElement.classList.remove('hide-approvalsign')
    }
}

function getScore(obj){
	var score = 0;
	var cnt = 0;
	$(obj).each(function(idx, data){
		switch(data.toolCd){
			case "textbox":
			case "radio":
			case "check":
			case "select":
			case "linematch":
			case "toggle":
			case "fx": cnt++; score += parseInt(data["allot"]); 
				break;
		}
	});
	$("#score").text(score);
	$("#cnt").text(cnt);

	if(score == 0 && cnt == 0){
		$("#scoreBox").hide();
	}
	
}

/**
 * 시트 내 입력 가능한 텍스트 영역을 포커싱할 때 앱에 전달
 * @param object
 */
function focusSheetItem(object, status) {
    if (isReadonly) {
        return false
    }
    const curTabIndex = parseInt(object.tabIndex, 10)
    const prevSelector = $("textarea.essay-textbox[tabindex="+ (curTabIndex - 1) + "]")
    const nextSelector = $("textarea.essay-textbox[tabindex="+ (curTabIndex + 1) + "]")
    
    const command = 'focusSheetItem'
    const type = object.type
    let itemId;
    const placeholder = object.placeholder
    const value = object.value ? object.value.trim() : object.value
    const prevId = prevSelector && prevSelector.attr('name') ? prevSelector.attr('name').split('-')[1] : null
    const nextId = nextSelector && nextSelector.attr('name') ? nextSelector.attr('name').split('-')[1] : null
    
    try {
        itemId = object.name.split('-')[1]
    
        const data = {
            type,
            itemId,
            placeholder,
            value,
            status,
            prevId,
            nextId
        }
        
        // 이전 포커싱 된 아이템 초기화
        if (status === 'in') {
            clearFocus('textarea')
    
            lastFocusedTabIndex = curTabIndex
            
            setFocus('textarea', lastFocusedTabIndex)
        }
        window.parent.sendDataToNative(command, data)
    
    } catch (e) {
        console.warn(e)
    }
}

/**
 * 이전 포커싱 된 아이템 초기화
 * @param type
 */
function clearFocus(type) {
    type = type || 'textarea'
    const focusedItem = document.querySelector(`.layer ${type}.focused`)
    if (focusedItem) {
        focusedItem.classList.remove('focused')
    }
}

function setFocus(type, lastFocusedTabIndex) {
    type = type || 'textarea'
    const focusedItem = document.querySelector(`${type}[tabIndex='${lastFocusedTabIndex}']`)
    if (focusedItem) {
        if (!focusedItem.classList.contains('focused'))
            focusedItem.classList.add('focused')
    }
}

function changedValueSheetItem(object) {
    if (isReadonly) {
        return false
    }
    
    // 잘라내기, 붙여넣기 이벤트 핸들링
    if (object.type === 'cut' || object.type === 'paste') {
        setTimeout(() => {
            const name = object.target.name
            const textareaNode = document.querySelector(`textarea[name=${name}]`)
            if (textareaNode) {
                changedValueSheetItem(textareaNode)
            }
        }, 100)
        return false
    }
    
    const command = 'changedValueSheetItem'
    const type = object.type
    let itemId;
    const placeholder = object.placeholder
    const value = object.value ? object.value.trim() : object.value
    
    try {
        itemId = object.name.split('-')[1]
        
        const data = {
            type,
            itemId,
            placeholder,
            value
        }
    
        if (changedValueSheetItemHistory[itemId] !== value) {
            window.parent.sendDataToNative(command, data)
            changedValueSheetItemHistory[itemId] = value
            
            // 필수, 비필수 값 입력 여부를 즉시 반영
            renderingAnswerValidateSheetItem(data)
        }
    } catch (e) {
        console.warn(e)
    }

}

/**
 * 필수 여부 체크하여 음영 처리
 * @param object
 * @param element
 */
function setRequiredClass(object, element) {
    try {
        element.addClass(object["essential"] ? 'required' : 'notrequired')
    } catch (e) {
      throw new Error(e)
    }
    
}

function removeRequiredClass(object, element) {
    try {
        element.removeClass(object["essential"] ? 'required' : 'notrequired')
    } catch (e) {
      throw new Error(e)
    }
    
}

// 공통 필요한 부분
$(document).ready(function(){
	// O/X - 라디오박스
    $(document).on("change", ".ox-radio-box", function(e){
        $(this).closest(".group").find("label").removeClass("active");
        $(this).closest("label").addClass("active");
    });
    
    // 선잇기 - 선 긋기
    $(document).on("click", "input[type=radio].line-match", function(){
        var self = $(this);
        var parent = self.closest("div.linematch-layer");
        var toolSeq = parent.data("toolSeq");
        var selectedValue = parseInt(parent.find("input[name=selectedValue]").val());
        var thisValue = parseInt(self.val());
        var lineMatchFlag = parent.find("input[name=lineMatchFlag]").val();
        var object;
        $(objectArr).each(function(idx, data){
            if(data["toolSeq"] == toolSeq){
            	object = data;
            }
        });

        targetElement = parent;
        var itemType = parent.data("itemType");
        $(".tool-sub .option").hide();
        $(".option-" + itemType).show();
        $(".selected").removeClass("selected");
        parent.addClass("selected");

        var startValue = selectedValue;
        var endValue = thisValue;

        if(selectedValue < thisValue){
            startValue = selectedValue;
            endValue = thisValue;
        } else if (selectedValue > thisValue){
            startValue = thisValue;
            endValue = selectedValue;
        }

        if(lineMatchFlag === "true"){
        	$(".linematch-" + object["toolSeq"] + ".linestart-" + startValue).remove();
            $(".linematch-" + object["toolSeq"] + ".lineend-" + endValue).remove();
        	
            var arr = [];
            $(".linematch-" + toolSeq).each(function(){
            	var start = parseInt($(this).attr("dataStart"));
                var end = parseInt($(this).attr("dataEnd"));
               arr.push([start, end]);
            });
            
            if(parseInt(startValue) != parseInt(endValue)){
	            arr.push([parseInt(startValue), parseInt(endValue)]);
	            arr.sort(function(a, b) {
	                return (a[0] - b[0]) || (a[1] - b[1]);
	            });
            }
            
            $(".linematch-" + object["toolSeq"]).remove();
        	var data = arr;
        	var t = $("div.editor-layer.editor-seq-" + object["sheetPage"]);
            for (var i in data){
                var answerArr = data[i];
                var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                $(line).attr({
                    class: "linematch linematch-" + object["toolSeq"] + " linestart-" + answerArr[0] + " lineend-" + answerArr[1],
                    dataStart: answerArr[0],
                    dataEnd: answerArr[1],
                    x1: parseInt(object["x"]) + parseInt(object["exampleList"][answerArr[0]]["x"]) + 6,
                    x2: parseInt(object["x"]) + parseInt(object["exampleList"][answerArr[1]]["x"]) + 6,
                    y1: parseInt(object["y"]) + parseInt(object["exampleList"][answerArr[0]]["y"]) + 12,
                    y2: parseInt(object["y"]) + parseInt(object["exampleList"][answerArr[1]]["y"]) + 12,
                    "stroke": object["borderColor"],
                    "stroke-width": object["borderSize"],
                });

                t.find("svg").append(line);
            }
            
            parent.find("input[name=lineMatchResp-" + object["toolSeq"] + "]").val(JSON.stringify(arr));
            parent.find("input[name=selectedValue]").val("");
            parent.find("input[name=lineMatchFlag]").val("false");
            parent.find("input[type=radio]:input[value=" + startValue + "]").prop("checked", false).trigger("change");
            parent.find("input[type=radio]:input[value=" + endValue + "]").prop("checked", false).trigger("change");
        } else {
            parent.find("input[name=selectedValue]").val(self.val());
            parent.find("input[name=lineMatchFlag]").val("true");
        }
    });
    
    // 틀린문제 정답확인
    $(document).on("mouseenter", ".wrong", function () {
    	var toolSeq = $(this).data("toolSeq");
    	$(".tool-seq-" + toolSeq).css("opacity", "0");
    	$(".linematch-" + toolSeq).hide();
    	$(".tool-seq-clone-" + toolSeq).show();
    	$(".linematch-clone-" + toolSeq).show();
    }).on("mouseleave", ".wrong", function () {
    	var toolSeq = $(this).data("toolSeq");
    	$(".linematch-" + toolSeq).show();
    	$(".tool-seq-clone-" + toolSeq).hide();
    	$(".linematch-clone-" + toolSeq).hide();
    	$(".tool-seq-" + toolSeq).css("opacity", "1");
    });
    
    // 화면 클릭 시
    $(document).on("click", function () {
        // 이전 포커싱 된 아이템 초기화
        // clearFocus('textarea')
    })
});