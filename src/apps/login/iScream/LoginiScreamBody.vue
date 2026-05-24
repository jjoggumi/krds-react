<template>
  <component v-bind:is="curForm"></component>
</template>

<script>
import Teacher from "./teacher/LoginiScreamBodyTeacherItem";
import Student from "./student/LoginiScreamBodyStudentItem";

export default {
  name: "login-iscream-body",
  components: { Teacher, Student },
  data: () => ({
    curForm: ""
  }),
  created() {
    let id = this.$route.params.id;
    this.curForm = id.replace(/^./, id[0].toUpperCase());

    document.title = "login-" + this.curForm;
  }
};
</script>

<style scoped></style>