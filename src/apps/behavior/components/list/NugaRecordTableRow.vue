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
    <td @click="openNugaRecord">
        <div class="center">
            {{ dateString }}
        </div>
    </td>
    <td @click="openNugaRecord">
        <div v-if="record.tags && record.tags.length !== 0" class="center gap">
            <span
                v-for="tag of record.tags"
                :key="tag.tagId" 
                class="tag"
                :class="{on: highlightTags.includes(tag.tagId)}"
            >
                {{ tag.tagName }}
            </span>
        </div>
        <div v-else class="center">
            -
        </div>
    </td>
    <td @click="openNugaRecord">
        <div class="center" :inner-html.prop="targetNames">
        </div>
    </td>
    <td class="remove-border-right" @click="openNugaRecord">
        <div class="nuga-message">
            {{ record.message }}
        </div>
    </td>
    <td @click="openNugaRecord"><div class="insertedDate">{{ insertedDate }}</div></td>
    <!--td class="remove-border-left">
        <div @click="deleteItem" class="center" v-if="isDeleteBtn"><i class="remove"></i></div>
    </td-->
</tr>
</template>

<script>
export default {
    name: 'nuga-record-table-row',
    props: {
        record: Object,
        targets: Array,
        selected: Array,
        highlightTargets: Array,
        highlightTags: Array
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
        insertedDate: function() {
            return this.$moment(this.record.insertedTimestamp).format('YY.MM.DD HH:mm')
        }
    },
    methods: {
        onMouseOver: function() {
            this.isDeleteBtn = true
        },
        onMouseLeave: function() {
            this.isDeleteBtn = false
        },
        selectItem: function(id) {
            this.$emit('toggle', id)
        },
        openNugaRecord: function() {
            this.$emit('openNugaDetail', this.record.recordId)
        },
        deleteItem: function() {
            this.$emit('deleteRow', this.record.recordId)
        }
    },
}
</script>

<style scoped>
/* .remove-border-right {
    border-right: 0px !important;
} */
.remove-border-left {
    border-left: 0px !important;
    width: 40px;
}
.remove {
    width: 40px;
    height: 40px;
    background: url('../../../../assets/img/icon/btn_removes.png');
}
.behavior-wrapper__body .behavior-wrapper__body__content .report .report__content .record-tab-content table td div.nuga-message {
    font-size: 14px;
    font-weight: 400;
    line-height: 21px;
    padding: 0px 10px 0px 10px;
    margin: 6px auto;
    width: 100%;
    height: auto;
    min-height: auto;
    max-height: 100%;
    overflow: hidden;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3
}
.behavior-wrapper__body .behavior-wrapper__body__content .report .report__content .record-tab-content table td div.insertedDate {
    font-size: 14px;
    font-weight: 400;
    color: #9E9E9E;
    padding: 0;
    justify-content: center;
}
</style>