<template>
<!--tr>
    <td>
        <span class="image" :style="{background: item.pointColor}">
            <img :src="`https://download.hiclass.net/static/classroom/point/${item.pointImage}.png`" />
            <span class="score">{{ item.point }}</span>
        </span>
    </td>
    <td>
        <div class="name">{{ item.pointName }}</div>
        <template v-if="isAll">
            <div class="target">
                {{ item.targetNames.join(', ') }}
            </div>
        </template>
        <template v-else>
            <div @click="changeEditMode" v-if="!isEditMode" class="memo">
                <i class="update"></i>
                <span>{{ item.memo ? item.memo : '메모추가' }}</span>
            </div>
            <textarea  
                    v-else
                    ref="memo"
                    class="memo"
                    rows="1"
                    maxlength="50"
                    @focusout="updateMemo"
                    @keydown="autoHeight" 
                    v-model="item.memo" 
                />
        </template>
    </td>
    <td>
        <span class="time">{{ $moment(item.rewardTimestamp).format('HH:mm') }}</span>
    </td>
    <td>
        <span class="delete" @click="deletePaidPoint">
            <span class="bh-icon-delete-20 cursor-pointer"></span>
        </span>
    </td>
</tr-->

<li>
    <div class="image">
        <span class="image" :style="{background: item.pointColor}">
            <img :src="`https://download.hiclass.net/static/classroom/point/${item.pointImage}.png`" />
            <span class="score" :class="{bad: item.isNegative}">{{ item.point }}</span>
        </span>
    </div>
    <div class="content">
        <p class="name">{{ item.pointName }}</p>
        <template v-if="isAll">
            <p class="target">{{ item.targetNames ? item.targetNames.join(', ') : '' }}</p>
        </template>
        <template v-else>
            <div @click="changeEditMode" v-if="!isEditMode" class="memo">
                <i class="update"></i>
                <span>{{ item.memo ? item.memo : '메모추가' }}</span>
            </div>
            <textarea  
                    v-else
                    ref="memo"
                    class="memo"
                    rows="1"
                    maxlength="50"
                    @focusout="updateMemo"
                    @keydown="autoHeight" 
                    @keyup="validate"
                    v-model="item.memo" 
                />
        </template>
    </div>
    <div v-if="isSearch">
        <span class="student-t">{{ item.targetNames[0] }}</span>
    </div>
    <span class="line" v-if="isSearch"></span>
    <div class="date">
        <span class="time">{{ $moment(item.rewardTimestamp).format('HH:mm') }}</span>
    </div>
    <div class="delete">
        <p class="delete" @click="deletePaidPoint">
            <span class="delete bh-icon-delete-20 cursor-pointer">
                <em>삭제</em>
            </span>
        </p>
    </div>
</li>
</template>

<script>
import {mapActions} from 'vuex'
export default {
    name: 'point-paid-table-row',
    props: {
        point: Object,
        isAll: Boolean,
        isSearch: Boolean,
        classroomId: String,
        studentId: String
    },
    data() {
        return {
            isEditMode: false,
            item: {
                targetNames: []
            }
        }
    },
    watch: {
        point: {
            handler: function (newVal, oldVal) {
                if(newVal && newVal.memo !== oldVal.memo){
                    this.item = {...newVal, memo: newVal.memo ? newVal.memo.trim() : ''}
                }
            }
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            patchPaidPointMemo: 'patchPaidPointMemo'
        }),
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
            this.$refs.memo.style.height = '28px';
            this.$refs.memo.style.height = `${this.$refs.memo.scrollHeight}px`;
        },
        validate: function(e) {
            const text = this.$refs.memo.value
            if(text.length > 50) {
                e.preventDefault()
                this.$refs.memo.value = text.substr(0, 50)
                return false
            }
        },
        changeEditMode: function() {
            this.isEditMode = !this.isEditMode
            if(this.isEditMode) {
                this.$nextTick(() => {
                    this.$refs.memo.style.height = '28px';
                    this.$refs.memo.style.height = `${this.$refs.memo.scrollHeight}px`;
                    this.$refs.memo.focus()
                })
            }
        },
        updateMemo: async function() {
            this.item.memo = this.item.memo.trim()
            const params = {
                classroomId: this.classroomId,
                rewardId: this.item.rewardId,
                pointId: this.item.pointId,
                studentId: this.studentId,
                memo: this.item.memo,
                sortNo: this.item.sortNo
            }
            await this.patchPaidPointMemo(params)
            this.changeEditMode()
        },
        deletePaidPoint: function() {
            const params = {
                classroomId: this.classroomId,
                rewardId: this.item.rewardId,
                pointId: this.item.pointId,
                studentId: this.studentId,
                sortNo: this.item.sortNo
            }
            this.$emit('delete', params)
        }
    },
    created() {
        this.item = {...this.point, memo: this.point.memo ? this.point.memo : ''}
    }
}
</script>

<style scoped>
.student-t{ 
    display: inline-block;
    width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--web-Text-Gray-08, #9e9e9e);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.4;
    text-align: right;
}
.line {
    width: 1px;
    height: 14px;
    background: #D9D9D9;
    margin-left: 6px;
    margin-right: 6px;
}
span.delete {
    position: relative;
}
span.delete em {
    position: absolute;
    top: -40px;
    left: -15px;
    display: none;
    background: #000000;
    color: #fff;
    font-size: 14px;
    font-weight: 400;
    line-height: 14px;
    padding: 12px 12px 12px 12px;
}
span.delete:hover em {
    display: inline-block;
}
</style>