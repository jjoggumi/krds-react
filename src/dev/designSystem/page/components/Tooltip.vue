<template>
  <article class="tooltipSys type01">
    <div class="sections">
      <section>
        <h2>Tooltip Icon</h2>
        <div class="hi-row">
          <div class="col-sm-3">
            <HiTooltip ico="info" position="right"
              class="hi-tooltip-wrap"
              :title-html="`정보아이콘이 들어가는 툴팁입니다.`"
            />
          </div>
          <div class="col-sm-3">
            <HiTooltip ico="help" position="right"
              class="hi-tooltip-wrap"
              :title-html="`도움아이콘이 들어가는 툴팁입니다.`"
            />
          </div>          
        </div>
      </section>     
      <section>
        <h2>Tooltip Color</h2>
        <div class="hi-row">
          <div class="col-sm-2 pt-10 pb-10" >
            <HiTooltip ico="info" position="right" isActive
              class="hi-tooltip-wrap"
              :title-html="`basic color`"
            />
          </div>
          <div class="col-sm-2 pt-10 pb-15" :class="{ 'bg-black': item.value === 'white' }" 
            :style="{'border-radius': item.value === 'white' ? '5px' : '0'}" v-for="item in color" :key="item.value">
            <HiTooltip ico="info" position="right" :color="item.value" isActive
              class="hi-tooltip-wrap"
              :title-html="`${item.value} color`"
            />
          </div>          
        </div>
      </section>     
      <section>
        <h2>Tooltip Position</h2>
        <div class="hi-row mb-40">
          <div class="col-sm-3">
            <HiTooltip position="right" isActive
              class="hi-tooltip-wrap"
              :title-html="`우측에 표시되는 툴팁입니다.`"
            />
          </div>
          <div class="col-sm-3 txt-right">
            <HiTooltip position="left" isActive
              class="hi-tooltip-wrap"
              :title-html="`좌측에 표시되는 툴팁입니다.`"
            />
          </div>
          <div class="col-sm-3 txt-center">
            <HiTooltip position="top" isActive
              class="hi-tooltip-wrap"
              :title-html="`상단에 표시되는 툴팁입니다.`"
            />
          </div>
          <div class="col-sm-3 txt-center">
            <HiTooltip position="bottom" isActive
              class="hi-tooltip-wrap"
              :title-html="`하단에 표시되는 툴팁입니다.`"
            />
          </div>
        </div>
        <div class="hi-row mb-40">
          <div class="col-sm-4">
            <HiTooltip isActive
              class="hi-tooltip-wrap"
              :title-html="`position 지정안된 툴팁입니다.`"
            />
          </div>
        </div>
      </section>     
      <section>
        <h2>Tooltip Animation</h2>
        <div class="hi-row mt-50">
          <div class="col-sm-2">
          </div>
          <div class="col-sm-3">
            <HiTooltip position="bottom" ico="none" ani="x" isActive
              class="hi-tooltip-wrap"
              :title-html="`X축으로 움직이는 툴팁입니다.`"
            />
          </div>
          <div class="col-sm-3">            
            <HiTooltip position="bottom" ico="none" ani="y" isActive
              class="hi-tooltip-wrap"
              :title-html="`Y축으로 움직이는 툴팁입니다.`"
            />
          </div>          
          <div class="col-sm-3">            
            <HiTooltip position="bottom" ico="none" ani="fade" isActive
              class="hi-tooltip-wrap"
              :title-html="`fade in out 효과 툴팁입니다.`"
            />
          </div>          
        </div>
      </section>     
    </div>    
  </article>
</template>

<script>
import designsysData from "@/dev/designSystem/assets/js/designsysData.js"
export default {
  name: "ComponentsTooltip",
  data() {
    return {
      color: designsysData.color,
      propsVal: {
        type: "messageAlert",
        icon: "none",
        btn: false,
      },
      propsOpt: {
        type: [
          { value: "messageAlert", title: "messageAlert" },
          { value: "confirmAlert", title: "confirmAlert" },
          { value: "toast", title: "toast" },
        ],
        icon: [
          { value: "none", title: "none" },
          { value: "success", title: "success" },
          { value: "info", title: "info" },
          { value: "warning", title: "warning" },
          { value: "error", title: "error" },
        ],
      },
    };
  },
  methods: {
    confirmAlert(msg, ico) {
      this.$hiClass
        .confirm(msg, ico)
        .then(() => {
          console.log("확인");
        })
        .catch(() => {
          console.log("취소");
        });
    },
    messageAlert(msg, ico, btn) {
      this.$hiClass.alert(msg, ico, btn);
    },
    showBasicToast(msg) {
      this.$toasted.clear();
      this.$toasted.show(msg, {
        duration: 2000,
        className: "type01",
      });
    },
  },
  computed: {
    generatedCode() {
      const ico = this.propsVal.icon !== "none" ? `'${this.propsVal.icon}'` : null;
      const noti =
        this.propsVal.type === "confirmAlert"
          ? `this.$hiClass
          .confirm('메세지 액션 알림입니다', ${ico})
          .then(() => {
            console.log("확인");
          })
          .catch(() => {
            console.log("취소");
          });`
          : this.propsVal.type === "messageAlert"
          ? `this.$hiClass.alert('메세지 알림입니다.', ${ico}, ${this.propsVal.btn});`
          : `this.$toasted.show('토스트 알림입니다.', {
            duration: 2000,
            className: "type01",
          });`;

      return `
      methods: {
        noti(){
          ${noti}
        }
      },
    `;
    },
  },
};
</script>
