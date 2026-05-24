<template>
  <header>
    <h1>{{ headTitle.title }} System</h1>
    <p class="smr" v-html="headTitle.description"></p>
    <p class="info">1.1.1<span>/</span> 2025년 03월 11일 업데이트(UI프로젝트로 이동) <span>/</span> 김은영</p>
  </header>
</template>

<script>
export default {
  data() {
    return {
      headTitles: [
        {
          title: "",
          description: "",
        },
        {
          title: "Color",
          description: `Colors help to represent hierarchy, establish brand identity, and convey meaning and status of elements.<br>
      색상은 계층 구조를 표현하고, 브랜드 정체성을 확립하고, 요소의 의미,  상태를 나타내는 데 도움이 됩니다.`,
        },
        {
          title: "Typography",
          description: `Typography establishes a clear and readable hierarchy, guiding users through content with consistent font styles and sizes.<br>
타이포그래피는 명확하고 가독성 높은 계층 구조를 형성하여, 일관된 글꼴 스타일과 크기로 사용자를 콘텐츠로 안내합니다.`,
        },
        {
          title: "Icon",
          description: `Icons are visual symbols that represent actions, statuses, and navigation cues in a simplified and intuitive manner.<br>
        아이콘은 동작, 상태, 탐색을 직관적으로 전달하는 시각적 기호로, 사용자 경험을 향상시킵니다.`,
        },
        {
          title: "Check & Radio & Switch",
          description: `These components enable users to select options, toggle states, and interact with forms in a clear and structured way.<br>
        이 요소들은 사용자가 옵션을 선택하고 상태를 전환하며, 폼과 상호작용할 수 있도록 돕는 기본적인 UI 컴포넌트입니다.`,
        },
        {
          title: "Selectbox",
          description: `select box allows users to choose a single or multiple options from a dropdown list, improving data input efficiency.<br>
        셀렉트박스는 사용자가 드롭다운 목록에서 하나 또는 여러 개의 옵션을 선택할 수 있도록 하여 데이터 입력의 효율성을 높입니다.`,
        },
        {
          title: "Input",
          description: `Forms allow users to input and submit information, fostering interaction between users and the system.<br>
        폼은 사용자가 정보를 입력하고 제출할 수 있게 하여 사용자와 시스템 간의 상호작용을 촉진합니다.`,
        },
        {
          title: "Button",
          description: `Buttons are elements designed to prompt user actions, incorporating various states and behavioral rules based on shape, size, and color.<br>
        버튼은 사용자 수행을 유도하기 위한 요소로 모양, 크기, 색상에 따라 다양한 상태와 그에 따른 행동 규칙을 포함합니다.`,
        },
        {
          title: "Modal",
          description: `Modals provide temporary, focused interactions without leaving the current page, drawing attention to essential tasks or information.<br>
        모달은 사용자가 현재 페이지를 떠나지 않고 중요한 작업이나 정보에 집중할 수 있도록 일시적인 상호작용을 제공합니다.`,
        },
        {
          title: "Tab",
          description: `Tabs organize content into categories, allowing users to navigate and switch between sections efficiently.<br>
        탭은 콘텐츠를 카테고리별로 정리하여 사용자가 효율적으로 섹션을 탐색하고 전환할 수 있도록 합니다.`,
        },
        {
          title: "Notification",
          description: ` Notifications provide users with real-time feedback, status updates, or alerts that require immediate or contextual attention.<br>
        알림은 사용자에게 실시간 피드백, 상태 업데이트 또는 즉각적인 주의가 필요한 정보를 전달하는 요소입니다.`,
        },
        {
          title: "Table",
          description: `Tables present structured data in a grid format, improving readability and enabling efficient data comparison.<br>
        테이블은 구조화된 데이터를 명확하게 제시하여 사용자가 정보를 비교하고 해석하기 쉽게 만듭니다.`,
        },
        {
          title: "Kebab",
          description: ` kebab menu (three vertical dots) provides access to additional options without cluttering the main interface.<br>
        케밥 메뉴(세 개의 수직 점)는 UI를 간결하게 유지하면서도 추가적인 옵션을 제공하는 메뉴입니다.`,
        },
        {
          title: "Tooltip",
          description: `Tooltips offer contextual hints or additional information when users hover over or focus on an element.<br>
        툴팁은 사용자가 특정 요소에 마우스를 올리거나 포커스를 맞출 때 추가적인 정보를 제공하는 작은 팝업입니다.`,
        },
        {
          title: "Avatar",
          description: `Avatars visually represent users, accounts, or entities through images, initials, or icons.<br>
        아바타는 사용자, 계정, 혹은 특정 개체를 이미지, 이니셜 또는 아이콘 형태로 시각적으로 나타냅니다.`,
        },
      ],
    };
  },
  computed: {
    headTitle() {
      const match = this.headTitles.find((item) => item.title === this.$route.name);
      return match || this.headTitles[0];
    },
  },
};
</script>

<style></style>
