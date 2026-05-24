<template>
  <div class="profile-list-item">
    <input type="checkbox" :id="userId" :disabled="disabled" :checked="value" @change="onChange" />
    <label :for="userId" style="user-select: none;">
      <item :user="user" :showImage="showImage" :withStyle="false" :blocked="blocked" :showStudentNo="showStudentNo" :showStudentProfileName="showStudentProfileName"></item>
    </label>
    <slot name="right"></slot>
  </div>
  </template>
  
  <script>
  import Item from './Item.vue'
  export default {
    components: { Item },
    name: 'SelectableProfileListItem',
    props: {
      user: {
        type: Object,
        required: true
      },
      value: {
        type: Boolean,
        default: false
      },
      showImage: {
        type: Boolean,
        default: true
      },
      disabled: {
        type: Boolean,
        default: false
      },
      blocked: {
        type: Boolean,
        default: false
      },
      showStudentNo: {
        type: Boolean,
        default: true
      },
      showStudentProfileName: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      userId () {
        return this.user.id || this.user.userId
      }
    },
    methods: {
      onChange (event) {
        this.$emit('input', event.target.checked)
      }
    }
  }
  </script>