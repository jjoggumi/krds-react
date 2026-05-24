<template>
  <article class="NotificationSys type01">
    <div class="sections">
      <section>
        <h2>Alert Type</h2>
        <div>
          <HiButton class="mr-10 mb-05" color="primary" size="md" @click="messageAlert('단순한 정보 전달 목적의 알림', 'success', true)">MessageAlert: 단순한 정보전달 알림</HiButton>
          <HiButton class="mr-10 mb-05" color="primary" size="md" @click="confirmAlert('사용자의 결정을 요구하는 알림', 'error')">ConfirmAlert : 사용자의 결정요구 알림</HiButton>          
          <HiButton
            class="mr-10 mb-05"
            color="primary"
            size="md"
            @click="
              confirmAlert(
                `<div>
                    <p>HTML로 
                      <strong class='txt-primary'>커스텀 가능한</strong> 
                      <br>알림입니다.
                    </p>
                  </div>
                `,
                null
              )
            "
            >htmlAlert:커스텀 알림</HiButton
          >
        </div>
      </section>
      <section>
        <h2>Alert with Icon</h2>
        <div>
          <HiButton class="mr-10 mb-05" color="primary" size="md" @click="messageAlert('삭제하시겠습니까', 'warning', true)">Warning Icon</HiButton>
          <HiButton class="mr-10 mb-05" color="primary" size="md" @click="messageAlert('다시 전송하시겠습니까?.', 'error', true)">Error Icon</HiButton>
          <HiButton class="mr-10 mb-05" color="primary" size="md" @click="messageAlert('로그인 후 이용 가능합니다', 'info', true)">Info Icon</HiButton>
          <HiButton class="mr-10 mb-05" color="primary" size="md" @click="messageAlert('입력이 완료되었습니다.', 'success', true)">Success Icon</HiButton>
        </div>
      </section>      
      <section>
        <h2>Alert with Button</h2>
        <div>          
          <HiButton class="mr-10 mb-05" color="primary" size="md" @click="messageAlert('버튼이 있는 메세지 알림', 'success')">버튼이 있는 MessageAlert</HiButton>
          <HiButton class="mr-10 mb-05" color="primary" size="md" @click="confirmAlertBtnCustom('커스텀된 버튼이 있는 메세지 확인 알림', 'success')">커스텀 된 버튼이 있는 ConfirmAlert </HiButton>
        </div>
      </section>     
      <section>
        <h2>Toast Type</h2>
        <div>
          <HiButton class="mr-10 mb-05" color="primary" size="md" @click="showBasicToast('기본 토스트입니다')">Toast</HiButton>
          <HiButton
            color="primary"
            size="md"
            @click="
              showBasicToast(
                `
                  <div style='padding:15px 0; line-height:1.4;'>
                    HTML로 <strong class='txt-primary'>커스텀 가능한</strong>토스트입니다.<br>
                    HTML로 <strong class='txt-primary'>커스텀 가능한</strong>토스트입니다.<br>
                    HTML로 <strong class='txt-primary'>커스텀 가능한</strong>토스트입니다.<br>
                    HTML로 <strong class='txt-primary'>커스텀 가능한</strong>토스트입니다.<br>
                  </div>
                `
              )
            "
            >html Toast</HiButton
          >
        </div>
      </section>
    </div>
    <div class="ctrArea">
      <div class="optArea">
        <div class="elArea">
          <HiButton v-if="propsVal.type === 'messageAlert'" class="mr-10" block color="primary" size="md" @click="messageAlert('단순한 정보 전달 목적의 알림입니다', propsVal.icon, propsVal.btn)"
            >단순한 정보 전달 목적의 알림</HiButton
          >
          <HiButton v-if="propsVal.type === 'confirmAlert'" class="mr-10" block color="primary" size="md" 
          @click="
            propsVal.btnCustom 
              ? confirmAlertBtnCustom('사용자의 결정을 요구하는 알림입니다', propsVal.icon)
              : confirmAlert('사용자의 결정을 요구하는 알림입니다', propsVal.icon)
          "
            >사용자의 결정을 요구하는 알림</HiButton
          >          
          <HiButton v-if="propsVal.type === 'htmlAlert'" class="mr-10" block color="primary" size="md" 
          @click="
            propsVal.btnCustom 
              ? confirmAlertBtnCustom(`
                  <div>
                    <p>HTML로 
                      <strong class='txt-primary'>커스텀 가능한</strong> 
                      <br>알림입니다.
                    </p>
                  </div>
                `, propsVal.icon)
              : confirmAlert(`
                  <div>
                    <p>HTML로 
                      <strong class='txt-primary'>커스텀 가능한</strong> 
                      <br>알림입니다.
                    </p>
                  </div>
                `,propsVal.icon)
          "
            >html 커스텀 알림</HiButton
          >          
          <HiButton v-if="propsVal.type === 'toast'" class="mr-10" block color="primary" size="md" @click="showBasicToast('기본 토스트입니다.')">토스트</HiButton>
          <HiButton v-if="propsVal.type === 'htmlToast'" class="mr-10" block color="primary" size="md" @click="showBasicToast(`
          <div style='padding:15px 0; line-height:1.4;'>
            HTML로 <strong class='txt-primary'>커스텀 가능한</strong>토스트입니다.<br>
            HTML로 <strong class='txt-primary'>커스텀 가능한</strong>토스트입니다.<br>
            HTML로 <strong class='txt-primary'>커스텀 가능한</strong>토스트입니다.<br>
            HTML로 <strong class='txt-primary'>커스텀 가능한</strong>토스트입니다.<br>
          </div>
          `)">html 커스텀 토스트</HiButton>
        </div>
        <ul class="propArea">
          <li>
            <label>NOTI TYPE</label>
            <hi-select-box :value="propsVal.type" @update:value="propsVal.type = $event" :items="propsOpt.type" empty-title="TYPE" />
          </li>
          <li v-if="propsVal.type === 'messageAlert' || propsVal.type === 'confirmAlert' || propsVal.type === 'htmlAlert'">
            <label>ICON</label>
            <hi-select-box :value="propsVal.icon" @update:value="propsVal.icon = $event" :items="propsOpt.icon" empty-title="ICON" />
          </li>
          <li v-if="propsVal.type === 'messageAlert'">
            <label>BUTTON</label>
            <hi-switch v-model="propsVal.btn" @update:model="propsVal.btn = !$event" />
          </li>
          <li v-if="propsVal.type === 'confirmAlert' || propsVal.type === 'htmlAlert'">
            <label>BUTTON CUSTOM</label>
            <hi-switch v-model="propsVal.btnCustom" @update:model="propsVal.btnCustom = $event" />
          </li>
        </ul>
      </div>
      <div class="codeArea">
        <pre>
          <code v-html="generatedCode"></code>
        </pre>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: "ComponentsNotification",
  data() {
    return {      
      currentCode: "",
      propsVal: {
        type: "messageAlert",
        icon: "none",
        btn: true,
        btnCustom: false,
      },
      propsOpt: {
        type: [
          { value: "messageAlert", title: "Alert:message" },
          { value: "confirmAlert", title: "Alert:confirm" },
          { value: "htmlAlert", title: "Alert:html" },
          { value: "toast", title: "Toast" },
          { value: "htmlToast", title: "Toast:html" },
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
    confirmAlert(msg, ico, btn) {
      this.$hiClass.confirm(msg, ico, btn)
    },
    confirmAlertBtnCustom(msg, ico, btn) {
      this.$hiClass.confirm(msg, ico, {
        confirmButtonText: '맞아맞아',
        cancelButtonText: '아니야아니야'
      })
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
      const btnCustom = this.propsVal.btnCustom  ? `{
            confirmButtonText: '맞아맞아',
            cancelButtonText: '아니야아니야'
          }` : null;
      const noti2 = 
        this.propsVal.type === "confirmAlert"
          ?`  
          &lt;button @click="noti('사용자의 결정을 요구하는 알림입니다', ${ico}, ${btnCustom})"&gt;
            사용자의 결정을 요구하는 알림 확인&lt;/button&gt;

          methods: {
            noti(msg, ico, btn) {
              this.$hiClass.confirm(msg, ico, btn)
              .then(() => { })
              .catch(() => { })
            }              
          },
          
          ---------------------------------------------------------------`

          : this.propsVal.type === "htmlAlert"
          ?`  
          &lt;button @click="noti(&#96;
            &lt;div&gt;
              &lt;p&gt;HTML로 &lt;strong class='txt-primary'&gt;커스텀 가능한&lt;/strong&gt; &lt;br&gt;
              알림입니다.&lt;/p&gt; 
            &lt;/div&gt;
            &#96;, ${ico}, ${btnCustom})"&gt;
            html 커스텀 알림&lt;/button&gt;

          methods: {
            noti(msg, ico, btn) {
              this.$hiClass.confirm(msg, ico, btn)
              .then(() => { })
              .catch(() => { })
            }              
          },
          
          ---------------------------------------------------------------`

          : this.propsVal.type === "messageAlert"
          ? `          
          &lt;button @click="noti('단순한 정보 전달 목적의 알림입니다', ${ico}, ${this.propsVal.btn})"&gt;
            단순한 정보 전달 목적의 알림 확인&lt;/button&gt;

          methods: {
            noti(msg, ico, btn) {
              this.$hiClass.alert(msg, ico, btn)
            }              
          },
          
          ---------------------------------------------------------------`
          
          : this.propsVal.type === "toast"
          ? `
          &lt;button @click="noti('기본 토스트')"&gt;토스트 알림 확인&lt;/button&gt;
          `

          : ` 
          &lt;button @click="noti(&#96;
            &lt;div style='padding:15px 0; line-height:1.4;'&gt;
              HTML로 &lt;strong class='txt-primary'&gt;커스텀 가능한&lt;/strong&gt;토스트입니다.&lt;br&gt;
              HTML로 &lt;strong class='txt-primary'&gt;커스텀 가능한&lt;/strong&gt;토스트입니다.&lt;br&gt;
              HTML로 &lt;strong class='txt-primary'&gt;커스텀 가능한&lt;/strong&gt;토스트입니다.&lt;br&gt;
              HTML로 &lt;strong class='txt-primary'&gt;커스텀 가능한&lt;/strong&gt;토스트입니다.&lt;br&gt;
            &lt;/div&gt;
          &#96;)"&gt;html 커스텀 토스트&lt;/button&gt;
          `;
      const noti =
        this.propsVal.type === "confirmAlert"
          ? `this.$hiClass.confirm('사용자의 결정을 요구하는 알림입니다', ${ico}, ${btnCustom})
            .then(() => { })
            .catch(() => { });`

          : this.propsVal.type === "messageAlert"
          ? `this.$hiClass.alert('단순한 정보 전달 목적의 알림입니다.', ${ico}, ${this.propsVal.btn});`

          : ` this.$toasted.clear();
              this.$toasted.show('토스트 알림입니다.', {
              duration: 2000,
              className: "type01",
            });`;


      return `
      ${noti2}

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
