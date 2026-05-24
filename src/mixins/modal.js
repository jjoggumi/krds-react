/***************************
**** [ mixins example ] ****
****************************
 
  <template>
    <div className="modal common-modal">
      <div
        ref="modal"
        className="modal-cont-wrap"
        :style="modalStyleObj"
      ></div>
      ...
    </div>
  </template>
  
  <script>
  import modalInit from '@/mixins/modal'
  
  export default {
    name: '?',
    mixins: [modalInit],
    ...
  }
  </script>
  
  <style lang="scss" scoped>
    .modal {
      display: block;
    }
    ...
  </style>

*/
export default {
   data() {
     return {
       m_height: 0,
       m_width: 0,
     }
   },
   computed: {
     modalStyleObj() {
       return {
         "margin-top": -this.m_height + "px",
         "margin-left": -this.m_width + "px"
       };
     },
   },
   mounted() {
     if (this.$refs.modal) {
       const positionObj = this.getModalPosition(this.$refs.modal);
       this.m_height = positionObj.m_height;
       this.m_width = positionObj.m_width;
     }
     this.$hiClass.toggleBodyClass('add', 'hidden')
   },
   destroyed() {
     this.$hiClass.toggleBodyClass('remove', 'hidden')
   },
   methods: {
     getModalPosition(modal) {
       return {
         m_height: modal.clientHeight / 2,
         m_width: modal.clientWidth / 2
       }
     },
   }
   
 }