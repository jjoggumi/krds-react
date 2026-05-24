import lightningStrikeLeftLottie from '@/assets/img/lottie/lightning_strike_left.json';
import lightningStrikeRightLottie from '@/assets/img/lottie/lightning_strike_right.json';
import stemDefaultLottie from '@/assets/img/lottie/stem_default.json';
import stemEggWaitLottie from '@/assets/img/lottie/stem_egg_wait.json';
import caterpillarIdleLottie from '@/assets/img/lottie/motion_caterpillar_idle.json';
import dewDropSingleLottie from '@/assets/img/lottie/dew_drop_single.json';
import dewDropFiveLottie from '@/assets/img/lottie/dew_drop_five.json';
import motionEggLightningLottie from '@/assets/img/lottie/motion_egg_lightning.json';
import motionEggDewSingleLottie from '@/assets/img/lottie/motion_egg_dew_single.json';
import motionEggDewFiveLottie from '@/assets/img/lottie/motion_egg_dew_five.json';
import motionCaterpillarLightningLottie from '@/assets/img/lottie/motion_caterpillar_lightning.json';
import motionCaterpillarDewSingleLottie from '@/assets/img/lottie/motion_caterpillar_dew_single.json';
import motionCaterpillarDewFiveLottie from '@/assets/img/lottie/motion_caterpillar_dew_five.json';
import motionPupaDewSingleLottie from '@/assets/img/lottie/motion_pupa_dew_single.json';
import motionPupaDewFiveLottie from '@/assets/img/lottie/motion_pupa_dew_five.json';
import motionPupaLightningLottie from '@/assets/img/lottie/motion_pupa_lightning.json';
import motionPupaIdleLottie from '@/assets/img/lottie/motion_pupa_idle.json';
import stemPupaLottie from '@/assets/img/lottie/stem_pupa.json';
import pointPlus1Lottie from '@/assets/img/lottie/point+1.json';
import pointPlus5Lottie from '@/assets/img/lottie/point+5.json';
import pointMinus1Lottie from '@/assets/img/lottie/point-1.json';
import eggPopInLottie from '@/assets/img/lottie/egg_pop_in.json';
import caterpillarPopInLottie from '@/assets/img/lottie/caterpillar_pop_in.json';
import pupaPopInLottie from '@/assets/img/lottie/pupa_pop_in.json';
import stemPopInLottie from '@/assets/img/lottie/stem_pop_in.json';
import stemPupaPopInLottie from '@/assets/img/lottie/stem_pupa_pop_in.json';

// ======================= 🌟 기본 메시지 =======================
export const speechMessages = [
  {
    text: '목말라요…💧 이슬을 더 주세요!',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_thirsty_more_dew.mp3',
  },
  {
    text: '오늘도 쑥쑥 크고 싶어요 ✨',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_grow_more.mp3',
  },
  {
    text: '언젠가 예쁜 나비가 될 거예요! 🦋',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_future_butterfly.mp3',
  },
  {
    text: '우리 반 친구들이 있어서 참 든든해요 💖',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_friends_reliable.mp3',
  },
  {
    text: '오늘도 반짝이는 하루가 될 것 같아요 🌈',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_sparkling_day.mp3',
  },
  {
    text: '햇살이 포근해서 기분이 좋아요 ☀️',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_cozy_sunshine.mp3',
  },
  {
    text: '친구들 웃음소리가 제일 좋아요 😊',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_friends_laugh.mp3',
  },
  {
    text: '오늘은 어떤 기적이 일어날까요? 🌟',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_what_miracle.mp3',
  },
  {
    text: '톡톡! 누가 인사했나요? 히힛 🫧',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_knock_greeting.mp3',
  },
  {
    text: '오늘도 응원할게요, 친구들 파이팅! 💪',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_cheer_friends.mp3',
  },
  {
    text: '하늘이 너무 예뻐서 기분이 좋아요 ☁️',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_beautiful_sky.mp3',
  },
  {
    text: '오늘도 웃으면 꽃이 피어요 🌸',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_smile_flowers.mp3',
  },
  {
    text: '오늘도 우리 반 최고예요! 💪🌟',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_best_class.mp3',
  },
  {
    text: '오늘은 어떤 멋진 일들이 기다릴까요? ✨',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_wonder_miracle.mp3',
  },
  {
    text: '친구들이 열심히 하는 모습이 정말 멋져요 🌱',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_friends_hardwork.mp3',
  },
  {
    text: '오늘도 다 같이 힘을 모아볼까요? 💪💖',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_work_together.mp3',
  },
  {
    text: '서로 도와주는 마음이 참 예뻐요 💞',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_helping_heart.mp3',
  },
  {
    text: '모두가 반짝반짝, 우리 반이 제일 빛나요 🌟',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_everyone_sparkle.mp3',
  },
  {
    text: '함께 웃는 우리 반, 마음이 따뜻해져요 🌈',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_warm_laughter.mp3',
  },
  {
    text: '우리 반의 노력은 작은 기적을 만들어요 ✨',
    sound: 'https://download.hiclass.net/static/assets/audio/mission_sound_effort_miracle.mp3',
  },
];

// ======================= 🌟 미션 달성 메시지 =======================
export const successMessages = [
  '목표 달성! 모두의 노력이 큰 힘이 되었어요 💪',
  '우리 반이 힘을 합쳐 멋진 성과를 만들었어요 ✨',
  '작은 물방울이 모여 큰 꿈을 이루었어요 🌍',
  '미션 달성! 우리 반 최고예요 👍',
  '우리가 해냈어요! 함께라서 가능했어요 👏',
];

// ======================= 💧 이슬 1방울 메시지 =======================
export const waterDropMessages = [
  '물을 마시니 힘이 솟아요! 고마워요 🌱',
  '덕분에 오늘도 무럭무럭 자랄 거예요 💧',
  '나비의 꿈에 한 걸음 더 다가갔어요 🦋',
  '촉촉해지니 기분이 좋아요, 고마워요 ✨',
  '나를 위해 물을 주다니… 감동이에요 💖',
];

// ======================= 💧 이슬 5방울 메시지 =======================
export const waterDropFiveMessages = [
  '와~ 든든하게 마셨어요! 쑥쑥 자랄 준비 완료 🌱',
  '물을 충분히 먹으니 마음도 밝아져요 ☀️',
  '듬뿍 마셨더니 에너지가 가득해졌어요 ⚡️',
  '친구들 덕분에 더 건강해졌어요 💧',
  '넉넉한 보살핌 덕분에 오늘도 행복해요 😊',
];

// ======================= ⚡ 번개 메시지 =======================
export const lightningMessages = [
  '번개는 미션 달성을 방해해요 🚫',
  '으아… 번개가 내려앉았어요, 무서워요 😣',
  '도와줘요! 번개가 치면 쑥쑥 크기 힘들어요 💧',
  '에구… 나비의 길이란 험난하네요 🥺',
  '흐잉… 조금 무서웠지만 다시 힘낼 거예요 💖',
];

// ======================= 🎬 Lottie =======================
export const lotties = {
  lightningStrikeLeft: { animationData: lightningStrikeLeftLottie },
  lightningStrikeRight: { animationData: lightningStrikeRightLottie },
  stemDefault: { animationData: stemDefaultLottie, loop: true, autoplay: true },
  stemEggWait: {
    animationData: stemEggWaitLottie,
    loop: true,
    autoplay: true,
  },
  stemPupa: {
    animationData: stemPupaLottie,
    loop: true,
    autoplay: true,
  },
  caterpillarIdle: {
    animationData: caterpillarIdleLottie,
    loop: true,
    autoplay: true,
  },
  dewDropSingle: { animationData: dewDropSingleLottie },
  dewDropFive: { animationData: dewDropFiveLottie },
  motionEggLightning: { animationData: motionEggLightningLottie },
  motionEggDewSingle: { animationData: motionEggDewSingleLottie },
  motionEggDewFive: { animationData: motionEggDewFiveLottie },
  motionCaterpillarLightning: {
    animationData: motionCaterpillarLightningLottie,
  },
  motionCaterpillarDewSingle: {
    animationData: motionCaterpillarDewSingleLottie,
  },
  motionCaterpillarDewFive: {
    animationData: motionCaterpillarDewFiveLottie,
  },
  motionPupaDewSingle: { animationData: motionPupaDewSingleLottie },
  motionPupaDewFive: { animationData: motionPupaDewFiveLottie },
  motionPupaLightning: { animationData: motionPupaLightningLottie },
  motionPupaIdle: {
    animationData: motionPupaIdleLottie,
    loop: true,
    autoplay: true,
    duration: 3000,
  },
  pointPlus1: { animationData: pointPlus1Lottie, loop: false, autoplay: true },
  pointPlus5: { animationData: pointPlus5Lottie, loop: false, autoplay: true },
  pointMinus1: { animationData: pointMinus1Lottie, loop: false, autoplay: true },
  eggPopIn: { animationData: eggPopInLottie, loop: false, autoplay: true },
  caterpillarPopIn: { animationData: caterpillarPopInLottie, loop: false, autoplay: true },
  pupaPopIn: { animationData: pupaPopInLottie, loop: false, autoplay: true },
  stemPopIn: { animationData: stemPopInLottie, loop: false, autoplay: true },
  stemPupaPopIn: { animationData: stemPupaPopInLottie, loop: false, autoplay: true },
};

// ======================= 🌟 버튼 사운드 =======================
export const soundEffects = {
  singleWater: 'https://download.hiclass.net/static/assets/audio/mission_sound_single_water.wav',
  fiveWater: 'https://download.hiclass.net/static/assets/audio/mission_sound_five_water.mp3',
  lightning: 'https://download.hiclass.net/static/assets/audio/mission_sound_lightning.mp3',
  confetti: 'https://download.hiclass.net/static/assets/audio/random-confetti.wav',
};
