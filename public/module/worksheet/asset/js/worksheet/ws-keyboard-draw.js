/* eslint-disable */
/**
 * 키보드 컨트롤 관련 js
 */
$(document).ready(function(){
    $("body").keydown(function(e) {
        // const LEFT_CONTROL = 17
        const ARROW_KEYCODES = [37, 38, 39, 40]
        if (ARROW_KEYCODES.includes(e.keyCode)) {
            var selectedItem = $("div.layer.selected")
            if (selectedItem.length > 0 && !isIgnoreFocusedItem()) {
                e.preventDefault()
                moveSelectedItem(selectedItem, e.keyCode)
            }
        }
    }).keyup(function(e) {
        const ARROW_KEYCODES = [37, 38, 39, 40]
        if (ARROW_KEYCODES.includes(e.keyCode)) {
            var selectedItem = $("div.layer.selected")
            if (selectedItem.length > 0 && !isIgnoreFocusedItem()) {
                e.preventDefault()
                setPositionSelectedItem()
            }
        }
    })
});

function moveSelectedItem(selectedItem, keyCode) {
    try {
        var keyDownPageX = 0
        var keyDownPageY = 0
    
        switch (keyCode) {
            case 37:    // left
                keyDownPageX--
                break
            case 38:    // up
                keyDownPageY--
                break
            case 39:    // right
                keyDownPageX++
                break
            case 40:    // down
                keyDownPageY++
                break
        }
    
        if(!selectedItem) return;
    
        var x = selectedItem.offset().left + keyDownPageX
        var y = selectedItem.offset().top + keyDownPageY
    
        selectedItem.offset({
            left: x,
            top: y
        })
    } catch (e) {
        console.warn('moveSelectedItem() e: ', e)
    }
}

function setPositionSelectedItem() {
    try {
        const selectedItem = document.querySelector('div.layer.selected')
    
        const itemName = Array.from(selectedItem.classList).find(item => item.includes('tool-seq-'))
        const toolSeq = parseInt(itemName.replace('tool-seq-', ''), 10)
    
        const selectedObject = objectArr.find(o => o.toolSeq === toolSeq)
        selectedObject.x = selectedItem.offsetLeft
        selectedObject.y = selectedItem.offsetTop
    } catch (e) {
        console.warn('setPositionSelectedItem() e: ', e)
    }
}

function getActiveElement() {
    return document.activeElement
}

function isIgnoreFocusedItem() {
    const activeElement = getActiveElement()
    const ignoreTags = ['INPUT', 'TEXTAREA']
    
    return ignoreTags.includes(activeElement.tagName)
}