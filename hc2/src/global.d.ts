// src/global.d.ts

//  Vite 환경에서 모듈을 인식하도록 설정
/// <reference types="vite/client" />  
declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.scss";
declare module "*.css";

// typescript에서 window 객체에 ReactNativeWebView가 존재한다고 인식하도록 글로벌 타입 선언
declare global {
  interface Window {
    ReactNativeWebView: {
      postMessage: (message: string) => void;
    };
    handleNativeBackPress?: () => void;
    handlePageBackPress?: () => void;
  }
}

export {};