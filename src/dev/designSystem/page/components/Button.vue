<template>
  <article class="buttonSys type01">
    <div class="sections">
      <section>
        <h2>Btn Type</h2>
        <div>
          <HiButton color="primary" size="md">basic</HiButton>
          <HiButton color="line-primary" size="md">outline</HiButton>
          <HiButton color="primary" size="md" bitrounded>bitrounded</HiButton>
          <HiButton color="primary" size="md" square>square</HiButton>
        </div>
      </section>
      <section>
        <h2>Btn Color</h2>
          <template v-for="(color, i) in color">
            <span :key="i">              
              <span v-if="color.value ==='white'" style="background: rgb(71 120 222); display: inline-block; padding: 5px; border-radius: 5px">
                <HiButton color="white" size="md">white</HiButton>
              </span>
              <HiButton v-else-if="color.value ==='disabled'" color="primary" size="md" disabled>disabled</HiButton>
              <HiButton v-else-if="color.value ==='link'" color="link" size="md">link</HiButton>
              <HiButton v-else :color="color.value" size="md">{{color.value}}</HiButton>
            </span>
          </template>   
      </section>
      <section>
        <h2>Btn Outline Color</h2>        
        <template v-for="(color, i) in color">
          <span :key="i">              
            <span v-if="color.value ==='white'" style="background: rgb(71 120 222); display: inline-block; padding: 5px; border-radius: 5px">
              <HiButton color="line-white" size="md">white</HiButton>
            </span>
            <HiButton v-else-if="color.value ==='disabled'" color="line-primary" size="md" disabled>disabled</HiButton>
            <HiButton v-else-if="color.value ==='link'" color="link" size="md">link</HiButton>
            <HiButton v-else :color="`line-${color.value}`" size="md">{{color.value}}</HiButton>
          </span>
        </template>
      </section>
      <section>
        <h2>Btn Size</h2>
        <div>
          <HiButton color="primary" size="xl" >extraLarge</HiButton>
          <HiButton color="primary" size="lg">large</HiButton>
          <HiButton color="primary" size="md">medium</HiButton>
          <HiButton color="primary" size="sm">small</HiButton>
          <HiButton color="primary" size="xs">extraSmall</HiButton>
          <HiButton color="primary" size="block">width 100%</HiButton>
        </div>
      </section>
    </div>
    <div class="ctrArea">
      <div class="optArea">
        <div class="elArea">
          <button
            type="button"
            :class="[
              'hi-btn',
              propsVal.color ? (propsVal.outline === true ? 'btn-line-' + propsVal.color : 'btn-' + propsVal.color) : null,
              propsVal.shap ? 'btn-' + propsVal.shap : '',
              propsVal.size ? 'btn-' + propsVal.size : '',
              propsVal.block === true ? 'btn-block' : '',
            ]"
            :disabled="propsVal.disabled === true"
          >
            Button element
          </button>
          <HiButton
            :color="propsVal.color"
            :size="propsVal.size"
            :outline="propsVal.outline === true"
            :disabled="propsVal.disabled === true"
            :block="propsVal.block === true"
            :bitrounded="propsVal.shap === 'bitrounded'"
            :square="propsVal.shap === 'square'"
          >
            HiButton Component
          </HiButton>
        </div>
        <ul class="propArea">
          <li>
            <label>COLOR</label>
            <hi-select-box :value="propsVal.color" @update:value="propsVal.color = $event" :items="propsOpt.color" empty-title="COLOR" />
          </li>
          <li>
            <label>OUTLINE</label>
            <hi-switch v-model="propsVal.outline" @update:model="propsVal.outline = $event" :disabled="propsVal.color==='link'"/>
          </li>
          <li>
            <label>ROUNDED</label>
            <hi-select-box :value="propsVal.shap" @update:value="propsVal.shap = $event" :items="propsOpt.shap" empty-title="SHAP" :disabled="propsVal.color==='link'" />
          </li>
          <li>
            <label>SIZE</label>
            <hi-select-box :value="propsVal.size" @update:value="propsVal.size = $event" :items="propsOpt.size" empty-title="SIZE" :disabled="propsVal.color==='link'" />
          </li>
          <li>
            <label>BLOCK</label>
            <hi-switch v-model="propsVal.block" @update:model="propsVal.block = $event" :disabled="propsVal.color==='link'" />
          </li>
          <li>
            <label>DISABLED</label>
            <hi-switch v-model="propsVal.disabled" @update:model="propsVal.disabled = $event" :disabled="propsVal.color==='link'" />
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
  name: "ComponentsHiButton",
  data() {
    return {
      color: designsysData.btnColor,
      size: designsysData.size,
      propsVal: {
        shap: "",
        color: "link",
        outline: false,
        disabled: false,
        size: "",
        block: false,
      },
      propsOpt: {
        shap: [
          { value: "", title: "rounded" },
          { value: "bitrounded", title: "bitrounded" },
          { value: "square", title: "square" },
        ],
        color: designsysData.btnColor,
        size: designsysData.size,
      },
    };
  },
  computed: {
    generatedCode() {
      // Generate class list for the button element
      const classes = [
        "hi-btn",
        this.propsVal.color ? (this.propsVal.outline === true ? `btn-line-${this.propsVal.color}` : `btn-${this.propsVal.color}`) : null,
        this.propsVal.shap ? `btn-${this.propsVal.shap}` : "",
        this.propsVal.size ? `btn-${this.propsVal.size}` : "",
        this.propsVal.block === true ? `btn-block` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const hiBtnAttrs = [this.propsVal.disabled ? `disabled` : ""].filter(Boolean).join(" ");

      // Generate HiButton component attributes
      const hiButtonAttrs = [
        this.propsVal.color ? (this.propsVal.outline === true ? `color="line-${this.propsVal.color}"` : `color="${this.propsVal.color}"`) : null,
        this.propsVal.size ? `size="${this.propsVal.size}"` : "",
        this.propsVal.disabled ? `disabled` : "",
        this.propsVal.block ? `block` : "",
        this.propsVal.shap === "bitrounded" ? `bitrounded` : "",
        this.propsVal.shap === "square" ? `square` : "",
      ]
        .filter(Boolean)
        .join(" ");

      // Generate HTML code for the button and HiButton component
      return `
      &lt;button type="button" class="${classes}" ${hiBtnAttrs}&gt;
        Button element
      &lt;/button&gt;

      &lt;HiButton ${hiButtonAttrs}&gt;
        HiButton Component
      &lt;/HiButton&gt;
    `;
    },
  },
};
</script>
<style lang="scss" scoped>
.buttonSys {
  button {
    margin: 0.3rem;
  }
}
</style>
