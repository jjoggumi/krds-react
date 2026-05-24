<template>
  <div id="price-plan" class="price-plan-wrap">
    <help-header />
    <div class="price-plan-inner">
      <header>
        <h2>하이클래스 도입 및 이용료 안내</h2>
        <p class="desc">
          <!-- <em></em> <br class="m-br"> -->
          이용 규모에 맞게 도입할 수 있도록 <br class="m-br" />맞춤형 유료 플랜을 제공합니다. <br />
          우리 학교에 맞는 하이클래스 플랜을 선택하세요.
        </p>
      </header>
      <main class="con hi-row">
        <div class="col-md-12 col-lg-6 basic-price">
          <div class="plan-tit">
            <div class="txt">
              <p class="plan-name">교사 개인 또는 개별 학교</p>
              <h4>광고 노출</h4>
              <p class="plan-price">무료</p>
            </div>
            <HiButton size="xl" bitrounded block @click="startButtonClick('teacher/v2/#wrap')"> 시작하기 </HiButton>
          </div>
          <div class="plan-con">
            <div class="plan-list">
              <dl>
                <dt>지원 OS</dt>
                <dd>Web, App</dd>
              </dl>
              <dl>
                <dt>기본 기능</dt>
                <dd>설문, 상담, 방과후 신청</dd>
                <dd>학급관리</dd>
                <dd>알림장, 가정통신문</dd>
              </dl>
              <dl>
                <dt>번역 지원</dt>
                <dd>게시글 번역</dd>
              </dl>
              <dl>
                <dt>광고 노출</dt>
                <dd>앱 내 노출 일부 있음</dd>
              </dl>
            </div>
            <div class="plan-btns">
              <HiButton size="xl" color="primary" outline bitrounded block @click="startButtonClick('teacher/v2/#wrap')"> 시작하기 </HiButton>
            </div>
          </div>
        </div>
        <div class="col-md-12 col-lg-6 pro-price">
          <div class="plan-tit">
            <div class="txt">
              <p class="plan-name">교육청 산하 시스템 도입</p>
              <h4>무광고 & 커스터마이징</h4>
              <!-- <p class="plan-price">학교 당 연간 200만원</p>
              <small>(VAT 별도 / 학교 수에 따른 별도 협의)</small> -->
              <p class="plan-price">연간 200만원</p>
              <small>(학교 당 / VAT 별도 )</small>
            </div>
            <HiButton color="primary" size="xl" bitrounded block @click="$router.push('/help/contactus')"> 도입 문의하기 </HiButton>
          </div>
          <div class="plan-con">
            <div class="plan-list">
<!--              <dl>-->
<!--                <dt>지원 OS</dt>-->
<!--                <dd>Web, App</dd>-->
<!--              </dl>-->
              <dl>
                <dt>기본 기능</dt>
                <dd>교육청/교육지원청 단위 가정통신문 발행 관리</dd>
                <dd>학교 단위 가정통신문, 알림장, 설문/신청 발행 관리</dd>
                <dd>설문/신청 결과 통계 데이터 제공</dd>
                <dd>발행 게시물의 열람 상태 확인</dd>
              </dl>
              <div class="pro-feature">
                <dl>
                  <dt>학교 단체 제공 기능</dt>
                  <dd>고급 설문 분석 리포트</dd>
                  <dd>교육청 통합 로그인 연동</dd>
<!--                  <dd>NEIS, 온/오프라인 학습 시스템 API 연동 가능</dd>-->
                </dl>
                <dl>
                  <dt>커스터마이징</dt>
                  <dd>교육청 단체 운영 방식에 맞춘 커스터마이징 지원</dd>
                </dl>
                <dl>
                  <dt>번역 지원</dt>
                  <dd>서비스 전체</dd>
                </dl>
                <dl>
                  <dt>광고 노출</dt>
                  <dd>Ad Free (모든 서비스 무광고 제공)</dd>
                </dl>
                <dl>
                  <dt>장애 대응 서비스</dt>
                  <dd>전담 CS 및 긴급 장애 대응 전용 라인 제공</dd>
                </dl>
                <dl>
                  <dt>기술지원</dt>
                  <dd>공공기관 보안 가이드 준수 서버</dd>
                  <dd>외부 인증 모듈 적용</dd>
                  <dd>구축형 지원 가능</dd>
                </dl>
              </div>
            </div>
            <div class="plan-btns">
              <HiButton color="primary" size="xl" bitrounded block @click="goToPayment"> 결제하기 </HiButton>
              <HiButton color="primary" size="xl" bitrounded block @click="$router.push('/help/contactus')"> 도입 문의하기 </HiButton>
            </div>
          </div>
        </div>
      </main>
    </div>
    <hc-footer />
  </div>
</template>

<script>
import HelpHeader from '@/apps/help/HelpHeader.vue';
import HcFooter from '@/components/Form/HcFooter';

export default {
  name: 'pricePlan',
  components: {
    HelpHeader,
    HcFooter,
  },
  data() {
    return {};
  },
  methods: {
    startButtonClick(loginUserType) {
      let path = '/login/' + loginUserType;
      this.$router.push(path, () => {});
    },
    goToPayment() {
      //window.location.href = 'https://www.naver.com';
      window.open('https://i-screammall.co.kr/goods/detail/10193013', '_blank');
    },
  },
};
</script>

<style lang="scss" scoped>
// @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
.price-plan-wrap {
  padding: 120px 40px 103px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  .price-plan-inner {
    width: 100%;
    header {
      text-align: center;
      h2 {
        font-size: 36px;
        font-weight: 600;
        line-height: 150%;
        margin-bottom: 16px;
        color: var(--font-color);
      }
      p {
        font-size: 16px;
        line-height: 160%;
        color: var(--gray-10);
      }
    }
    .con * {
      font-family: var(--font-body);
    }
    .con {
      margin: 48px auto 0;
      max-width: 1040px;
      align-items: stretch;
      justify-content: center;

      .pro-price,
      .basic-price {
        max-width: 430px;
        display: flex;
        flex-flow: column;

        .plan-tit {
          background: linear-gradient(to bottom, #8549fe, #5343d9);
          padding: 20px;
          height: 282px;
          min-height: 282px;
          overflow: hidden;
          border-radius: 8px 8px 0 0;
          display: flex;
          flex-flow: column;
          justify-content: space-between;
          .txt {
            padding: 12px;
            h4 {
              font-size: 18px;
              font-weight: 500;
              line-height: 144%;
              letter-spacing: -0.5px;
              color: #fff;
              margin-bottom: 4px;
            }
            .plan-name {
              font-size: 24px;
              font-weight: 700;
              line-height: 136%;
              letter-spacing: -0.5px;
              color: #fff;
              margin-bottom: 8px;
            }
            .plan-price {
              font-size: 28px;
              font-weight: 700;
              line-height: 136%;
              letter-spacing: -0.5px;
              color: #fff;
            }
            small {
              font-size: 14px;
              font-weight: 400;
              line-height: 160%;
              letter-spacing: 0;
              color: #abd8f5;
            }
          }
          .hi-btn {
            background: #392387;
            border: 1px solid #392387;
            &:hover {
              background: #301d71;
              border: 1px solid #301d71;
            }
          }
        }
        .plan-con {
          border: 1px solid #d6d6d6;
          border-radius: 0 0 8px 8px;
          padding: 30px;
          height: 100%;
          display: flex;
          flex-flow: column;
          justify-content: space-between;
        }
        .plan-btns {
          height: 110px;
          margin-top: 20px;
          .hi-btn {
            border-radius: 8px;
            margin-left: -13px;
            width: calc(100% + 26px);
          }
          .hi-btn {
            border-radius: 8px;
          }
          .btn-primary {
            background: #4d98ff;
            border: 1px solid #4d98ff;
            &:hover {
              background: #478ceb;
              border: 1px solid #478ceb;
            }
          }
          .btn-line-primary {
            border: 1px solid #4d98ff;
            &:hover {
              background: rgba(#4d98ff, 0.1);
            }
          }
          .hi-btn + .hi-btn {
            margin-top: 8px;
          }
        }
      }

      dl {
        dt {
          font-size: 16px;
          font-weight: 700;
          line-height: 150%;
          margin-bottom: 8px;
          color: var(--gray-10);
        }
        dd {
          font-size: 16px;
          font-weight: 400;
          line-height: 150%;
          position: relative;
          padding-left: 24px;
          color: var(--gray-10);
          &::before {
            content: '';
            color: var(--font-color);
            position: absolute;
            left: -1px;
            top: 0px;
            width: 20px;
            height: 20px;
            mask-image: url(~@/assets/img/svg/ico-check.svg);
            background-color: var(--success);
            background-size: 20px;
          }
          &.not-spt::before {
            background-color: var(--gray-07);
          }
          &.no-data::before {
            display: none;
          }
          & + dd {
            margin-top: 9px;
          }
        }
        & + dl {
          margin-top: 40px;
        }
      }
      .pro-price {
        .plan-tit {
          background: linear-gradient(to bottom, #3cabf4, #5285ee);
          .hi-btn {
            background: #234d9f;
            border: 1px solid #234d9f;
            &:hover {
              background: #1d4185;
              border: 1px solid #1d4185;
            }
          }
        }
        .plan-con {
          border: 2px solid #5088ee;
        }
      }
      .pro-feature {
        background-color: #f9fafc;
        padding: 20px 14px;
        margin-top: 45px;
        border-radius: 4px;
        margin-left: -13px;
        width: calc(100% + 26px);
        dl dt {
          color: #4d98ff;
        }
      }
    }
  }
  .l-footer-sub {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
  .m-br {
    display: none;
  }
  .w-br {
    display: block;
  }
}
@media (max-width: 993px) {
  .price-plan-wrap {
    .price-plan-inner {
      header h2 {
        font-size: 30px;
      }
      .con {
        gap: 16px;
      }
    }
  }
}
@media (max-width: 660px) {
  .price-plan-wrap {
    padding: 74px 24px 82px;
    .m-br {
      display: block;
    }
    .w-br {
      display: none;
    }
    .price-plan-inner {
      padding: 0px;
      header {
        h2 {
          font-size: 24px;
        }
        p {
          font-size: 15px;
        }
      }
      .con {
        gap: 16px;
        margin-top: 32px;
        .basic-price,
        .pro-price {
          .plan-tit {
            padding: 20px 22px;
            height: 210px;
            min-height: 210px;
            .txt {
              padding: 6px;
              .plan-name {
                font-size: 20px;
              }
              h4 {
                font-size: 16px;
              }
              .plan-price {
                font-size: 22px;
              }
            }
          }
          .plan-btns {
            height: auto;
          }
        }
        .pro-price {
          .plan-tit {
            height: 235px;
            min-height: 235px;
          }
        }
      }
      .con ul {
        padding: 20px 20px 20px 35px;
      }
    }
    .hi-row > * {
      padding: 0;
    }
  }
}
</style>