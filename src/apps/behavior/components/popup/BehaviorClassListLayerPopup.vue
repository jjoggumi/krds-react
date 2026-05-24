<template>
    <div class="class-list">
        <div class="list">
            <ul>
                <li 
                    v-for="item of items"
                    :key="item.classroomId"
                    :class="selected === item.classroomId ? 'on' : ''"
                    @click="selectClassroom(item)"
                >
                    {{ item.classroomName }}
                </li>
            </ul>
            <div ref="scrollListAccess"></div> 
        </div>
        <div class="manage">
            <button class="manage-add" @click="openAddModal"><i class="bh-plus-orange-24"></i>새 교실 만들기</button>
            <button class="manage-setting" @click="openManageModal"><i class="bh-icon-setting-24"></i>교실 관리</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'behavior-class-list-layer-popup',
    props: {
        selected: String,
        items: Array,
        curPage: Number
    },
    data() {
        return {
            obsRef: null,
            observer: null
        }
    },
    methods: {
        selectClassroom: function(item) {
            this.$emit('clickClassroom', item)
        },
        openAddModal: function() {
            this.$emit('openAddModal')
        },
        openManageModal: function() {
            this.$emit('openManageModal')
        },
        scrollObserver: function() {
            this.$nextTick(function() {
                const option = {
                    root: null,
                    rootMargin: '0px',
                    threshold: 1
                }

                const callback = async([entry]) => {
                    if (entry.isIntersecting) {
                        this.$emit('classroomsPageSearch', this.curPage + 1)
                    }
                };

                this.observer = new IntersectionObserver(callback, option);
                this.observer.observe(this.obsRef)
            })
        }
    },
    mounted() {
        this.obsRef = this.$refs.scrollListAccess
    },
    created() {
        this.scrollObserver()
    }
}
</script>

<style>

</style>