<template>
<tr 
    class="cursor-pointer"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
>
    <td>
        <div class="center" @click="selectItem(record.recordId)">
            <i class="checkbox" :class="{on: isSelected}"></i>  
        </div>
    </td>
    <td @click="openRecordDetail">
        <div class="center">
            {{ dateString }}
        </div>
    </td>
    <td @click="openRecordDetail">
        <div class="center" :inner-html.prop="targetNames">
        </div>
    </td>
    <td @click="openRecordDetail">
        <div class="center" :style="{color: isTypeFilterOn ? '#FF6600' : ''}">
            {{ recordTypeName }}
        </div>
    </td>
    <td>
        <div @click="openViewer" class="center" v-if="record.recordType === 'PHOTO'">
            <span class="photo">
                <img :src="record.fileThumbnailPath" />
            </span>
        </div>
        <div @click="openViewer" class="center" v-else-if="record.recordType === 'VIDEO'">
            <span class="video" :class="{'no-thumnail': !isThumbnailPath}">
                <img v-if="isThumbnailPath" :src="record.fileThumbnailPath" />
                <button></button>
            </span>
        </div>
        <div class="center" @click="openRecordDetail" v-else-if="record.recordType === 'AUDIO'">
            <span class="audio">
                <i></i>
            </span>
        </div>
        <div class="center" @click="openRecordDetail" v-else-if="record.recordType === 'NUGA'">
            <span class="nuga">
                <i></i>
            </span>
        </div>
        <div class="center" v-else-if="record.recordType === 'MEMO'">
            <span class="memo" :class="background">
                <img @click="openViewer" v-if="isThumbnailPath" :src="record.fileThumbnailPath" />
                <i v-else :class="{color: background !== 'white'}"></i>
            </span>
        </div>
    </td>
    <td @click="openRecordDetail" class="remove-border-right">
        <div>
            {{ record.message }}
        </div>
    </td>
    <!--td class="remove-border-left">
        <div @click="deleteItem" class="center" v-if="isDeleteBtn"><i class="remove"></i></div>
    </td-->
</tr>  
</template>

<script>
import {mapActions, mapMutations} from 'vuex'
export default {
    name: 'behavior-record-table-row',
    props: {
        record: Object,
        targets: Array,
        selected: Array,
        classroomId: String,
        highlightTargets: Array,
        isTypeFilterOn: Boolean
    },
    data() {
        return {
            isDeleteBtn: false
        }
    },
    computed: {
        dateString: function() {
            return this.$moment(this.record.recordTimestamp).format('YYYY년 M월 D일')
        },
        targetNames: function() {
            if(this.record.targetNames.length  === 0) {
                return '-'
            }
            return this.record.targetNames.map(o => {
                const color = this.highlightTargets.includes(o)
                return `<span ${color ? 'style="color: #FF6600;"' : ''}>${o}</span>`
            }).join(',&nbsp;')
        },
        isSelected: function() {
            return this.selected.includes(this.record.recordId)
        },
        recordTypeName: function() {
            const names = {
                PHOTO: '사진',
                VIDEO: '동영상',
                AUDIO: '오디오',
                MEMO: '메모',
                NUGA: '누가기록'
            }
            return names[this.record.recordType]
        },
        background: function() {
            return this.record.recordStyle.toLowerCase()
        },
        isThumbnailPath: function() {
            return !!this.record.fileThumbnailPath
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomRecordingDetail: 'getClassroomRecordingDetail',
        }),
        ...mapMutations('storeBehavior', {
            setBehaviorViewerOptions: 'setBehaviorViewerOptions'
        }),
        onMouseOver: function() {
            this.isDeleteBtn = true
        },
        onMouseLeave: function() {
            this.isDeleteBtn = false
        },
        selectItem: function(id) {
            this.$emit('toggle', id)
        },
        openRecordDetail: function() {
            this.$emit('detail', {type: this.record.recordType, id:this.record.recordId})
        },
        deleteItem: function() {
            this.$emit('deleteRow', this.record.recordId)
        },
        openViewer: async function(e) {   
            e.preventDefault()
            const detail = await this.getClassroomRecordingDetail({
                classroomId: this.classroomId,
                recordId: this.record.recordId,
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
    }
}
</script>

<style scoped>
.remove-border-right {
    border-right: 0px !important;
}
.remove-border-left {
    border-left: 0px !important;
    width: 40px;
}
.remove {
    width: 40px;
    height: 40px;
    background: url('../../../../assets/img/icon/btn_removes.png');
}
</style>