<template>  
  <div class="hi-nodata">
    <p>
      <slot name="message">
        {{ $t('main.clazzes.form.empty.list.text') }}
      </slot>
    </p>
  </div>
</template>

<script>
export default {
  name: "main-body-clazzes-body-form-empty-list"
}
</script>

<style scoped>
.hi-nodata{
  padding:163px 0;
}
</style>