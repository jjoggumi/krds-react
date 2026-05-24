# API GENERATOR

## Overview

[swagger-typescript-api](https://www.npmjs.com/package/swagger-typescript-api) 을 활용한 API 자동 생성 스크립트입니다.

## Requirements

- Node.js >= 17  (22.14.0 LTS 추천)
  - 안타깝게도 swagger-typescript-api는 Node.js 17 이상에서만 작동하므로, 당분간 빌드 과정에 들어갈 수는 없고, 필요할 때만 생성해서 생성 결과물을 소스트리에 반영하는 형태로 운영해야 합니다.

## Usage

1. 아래와 같이 API 생성을 한번 실행해 봅니다.
    ```bash
    cd src/node && node scripts/apiGenerator/index.js ./src/apis
    ```

2. scripts/apiGenerator/generated-apis 폴더에서 필요한 모듈 이름을 찾습니다.
3. scripts/apiGenerator/config.js 상단의 using_modules 목록에 필요한 모듈 이름을 추가합니다.
4. API 생성을 다시 실행합니다.
5. 추가된 모듈을 push 합니다.