export const TOOLKITS = Object.freeze([
  { type: 'timer', label: '타이머', w: '1000', h: '635', path: 'timer', icon: require('@/assets/img/icon/icon_timer.svg') },
  { type: 'dice', label: '주사위', w: '440', h: '527', path: 'dice', icon: require('@/assets/img/icon/icon_dice.svg') },
  { type: 'coin', label: '동전던지기', w: '440', h: '527', path: 'coin', icon: require('@/assets/img/icon/icon_coin.svg') },
  { type: 'wheel', label: '돌림판', w: '1000', h: '610', path: 'wheel', icon: require('@/assets/img/icon/icon_wheel.svg') },
  { type: 'memo', label: '메모', w: '757', h: '387', path: 'memo', icon: require('@/assets/img/icon/icon_memo.svg') },
  { type: 'noisemonitor', label: '소음측정기', w: '1000', h: '635', path: 'noisemonitor', icon: require('@/assets/img/icon/icon_noise.png') },
  { type: 'video', label: '영상재생', w: '820', h: '560', path: 'video', icon: require('@/assets/img/icon/icon_video.svg') },
  {
    type: 'qrcode',
    label: 'QR코드',
    w: '820',
    h: '540',
    path: 'qrcode',
    icon: require('@/assets/img/icon/icon_qr_black.svg'),
    iconActive: require('@/assets/img/icon/icon_qr_white.svg'), // 추가: hover/active용 아이콘
  },
  { type: 'air', label: '미세먼지', w: '1000', h: '610', path: 'air', icon: require('@/assets/img/icon/icon_dust.png') },
]);

export const activeToolkits = {}

export const openToolkit = (type, value) => {
  activeToolkits[type] = value
}

export const closeToolkit = (type) => {
  delete activeToolkits[type]
}