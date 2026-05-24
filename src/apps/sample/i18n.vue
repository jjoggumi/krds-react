<template>
  <div class="i18n">
    <select v-model="$i18n.locale" @change="onLocaleChange($event)">
      <option v-for="lang in langs" :value="lang.code" :key="lang.code">
        {{ lang.label }}
      </option>
    </select>
    <h2>Message localization</h2>
    <p>title : {{ $t("title") }}</p>
    <p>title : {{ $t("hello", { name: "Your name" }) }}</p>
    <h2>DateTime localization</h2>
    <p>origin : {{ sample.date }}</p>
    <p>short : {{ $d(sample.date, "short") }}</p>
    <p>long : {{ $d(sample.date, "long") }}</p>
    <h2>Number localization</h2>
    <p>origin : {{ sample.number }}</p>
    <p>currency : {{ $n(sample.number, "currency") }}</p>
  </div>
</template>

<script>
export default {
  name: "sample-i18n",
  components: {},
  data() {
    return {
      sample: {
        date: new Date(),
        number: 10000,
      },
      langs: [
        {
          code: "en",
          label: "English",
        },
        {
          code: "ko",
          label: "한국어",
        },
      ],
    }
  },
  methods: {
    onLocaleChange(event) {
      this.$i18n.locale = event.target.value
    },
  },
}
</script>

<style scoped lang="scss">
  .i18n {
    select, h2, p {
      padding: inherit;
    }
    select {
      font-family: Cursive,serif;
      font-size: 32px;
      padding: 20px;
      margin: 20px;
    }
    h2 {
      font-size: 25px;
      padding: 30px 20px;
    }
    p {
      font-size: 17px;
      padding: 5px 20px;
    }
  }
</style>