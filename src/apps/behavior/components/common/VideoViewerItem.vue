<template>
<video 
    ref="videoPlayer"  id="vjs_video"
    class="video-js vjs-theme-forest" />
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.min.css'

import '@videojs/themes/dist/forest/index.css'
export default {
    name: 'video-viewer-item',
    props: {
        file: Object
    },
    data() {
        return {
            player: null
        }
    },
    mounted() {
        this.$nextTick(() => {
            const playSrc = (this.file.fileTranscodePath || this.file.fileOriginalPath)
                .replace('https://download.hiclass.net', 'https://streaming.hiclass.net')
            const options = {
                autoplay: false,
                controls: true,
                sources: [
                    {
                        src: playSrc,
                        type: this.file.fileContentType
                    }
                ],
                width: '720px',
                height: '480px'
            }
            this.player = videojs(this.$refs.videoPlayer, options, () => {
                this.player.log('onPlayerReady', this);
            })
        })
    }
}
</script>

<style>

</style>