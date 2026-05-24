<template>
  <article class="formSys type01">
    <div class="sections">
      <section>
        <h2 class="d-flex j-between">Checkbox 
          <HiButton color="primary" @click="setCode('checkboxCode')" > 코드 보기 </HiButton>
        </h2>
        <!-- <div v-for="(day, index) in checkArray" :key="index">
          <input type="checkbox" :id="'check' + index" :value="day.value" :checked="checkArraySelected.includes(day.value)" />
          <label :for="'check' + index"
            ><span>{{ day.title }}</span></label
          >
        </div>
        <br /><br /> -->
        <div class="hi-row no-gutters mb-30">
          <div class="col-sm-6">          
            <div class="form-check">
              <input type="checkbox" id="check" />
              <label for="check"><span>체크박스</span></label>
            </div>          
            <div class="form-check">
              <input type="checkbox" id="checked" checked />
              <label for="checked"><span>체크박스 선택</span></label>
            </div>          
            <div class="form-check">
              <input type="checkbox" id="check-disabled" disabled />
              <label for="check-disabled"><span>체크박스 비활성화</span></label>
            </div>          
            <div class="form-check">
              <input type="checkbox" id="checked-disabled" checked disabled />
              <label for="checked-disabled"><span>체크박스 선택 비활성화</span></label>
            </div>
          </div>
          <div class="col-sm-6">          
            <div class="form-check">
              <input type="checkbox" id="check-sq" class="sq-type"/>
              <label for="check-sq"><span>네모체크</span></label>
            </div>          
            <div class="form-check">
              <input type="checkbox" id="checked-sq" checked class="sq-type"/>
              <label for="checked-sq"><span>네모체크 선택</span></label>
            </div>          
            <div class="form-check">
              <input type="checkbox" id="check-disabled-sq" disabled class="sq-type"/>
              <label for="check-disabled-sq"><span>네모체크 비활성화</span></label>
            </div>          
            <div class="form-check">
              <input type="checkbox" id="checked-disabled-sq" checked disabled class="sq-type"/>
              <label for="checked-disabled-sq"><span>네모체크 선택 비활성화</span></label>
            </div>        
          </div> 
        </div>
        <div>
          <input type="checkbox" id="check-btn" class="btn-type"/>
          <label for="check-btn"><span>버튼형체크</span></label>      
          <input type="checkbox" id="checked-btn" checked class="btn-type"/>
          <label for="checked-btn"><span>버튼형체크 선택</span></label>  
        </div>
      </section>
      <section>
        <h2 class="d-flex j-between">Radio 
          <HiButton color="primary" @click="setCode('radioCode')"> 코드 보기 </HiButton>
        </h2>
        <div class="mb-30">
          <div class="form-check">
            <input type="radio" id="radio" name="radio"/>
            <label for="radio"><span>라디오</span></label>
          </div>
          <div class="form-check">
            <input type="radio" id="radio-checked" name="radio" checked />
            <label for="radio-checked"><span>라디오 선택</span></label>
          </div>
          <div class="form-check">
            <input type="radio" id="radio-disabled" disabled />
            <label for="radio-disabled"><span>라디오 비활성화</span></label>
          </div>
          <div class="form-check">
            <input type="radio" id="radio-checked-disabled" checked disabled />
            <label for="radio-checked-disabled"><span>라디오 선택 비활성화</span></label>
          </div>
        </div>
        <div>
          <input type="radio" id="radio1" name="radio1" class="btn-type"/>
          <label for="radio1"><span>라디오</span></label>
          <input type="radio" id="radio-checked1" name="radio1" checked class="btn-type"/>
          <label for="radio-checked1"><span>라디오 선택</span></label>
        </div>
      </section>
      <section>
        <h2 class="d-flex j-between">Checkbox & Radio Inline
          <HiButton color="primary" @click="setCode('checkboxInlineCode')" > 코드 보기 </HiButton>
        </h2>
        <div class="mb-20">
          <div class="form-check-inline">
            <input type="checkbox" id="check" />
            <label for="check"><span>체크박스</span></label>
          </div>          
          <div class="form-check-inline">
            <input type="checkbox" id="checked" checked />
            <label for="checked"><span>체크박스 선택</span></label>
          </div>          
          <div class="form-check-inline">
            <input type="checkbox" id="check-disabled" disabled />
            <label for="check-disabled"><span>체크박스 비활성화</span></label>
          </div>          
          <div class="form-check-inline">
            <input type="checkbox" id="checked-disabled" checked disabled />
            <label for="checked-disabled"><span>체크박스 선택 비활성화</span></label>
          </div>
        </div>
        <div class="mb-20">
          <div class="form-check-inline">
            <input type="checkbox" id="check-sq" class="sq-type"/>
            <label for="check-sq"><span>네모체크</span></label>
          </div>          
          <div class="form-check-inline">
            <input type="checkbox" id="checked-sq" checked class="sq-type"/>
            <label for="checked-sq"><span>네모체크 선택</span></label>
          </div>          
          <div class="form-check-inline">
            <input type="checkbox" id="check-disabled-sq" disabled class="sq-type"/>
            <label for="check-disabled-sq"><span>네모체크 비활성화</span></label>
          </div>          
          <div class="form-check-inline">
            <input type="checkbox" id="checked-disabled-sq" checked disabled class="sq-type"/>
            <label for="checked-disabled-sq"><span>네모체크 선택 비활성화</span></label>
          </div>
        </div>     
        <div>
          <div class="form-check-inline">
            <input type="radio" id="radio2" name="radio2"/>
            <label for="radio2"><span>라디오</span></label>
          </div>
          <div class="form-check-inline">
            <input type="radio" id="radio-checked2" name="radio2" checked />
            <label for="radio-checked2"><span>라디오 선택</span></label>
          </div>
          <div class="form-check-inline">
            <input type="radio" id="radio-disabled" disabled />
            <label for="radio-disabled2"><span>라디오 비활성화</span></label>
          </div>
          <div class="form-check-inline">
            <input type="radio" id="radio-checked-disabled" checked disabled />
            <label for="radio-checked-disabled"><span>라디오 선택 비활성화</span></label>
          </div>
        </div>
      </section>
      <section>        
        <h2 class="d-flex j-between">Switch 
          <HiButton color="primary" @click="setCode('switchCode')"> 코드 보기 </HiButton>
        </h2>
        <div>
          <!-- <hi-switch v-model="switchValue" @update:model="switchValue = $event" invert/> -->
          <hi-switch v-model="switchValue" invert />
          <hi-switch v-model="switchValue" />
          <hi-switch v-model="switchValue" disabled />
        </div>
      </section>
    </div>
    <div class="ctrArea">      
      <div class="codeArea">
        <pre>
          <code v-html="currentCode"></code>
        </pre>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: "CheckRadioSwitch",
  data() {
    return {
      currentCode: "",
      switchValue: false,
      // checkArraySelected: [1, 3],
      // checkArray: [
      //   { title: "월요일", value: 1 },
      //   { title: "화요일", value: 2 },
      //   { title: "수요일", value: 3 },
      //   { title: "목요일", value: 4 },
      //   { title: "금요일", value: 5 },
      // ],     
    };
  },
  methods: {
    setCode(type) {
      const codeMap = {
        checkboxCode: `// 기본 체크
        <div class="form-check">
          <input type="checkbox" id="check">
          <label for="check"><span>체크박스</span></label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="checked" checked>
          <label for="checked"><span>체크박스 선택</span></label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="check-disabled" disabled>
          <label for="check-disabled"><span>체크박스 비활성화</span></label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="checked-disabled" checked disabled>
          <label for="checked-disabled"><span>체크박스 선택 비활성화</span></label>
        </div>

        // 네모 체크
        <div class="form-check">
          <input type="checkbox" id="check-sq" class="sq-type">
          <label for="check-sq"><span>네모체크</span></label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="checked-sq" checked class="sq-type">
          <label for="checked-sq"><span>네모체크 선택</span></label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="check-disabled-sq" disabled class="sq-type">
          <label for="check-disabled-sq"><span>네모체크 비활성화</span></label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="checked-disabled-sq" checked disabled class="sq-type">
          <label for="checked-disabled-sq"><span>네모체크 선택 비활성화</span></label>
        </div>

        // 버튼형 체크
        <div>
          <input type="checkbox" id="check-btn" class="btn-type">
          <label for="check-btn">
            <span >버튼형체크</span>
          </label>
          <input type="checkbox" id="checked-btn" checked="checked" class="btn-type">
          <label for="checked-btn">
            <span>버튼형체크 선택</span>
          </label>
        </div>
        `,
        radioCode: `// 기본 라디오
        <div class="form-check">
          <input type="radio" id="radio" name="radio">
          <label for="radio"><span>라디오</span></label>
        </div>
        <div class="form-check">
          <input type="radio" id="radio-checked" name="radio" checked>
          <label for="radio-checked"><span>라디오 선택</span></label>
        </div>
        <div class="form-check">
          <input type="radio" id="radio-disabled" disabled>
          <label for="radio-disabled"><span>라디오 비활성화</span></label>
        </div>
        <div class="form-check">
          <input type="radio" id="radio-checked-disabled" checked disabled>
          <label for="radio-checked-disabled"><span>라디오 선택 비활성화</span></label>
        </div>

        // 버튼형 라디오
        <div>
          <input type="radio" id="radio-btn" name="radio1" class="btn-type">
          <label for="radio-btn"><span>라디오</span></label>
          <input type="radio" id="radio-checked-btn" name="radio1" checked class="btn-type">
          <label for="radio-checked-btn"><span>라디오 선택</span></label>
        </div>    
      `,
      checkboxInlineCode: `// 체크 inline 
        <div class="form-check-inline">
          <input type="checkbox" id="check">
          <label for="check"><span>체크박스</span></label>
        </div>
        <div class="form-check-inline">
          <input type="checkbox" id="checked" checked>
          <label for="checked"><span>체크박스 선택</span></label>
        </div>
        <div class="form-check-inline">
          <input type="checkbox" id="check-disabled" disabled>
          <label for="check-disabled"><span>체크박스 비활성화</span></label>
        </div>
        <div class="form-check-inline">
          <input type="checkbox" id="checked-disabled" checked disabled>
          <label for="checked-disabled"><span>체크박스 선택 비활성화</span></label>
        </div>

        // 네모체크 inline 
        <div class="form-check-inline">
          <input type="checkbox" id="check-sq" class="sq-type">
          <label for="check-sq"><span>네모체크</span></label>
        </div>
        <div class="form-check-inline">
          <input type="checkbox" id="checked-sq" checked class="sq-type">
          <label for="checked-sq"><span>네모체크 선택</span></label>
        </div>
        <div class="form-check-inline">
          <input type="checkbox" id="check-disabled-sq" disabled class="sq-type">
          <label for="check-disabled-sq"><span>네모체크 비활성화</span></label>
        </div>
        <div class="form-check-inline">
          <input type="checkbox" id="checked-disabled-sq" checked disabled class="sq-type">
          <label for="checked-disabled-sq"><span>네모체크 선택 비활성화</span></label>
        </div>
        
        // 라디오 inline 
        <div class="form-check-inline">
          <input type="radio" id="radio" name="radio2">
          <label for="radio"><span>라디오</span></label>
        </div>
        <div class="form-check-inline">
          <input type="radio" id="radio-checked" name="radio2" checked>
          <label for="radio-checked"><span>라디오 선택</span></label>
        </div>
        <div class="form-check-inline">
          <input type="radio" id="radio-disabled" disabled>
          <label for="radio-disabled"><span>라디오 비활성화</span></label>
        </div>
        <div class="form-check-inline">
          <input type="radio" id="radio-checked-disabled" checked disabled>
          <label for="radio-checked-disabled"><span>라디오 선택 비활성화</span></label>
        </div>   
      `,
        switchCode: `
      <hi-switch v-model="switchValue" invert />
      <hi-switch v-model="switchValue" />
      <hi-switch v-model="switchValue" disabled />
      `,
      };

      // type에 따라 currentCode 설정
      this.currentCode = this.encodeHTML(codeMap[type] || `<div>default</div>`);
    },
    encodeHTML(html) {
      const div = document.createElement("div");
      div.innerText = html;
      return div.innerHTML;
    },
  },
};
</script>
<style lang="scss" scoped>
.formSys{
  .codeArea{
    height:calc(100% - 114px) !important;
  }
}

</style>
