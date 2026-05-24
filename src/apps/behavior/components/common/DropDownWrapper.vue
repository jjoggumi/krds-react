<template>
<div>
    <slot :selected="currentIndex"></slot>
</div>
</template>

<script>
export default {
    name: 'drop-down-wrapper',
    props: {
        totalElements: {
            type: Number,
            default: 0
        },
        itemTag: String
    },
    data() {
        return {
            currentIndex: -1
        }
    },
    computed: {
        keyboardDown: function() {
            return (event) => {
                const {key} = event
                const updownkeyName = ['ArrowDown', 'ArrowUp']
                if(updownkeyName.includes(key)) {
                    switch(key) {
                        case 'ArrowDown':
                            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                            this.currentIndex = this.currentIndex + 1
                        break;
                        case 'ArrowUp': 
                            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                            this.currentIndex = this.currentIndex - 1
                        break;
                    }


                    if(this.currentIndex < 0) {
                        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                        this.currentIndex = this.totalElements - 1
                    }

                    if(this.currentIndex > this.totalElements - 1) {
                        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                        this.currentIndex = 0
                    }
                    const selected = document.querySelectorAll(this.itemTag)[this.currentIndex]
                    const parent = selected.offsetParent
                    
                    if(key === 'ArrowDown') {
                        if((selected.offsetHeight * (this.currentIndex + 1)) >= parent.offsetHeight ) {
                            selected.scrollIntoView(false)
                        } else if(parent.scrollTop !== 0 && parent.scrollTop > selected.offsetHeight * (this.currentIndex + 1)) {
                            selected.scrollIntoView(true)
                        }
                    } else {
                        selected.scrollIntoView(false)
                    }
                } else if(key === 'Enter') {
                    this.$emit('enter', this.currentIndex)
                }
            }
        }
    },
    mounted() {
        document.addEventListener("keydown", this.keyboardDown)
    },
    beforeDestroy() {
        document.removeEventListener("keydown", this.keyboardDown)
    }
}
</script>

<style>

</style>