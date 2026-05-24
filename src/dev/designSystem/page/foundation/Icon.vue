<template>
  <article class="iconSys type01">
    <div class="sections">
      <section>
        <h2>Icon Variant</h2>
        <ul class="options">
          <li v-for="name in propsOpt.name" :key="name.value" @click="changeName(name.value)">
            <HiIcon :name="name.value" size="24" />
            <span>{{ name.title }}</span>
          </li>
        </ul>
      </section>
      <section>
        <h2>Icon Type</h2>
        <ul class="options">
          <li>
            <HiIcon :name="propsName" color="primary" size="24" />
          </li>
          <li>
            <HiIcon :name="propsName" bgColor="primary" color="white" size="24" />
          </li>
          <li>
            <HiIcon :name="propsName" color="primary" outline size="24" />
          </li>
          <li>
            <HiIcon :name="propsName" bgColor="primary" color="white" rounded="bitrounded" size="24" />
          </li>
          <li>
            <HiIcon :name="propsName" color="primary" rounded="bitrounded" outline size="24" />
          </li>
          <li>
            <HiIcon :name="propsName" bgColor="primary" color="white" rounded="rounded" size="24" />
          </li>
          <li>
            <HiIcon :name="propsName" color="primary" rounded="rounded" outline size="24" />
          </li>
        </ul>
      </section>
      <section>
        <h2>Icon Color</h2>
        <ul class="options">
          <li v-for="color in propsOpt.color" :key="color.value">
            <template v-if="color.value === 'white'">
              <HiIcon :name="propsName" :color="color.value" bgColor="default" size="24" />
              <span>{{ color.value }}</span>
            </template>
            <template v-else>
              <HiIcon :name="propsName" :color="color.value" size="24" />
              <span>{{ color.value }}</span>
            </template>
          </li>
        </ul>
      </section>
      <section>
        <h2>Icon BgColor</h2>
        <ul class="options">
          <li v-for="bgColor in propsOpt.bgColor" :key="bgColor.value">
            <template v-if="bgColor.value === ''"> </template>
            <template v-if="bgColor.value === 'white'">
              <HiIcon :name="propsName" color="black" :bgColor="bgColor.value" size="24" />
              <span>{{ bgColor.value }}</span>
            </template>
            <template v-else>
              <HiIcon :name="propsName" color="white" :bgColor="bgColor.value" size="24" />
              <span>{{ bgColor.value }}</span>
            </template>
          </li>
        </ul>
      </section>
      <section>
        <h2>Icon Size</h2>
        <ul class="options">
          <li v-for="size in propsOpt.size" :key="size.value">
            <HiIcon :name="propsName" :size="size.value" />
            <span>{{ size.value }}</span>
          </li>
        </ul>
      </section>
    </div>
    <div class="ctrArea">
      <div class="optArea">
        <div class="elArea">
          <i
            :class="[
              'hi-ico',
              propsVal.name ? propsVal.name : '',
              propsVal.color ? (propsVal.outline === true ? 'ico-line-' + propsVal.color : 'ico-' + propsVal.color) : propsVal.outline === true ? 'ico-line-primary' : '',
              propsVal.bgColor ? 'ico-bg-' + propsVal.bgColor : '',
              propsVal.size ? 'ico-size-' + propsVal.size : '',
              propsVal.rounded ? 'ico-' + propsVal.rounded : '',
            ]"
          >
          </i>
          <HiIcon :name="propsVal.name" :color="propsVal.color" :bgColor="propsVal.bgColor" :outline="propsVal.outline" :size="propsVal.size" :rounded="propsVal.rounded" />
        </div>
        <ul class="propArea">
          <li>
            <label>NAME</label>
            <hi-select-box :value="propsVal.name" @update:value="propsVal.name = $event" :items="propsOpt.name" empty-title="NAME" />
          </li>
          <li>
            <label>OUTLINE</label>
            <hi-switch v-model="propsVal.outline" @update:model="propsVal.outline = $event" />
          </li>
          <li>
            <label>COLOR</label>
            <hi-select-box :value="propsVal.color" @update:value="propsVal.color = $event" :items="propsOpt.color" empty-title="COLOR" />
          </li>
          <li>
            <label>BG COLOR</label>
            <hi-select-box :value="propsVal.bgColor" @update:value="propsVal.bgColor = $event" :items="propsOpt.bgColor" empty-title="BG COLOR" />
          </li>
          <li>
            <label>ROUNDED</label>
            <hi-select-box :value="propsVal.rounded" @update:value="propsVal.rounded = $event" :items="propsOpt.rounded" empty-title="ROUNDED" />
          </li>
          <li>
            <label>SIZE</label>
            <hi-select-box :value="propsVal.size" @update:value="propsVal.size = $event" :items="propsOpt.size" empty-title="SIZE" />
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
  name: "FoundationIcon",
  data() {
    return {
      propsName: "ico-none",
      propsVal: {
        name: "ico-none",
        color: "primary",
        bgColor: "",
        outline: false,
        size: "24",
        rounded: "",
      },
      propsOpt: {
        name: designsysData.icon,
        color: designsysData.iconColor,
        bgColor: designsysData.iconColor,
        rounded: [
          { value: "", title: "none" },
          { value: "rounded", title: "rounded" },
          { value: "bitrounded", title: "bitrounded" },
        ],
        size: [
          { value: "10", title: "10" },
          { value: "14", title: "14" },
          { value: "18", title: "18" },
          { value: "20", title: "20" },
          { value: "24", title: "24" },
          { value: "28", title: "28" },
          { value: "32", title: "32" },
          { value: "36", title: "36" },
          { value: "50", title: "50" },
          { value: "100", title: "100" },
        ],
      },
    };
  },
  methods: {
    changeName(e) {
      this.propsName = e;
    },
  },
  computed: {
    generatedCode() {
      const classes = [
        "hi-ico",
        this.propsVal.name ? this.propsVal.name : "",
        this.propsVal.color ? (this.propsVal.outline === true ? "ico-line-" + this.propsVal.color : "ico-" + this.propsVal.color) : this.propsVal.outline === true ? "ico-line-primary" : "",
        this.propsVal.bgColor ? "ico-bg-" + this.propsVal.bgColor : "",
        this.propsVal.size ? "ico-size-" + this.propsVal.size : "",
        this.propsVal.rounded ? "ico-" + this.propsVal.rounded : "",
      ]
        .filter(Boolean)
        .join(" ");

      const hiButtonAttrs = [
        this.propsVal.name ? `name="${this.propsVal.name}"` : "",
        this.propsVal.color ? `color="${this.propsVal.color}"` : "",
        this.propsVal.bgColor ? `bgColor="${this.propsVal.bgColor}"` : "",
        this.propsVal.size ? `size="${this.propsVal.size}"` : "",
        this.propsVal.rounded ? `rounded="${this.propsVal.rounded}"` : "",
        this.propsVal.outline ? "outline" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `
      &lt;i class="${classes}" &gt;&lt;/i&gt;

      &lt;HiIcon ${hiButtonAttrs}&gt;&lt;/HiIcon&gt;
    `;
    },
  },
};
</script>

<style lang="scss" scoped>
.iconSys {
  i {
    margin: 10px;
  }
  .options {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    li {
      width: 110px;
      display: flex;
      flex-flow: column;
      align-items: center;
      gap: 5px;
      span {
        font-size: 13px;
      }
    }
  }
}
</style>
