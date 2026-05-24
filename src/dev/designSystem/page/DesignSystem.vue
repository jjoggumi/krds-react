<template>
  <main id="main-content" class="main_container without_side">
    <div class="top_sub_con compact_con">
        <span class="sub_top_text">
            Principle
        </span>
    </div>
    <div class="overview_area">
        <div class="left_text">
            <h2 class="main_title">디자인 시스템 정의</h2>
        <p class="desc">디자인 시스템은 재사용 가능한 컴포넌트와 패턴을 사용하여 규모에 맞게 설계를 관리하기 위한 완전한 표준 집합입니다.</p>
        </div>
        <div class="elements_pc_con">
            <div class="title_area">
                Design System
            </div>
            <div class="element_container">
                <ul>
                    <li class="circle_con">
                        <h3>스타일 가이드</h3>
                        <p>콘텐츠에 관한 지침이나 상호작용, 시각적 디자인 기준 등 설계 결과물을 만들어내기 위한 기본 디자인 원칙입니다.</p>
                    </li>
                    <li class="plus_icon_con">
                        <span class="plus_icon"></span>
                    </li>
                    <li class="circle_con">
                        <h3>컴포넌트 라이브러리</h3>
                        <p>재사용이 가능한 UI 컴포넌트를 미리
                            만들고 설명해 놓은 것입니다.
                            시각적 요소와 이름, 설명, 속성, 상태
                            등으로 구성됩니다.</p>
                    </li>
                    <li class="plus_icon_con">
                        <span class="plus_icon"></span>
                    </li>
                    <li class="circle_con">
                        <h3>패턴 라이브러리</h3>
                        <p>기능적 목적 달성을 위해
                            자주 함께 사용되는 UI 컴포넌트들의
                            조합과 레이아웃을 미리 만들고
                            설명해 놓은 것입니다.</p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div class="white_back">
        <div class="left_text">
            <h2 class="main_title">디자인 시스템의 목적</h2>
            <p class="desc">내부효과로는 업무 생산성을 향상 시키고 외부효과로는 일관된 사용자 경험 설계를 통한 사용자 신뢰도 상승과 브랜드 가치 상승입니다.</p>
        </div>
        <div class="purpose_con">
            <ul class="purpose_area">
                <li class="purpose_item">
                    <span class="ico_1"></span>
                    <h3>일관된 UX 설계로 브랜드 신뢰도 상승</h3>
                    <p>UX 설계, 디자인의 표준 및 체계를 적용하여 다누시스의 제품들에 일관된 사용자 경험을 제공함으로써 사용자의 신뢰도와 브랜드 가치를 높입니다.</p>
                </li>
                <li class="purpose_item">
                    <span class="ico_2"></span>
                    <h3>디자인 및 개발 생산성 향상</h3>
                    <p>미리 만들어 놓은 컴포넌트 또는 패턴을 재사용함으로써 반복 작업을 제거하고 의도되지 않은 비일관성을 줄여 업무 생산성과 결과물의 품질을 향상시킵니다.</p>
                </li>
                <li class="purpose_item">
                    <span class="ico_3"></span>
                    <h3>커뮤니케이션 비용 감소</h3>
                    <p>팀내 또는 조직 간 소통을 위한 공통 언어로 기능하여 커뮤니케이션 오류를 예방합니다.</p>
                </li>
                <li class="purpose_item">
                    <span class="ico_4"></span>
                    <h3>효율적인 업데이트</h3>
                    <p>토큰이나 컴포넌트, 패턴의 원본만 수정하여 전체 시스템을 효율적으로 업데이트할 수 있습니다.</p>
                </li>
            </ul>
        </div>
    </div>
    <footer class="content_footer">
        <div class="footer_inner">
            <p class="copyright">Copyright © 2024 HiClass</p>
        </div>
    </footer>
  </main>
</template>

<script>
export default {
  name : 'DesignSystem'
}
</script>