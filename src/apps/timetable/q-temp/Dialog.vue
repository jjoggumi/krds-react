<template>
  <div class="dialog-backdrop" v-if="visible">
    <div class="dialog">
      <div class="dialog-header">
        <h3>{{ title }}</h3>
      </div>
      <div class="dialog-body">
        <p>{{ message }}</p>
        <div v-if="options.type === 'checkbox'" class="dialog-options">
          <label
            v-for="item in options.items"
            :key="item.value"
            class="dialog-option"
          >
            <input
              type="checkbox"
              v-model="model"
              :value="item.value"
            />
            {{ item.label }}
          </label>
        </div>
      </div>
      <div class="dialog-footer">
        <button @click="handleCancel">{{ cancel }}</button>
        <button @click="handleOk">{{ ok }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dialog',
  props: {
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    ok: {
      type: String,
      default: 'OK'
    },
    cancel: {
      type: String,
      default: 'Cancel'
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: true,
      model: this.options.model || []
    };
  },
  methods: {
    handleOk() {
      this.$emit('ok', this.model);
      this.close();
    },
    handleCancel() {
      this.$emit('cancel');
      this.close();
    },
    close() {
      this.visible = false;
      this.$emit('dismiss');
    }
  }
};
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.dialog-header h3 {
  margin: 0;
}

.dialog-body {
  margin: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-options {
  margin-top: 10px;
}

.dialog-option {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.dialog-option input {
  margin-right: 10px;
}
</style>