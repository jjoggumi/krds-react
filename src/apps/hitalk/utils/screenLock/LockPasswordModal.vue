<!--
@File(Method): LockPasswordModal.vue
@Description: 잠금모드 암호설정
@Modified: 2025-04-16 - #72806 하이톡웹뷰 잠금모드 디자안 반영
-->
<template>
  <HiModal type="type01" @close="onClose" size="sm">
    <template v-slot:heading>
      잠금모드 암호 설정
      <p class="smr">잠금모드 해제 시 필요한 암호를 설정해주세요.</p>
    </template>
    <template v-slot:content>
      <div class="input-wrap">
        <input type="password" maxlength=4 v-model="password1" @keydown='event => onKeydownPassword(event, 0)' placeholder="잠금모드 암호 입력 (숫자 4자리)" />
        <span class="counter">{{ password1.length }}/4</span>
      </div>
      <div class="input-wrap" :class="{ wrong }">
        <input type="password" maxlength=4 v-model="password2" @keydown='event => onKeydownPassword(event, 1)' placeholder="잠금모드 암호 확인" />
        <span class="counter">{{ password2.length }}/4</span>
      </div>
      <span v-if="wrong" class="wrong">암호를 확인해 주세요.</span>
    </template>
    <template v-slot:footer>          
      <HiButton @click="submitPassword" size="md" :disabled="!gotValidInput">확인</HiButton>
    </template> 
  </HiModal>
</template>

<script>
import { useScreenLockController } from "@/apps/hitalk/utils/screenLock"

const screenLockController = useScreenLockController();
const isDigit = n => /^\d$/.test(n);  

export default {
  props: {
    onPasswordSet: {
      type: Function,
      required: true
    },
    onClose: {
      type: Function,
      required: true
    }
  },
  computed: {
    gotValidInput() {
      return this.password1.length === 4 && this.password1 === this.password2;
    },
    wrong() {
      return this.password1.length > 0 && this.password2.length > 0 && this.password1 !== this.password2;
    }
  },
  data() {
    return {
      password1: '',
      password2: '',
    };
  },
  methods: {
    submitPassword() {
      if (this.gotValidInput) {
        this.onPasswordSet(this.password1);
      }
    },
    onKeydownPassword(event, idx) {
      event.preventDefault();
      const pwdKey = idx === 0 ? 'password1' : 'password2';
      const key = event.key;
      if (!(isDigit(key) || ['Backspace', 'Enter'].includes(key))) {
        return;
      }
      ({
        Backspace: () => {
          if (this[pwdKey].length === 0) {
            return idx === 1 ? this.$el.querySelectorAll('input')[0].focus() : null;
          }
          const { selectionStart, selectionEnd } = event.target;
          this[pwdKey] = (selectionStart !== selectionEnd)
            ? this[pwdKey].substring(0, selectionStart) + this[pwdKey].substring(selectionEnd)
            : this[pwdKey].substring(0, this[pwdKey].length - 1);
        },
        Enter: () => [
            () => this.$el.querySelectorAll('input')[1].focus(),
            () => this.submitPassword()
          ][idx]()
      }[key] || (() => {
        this[pwdKey] = (this[pwdKey] + key).replace(/\D/g, '').substring(0, 4);
      }))()
      if (this[pwdKey].length === 4 && idx === 0)
        this.$el.querySelectorAll('input')[1].focus();
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$el.querySelector('input').focus();
    });
  },
}
</script>

<style scoped lang="scss">
.input-wrap {
  width: 100%;
  height: 40px;
  border: solid 1px #e0e0e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-bottom: 3px;
  + .input-wrap {
    margin-top: 8px;
  }
  input {
    border: none;
    width: 100%;
    background: transparent;
    padding: 10px 12px;
    flex-grow: 1;
    font-size: 50px;
    letter-spacing: 0px;
    &::placeholder {
      letter-spacing: 0px;      
      font-size: 16px;
    }
    &:placeholder-shown {    
      font-size: 16px;
    }
  }  
  .counter {
    color: #b3b3b3;
    padding: 10px 12px;
    display: inline-block;
  }
}

.input-wrap.wrong {
  border: solid 1px #ff4d4f;
}

span.wrong {
  color: #ff4d4f;
  font-size: 12px;
  width: 100%;
  display: inline-block;
  text-align: left;
  padding-left: 5px;
}
</style>