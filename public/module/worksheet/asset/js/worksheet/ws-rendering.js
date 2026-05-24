/* eslint-disable */
function renderingAll(objectArr){
    $("div.content-layer").empty();
    $("svg").empty();
    
    // 순서대로 렌더링
    const sortKeys = ['eraser', 'text', 'others']
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
            
            wsRendering(this);
        });
    }
}

function wsRendering(object){
    switch (object["toolCd"]){
        case "line":
            $("#arrow" + object["toolSeq"]).remove();
            d3.select("svg").append("defs").append("marker")
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

            var rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            $(rect1).attr({
                class: "line-" + object["toolSeq"] + " dot selected line-resize line-start-" + object["toolSeq"],
                "index": object["toolSeq"],
                "move-type": "start",
                x: object["x"] - 4,
                y: object["y"] - 4,
                width: 8,
                height: 8,
                fill: "#FF0000",
                stroke: "rgba(0, 0, 0, 0)",
                style: "cursor:sw-resize"
            });

            var rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            $(rect2).attr({
                class: "line-" + object["toolSeq"] + " dot selected line-resize line-end-" + object["toolSeq"],
                "index": object["toolSeq"],
                "move-type": "end",
                x: object["width"] - 4,
                y: object["height"] - 4,
                width: 8,
                height: 8,
                fill: "#FF0000",
                stroke: "rgba(0, 0, 0, 0)",
                style: "cursor:sw-resize"
            });

            $(line).attr(obj);

            var self = $("#line" + object["toolSeq"]);
            if(self.length === 0){
                var t = $("div.editor-layer.editor-seq-" + object["sheetPage"]);
                t.find("svg").append(line);
                t.find("svg").append(rect1);
                t.find("svg").append(rect2);
            } else {
                self.after(line);
                self.after(rect1);
                self.after(rect2);
                $("#line" + object["toolSeq"]).eq(0).remove();
                $(".line-start-" + object["toolSeq"]).eq(0).remove();
                $(".line-end-" + object["toolSeq"]).eq(0).remove();
            }
            break;
        case "text":
            var element = $("<div>");
            element.addClass("selected text-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "text");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<textarea placeholder='설명 입력'></textarea>" +
                "<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            var fontStyle = object["fontStyle"];
            var fontWeight = fontStyle.substring(0, 1);
            var fontItalic = fontStyle.substring(1, 2);
            var fontUnderline = fontStyle.substring(2, 3);

            element.find("textarea").css({
                "font-family": object["fontFamily"],
                "font-size": object["fontSize"] + "px",
                "font-weight": fontWeight === "1" ? "bold" : "normal",
                "font-style": fontItalic === "1" ? "italic" : "",
                "text-decoration": fontUnderline === "1" ? "underline" : "",
                "color": object["fontColor"]
            });
            
            element.find("textarea").val(object["txt"]);

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            break;
        case "eraser":
            var element = $("<div>");
            element.addClass("selected eraser-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "eraser");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            break;
        // 20211018 추가
        case "esign":
            var element = $("<div>");
            element.addClass("selected esign-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "esign");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                // "background-image": "url('https://download.hiclass.net/7e50/8150/9950/dd50/911405b1-e58e-486a-8f5a-9ffe5135cd01.png')",
                // "background-size": "100% 100%",
                "opacity": object["opacity"]
            });
        
            element.data("toolSeq", object["toolSeq"]);
        
            element.html(
              "<div class='text-esign'><div><strong>제출자 서명</strong>(자동기입)</div></div>" +
              "<div class='dot dot-left-top'></div>" +
              "<div class='dot dot-center-top'></div>" +
              "<div class='dot dot-right-top'></div>" +
              "<div class='dot dot-left-middle'></div>" +
              "<div class='dot dot-right-middle'></div>" +
              "<div class='dot dot-left-bottom'></div>" +
              "<div class='dot dot-center-bottom'></div>" +
              "<div class='dot dot-right-bottom'></div>");
        
            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            break;
        case "approvalsign":
            var element = $("<div>");
            element.addClass("selected esign-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "approvalsign");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                // "background-image": "url('https://download.hiclass.net/7e50/8150/9950/dd50/911405b1-e58e-486a-8f5a-9ffe5135cd01.png')",
                // "background-size": "100% 100%",
                "opacity": object["opacity"]
            });
        
            element.data("toolSeq", object["toolSeq"]);
        
            element.html(
              "<div class='text-esign'><div><strong>결재서명</strong>(자동기입)</div></div>" +
              "<div class='dot dot-left-top'></div>" +
              "<div class='dot dot-center-top'></div>" +
              "<div class='dot dot-right-top'></div>" +
              "<div class='dot dot-left-middle'></div>" +
              "<div class='dot dot-right-middle'></div>" +
              "<div class='dot dot-left-bottom'></div>" +
              "<div class='dot dot-center-bottom'></div>" +
              "<div class='dot dot-right-bottom'></div>");
        
            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
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

            element.html("<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
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

            element.html("<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
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
                "</audio></div><div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            
            $('#sound' + object["toolSeq"]).mediaelementplayer({
        		success: function(media, node, instance) {
        		}
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

            element.html("<iframe width='100%' height='100%' src='" + object["quesNo"] + "' title='YouTube video player' frameborder='0'  allowfullscreen></iframe>" + 
                "<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

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
            element.addClass("selected textbox-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "textbox");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<div class='ques-number'></div>" +
                "<input type='text' style='width:100%; height:100%;' readonly />" +
                "<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            element.find("input").css({
                "font-family": object["fontFamily"],
                "font-size": object["fontSize"] + "px",
                "background-color": object["backgroundColor"],
                "color": object["fontColor"]
            });
            
            // if(object["answerList"].length == 0){
            // 	element.find(".ques-number").css({"background-color": "crimson", "color": "#FFF"});
            // }
            
            // if(object["answerList"].length != 0){
            // 	element.find("input").val(object["answerList"][0]["answer"]);
            // }

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            autoNumbering();
            break;
        case "essay":
            var element = $("<div>");
            element.addClass("selected essay-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "essay");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<div class='ques-number'></div>" +
                "<textarea style='padding:2px!important; width:100%; height:100%;' readonly placeholder='" + object["txt"] + "'></textarea>" +
                "<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            element.find("textarea").css({
                "font-family": object["fontFamily"],
                "font-size": object["fontSize"] + "px",
                "background-color": object["backgroundColor"],
                "color": object["fontColor"]
            });
            
            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            autoNumbering();
            break;
        case "radio":
            var element = $("<div>");
            element.addClass("selected radio-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "radio");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<div class='ques-number'></div>" +
                "<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            for (var i in object["exampleList"]){
                var checked = "";
                // [띵커벨] 라디오 응답 처리
                for(var j in object["answerList"]){
                    if(parseInt(i)+1 == object["answerList"][j]["answer"]){
                        checked = "checked";
                    }
                }
    
                // [하이클래스] 라디오 응답 처리
                if (parseInt(i)+1 == object["txt"]) {
                    checked = " checked";
                }

                element.append('<div class="label"><div class="arrows"><i class="fa fa-arrows"></i></div><label style="display:block;height:100%"><input type="radio" name="radio-' + object["toolSeq"] + '" value="' + (parseInt(i) + 1) + '" ' + checked + ' /></div></label>');
                element.find("div.label").eq(i).css({
                    "width": object["exampleList"][i]["width"],
                    "height": object["exampleList"][i]["height"],
                    "position": "absolute",
                    "top": object["exampleList"][i]["y"] + "px",
                    "left": object["exampleList"][i]["x"] + "px",
                    "font-size": object["fontSize"] + "px",
                    "line-height": object["fontSize"] + "px",
                    "color": object["fontColor"]
                });
            }
            
            // if(object["answerList"].length == 0){
            // 	element.find(".ques-number").css({"background-color": "crimson", "color": "#FFF"});
            // }

            element.find("input").checkbox();

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            autoNumbering();
            break;
        case "check":
            var element = $("<div>");
            element.addClass("selected check-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "check");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<div class='ques-number'></div>" +
                "<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            for (var i in object["exampleList"]){
                var checked = "";
                // [띵커벨] 체크박스 응답 처리
                for(var j in object["answerList"]){
                    if(parseInt(i)+1 == object["answerList"][j]["answer"]){
                        checked = "checked";
                    }
                }
    
                // [하이클래스] 체크박스 응답 처리
                if (parseInt(i)+1 == object["txt"]) {
                    checked = " checked";
                }

                element.append('<div class="label"><div class="arrows"><i class="fa fa-arrows"></i></div><label style="display:block;height:100%"><input type="checkbox" name="check-' + object["toolSeq"] + '" value="' + (parseInt(i) + 1) + '" ' + checked + ' /></div></label>');
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
            
            // if(object["answerList"].length == 0){
            // 	element.find(".ques-number").css({"background-color": "crimson", "color": "#FFF"});
            // }

            element.find("input").checkbox();

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            autoNumbering();
            break;
        case "select":
            var element = $("<div>");
            element.addClass("selected select-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "select");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<select name='select" + object["toolSeq"] + "'></select>" +
                "<div class='ques-number'></div>" +
                "<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            for (var i in object["exampleList"]){
                var checked = "";
                for(var j in object["answerList"]){
                    if(parseInt(i)+1 == object["answerList"][j]["answer"]){
                        checked = "selected";
                    }
                }

                element.find("select").append("<option value='" + (parseInt(i) + 1)  + "' " + checked + ">" + object["exampleList"][i]["text"] + "</option>");
            }
            
            // if(object["answerList"].length == 0){
            // 	element.find(".ques-number").css({"background-color": "crimson", "color": "#FFF"});
            // }

            element.find("select").select2({
            	minimumResultsForSearch: Infinity
            });
            element.find(".select2").css({
                "width": object["width"],
                "height": object["height"],
                "lineHeight": object["height"] + "px",
                "font-size": object["fontSize"] + "px",
                "color": object["fontColor"],
                "font-family": object["fontFamily"]
            });

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            autoNumbering();
            break;
        case "linematch":
            var element = $("<div>");
            element.addClass("selected linematch-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "linematch");
            element.css({
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                //"border": object["borderSize"] + "px solid " + object["borderColor"],
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            element.html("<div class='ques-number'></div>" +
                "<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            for (var i in object["exampleList"]){
                var html = '<div class="label">' +
                    '<input type="hidden" name="selectedValue" />' +
                    '<input type="hidden" name="lineMatchFlag" />' +
                    '<div class="arrows">' +
                    '<i class="fa fa-arrows"></i>' +
                    '</div>' +
                    '<label style="">' +
                    '<input type="radio" class="line-match" value="' + parseInt(i) + '"/></div></label>'

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

            $(".linematch-" + object["toolSeq"]).remove();

            var t = $("div.editor-layer.editor-seq-" + object["sheetPage"]);
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
            
            // if(object["answerList"].length == 0){
            // 	element.find(".ques-number").css({"background-color": "crimson", "color": "#FFF"});
            // }

            element.find("input[type=radio]").checkbox();

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            autoNumbering();
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
                "width": object["width"],
                "height": object["height"],
                "position": "absolute",
                "top": object["y"] + "px",
                "left": object["x"] + "px",
                "border": object["borderSize"] + "px solid " + object["borderColor"],
                "font-size": fontSize,
                "background-color": object["backgroundColor"],
                "opacity": object["opacity"]
            });

            element.data("toolSeq", object["toolSeq"]);

            var html = '<div class="box-o-x">';
                html += '<div class="group">';
                html += '<div class="item item-yes slider-'+ object["quesNo"] + '"><label class="btn-select"><input type="radio" class="ox-radio-box" name="toggle' + object["toolSeq"] + '" value="Y"/><span></span></label></div>';
                html += '<div class="item item-no slider-' + object["quesNo"] + '"><label class="btn-select"><input type="radio" class="ox-radio-box" name="toggle' + object["toolSeq"] + '" value="N"/><span></span></label></div>';
                html += '</div>';
                html += '</div>';

            element.html(html +
                "<div class='ques-number'></div>" +
                "<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");

            if(object["answerList"].length == 1){
                element.find("input[name=toggle" + object["toolSeq"] + "]:input[value=" + object["answerList"][0]["answer"] + "]").prop("checked", true);
                element.find("input[name=toggle" + object["toolSeq"] + "]:input[value=" + object["answerList"][0]["answer"] + "]").closest("label").addClass("active");
            }
            
            // if(object["answerList"].length == 0){
            // 	element.find(".ques-number").css({"background-color": "crimson", "color": "#FFF"});
            // }

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            autoNumbering();
            break;
        case "fx":
            var element = $("<div>");
            element.addClass("selected fx-layer layer tool-seq-" + object["toolSeq"]);
            element.data("itemType", "fx");
            element.css({
                "width": object["width"],
                "height": object["height"],
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
                        '<input type="text" readonly name="fxFirst' + object["toolSeq"] + '" class="box-style" placeholder="?" style="text-align:center;display:none;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                        '<div class="col-12">' +
                        '<input type="text" readonly name="fxSecond' + object["toolSeq"] + '"  class="box-style" placeholder="?" style="text-align:center;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                        '<span class="bar"></span>' +
                        '<input type="text" readonly name="fxThird' + object["toolSeq"] + '"  class="box-style" placeholder="?" style="text-align:center;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                        '</div>' +
                        '</div>' +
                        '</div>';

            if(object["quesNo"] === "B"){
                html = '<div>' +
                    '<div class="row align-items-center">' +
                    '<div class="col-6 p-0">' +
                    '<input type="text" readonly name="fxFirst' + object["toolSeq"] + '"  class="box-style" placeholder="?" style="text-align:center;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                    '</div>' +
                    '<div class="col-6 p-0">' +
                    '<input type="text" readonly name="fxSecond' + object["toolSeq"] + '"  class="box-style" placeholder="?" style="text-align:center;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                    '<span class="bar"></span>' +
                    '<input type="text" readonly name="fxThird' + object["toolSeq"] + '"  class="box-style" placeholder="?" style="text-align:center;height:' + Math.abs((object["height"] / 2 - 15))  + 'px">' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }

            element.html(html +
                "<div class='ques-number'></div>" +
                "<div class='dot dot-left-top'></div>" +
                "<div class='dot dot-center-top'></div>" +
                "<div class='dot dot-right-top'></div>" +
                "<div class='dot dot-left-middle'></div>" +
                "<div class='dot dot-right-middle'></div>" +
                "<div class='dot dot-left-bottom'></div>" +
                "<div class='dot dot-center-bottom'></div>" +
                "<div class='dot dot-right-bottom'></div>");
            
            if(object["answerList"].length != 0){
	            var answerArr = object["answerList"][0]["answer"].split(",");
	            element.find("input[name=fxFirst" + object["toolSeq"] + "]").val(answerArr[0]);
	            element.find("input[name=fxSecond" + object["toolSeq"] + "]").val(answerArr[1]);
	            element.find("input[name=fxThird" + object["toolSeq"] + "]").val(answerArr[2]);
            }
            
            // if(object["answerList"].length == 0 || object["answerList"][0]["answer"] == ",," ){
            // 	element.find(".ques-number").css({"background-color": "crimson", "color": "#FFF"});
            // }

            var self = $("div.layer.tool-seq-" + object["toolSeq"]);
            if(self.length === 0){
                $("div.editor-layer.editor-seq-" + object["sheetPage"]).find("div.content-layer").append(element);
            } else {
                self.after(element);
                $("div.layer.tool-seq-" + object["toolSeq"]).eq(0).remove();
            }
            autoNumbering();
            break;
    }
}

renderingAll(objectArr);
