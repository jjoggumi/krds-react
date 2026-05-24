<template>
  <article class="modalSys type01">
    <div class="sections">
      <section>
        <h2>Modal Type</h2>
        <HiButton color="primary" size="md" @click="$set(modalType, 0, true)">Default</HiButton>
        <HiButton color="primary" size="md" @click="$set(modalType, 2, true)">Event</HiButton>
        <HiButton color="secondary" size="md" @click="$set(modalType, 1, true)">Opt : 상단 닫기버튼 스킵</HiButton>        
        <HiModal type="type01" v-show="modalType[0]" @close="$set(modalType, 0, false)">
          <template v-slot:heading>기본 모달</template>
          <template v-slot:content>
            <div class="desc">컨텐츠모달, 알림모달, 메시지모달 등 <br /><strong>현행에서 주로 사용되는 UI</strong> 입니다.</div>
          </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalType, 0, false)">취소</HiButton>
            <HiButton color="primary" size="lg" @click="$set(modalType, 0, false)">확인</HiButton>
          </template>
        </HiModal>        
        <HiModal type="type01" closeSkip v-show="modalType[1]" @close="$set(modalType, 1, false)">
          <template v-slot:heading>Option :상단 닫기버튼 스킵</template>
          <template v-slot:content>
            <div class="desc">메세지 알림 모달 형태로 <br />하단버튼으로 상단 닫기 이벤트를 대신함</div>
          </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalType, 1, false)">취소</HiButton>
            <HiButton color="primary" size="lg" @click="$set(modalType, 1, false)">확인</HiButton>
          </template>
        </HiModal>
        <HiModal type="type01" closeSkip v-show="modalType[2]" @close="$set(modalType, 2, false)">
          <template v-slot:heading>event</template>
          <template v-slot:content>
            <div class="desc">메세지 알림 모달 형태로 <br />하단버튼으로 상단 닫기 이벤트를 대신함</div>
          </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalType, 2, false)">취소</HiButton>
            <HiButton color="primary" size="lg" @click="$set(modalType, 2, false)">확인</HiButton>
          </template>
        </HiModal>
      </section>

      <section>
        <h2>Modal Size</h2>
        <HiButton color="primary" size="md" @click="$set(modalSize, 4, true)">xs (360px)</HiButton>
        <HiButton color="primary" size="md" @click="$set(modalSize, 0, true)">sm (400px)</HiButton>
        <HiButton color="primary" size="md" @click="$set(modalSize, 1, true)">md (620px)</HiButton>
        <HiButton color="primary" size="md" @click="$set(modalSize, 2, true)">lg (780px)</HiButton>
        <HiButton color="primary" size="md" @click="$set(modalSize, 3, true)">xl  (850px)</HiButton>
        <HiButton color="primary" size="md" @click="$set(modalSize, 5, true)">Full (360px)</HiButton>
        <HiModal type="type01" size="xs" v-show="modalSize[4]" @close="$set(modalSize, 4, false)">
          <template v-slot:heading>Extra Small Modal(360px) </template>
          <template v-slot:content>Extra Small Modal Content </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalSize, 4, false)">취소</HiButton>
            <HiButton color="primary" size="lg" @click="$set(modalSize, 4, false)">확인</HiButton>
          </template>
        </HiModal>
        <HiModal type="type01" size="sm" v-show="modalSize[0]" @close="$set(modalSize, 0, false)">
          <template v-slot:heading>Small Modal(400px) </template>
          <template v-slot:content> Small Modal Content </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalSize, 0, false)">취소</HiButton>
            <HiButton color="primary" size="lg" @click="$set(modalSize, 0, false)">확인</HiButton>
          </template>
        </HiModal>
        <HiModal type="type01" size="md" v-show="modalSize[1]" @close="$set(modalSize, 1, false)">
          <template v-slot:heading>Medium Modal(620px) </template>
          <template v-slot:content>Medium Modal Content </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalSize, 1, false)">취소</HiButton>
            <HiButton color="primary" size="lg" @click="$set(modalSize, 1, false)">확인</HiButton>
          </template>
        </HiModal>
        <HiModal type="type01" size="lg" v-show="modalSize[2]" @close="$set(modalSize, 2, false)">
          <template v-slot:heading>Large Modal(780px) </template>
          <template v-slot:content>Large Modal Content </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalSize, 2, false)">취소</HiButton>
            <HiButton color="primary" size="lg" @click="$set(modalSize, 2, false)">확인</HiButton>
          </template>
        </HiModal>
        <HiModal type="type01" size="xl" v-show="modalSize[3]" @close="$set(modalSize, 3, false)">
          <template v-slot:heading>xl Modal(850px) </template>
          <template v-slot:content>xl Modal Content </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalSize, 3, false)">취소</HiButton>
            <HiButton color="primary" size="lg" @click="$set(modalSize, 3, false)">확인</HiButton>
          </template>
        </HiModal>
        <HiModal type="type01" size="full" v-show="modalSize[5]" @close="$set(modalSize, 5, false)">
          <template v-slot:heading>Full Modal Title </template>
          <template v-slot:content>Full Modal Content </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalSize, 5, false)">취소</HiButton>
            <HiButton color="primary" size="lg" @click="$set(modalSize, 5, false)">확인</HiButton>
          </template>
        </HiModal>
      </section>
      <section>
        <h2>Modal Condent Type</h2>
        <HiButton color="primary" size="md" @click="$set(modalCon, 0, true)">Default Content</HiButton>
        <HiButton color="primary" size="md" @click="$set(modalCon, 1, true)">Icon Messege</HiButton>
        <HiButton color="primary" size="md" @click="$set(modalCon, 2, true)">Progress bar</HiButton>
        <HiModal type="type01" v-show="modalCon[0]" @close="$set(modalCon, 0, false)">
          <template v-slot:heading>
            모달 제목 영역
            <span class="highlight">제목 강조 텍스트</span>
            <p class="smr">제목 작은 설명글</p>
          </template>
          <template v-slot:content>
            <p class="desc">
              텍스트가 두줄 이상일 경우 <br /> 줄바꿈 처리가 필요합니다.
            </p>
            <p class="desc">
              텍스트 /
              <strong>Bold</strong> / <span class="txt-primary">Color</span> /
              <strong class="txt-primary">Bold & Color</strong>
            </p>
            <div class="textbox"><p>텍스트 박스</p></div>
            <p class="text-refer mt-10">※ 참조 텍스트</p>
          </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalCon, 0, false)">취소</HiButton>
            <HiButton color="primary" size="lg" @click="$set(modalCon, 0, false)">확인</HiButton>
          </template>
        </HiModal>
        <HiModal type="type01" v-show="modalCon[1]" @close="$set(modalCon, 1, false)">
          <template v-slot:heading>
            모달 제목 영역
            <span class="highlight">제목 강조 텍스트</span>
          </template>
          <template v-slot:content>
            <HiIcon name="ico-none" color="disabled" size="50" rounded="rounded" outline></HiIcon>
            <p class="desc mt-10"><strong class="txt-primary">아이콘</strong>이 추가된 메세지 모달입니다.</p>
          </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalCon, 1, false)">취소</HiButton>
            <HiButton color="primary" size="lg" @click="$set(modalCon, 1, false)">확인</HiButton>
          </template>
        </HiModal>
        <HiModal type="type01" v-show="modalCon[2]" @close="$set(modalCon, 2, false)">
          <template v-slot:heading>전체 파일을 선택 중입니다.<br />잠시만 기다려주세요.</template>
          <template v-slot:content>
            <div class="w100">
              <p>6/77</p>
              <div class="progressbar">
                <span class="bar" style="width: calc(6 / 77 * 100%)"></span>
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg" @click="$set(modalCon, 2, false)" style="width: 150px">취소</HiButton>
          </template>
        </HiModal>
      </section>
    </div>
    <div class="ctrArea">  
      <ul class="propArea">
        <li>
          <label>TYPE</label>
          <hi-select-box :value="propsVal.type" @update:value="propsVal.type = $event" :items="propsOpt.type" empty-title="TYPE" />
        </li>
        <li>
          <label>SIZE</label>
          <hi-select-box :value="propsVal.size" @update:value="propsVal.size = $event" :items="propsOpt.size" empty-title="SIZE" :disabled="propsVal.type === 'main'" />
        </li>
        <li>
          <label>CLOSE SKIP</label>
          <hi-switch v-model="propsVal.closeSkip" @update:model="propsVal.closeSkip = $event" :disabled="propsVal.type === 'main'"/>
        </li>
      </ul> 
      <div class="elArea">
        <HiModal v-if="propsVal.type==='main'" type="main" closeSkip @close="modalType[0] = false">
          <template v-slot:content> 
            <div class="img_area">
              <img src="@/assets/img/popup/pup_parent_01.png" alt="" >
            </div> 
          </template>
          <template v-slot:footer>
            <HiButton color="gray" square size="md">취소</HiButton>
            <HiButton color="black" square size="md">확인</HiButton>
          </template>
        </HiModal>
        <HiModal v-else :type="propsVal.type" :size="propsVal.size ? propsVal.size : ''" :closeSkip="propsVal.closeSkip" @close="modalType[1] = false">
          <template v-slot:heading>{{ propsVal.type }}모달 제목 영역입니다. </template>
          <template v-slot:content> 모달 컨텐츠 영역입니다. </template>
          <template v-slot:footer>
            <HiButton color="line-default" size="lg">취소</HiButton>
            <HiButton color="primary" size="lg">확인</HiButton>
          </template>
        </HiModal>
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
  name: "ComponentsModal",
  data() {
    return {
      modalType: [false, false, false],
      modalSize: [null, null, null, null, null],
      modalCon: [null, null, null, null],
      propsVal: {
        type: "type01",
        closeSkip: false,
        size: "sm",
      },
      propsOpt: {
        type: [
          { value: "main", title: "main" },
          { value: "type01", title: "type01" },
        ],
        size: [
          { value: "xs", title: "xs" },
          { value: "sm", title: "sm" },
          { value: "md", title: "md" },
          { value: "lg", title: "lg" },
          { value: "xl", title: "xl" },
          { value: "full", title: "full" },
        ],
      },
    };
  },
  computed: {
    generatedCode() {
      const classes = [
        this.propsVal.type ? `type="${this.propsVal.type}"` : "",
        this.propsVal.type === "main"
          ? `closeSkip`:
          this.propsVal.size ? `size="${this.propsVal.size}"` : "",
          this.propsVal.closeSkip ? "closeSkip" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const btnarea = [
        this.propsVal.type === "main"
          ? `&lt;template v-slot:content&gt; 
                &lt;div class="img_area"&gt;
                    &lt;img :src="imagePath" alt=""&gt;
                &lt;/div&gt;
            &lt;/template&gt;
            &lt;template v-slot:footer&gt;          
                &lt;HiButton square size="md" &gt;취소&lt;/HiButton&gt;
                &lt;HiButton square size="md" &gt;확인&lt;/HiButton&gt;
            &lt;/template&gt;`
          : `&lt;template v-slot:heading&gt;모달 제목 영역입니다.&lt;/template&gt;
            &lt;template v-slot:content&gt; 모달 컨텐츠 영역입니다. &lt;/template&gt;
            &lt;template v-slot:footer&gt;          
                &lt;HiButton color="line-default" size="lg" &gt;취소&lt;/HiButton&gt;
                &lt;HiButton color="primary" size="lg" &gt;확인&lt;/HiButton&gt;
            &lt;/template&gt;`,
      ]
        .filter(Boolean)
        .join(" ");

      return `
        &lt;HiModal ${classes} @close=""&gt;
            ${btnarea}       
        &lt;/HiModal&gt;
    `;
    },
  },
};
  
</script>
<style lang="scss" scoped>
.modalSys {
  section > button {
    margin: 0.3rem;
  }
  .hi-modal-common.main-popup{
    width:400px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .hi-modal-common.modal-full .modal__layer{
    border-left: 1px solid #ddd;
    border-top: 1px solid #ddd;
  }
  .ctrArea {
    min-width: 900px !important;
    .propArea{width:100%;}
    .elArea {
      position: relative;
      min-height: 350px;
      .hi-modal-common {
        position: absolute;
        z-index: 1;
      }
    }
  }
}
</style>
