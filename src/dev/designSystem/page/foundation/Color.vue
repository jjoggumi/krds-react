<template>
  <article class="colorSys">
    <div class="sections">
      <section>
        <h2>Main Color</h2>
        <div class="primaryWrap">
          <div class="primary">
            <p class="tit">Primary</p>
            <p class="color">#4778DE <br />var(--primary)</p>
          </div>
          <ul class="primarySub">
            <li class="sub01" v-for="(primarySub, i) in primarySubColor" :key="i" :style="`background-color:${primarySub.color}`">
              {{ primarySub.color }}
              <br />var(--{{ primarySub.name }})
            </li>
          </ul>
          <div class="secondary">
            <p class="tit">Secondary</p>
            <p class="color">#4267B2 <br />var(--primary)</p>
          </div>
        </div>
      </section>
      <section>
        <h2>State Color</h2>
        <ul class="colorWrap">
          <li :style="`background-color:` + state.color" v-for="(state, i) in stateColor" :key="i">
            <p class="tit">{{ state.name }}</p>
            <p class="color">{{ state.color }}<br />var(--{{ state.name }})</p>
          </li>
        </ul>
      </section>
      <section>
        <h2>Sub Color</h2>
        <ul class="colorWrap">
          <li :style="`background-color:` + sub.color" v-for="(sub, i) in subColor" :key="i">
            <p class="tit">{{ sub.name }}</p>
            <p class="color">{{ sub.color }}<br />var(--{{ sub.name }})</p>
          </li>
        </ul>
      </section>
      <section>
        <h2>Gray Color</h2>
        <div class="garyWrap">
          <div :style="`background-color:var(--${grayColor[0].name});`">
            <p class="tit" style="color: var(--gray-09)">{{ grayColor[0].name }}</p>
            <p class="color" style="color: var(--gray-09)">{{ grayColor[0].color }}</p>
          </div>
          <ul class="colorWrap">
            <li v-for="(gray, i) in grayColor.slice(1, -1)" :key="i" :style="`background-color:var(--${gray.name})`">
              <template v-if="i < 6">
                <p class="tit" style="color: var(--gray-09)">{{ gray.name }}</p>
                <p class="color" style="color: var(--gray-09)">{{ gray.color }}<br />var(--{{ gray.name }})</p>
              </template>
              <template v-else>
                <p class="tit">{{ gray.name }}</p>
                <p class="color">{{ gray.color }}<br />var(--{{ gray.name }})</p>
              </template>
            </li>
          </ul>
          <div :style="`background-color:var(--${grayColor[11].name})`">
            <p class="tit">{{ grayColor[11].name }}</p>
            <p class="color">{{ grayColor[11].color }}</p>
          </div>
        </div>
      </section>
      <section>
        <h2>Text Color</h2>
        <ul class="colorWrap txt">
          <li v-for="(txtColor, i) in txtColor" :key="i">
            <p class="box" :style="`color:var(--${txtColor.name});font-size:20px;`">A</p>
            <p class="tit" :style="`color:var(--${txtColor.name})`">{{ txtColor.smr }}</p>
            <p class="color" :style="`color:var(--${txtColor.name})`">{{ txtColor.color }}<br />var(--{{ txtColor.name }})</p>
          </li>
        </ul>
      </section>
      <section>
        <h2>Background Color</h2>
        <ul class="colorWrap bg">
          <li v-for="(bgColor, i) in bgColor" :key="i">
            <p class="box" :style="`background-color:var(--${bgColor.name})`"></p>
            <p class="tit">{{ bgColor.smr }}</p>
            <p class="color">{{ bgColor.color }}<br />var(--{{ bgColor.name }})</p>
          </li>
        </ul>
      </section>
      <section>
        <h2>Border Color</h2>
        <ul class="colorWrap border">
          <li v-for="(borderColor, i) in borderColor" :key="i">
            <p class="box" :style="`border:2px solid var(--${borderColor.name})`"></p>
            <p class="tit">{{ borderColor.smr }}</p>
            <p class="color">{{ borderColor.color }}<br />var(--{{ borderColor.name }})</p>
          </li>
        </ul>
      </section>
    </div>
  </article>
</template>

<script>
import designsysData from "@/dev/designSystem/assets/js/designsysData.js"

export default {
  name: "GeneralColor",
  data() {
    return {
      primarySubColor: [
        {
          name: "primary-01",
          color: "#F8F9FC",
        },
        {
          name: "primary-02",
          color: "#EBEEF4",
        },
        {
          name: "primary-03",
          color: "#E9F3FF",
        },
        {
          name: "primary-04",
          color: "#E1E9F9",
        },
      ],
      stateColor: [
        {
          name: "success",
          color: "#61D235",
          smr: "확인, 성공, 긍정적 메세지 ",
        },
        {
          name: "info",
          color: "#4778DE",
          smr: "정보, 긍정적",
        },
        {
          name: "noti",
          color: "#FF6A6A",
          smr: "공지, 알럿 등 안내 긍정적",
        },
        {
          name: "warning",
          color: "#EC1F2D",
          smr: "오류, 경고, 부정적 탈퇴 등 주의 및 에러 ",
        },
        {
          name: "error",
          color: "#EC1F2D",
          smr: "오류, 경고, 부정적 탈퇴 등 주의 및 에러 ",
        },
      ],
      subColor: [
        {
          name: "purple",
          color: "#EB6BFF",
          smr: "포인트 색상 01",
        },
        {
          name: "yellow",
          color: "#FFB600",
          smr: "포인트 색상 02",
        },
        {
          name: "jungle",
          color: "#267E4E",
          smr: "포인트 색상 03",
        },
        {
          name: "orange",
          color: "#EE813E",
          smr: "메인>급식 영역 타이틀, 하이스토어 뱃지",
        },
      ],
      grayColor: [
        {
          name: "white",
          color: "#FFF",
        },
        {
          name: "gray-01",
          color: "#FAFAFA",
        },
        {
          name: "gray-02",
          color: "#F6F6F6",
        },
        {
          name: "gray-03",
          color: "#F3F3F3",
        },
        {
          name: "gray-04",
          color: "#EEE",
        },
        {
          name: "gray-05",
          color: "#E0E0E0",
        },
        {
          name: "gray-06",
          color: "#D6D6D6",
        },
        {
          name: "gray-07",
          color: "#BDBDBD",
        },
        {
          name: "gray-08",
          color: "#9E9E9E",
        },
        {
          name: "gray-09",
          color: "#616161",
        },
        {
          name: "gray-10",
          color: "#222",
        },
        {
          name: "black",
          color: "#000",
        },
      ],
      bgColor: [
        {
          name: "gray-01",
          color: "#FAFAFA",
          smr: "전체 두번째 배경",
        },
        {
          name: "gray-06",
          color: "#d6d6d6",
          smr: "버튼, 아이콘 비활성화 배경",
        },
        {
          name: "gray-04",
          color: "#EEEEEE",
          smr: "인풋박스 비활성화 배경",
        },
        {
          name: "gray-03",
          color: "#F3F3F3",
          smr: "구성항목 구분 배경",
        },
        {
          name: "primary-01",
          color: "#F8F9FC",
          smr: "서브페이지 배경",
        },
        {
          name: "primary-02",
          color: "#EBEEF4",
          smr: "첨부파일, 알림장 읽은 사람 표기",
        },
        {
          name: "primary-03",
          color: "#E9F3FF",
          smr: "비활성화, 입력제한 텍스트",
        },
        {
          name: "primary-04",
          color: "#E1E9F9",
          smr: "급식 상세 알레르기 정보",
        },
      ],
      txtColor: [
        {
          name: "black",
          color: "#000",
          smr: "타이틀명",
        },
        {
          name: "gray-10",
          color: "#222",
          smr: "본문(Body)",
        },
        {
          name: "gray-09",
          color: "#616161",
          smr: "본문 하위 서브",
        },
        {
          name: "gray-08",
          color: "#9E9E9E",
          smr: "설명 텍스트",
        },
        {
          name: "gray-07",
          color: "#BDBDBD",
          smr: "비활성화, 입력제한 텍스트",
        },
      ],
      borderColor: [
        {
          name: "gray-05",
          color: "#E0E0E0",
          smr: "셀렉박스, 텍스트박스 테두리",
        },
        {
          name: "gray-06",
          color: "#D6D6D6",
          smr: "기본 버튼 라인",
        },
        {
          name: "gray-04",
          color: "#EEE",
          smr: "컨텐츠별 영역 구분, 인풋박스 비활성화 라인",
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.colorSys {
  h2 {
    text-transform: capitalize;
  }
  p {
    color: #fff;
    margin-bottom: 0;
    font-weight: 300;
    line-height: 1.2;

    &.tit {
      font-size: 20px;
      font-weight: var(--font-bold);
    }
    &.color {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
  .colorWrap {
    display: flex;
    li {
      width: 100%;
      height: 150px;
      display: flex;
      flex-flow: column;
      justify-content: flex-end;
      align-items: flex-start;
      padding: 20px;
    }
    &.txt,
    &.border,
    &.bg {
      flex-wrap: wrap;
      li {
        height: fit-content;
        padding: 20px 0;
        width: 20%;
        p {
          color: #333;
        }
        p.box {
          display: inline-block;
          width: 50px;
          height: 50px;
          margin-bottom: 10px;
          border-radius: 8px;
        }
        p.tit {
          font-size: 16px;
        }
      }
    }
    &.txt {
      li {
        p.box {
          font-size: 20px;
          background: #fafafa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
        }
      }
    }
  }
  .primaryWrap {
    display: flex;
    flex-wrap: wrap;

    .primary {
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      flex-flow: column;
      width: 25%;
      background: var(--primary);

      .tit {
        padding: 0 15px;
      }
      .color {
        padding: 5px 15px 15px;
      }
    }
    .primarySub {
      width: 50%;
      display: flex;
      flex-wrap: wrap;

      li {
        margin: 0;
        padding: 20px;
        font-size: 13px;
        background: var(--gray-20);
        height: 90px;
        display: flex;
        align-items: flex-end;
        width: 50%;
        color: var(--secondary);
      }
    } 
    .secondary {
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      flex-flow: column;
      width: 25%;
      background: var(--secondary);

      .tit {
        color: #fff;
        font-size: 20px;
        padding: 0 15px;
      }
      .color {
        padding: 5px 15px 15px;
      }
    }
  }
  .garyWrap {
    display: flex;
    border: 1px solid #eee;
    > div {
      width: 15%;
      padding: 20px;
      display: flex;
      flex-flow: column;
      justify-content: flex-end;
    }
    > ul {
      width: 70%;
      flex-wrap: wrap;
      li {
        width: 20%;
        height: 120px;
      }
    }
  }
}
</style>
