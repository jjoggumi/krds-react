<template>
  <article class="tabSys type01">
    <div class="sections">
      <section>
        <h2>Tab Type</h2>
        <div v-for="(type, index) in propsOpt.type" :key="index">
          <HiTabs :type="type.value" size="md" class="mb-20" block>
            <HiTab :label="type.value + '탭'" class="p-10" onActive> 활성화 탭 컨텐츠</HiTab>
            <HiTab label="비활성화 탭" class="p-10">비활성화 탭 컨텐츠</HiTab>
            <HiTab v-if="type.value === 'default'" label="신규 알림 탭" class="p-10" onNew>신규 알림 탭 컨텐츠</HiTab>
            <HiTab label="아이콘 탭" class="p-10" ico="ico-chart">아이콘 탭 컨텐츠</HiTab>
          </HiTabs>
        </div>
      </section>
      <section>
        <h2>Tab Size</h2>
        <div v-for="(size, index) in filteredSizes" :key="index">
          <HiTabs :size="size.value" type="type01" class="mb-10" block>
            <HiTab :label="'활성화 탭(' + size.value + ')'" class="p-10" onActive>활성화 탭 컨텐츠</HiTab>
            <HiTab :label="'비활성화 탭(' + size.value + ')'" class="p-10">비활성화 탭 컨텐츠</HiTab>
          </HiTabs>
        </div>
      </section>
      <section>
        <h2>Tab Align</h2>
        <div>
          <HiTabs size="sm" type="type01" class="mb-10">
            <HiTab label="활성화 탭(left)" class="p-10" onActive>활성화 탭 컨텐츠</HiTab>
            <HiTab label="비활성화 탭(left)" class="p-10">비활성화 탭 컨텐츠</HiTab>
          </HiTabs>
          <HiTabs size="sm" type="type01" align="center" class="mb-10">
            <HiTab label="활성화 탭(center)" class="p-10" onActive>활성화 탭 컨텐츠</HiTab>
            <HiTab label="비활성화 탭(center)" class="p-10">비활성화 탭 컨텐츠</HiTab>
          </HiTabs>
          <HiTabs size="sm" type="type01" align="right" class="mb-10">
            <HiTab label="활성화 탭(right)" class="p-10" onActive>활성화 탭 컨텐츠</HiTab>
            <HiTab label="비활성화 탭(right)" class="p-10">비활성화 탭 컨텐츠</HiTab>
          </HiTabs>
          <HiTabs size="sm" type="type01" block class="mb-10">
            <HiTab label="활성화 탭(block)" class="p-10" onActive>활성화 탭 컨텐츠</HiTab>
            <HiTab label="비활성화 탭(block)" class="p-10">비활성화 탭 컨텐츠</HiTab>
          </HiTabs>
        </div>
      </section>
    </div>
    <div class="ctrArea">
      <div class="optArea">
        <div class="elArea">
          <HiTabs :type="propsVal.type" :size="propsVal.size" :align="propsVal.align" :minWidth="propsVal.minWidth" :block="propsVal.block === true">
            <HiTab label="활성화" class="p-10" onActive> 활성화 탭 컨텐츠 01</HiTab>
            <HiTab label="신규 알림" class="p-10" onNew> 신규 알림 탭 컨텐츠 02</HiTab>
            <HiTab label="아이콘" class="p-10" ico="ico-chart">아이콘 탭 컨텐츠 03</HiTab>
          </HiTabs>
        </div>
        <ul class="propArea">
          <li>
            <label>TABS TYPE</label>
            <hi-select-box :value="propsVal.type" @update:value="propsVal.type = $event" :items="propsOpt.type" empty-title="TYPE" />
          </li>
          <li>
            <label>TABS SIZE</label>
            <hi-select-box :value="propsVal.size" @update:value="propsVal.size = $event" :items="propsOpt.size" empty-title="SIZE" />
          </li>
          <li>
            <label>TABS ALIGN</label>
            <hi-select-box :value="propsVal.align" @update:value="propsVal.align = $event" :items="propsOpt.align" empty-title="ALIGN" />
          </li>
          <li>
            <label>TABS BLOCK</label>
            <hi-switch v-model="propsVal.block" @update:model="propsVal.block = $event" />
          </li>
          <li>
            <label>TABS MinWidth</label>
            <div class="input-box-wrap">
              <input type="number" v-model="propsVal.minWidth" />
            </div>
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
import designsysData from "@/dev/designSystem/assets/js/designsysData.js"
export default {
  name: "ComponentsTab",
  data() {
    return {
      propsVal: {
        type: "",
        size: "md",
        align: "",
        block: false,
        onActive: true,
        onNew: false,
        ico: "",
        minWidth: null,
      },
      propsOpt: {
        type: [
          { value: "default", title: "default" },
          { value: "type01", title: "type01" },
          { value: "type02", title: "type02" },
          { value: "type03", title: "type03" },
          { value: "type04", title: "type04" },
        ],
        size: designsysData.size,
        align: [
          { value: "", title: "left" },
          { value: "center", title: "center" },
          { value: "right", title: "right" },
        ],
        ico: designsysData.icon,
      },
    };
  },
  computed: {
    generatedCode() {
      const tabsProps = [
        "hi-tab",
        this.propsVal.type ? `type="${this.propsVal.type}"` : "",
        this.propsVal.size ? `size="tab-${this.propsVal.size}"` : "",
        this.propsVal.align ? `align="${this.propsVal.align}"` : "",
        this.propsVal.minWidth ? `minWidth="${this.propsVal.minWidth}"` : "",
        this.propsVal.block ? "block" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `
        &lt;HiTabs ${tabsProps} &gt;
          &lt;HiTab label="탭메뉴01" class="p-10" onActive &gt;탭 컨텐츠 01&lt;/HiTab&gt;
          &lt;HiTab label="탭메뉴01" class="p-10" onNew &gt;탭 컨텐츠 02&lt;/HiTab&gt;
          &lt;HiTab label="탭메뉴01" class="p-10" ico="ico-chart" &gt;탭 컨텐츠 03&lt;/HiTab&gt;
        &lt;/HiTabs&gt;
    `;
    },
    filteredSizes() {
      return this.propsOpt.size.filter((size) => size.value);
    },
  },
};
</script>
<style lang="scss" scoped>
.designSys .tabSys {
  ::v-deep {
    .hi-tab-content {
      background: #f9f9f9;
    }
    .hi-tab button {
      text-transform: capitalize;
    }
  }
  .ctrArea {
    min-width: 700px;
    .elArea {
      position: relative;
      .hi-modal-common {
        position: absolute;
        z-index: 999;
      }
    }
    .codeArea {
      width: 100%;
    }
  }
}
</style>
