<template>
    <li @click="moveBookmark">
        <span class="time">{{ getBookmarkTime(bookmark.bookmarkTime) }}</span>
        <span class="bookmark cursor-pointer">
            <i class="bh-icon-bookmark-fill-16"></i>
            북마크
            <i @click.stop="removeBookmark" class="close-btn01 close"></i>
        </span>
        <p>
            <label :class="{input: isEditMode}">
                <i class="bh-icon-memo-16"></i>
                <!--span ref="memo" :class="{empty: !bookmark.bookmarkMemo}" @focusout="changeEditMode" @input="changeMemo" :contenteditable="isEditMode">
                    {{ isEditMode ? bookmark.bookmarkMemo : (bookmark.bookmarkMemo ? bookmark.bookmarkMemo : '메모 추가') }}
                </span-->
                <span v-if="!isEditMode" :class="{empty: !bookmark.bookmarkMemo}">
                    {{ bookmark.bookmarkMemo ? bookmark.bookmarkMemo : '메모 추가' }}
                </span>
                <textarea  
                    v-else
                    ref="memo"
                    rows="1"
                    maxlength="50"
                    @focusout="changeEditMode"
                    @keydown="autoHeight" 
                    @input="changeMemo" 
                    v-model="bookmark.bookmarkMemo" 
                />
            </label>
        </p>
        <span class="edit">
            <button @click.stop="changeEditMode">
                <i class="bh-icon-modify-16"></i>
            </button>
        </span>
    </li>
</template>

<script>
import { debounce } from 'lodash'
export default {
    name: 'bookmark-list-item',
    props: {
        bookmark: Object
    },
    data() {
        return {
            isEditMode: false
        }
    },
    methods: {
        getBookmarkTime: function name(mili) {
            const seconds = mili / 1000
            const min = `${Math.floor(parseInt((seconds % 3600) / 60))}`.padStart(2, '0')
            const sec = `${Math.floor(seconds % 60)}`.padStart(2, '0')
            return `${min}:${sec}`
        },
        setEndOfContenteditable: function(contentEditableElement) {
            let range, selection
            if (document.createRange) {
                range = document.createRange()
                range.selectNodeContents(contentEditableElement)
                range.collapse(false)
                selection = window.getSelection()
                selection.removeAllRanges()
                selection.addRange(range)
            } else if (document.selection) {
                range = document.body.createTextRange()
                range.moveToElementText(contentEditableElement)
                range.collapse(false)
                range.select()
            }
        },
        changeEditMode: function() {
            this.isEditMode = !this.isEditMode
            if(this.isEditMode) {
                this.$nextTick(() => {
                    this.$refs.memo.style.height = '14px';
                    this.$refs.memo.style.height = `${this.$refs.memo.scrollHeight}px`;
                    this.$refs.memo.focus()
                })
            } else {
                const params = {
                    bookmarkId: this.bookmark.bookmarkId,
                    bookmarkMemo: this.$refs.memo.value
                }
                this.$emit('change', params)
            }
        },
        moveBookmark: function () {
            this.$emit('move', this.bookmark.bookmarkTime)
        },
        autoHeight: function(e) {
            const text = this.$refs.memo.value
            if(e.keyCode === 13) {
                e.preventDefault()
                return false
            }
            if(text.length > 50) {
                e.preventDefault()
                this.$refs.memo.value = text.substr(0, 50)
                return false
            }
            this.$refs.memo.style.height = '14px';
            this.$refs.memo.style.height = `${this.$refs.memo.scrollHeight}px`;
        },
        changeMemo: debounce(function() {
            if(this.isEditMode) {
                const params = {
                    bookmarkId: this.bookmark.bookmarkId,
                    bookmarkMemo: this.$refs.memo.value
                }
                this.$emit('change', params)
            }
        }, 500),
        removeBookmark: function() {
            this.$emit('delete', this.bookmark)
        }
    }
}
</script>

<style>

</style>