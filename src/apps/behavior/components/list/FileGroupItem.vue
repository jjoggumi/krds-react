<template>
    <div class="photo-group">
        <div class="date" @click="onClickGroup">
            <input type="checkbox" :checked="isAllGroupChecked" />
            <label>
                <span>{{ groupTitle }}</span>
            </label>
        </div>
        <div class="photo-list">
            <div class="photo" v-for="(item, index) of items" :key="item.fileId">
                <input type="checkbox" :checked="isCheck(item.fileId)">
                <label @click="onClickItem(item.fileId)"></label>
                <div @click="openViewer(item, index)" class="photo-img">
                    <img v-if="getThumbnailPath(item)" :src="getThumbnailPath(item)" />
                </div>
                <span v-if="item.fileCategory === 'VIDEO'" class="video-play-btn"></span>
            </div>
        </div>
    </div>
</template>

<script>
import {mapActions, mapMutations} from 'vuex'
export default {
    name: 'file-group-item',
    props: {
        groupName: String,
        items: Array,
        selected: Array,
        classroomId: String
    },
    computed: {
        isAllGroupChecked: function() {
            const ids = this.items.map(o => o.fileId)

            return ids.every(i => this.selected.includes(i))
        },
        groupTitle: function() {
            const date = this.$moment(this.groupName, 'YYYYMMDD', true).format('YYYY년 M월 D일')
            const day = this.getDay(this.$moment(this.groupName, 'YYYYMMDD', true).day())
            return `${date} (${day})`
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomRecordingDetail: 'getClassroomRecordingDetail',
        }),
        ...mapMutations('storeBehavior', {
            setBehaviorViewerOptions: 'setBehaviorViewerOptions'
        }),
        getDay: function(dayNumber) {
            switch(dayNumber) {
                case 0:
                    return '일'
                case 1:
                    return '월'
                case 2:
                    return '화'
                case 3:
                    return '수'  
                case 4:
                    return '목'
                case 5:
                    return '금'
                case 6:
                    return '토'              
            }
        }, 
        openViewer: async function(item, idx) {   
            const detail = await this.getClassroomRecordingDetail({
                classroomId: this.classroomId,
                recordId: item.recordId,
                isIncludeTargets: true
            })
            this.setBehaviorViewerOptions({
                isOpen: true,
                files: this.items.map(f => {
                    return {
                        ...f, 
                        recordContent: f.recordId === detail.recordId ? detail.recordContent : null,
                        targets: f.recordId === detail.recordId ? detail.targets : []
                    }
                }),
                currentIndex: idx
            })
        },
        isCheck: function(id) {
            return this.selected.includes(id)
        },
        onClickItem: function(id) {
            this.$emit('toggleItem', id)
        },
        onClickGroup: function() {
            const params = {
                check: !this.isAllGroupChecked,
                group: this.groupName
            }
            
            this.$emit('toggleGroup', params)
        },
        getThumbnailPath: function(item) {
            return item.fileCategory === 'PHOTO' 
                ? item.fileOriginalPath 
                : (item.fileThumbnailPath ? item.fileThumbnailPath : '')
        }
    }
}
</script>

<style scoped>
.photo-list .photo .video-play-btn {
    background: url('../../../../assets/img/icon/ic_play_circle_fill_38.png');
    width: 38px;
    height: 38px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
}
</style>