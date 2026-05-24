<template>
    <div class="hi-modal-common modal-flex" style="display: block;">
        <div class="modal__dim"></div>
        <div class="behavior-modal01">
            <div class="file-modal-wrap"> 
                <div class="title"> 
                    전체 선택 중입니다.<br/>
                    잠시만 기다려주세요.
                </div>
                <div class="progress-number"> 
                    {{ progressString }}
                </div>
                <div class="progress-bar"> 
                    <div class="progress-current" :style="{width: progressWidth}">
                    </div>
                </div>
                <div class="file-modal-btn-wrap"> 
                    <button @click="closeModal">취소</button>
                </div>
            </div>
        </div>
    </div>   
</template>

<script>
export default {
    name: 'behavior-file-modal',
    props: {
        contentString: String,
        progress: Object
    },
    data() {
        return {
            total: 0,
            current: 0,
            width: 0
        }
    },
    computed: {
        progressString: function() {
            return `${this.current}/${this.total}`
        },
        progressWidth: function() {
            return `${this.width}%`
        }
    },
    watch: {
        progress: {
            handler: async function (newVal, oldVal) {
                if(newVal && newVal !== oldVal){
                    this.total = newVal.totalElements
                    this.current = (newVal.number + 1) * newVal.size
                    this.width = Math.floor(this.current / this.total * 100)
                }
            }
        }
    },
    methods: {
        closeModal: function() {
            this.$emit('close')
        }
    },
    created() {
        this.total = this.progress.totalElements
        this.current = (this.progress.number + 1) * this.progress.size

        this.width = Math.floor(this.current / this.total * 100)
    }
}
</script>

<style scoped>
.behavior-modal01 .file-modal-wrap {
    width: 360px;
    height: 273px;
    border-radius: 20px;
    background: #fff;
    padding: 40px 30px 40px 30px;
}
.behavior-modal01 .file-modal-wrap .title {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 300px;
    height: 81px;
    font-size: 18px;
    font-weight: 700;
    line-height: 27px;
}
.behavior-modal01 .file-modal-wrap .progress-number {
    font-size: 14px;
    font-weight: 400;
    line-height: 14px;
    text-align: center;
}
.behavior-modal01 .file-modal-wrap .progress-bar {
    position: relative;
    width: 300px;
    height: 16px;
    border-radius: 8px;
    background: #F3F3F3;
    margin-top: 8px;
    margin-bottom: 30px;
}
.behavior-modal01 .file-modal-wrap .progress-bar .progress-current{
    height: 100%;
    border-radius: 8px;
    background: #FF8737;
    width: 0px;
}
.behavior-modal01 .file-modal-wrap .file-modal-btn-wrap {
    width: 300px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.behavior-modal01 .file-modal-wrap .file-modal-btn-wrap button {
    width: 140px;
    height: 44px;
    border-radius: 40px;
    border: 1px solid #D6D6D6;
    font-size: 16px;
    font-weight: 700;
    line-height: 16px;
}
</style>