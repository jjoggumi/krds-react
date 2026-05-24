# @hiclass/core

HiClass Core API and Types Package.
이 패키지는 하이클래스 서비스의 핵심 API 클라이언트와 관련 타입 정의를 제공합니다. 프레임워크에 의존되지 않도록 순수 Typescript로 작성되어 다양한 환경에서 사용할 수 있습니다.

## 설치

현재는 따로 설치나 빌드 없이 코드 자체를 가져서 쓸 수 있도록 tsconfig 설정 되어 있습니다. 기본적으로 TypeScript로 되어 있으며 JS 환경에서도 API 모듈은 쓸 수 있습니다.

## 사용법

패키지에서 필요한 API 모듈, 타입을 가져와서 사용할 수 있습니다.

```typescript
import { getSometing, SomeType } from '@hiclass/core';

// API 호출
const some = await getSometing()

// Type Casting 사용
const someType = {} as SomeType

// Funtion 에서의 Type 사용
const someFuntion = function (some : SomeType) : SomeType {
    some.someA = 'HAHA'
    return some
}
```

## 구조 및 코드 추가 안내

`@hiclass/core` 패키지는 API와 타입을 분리하여 관리합니다.

- **`src/api`**: API 요청을 보내는 함수들이 위치합니다.
- **`src/types`**: API 요청 및 응답에 사용되는 타입들이 위치합니다.

### 새로운 타입 추가하기

1.  `src/types` 디렉토리에 주제에 맞는 파일을 생성하거나, 기존 파일에 새로운 `interface` 또는 `type`을 추가합니다.
    - 요청 관련 타입: `src/types/request/`
    - 응답 관련 타입: `src/types/response/`
    - 데이터 관련 타입: `src/types/**.ts` (데이터 관련 도메인명.ts 예: user.ts)
2.  `src/types/index.ts` 파일에 새로 작성한 타입을 `export` 합니다.
3.  요청 / 응답 관련 타입에는 되도록이면 응답에 관한 WrapperDto의 타입만 정의하고 내부 데이터 타입은 데이터 관련 타입으로 작성해주길 권장드립니다.
---
일반적인 상황
```typescript
export interface ResponseA {
    data: {
        id: number,
        someA: string,
        someB: string,
    }
}; 
// 이럴 경우 ResponseA.data의 구조를 외부에서 사용하기 어렵습니다.
```
권장 상황
```typescript
export interface DataB {
    id: number,
    someA: string,
    someB: string,
};

export interface ResponseB {
    data: DataB
};

const getData = async function (id: string) {
    const state: DataB | null = null; // <-- DataB의 형식으로 변수를 선언합니다.
    const respnse = await getAPI<ResponseB>(id);
    state = respones.data; // state에서 DataB을 활용 할 수 있습니다!
};

// 이러면 ResponseB.data의 구조를 외부에서 사용할 수 있습니다!
```

### 새로운 API 추가하기

1. API 문서를보고 Type/Request & Type/Response 폴더에 Request & Response를 Type을 정의합니다. (Response는 기본적으로 작성, Request는 필요에 따라 작성합니다.) 
2. `src/api` 디렉토리에 `xxxService.ts` 형식으로 파일을 생성합니다.     
   (기본적으로 API의 컨트롤러 단위로 작성하나 관리상의 이유로 분리할 수 있습니다.)
3. 생성한 파일에서 API 요청 함수를 작성합니다. (`axios-client.ts` 활용)
4. `src/api/index.ts` 파일에 새로 작성한 API 모듈을 `export` 합니다.
5. 만약 요청 URL에 쿼리스트링이 있다면 config의 param 으로 입력하면 됩니다.

```typescript
// type/someData.ts
export interface SomeData {
    id: number,
    someA: string,
    someB: string,
};

// type/response/somedataResponse.ts
export interface Response {
    someData : SomeData
};

// api/someDataService.ts
import { Response, SomeData } from '../types';
import {Get} from './index' // <-- axios-client.ts

export const getSomeData = async function (someDataId: string, version = 1) {
    return await Get<ResponseB>(  // <-- 제네릭에 해당 Response를 넣어주세요.
        `someData/${someDataId}`, 
        {param: {version}} // 쿼리 스트링이 있다면 qs 라이브러리의 의해 변환되므로 config의 param으로 넣어주세요.
    );
};

// Vue에서 사용
import { getSomeData } from "@hiclass/core";

init: async (someDataId: string) => {
    const resp = getSomeData(someDataId);
    console.log(resp.someData) // <--- 자동으로 SomeData로 유추됩니다!
}
```
