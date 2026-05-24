# worksheet-webview docs
## version: 1.8.5

작성일: **2022-04-04**

작성자: **최경준**

---

## 변경사항
1. `validateSheetResponse`, `validateApplyResponse` 응답 메시지 코드 `05`가 추가되었습니다. (하단 코드 참조)
2. javascript code markdown 문법이 변경되었습니다.

---

## 1. 웹뷰 정의

- ### 신청서 신규 작성하기 웹뷰
|              | 신청서 신규 작성하기 웹뷰   |
| ------------ | ----------------------- |
| Request URL | `{WEB_DOMAIN}`/worksheetSubmit/`{sheetId}`?idToken=`{idToken}` |
| Sample URL  | [신청서 신규 작성하기 웹뷰 sample URL](https://devui.hiclass.net/worksheetSubmit/7ed86aca-62c8-4bbf-9ace-bdbf753324ea?idToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiZWRUV1Q3anNjeG1uZy13S2ZUODcyQSIsInN1YiI6IjEwOTkyNzQ0ODMzMjY5Njc5MjkyMSIsImNsaWVudFJlZ2lzdHJhdGlvbklkIjoiZ29vZ2xlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOlwvXC9hY2NvdW50cy5nb29nbGUuY29tIiwicGhvdG8iOiJodHRwczpcL1wvbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwvYVwvQUFUWEFKd05COU9FOTRjVFd1RWFQNWxDMVRMZW4zQVJjM196c3QxZkxFM0U9czk2LWMiLCJwcmluY2lwYWxOYW1lIjoiMTA5OTI3NDQ4MzMyNjk2NzkyOTIxIiwiZ2l2ZW5fbmFtZSI6IuqyveykgCIsImxvY2FsZSI6ImtvIiwidXVpZCI6IjMyODFlZjk4LTc3NjktNGZjOS05NjQ3LWVlOGViOGU0Y2Q0NiIsInBpY3R1cmUiOiJodHRwczpcL1wvbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwvYVwvQUFUWEFKd05COU9FOTRjVFd1RWFQNWxDMVRMZW4zQVJjM196c3QxZkxFM0U9czk2LWMiLCJhdWQiOiIxMDI4NjY1ODMyOTE5LWJzdGM1MTd1dWg4Z2U4NmphOGE0NzdrbXZwcDltZ3VzLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXpwIjoiMTAyODY2NTgzMjkxOS1ic3RjNTE3dXVoOGdlODZqYThhNDc3a212cHA5bWd1cy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsIm5hbWUiOiLstZzqsr3spIAiLCJhY2Nlc3NUb2tlbkF0Ijp7Imlzc3VlZEF0IjoiMjEuIDEwLiAyOSDsmKTtm4QgMTo0NSIsImV4cGlyZXNBdCI6IjIxLiAxMC4gMjkg7Jik7ZuEIDI6NDUifSwiZXhwIjoxNjM1NjU1NTEzLCJmYW1pbHlfbmFtZSI6Iuy1nCIsImlhdCI6MTYzNTQ4MjcxMywiZW1haWwiOiJyYWRla2t1OTJAZ21haWwuY29tIiwiaWRUb2tlbkF0Ijp7Imlzc3VlZEF0IjoiMjEuIDEwLiAyOSDsmKTtm4QgMTo0NSIsImV4cGlyZXNBdCI6IjIxLiAxMC4gMzEg7Jik7ZuEIDE6NDUifX0.cB5sy73vwTnrc67TjikmcJfQVcdqY_lwVK6Ot550qYrYOqNpHBBZTbRkBckNYUz-3LNSBIzhlDmC5ATIFJ5BaseIqTC5LjPmgclqmz-1b7deCKhB1_HHB7g1_6snWUXEPkBzST0wj8XZePIbtAp9cgKyEgfZU_Dv0poG1AB_48yGOqgvt9l3HyVFqV0gS2GRoAkD6Ieop-iQ0qD74V05h7qKaOAshqNGJORmmtSvnrMLqtXM4vhrn-scIxW0riFe7Tu3HAKqTGEdTmfvYem1k8kT0nBX9u2rgDQHUNI-hhFBH2rNFUCS8w6UPqrdpXNeJbOOyDkVc7L55S8KEFNzGg) |
| ETC         | 워크시트 기획서 v1.5 기준 51페이지 참조. `sheetId` , `idToken` URL 파라미터 추가하여 호출해주시면 됩니다. | 


- ### 신청서 상세보기 웹뷰 (수정 불가능)
|              | 신청서 상세보기 웹뷰 (수정 불가능)   |
| ------------ | ------------------------------- |
| Request URL | `{WEB_DOMAIN}`/worksheetSubmit/`{sheetId}`/`{applyId}`?idToken=`{idToken}` |
| Sample URL  | [신청서 상세보기 웹뷰 sample URL](https://devui.hiclass.net/worksheetSubmit/7ed86aca-62c8-4bbf-9ace-bdbf753324ea/b5b486e4-25f8-4174-8d56-4bf2eb20eb69?idToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiZWRUV1Q3anNjeG1uZy13S2ZUODcyQSIsInN1YiI6IjEwOTkyNzQ0ODMzMjY5Njc5MjkyMSIsImNsaWVudFJlZ2lzdHJhdGlvbklkIjoiZ29vZ2xlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOlwvXC9hY2NvdW50cy5nb29nbGUuY29tIiwicGhvdG8iOiJodHRwczpcL1wvbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwvYVwvQUFUWEFKd05COU9FOTRjVFd1RWFQNWxDMVRMZW4zQVJjM196c3QxZkxFM0U9czk2LWMiLCJwcmluY2lwYWxOYW1lIjoiMTA5OTI3NDQ4MzMyNjk2NzkyOTIxIiwiZ2l2ZW5fbmFtZSI6IuqyveykgCIsImxvY2FsZSI6ImtvIiwidXVpZCI6IjMyODFlZjk4LTc3NjktNGZjOS05NjQ3LWVlOGViOGU0Y2Q0NiIsInBpY3R1cmUiOiJodHRwczpcL1wvbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwvYVwvQUFUWEFKd05COU9FOTRjVFd1RWFQNWxDMVRMZW4zQVJjM196c3QxZkxFM0U9czk2LWMiLCJhdWQiOiIxMDI4NjY1ODMyOTE5LWJzdGM1MTd1dWg4Z2U4NmphOGE0NzdrbXZwcDltZ3VzLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXpwIjoiMTAyODY2NTgzMjkxOS1ic3RjNTE3dXVoOGdlODZqYThhNDc3a212cHA5bWd1cy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsIm5hbWUiOiLstZzqsr3spIAiLCJhY2Nlc3NUb2tlbkF0Ijp7Imlzc3VlZEF0IjoiMjEuIDEwLiAyOSDsmKTtm4QgMTo0NSIsImV4cGlyZXNBdCI6IjIxLiAxMC4gMjkg7Jik7ZuEIDI6NDUifSwiZXhwIjoxNjM1NjU1NTEzLCJmYW1pbHlfbmFtZSI6Iuy1nCIsImlhdCI6MTYzNTQ4MjcxMywiZW1haWwiOiJyYWRla2t1OTJAZ21haWwuY29tIiwiaWRUb2tlbkF0Ijp7Imlzc3VlZEF0IjoiMjEuIDEwLiAyOSDsmKTtm4QgMTo0NSIsImV4cGlyZXNBdCI6IjIxLiAxMC4gMzEg7Jik7ZuEIDE6NDUifX0.cB5sy73vwTnrc67TjikmcJfQVcdqY_lwVK6Ot550qYrYOqNpHBBZTbRkBckNYUz-3LNSBIzhlDmC5ATIFJ5BaseIqTC5LjPmgclqmz-1b7deCKhB1_HHB7g1_6snWUXEPkBzST0wj8XZePIbtAp9cgKyEgfZU_Dv0poG1AB_48yGOqgvt9l3HyVFqV0gS2GRoAkD6Ieop-iQ0qD74V05h7qKaOAshqNGJORmmtSvnrMLqtXM4vhrn-scIxW0riFe7Tu3HAKqTGEdTmfvYem1k8kT0nBX9u2rgDQHUNI-hhFBH2rNFUCS8w6UPqrdpXNeJbOOyDkVc7L55S8KEFNzGg) |
| ETC         | 워크시트 기획서 v1.5 기준 50페이지 참조. 신청서 신규 작성 후 발행된 `applyId` (`response.id` 또는 `response.currentId`) 를 추가해서 호출해주시면 됩니다. |


- ### 신청서 수정하기 웹뷰
|              | 신청서 수정하기 웹뷰    |
| ------------ | -------------------- |
| Request URL | `{WEB_DOMAIN}`/worksheetSubmit/`{sheetId}`/`{applyId}`/modify?idToken=`{idToken}` |
| Sample URL  | [신청서 수정하기 웹뷰 sample URL](https://devui.hiclass.net/worksheetSubmit/7ed86aca-62c8-4bbf-9ace-bdbf753324ea/b5b486e4-25f8-4174-8d56-4bf2eb20eb69?idToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiZWRUV1Q3anNjeG1uZy13S2ZUODcyQSIsInN1YiI6IjEwOTkyNzQ0ODMzMjY5Njc5MjkyMSIsImNsaWVudFJlZ2lzdHJhdGlvbklkIjoiZ29vZ2xlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOlwvXC9hY2NvdW50cy5nb29nbGUuY29tIiwicGhvdG8iOiJodHRwczpcL1wvbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwvYVwvQUFUWEFKd05COU9FOTRjVFd1RWFQNWxDMVRMZW4zQVJjM196c3QxZkxFM0U9czk2LWMiLCJwcmluY2lwYWxOYW1lIjoiMTA5OTI3NDQ4MzMyNjk2NzkyOTIxIiwiZ2l2ZW5fbmFtZSI6IuqyveykgCIsImxvY2FsZSI6ImtvIiwidXVpZCI6IjMyODFlZjk4LTc3NjktNGZjOS05NjQ3LWVlOGViOGU0Y2Q0NiIsInBpY3R1cmUiOiJodHRwczpcL1wvbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwvYVwvQUFUWEFKd05COU9FOTRjVFd1RWFQNWxDMVRMZW4zQVJjM196c3QxZkxFM0U9czk2LWMiLCJhdWQiOiIxMDI4NjY1ODMyOTE5LWJzdGM1MTd1dWg4Z2U4NmphOGE0NzdrbXZwcDltZ3VzLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXpwIjoiMTAyODY2NTgzMjkxOS1ic3RjNTE3dXVoOGdlODZqYThhNDc3a212cHA5bWd1cy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsIm5hbWUiOiLstZzqsr3spIAiLCJhY2Nlc3NUb2tlbkF0Ijp7Imlzc3VlZEF0IjoiMjEuIDEwLiAyOSDsmKTtm4QgMTo0NSIsImV4cGlyZXNBdCI6IjIxLiAxMC4gMjkg7Jik7ZuEIDI6NDUifSwiZXhwIjoxNjM1NjU1NTEzLCJmYW1pbHlfbmFtZSI6Iuy1nCIsImlhdCI6MTYzNTQ4MjcxMywiZW1haWwiOiJyYWRla2t1OTJAZ21haWwuY29tIiwiaWRUb2tlbkF0Ijp7Imlzc3VlZEF0IjoiMjEuIDEwLiAyOSDsmKTtm4QgMTo0NSIsImV4cGlyZXNBdCI6IjIxLiAxMC4gMzEg7Jik7ZuEIDE6NDUifX0.cB5sy73vwTnrc67TjikmcJfQVcdqY_lwVK6Ot550qYrYOqNpHBBZTbRkBckNYUz-3LNSBIzhlDmC5ATIFJ5BaseIqTC5LjPmgclqmz-1b7deCKhB1_HHB7g1_6snWUXEPkBzST0wj8XZePIbtAp9cgKyEgfZU_Dv0poG1AB_48yGOqgvt9l3HyVFqV0gS2GRoAkD6Ieop-iQ0qD74V05h7qKaOAshqNGJORmmtSvnrMLqtXM4vhrn-scIxW0riFe7Tu3HAKqTGEdTmfvYem1k8kT0nBX9u2rgDQHUNI-hhFBH2rNFUCS8w6UPqrdpXNeJbOOyDkVc7L55S8KEFNzGg) |
| ETC         | 워크시트 기획서 v1.5 기준 54페이지 참조. 파라미터는 신청서 상세보기와 같고 URL 마지막에 `/modify` 추가해서 호출해주시면 됩니다. |


- ### WEB_DOMAIN 정의
| 배포 서버 | URL                     |
| ------- | ------------------------ |
| 개발    | https://devui.hiclass.net |
| 스테이지 | https://stage.hiclass.net |
| 상용    | https://www.hiclass.net   |

---


## 2. APP-Webview 인터페이스
`신청서 신규 작성하기`, `신청서 수정하기` 웹뷰에서 `APP-Webview` 간 통신하는 인터페이스는 다음과 같습니다.


### 1. APP 에서 javascript 호출

- ### validateSheet
| validateSheet | 저장 버튼 클릭하기 전 입력 폼의 유효성 검사가 필요할 때 사용 |
| ------------ | ----------------------- |
| -            | -                       |
| Request | `javascript:validateSheet()` |
| Response | 유효성 체크 후 사전 정의된 `validateSheetResponse` 인터페이스를 호출합니다. |
| ETC |  |

- ### validateApply
| validateApply | 저장 버튼 클릭하기 전 입력 폼의 유효성 검사가 필요할 때 사용 |
| ------------ | ----------------------- |
| -            | -                       |
| Request | `javascript:validateApply(String: applyStatus)` |
| Response | 유효성 체크 후 사전 정의된 `validateApplyResponse` 인터페이스를 호출합니다. |
| ETC | 파라미터 `applyStatus` 는 변경될 신청서의 상태값을 전달해주세요. 가능한 상태값은 `UNIDENTIFIED` 또는 `REJECT` 또는 `COMPLETE` 이며 `COMPLETE` 일 경우에만 유효성 체크를 하고 기타 상태값은 정상 처리됩니다. |

- ### createSheetSubmit
| createSheetSubmit | 저장 버튼 클릭하여 시트 변경사항을 저장할 때 사용 |
| ----------------- | ----------------------------------------- |
| Request | `javascript:createSheetSubmit(String: applyId)` |
| Response | `validateSheet()` 함수를 실행합니다. |
| ETC |  |

- ### updateSheetSubmit
| updateSheetSubmit | 수정 버튼 클릭하여 시트 변경사항을 저장할 때 사용 |
| ------------ | ----------------------- |
| -            | -                       |
| Request | `javascript:updateSheetSubmit(String: applyId)` |
| Response | `validateSheet()` 함수를 실행합니다. |
| ETC |  |

- ### blurSheetItem
| blurSheetItem | 입력한 텍스트 내용을 시트에 반영할 때 사용 |
| ------------ | ----------------------- |
| -            | -                       |
| Request | `javascript:blurSheetItem(String: command, String: type, String: itemId, String: value)` |
| Response | 없음 |
| ETC | 워크시트 기획서 v1.5 기준 53페이지 참조 |

- ### doFocusItem
| doFocusItem | 입력한 텍스트 내용을 시트에 반영할 때 사용 |
| ------------ | ----------------------- |
| -            | -                       |
| Request | `javascript:doFocusItem(String: command, String: type, String: itemId, String: action)` |
| Response | `command` 또는 `type` 이 없는 경우 `validateSheetResponse` 인터페이스를 호출합니다. |
| ETC | 특정 `itemId` 를 지정하거나 현재 포커싱된 아이템에서 up(prev), down(next) 상태를 지정하면 해당 아이템으로 포커싱하는 함수. 파라미터 중 `itemId` 또는 `action` 둘 중 하나의 값은 꼭 있어야 합니다. 값이 없는 경우에는 `null` 또는 공백(`''`) 을 전달해 주세요. |

- ### doFocusOutItem
| doFocusOutItem | 앱의 키보드가 비활성화 되었을 때 호출하는 함수 |
| ------------ | ----------------------- |
| -            | -                       |
| Request | `javascript:doFocusOutItem(String: command, String: type)` |
| Response | `command` 또는 `type` 이 없는 경우 `validateSheetResponse` 인터페이스를 호출합니다. |
| ETC | 웹뷰의 포커싱된 아이템을 초기화합니다. |

- ### doReloadSign
| doReloadSign | 웹뷰의 서명을 갱신하는 함수 |
| ------------ | ----------------------- |
| -            | -                       |
| Request | `javascript:doReloadSign(String: command, String: signType)` |
| Response | `command` 또는 `signType` 이 없는 경우 `validateSheetResponse` 인터페이스를 호출합니다. |
| ETC | 앱에서 사용자 서명을 수정한 뒤 호출하면 됩니다. 파라미터 `signType` 은 신청서 작성자의 전자서명일 경우 `esign`, 신청서 승인자의 결재서명일 경우 `approvalsign` 을 전달해 주세요. |

- ### doRemoveSign
| doRemoveSign | 유효성 체크를 위해 전자서명 또는 결재서명을 삭제 |
| ------------ | ----------------------- |
| -            | -                       |
| Request | `javascript:doRemoveSign(String: command, String: signType)` |
| Response | `command` 또는 `signType` 이 없는 경우 `validateSheetResponse` 인터페이스를 호출합니다. 서명 삭제가 완료되면 웹뷰 페이지를 새로고침합니다. |
| ETC | 테스트를 위한 것으로 상용 배포되지 않으며 삭제 범위는 "현재 접속한 사용자"의 전자서명, 결재서명에 한합니다. 파라미터 `signType` 은 전자서명일 경우 `esign`, 결재서명일 경우 `approvalsign` 을 전달해 주세요. |



---



### 2. Webview 내에서 APP 에 사전 정의가 필요한 인터페이스

- ### validateSheetResponse
| validateSheetResponse | 워크시트 에디터 내 유효성 검사 또는 신청서 저장 후 응답 메시지를 전달 |
| ------------ | ----------------------- |
| -            | -                       |
| parameters | String: `command`        // 인터페이스명 |
|            | String: `resultCode`     // 응답메시지코드 |
|            | String: `message`		// 응답메시지 |
| ETC        | 워크시트 기획서 v1.5 기준 50,51페이지. |

*WEB Request Example (AOS)*
```javascript
AOSHandler.validateSheetResponse('01', '입력하지 않은 항목이 있습니다.\n다시 확인 해주세요.')
```

*WEB Request Example (iOS)*
```javascript
const postMessage = {
command: 'validateSheetResponse',
resultCode: '99',
message: '서버 오류가 발생하였습니다.\n잠시 후 다시 시도해주세요.'
}
window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
```

- ### validateApplyResponse 
| validateApplyResponse | 신청서 관련 유효성 검사 후 응답 메시지를 전달 |
| ------------ | ----------------------- |
| -            | -                       |
| parameters | String: `command`        // 인터페이스명 |
|            | String: `resultCode`     // 응답메시지코드 |
|            | String: `message`		// 응답메시지 |
| ETC        |  |

*WEB Request Example (AOS)*
```javascript
AOSHandler.validateApplyResponse('02', '신청서를 결재하시려면 결재서명이 필요합니다.\n결재서명을 등록해주세요')
```

*WEB Request Example (iOS)*
```javascript
const postMessage = {
	command: 'validateApplyResponse',
	resultCode: '02',
	message: '신청서를 결재하시려면 결재서명이 필요합니다.\n결재서명을 등록해주세요'
}
window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
```

- ### focusSheetItem
| focusSheetItem | 시트 내 입력 가능한 텍스트 영역을 포커스 인/아웃 할 때 전달 |
| ------------ | ----------------------- |
| -            | -                       |
| parameters | String: `command`		// 인터페이스 명 |
|            | String: `type`		    // 아이템 타입 (현재는 textarea 만 사용합니다.) |
|            | String: `placeholder`	// 아이템 배경글 |
|            | String: `value`	        // 아이템 입력값 |
|            | String: `status`	        // 아이템 포커스 인/아웃 상태값 ('in' or 'out') |
|            | String: `prevId`	        // 포커싱 가능한 이전 아이템 고유 ID. 없다면 null 을 반환합니다. |
|            | String: `nextId`	        // 포커싱 가능한 다음 아이템 고유 ID. 없다면 null 을 반환합니다. |
| ETC        | 워크시트 기획서 v1.5 기준 53페이지.  |

*WEB Request Example (AOS)*

1. 입력값이 없는 경우
- 포커스 인
```javascript
AOSHandler.focusSheetItem('textarea', '569', '방문장소를 구체적으로 입력하세요.', '', 'in', '54877', null)
```
- 포커스 아웃
```javascript
AOSHandler.focusSheetItem('textarea', '569', '방문장소를 구체적으로 입력하세요.', '', 'out', null, '56995')
```

2. 입력값이 있는 경우
- 포커스 인
```javascript
AOSHandler.focusSheetItem('textarea', '569', '방문장소를 구체적으로 입력하세요.', '이전에 입력한 값', 'in', '54877', null)
```
- 포커스 아웃
```javascript
AOSHandler.focusSheetItem('textarea', '569', '방문장소를 구체적으로 입력하세요.', '이전에 입력한 값', 'out', null, '56995')
```

*WEB Request Example (iOS)*

1. 입력값이 없는 경우
- 포커스 인
```javascript
const postMessage = {
	command: 'focusSheetItem',
	type: 'textarea',
	itemId: '569',
	placeholder: '방문장소를 구체적으로 입력하세요.',
	value: '',
	status: 'in',
	prevId: '54877',
	nextId: null
}
window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
```
- 포커스 아웃
```javascript
const postMessage = {
	command: 'focusSheetItem',
	type: 'textarea',
	itemId: '569',
	placeholder: '방문장소를 구체적으로 입력하세요.',
	value: '',
	status: 'out',
	prevId: null,
	nextId: '56995'
}	
window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
```

2. 입력값이 있는 경우
- 포커스 인
```javascript
const postMessage = {
	command: 'focusSheetItem',
	type: 'textarea',
	itemId: '569',
	placeholder: '방문장소를 구체적으로 입력하세요.',
	value: '이전에 입력한 값',
	status: 'in',
	prevId: '54877',
	nextId: null
}
window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
```
- 포커스 아웃
```javascript
const postMessage = {
	command: 'focusSheetItem',
	type: 'textarea',
	itemId: '569',
	placeholder: '방문장소를 구체적으로 입력하세요.',
	value: '이전에 입력한 값',
	status: 'out',
	prevId: null,
	nextId: '56995'
}
window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
```


- ### changedValueSheetItem
| changedValueSheetItem | 웹뷰의 `textarea` 에 포커싱된 후 값이 변경될 때마다 `APP` 에 값을 전달 |
| ------------ | ----------------------- |
| -            | -                       |
| parameters | String: `command`		// 인터페이스 명 |
|            | String: `type`		    // 아이템 타입 (현재는 textarea 만 사용합니다.) |
|            | String: `itemId`		    // 아이템 고유 ID |
|            | String: `placeholder`	// 아이템 배경글 |
|            | String: `value`	        // 아이템 입력값 |
| ETC        | 워크시트 기획서 v1.5 기준 53페이지.  |

*WEB Request Example (AOS)*
1. 입력값이 없는 경우
```javascript
AOSHandler.changedValueSheetItem('textarea', '569', '방문장소를 구체적으로 입력하세요.', '')
```
2. 입력값이 있는 경우
```javascript
AOSHandler.changedValueSheetItem('textarea', '569', '방문장소를 구체적으로 입력하세요.', '이전에 입력한 값')
```

*WEB Request Example (iOS)*
1. 입력값이 없는 경우
```javascript
const postMessage = {
	command: 'changedValueSheetItem',
	type: 'textarea',
	itemId: '569',
	placeholder: '방문장소를 구체적으로 입력하세요.',
	value: ''
}
window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
```
2. 입력값이 있는 경우
```javascript
const postMessage = {
	command: 'changedValueSheetItem',
	type: 'textarea',
	itemId: '569',
	placeholder: '방문장소를 구체적으로 입력하세요.',
	value: '이전에 입력한 값'
}
window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
```

---

## 3. WebView 에서 정의한 응답메시지 코드

- ### validateSheetResponse
| resultCode | message | isError | isSuccess |
| ---------- | ------- | ------- | --------- |
| 00 | validate success | | O |
| 01 | 입력하지 않은 항목이 있습니다.\n다시 확인 해주세요. | O | 
| 02 | 신청서 제출을 위해 전자서명이 필요합니다.\n전자서명을 등록해주세요. | O |
| 03 | 잘못된 파라미터입니다. | O |
| 04 | 해당 워크시트를 찾을 수 없습니다. | O |
| 05 | 워크시트 로딩 중입니다.\n잠시 후 다시 시도해주세요. | O |
| 98 | fail update applyStatus | O |
| 99 | 서버 오류가 발생하였습니다.\n잠시 후 다시 시도해주세요. | O |
| 100 | worksheet create/update success | | O |
| 101 | 전자서명 갱신 완료 | | O |
| 102 | 결재서명 갱신 완료 | | O |

- ### validateApplyResponse
| resultCode | message | isError | isSuccess |
| ---------- | ------- | ------- | --------- |
| 00 | validate success | | O |
| 01 | 미정 | O |  |
| 02 | 신청서를 결재하시려면 결재서명이 필요합니다.\n결재서명을 등록해주세요 | O |
| 03 | 잘못된 파라미터입니다. | O |
| 04 | 해당 워크시트를 찾을 수 없습니다. | O |
| 05 | 워크시트 로딩 중입니다.\n잠시 후 다시 시도해주세요. | O |
| 99 | 서버 오류가 발생하였습니다.\n잠시 후 다시 시도해주세요. | O |
 
---

	
	