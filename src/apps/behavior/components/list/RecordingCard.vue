<template>
    <div class="card cursor-pointer" 
        :class="{
            on: isSelected,
            new: !isSelected && addNewId === recording.recordId
        }" 
        @click="onClick($event)">
        <div class="content">
            <p class="etc">
                <span class="member">{{ targetNames }}</span>
            </p>
            <p class="title" :inner-html.prop="searchedTitleHighlight(recording.message)"></p>
            <p v-if="recording.tag !== null" class="tags">
                <span 
                    class="tag"
                    v-for="tag of recording.tags"
                    :key="tag.tagId"
                >
                    {{ tag.tagName }}
                </span>
            </p>
        </div>

        <div @click.stop="openViewer($event)" v-if="recording.recordType === 'PHOTO'" class="photo">
            <img :src="recording.fileThumbnailPath" />
            <button v-if="isMultiFiles">{{ mutiFilesString }}</button>
        </div>
        <div @click.stop="openViewer($event)" v-else-if="recording.recordType === 'VIDEO'" class="video">
            <img v-if="recording.fileThumbnailPath" :src="recording.fileThumbnailPath" />
            <button></button>
            <span v-if="recording.filePlayTime" class="time">{{ filePlayTime }}</span>
        </div>
        <div v-else-if="recording.recordType === 'AUDIO'" class="record">
            <i class="bh-icon-record-fill-28 cursor-pointer"></i>
        </div>
        <div v-else class="who"> 
            <i class="bh-icon-mn-whorecord-28 cursor-pointer"></i>
        </div>
        <!--div v-else 
            :class="{
                memo: !isThumbnail, 
                color: !isWhite, 
                photo: isThumbnail,
                white: isWhite,
                yellow: isYellow,
                orange: isOrange,
                blue: isBlue,
                pink: isPink,
                'blue-green': isBlueGreen,
                red: isRed,
                purple: isPurple,
                green: isGreen,
                gray: isGray,
                gray02: isGray02,
            }"
        >
            <i v-if="!isThumbnail" class="cursor-pointer" :class="{'bh-icon-memo-fill-gray-32': isWhite, 'bh-icon-memo-fill-32': !isWhite }"></i>
            <img @click.stop="openViewer($event)" v-if="isThumbnail" :src="recording.fileThumbnailPath" />
            <button v-if="isMultiFiles">{{ mutiFilesString }}</button>
        </div-->
    </div>
</template>

<script>
import {mapActions, mapMutations} from 'vuex'
export default {
    name: 'recording-card',
    props: {
        classroomId: String,
        recording: Object,
        selectedId: String,
        keyword: String,
        addNewId: String
    },
    computed: {
        /*isWhite: function() {
            return this.recording.recordStyle.toLowerCase() === 'white'
        },
        isYellow: function() {
            return this.recording.recordStyle.toLowerCase() === 'yellow'
        },
        isOrange: function() {
            return this.recording.recordStyle.toLowerCase() === 'orange'
        },
        isBlue: function() {
            return this.recording.recordStyle.toLowerCase() === 'blue'
        },
        isPink: function() {
            return this.recording.recordStyle.toLowerCase() === 'pink'
        },
        isBlueGreen: function() {
            return this.recording.recordStyle.toLowerCase() === 'blue_green'
        },
        isRed: function() {
            return this.recording.recordStyle.toLowerCase() === 'red'
        },
        isPurple: function() {
            return this.recording.recordStyle.toLowerCase() === 'purple'
        },
        isGreen: function() {
            return this.recording.recordStyle.toLowerCase() === 'green'
        },
        isGray: function() {
            return this.recording.recordStyle.toLowerCase() === 'gray'
        },
        isGray02: function() {
            return this.recording.recordStyle.toLowerCase() === 'gray02'
        },*/
        isSelected: function() {
            return this.selectedId === this.recording.recordId
        },
        targetNames: function() {
            return this.recording.targetNames.length > 0 ? this.recording.targetNames.join(', ') : '대상없음'
        },
        isMultiFiles: function() {
            return this.recording.fileCount > 1
        },
        mutiFilesString: function() {
            return `+${this.recording.fileCount}`
        },
        /*isThumbnail: function() {
            return this.recording.recordType === 'MEMO' && this.recording.fileThumbnailPath
        },*/
        filePlayTime : function() {
            const seconds = this.recording.filePlayTime
           
            const min = `${Math.floor(seconds/60)}`.padStart(2, '0')
            const sec = `${seconds % 60}`.padStart(2, '0')
            return `${min}:${sec}`
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomRecordingDetail: 'getClassroomRecordingDetail',
        }),
        ...mapMutations('storeBehavior', {
            setBehaviorViewerOptions: 'setBehaviorViewerOptions'
        }),
        searchedTitleHighlight: function(title) {
            title = title ? title.replaceAll('>', '&gt;').replaceAll('<', '&lt;') : title
            if(this.keyword) {
                const regex = new RegExp(`(${this.keyword})(?![^<]*>)(?![^&amp;|&nbsp;|&lt;|&gt;|&quot;|&ndash;|&mdash;|&copy;|&reg;|&trade;|&asymp;|&ne;|&pound;|&euro;|&deg;]*;)`, "gi")
                return title.replace(regex, "<span class='highlight01'>" + this.keyword + "</span>")
            } else {
                return title
            }
        },
        onClick: function(e) {
            e.preventDefault()
            this.$emit('click', this.recording.recordId)
        },
        openViewer: async function(e) {   
            e.preventDefault()
            const detail = await this.getClassroomRecordingDetail({
                classroomId: this.classroomId,
                recordId: this.recording.recordId,
                isIncludeTargets: true
            })
            this.setBehaviorViewerOptions({
                isOpen: true,
                files: detail.files.map(f => {
                    return {
                        ...f, 
                        recordId: detail.recordId,
                        recordContent: detail.recordContent,
                        recordTimestamp: detail.recordTimestamp,
                        targets: detail.targets
                    }
                }),
                currentIndex: 0
            })
        }
    },
    // mounted() {
    //     console.log("addNewId", this.addNewId, this.recording.recordId)
    // }
} 
</script>

<style>

</style>