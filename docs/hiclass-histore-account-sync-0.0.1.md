# 하이클래스 -> 하이스토어 계정 연계 명세서
2022년 4월 4일 하이클래스 -> 하이스토어 로그인 연동 방안 회의에서 논의된 내용을 정리하였습니다.

## 문서 이력
MD (markdown), PDF
- 0.0.1 - 20220404 created

MD 문서는 아래의 markdown viewer 확장기능을 chrome 브라우저에 설치하면 볼 수 있습니다.<br>
[Markdown Viewer - Chrome web extension store](https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk)

### 작성자
- 하이클래스팀 개발 담당자: [**최경준** 팀원](mailto:gaianos@i-screammedia.com)

## 요청 방식
하이스토어 상품 URL 에 `id_token_payload`, `refresh_token_payload` URL 파라미터를 추가하여 `GET` 방식으로 요청합니다.
파라미터 받는 부분은 공통 처리되어 있으므로 특정 URL 에 제한 받지 않음을 확인하였습니다.<br>
하이클래스에서는 다음과 같은 URL 을 하이스토어에 요청하게 됩니다.

## 요청 예시
- 하이스토어 메인 링크<br>
> `[GET] {하이스토어 도메인}?{기존 파라미터}&id_token={id_token_payload}&refresh_token={refresh_token_payload}`

- 하이스토어 로그인 링크<br>
> `[GET] {하이스토어 도메인}/member/login?{기존 파라미터}&id_token={id_token_payload}&refresh_token={refresh_token_payload}`

- 하이스토어 상품 링크<br>
> `[GET] {하이스토어 도메인}/goods/view?no=890695&{기존 파라미터}&id_token={id_token_payload}&refresh_token={refresh_token_payload}`

- 하이스토어 기획전 링크<br>
> `[GET] {하이스토어 도메인}/page/event_view?event_seq=1309&{기존 파라미터}&id_token={id_token_payload}&refresh_token={refresh_token_payload}`

## 관련 도메인
1. 하이클래스

- DEV
> `https://devui.hiclass.net`

- STAGE
> `https://stage.hiclass.net`

- PRODUCTION
> `https://www.hiclass.net`

2. 하이스토어

- DEV
> `https://dev.hi-store.co.kr`

- STAGE
> `https://stage.hi-store.co.kr`

- PRODUCTION
> `https://hi-store.co.kr`

## payload 예시
1. id_token: [jwt.io](https://jwt.io) -> 사용자 UUID 를 확인할 수 있습니다.
> `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJjbGllbnRSZWdpc3RyYXRpb25JZCI6ImlTY3JlYW0iLCJwaG90byI6Im51bGwiLCJwcmluY2lwYWxOYW1lIjoiaGljbGFzczM5IiwidG9rZW5fdHlwZSI6ImJlYXJlciIsInV1aWQiOiI4ZWExZmM3NS1lYzE5LTRhYjQtODBlMy05NGNhNjMzNWYyNTMiLCJpc2NyZWFtTWVtYmVySW5mbyI6eyJyZXN1bHQiOiJzdWNjZXNzIiwibWVtYmVySW5mb0xpc3QiOlt7Imdwa2lZbiI6IlkiLCJtZW1iZXJTY2hvb2wiOiIiLCJtZW1iZXJHcmFkZSI6IiIsIm1lbWJlclNjaG9vbE5vIjoiMCIsIm1lbWJlclNjaG9vbEFyZWEiOiIiLCJtZW1iZXJDbGFzcyI6IiJ9XSwicmVzdWx0Q29kZSI6IjEiLCJyZXN1bHRNZXNzYWdlIjoi7ZqM7JuQ7KCV67O0IOyhsO2ajCDsmYTro4wiLCJtZW1iZXJJbmZvTGlzdENudCI6MX0sIm1lbWJlckdyYWRlQ2hlY2siOnsicmVzdWx0Ijoic3VjY2VzcyIsImdyYWRlIjoxLCJyZXN1bHRDb2RlIjoiMSIsInJlc3VsdE1lc3NhZ2UiOiLqtoztlZwg7KGw7ZqMIOyZhOujjCJ9LCJzY29wZSI6Im1lc3NhZ2U6cmVhZCIsImFjY2Vzc1Rva2VuQXQiOnsiaXNzdWVkQXQiOiIyMi4gNC4gMSDsmKTtm4QgNToyNiIsImV4cGlyZXNBdCI6IjQxLiA0LiA2IOyYpOyghCA0OjA2In0sIm5hbWUiOiLthYzsiqTtirgiLCJpZCI6ImhpY2xhc3MzOSIsImV4cCI6MTY0OTIwNTMwNiwiZXhwaXJlc19pbiI6NTk5OTk5OTk5LCJpYXQiOjE2NDkwMzI1MDYsImp0aSI6IjNjYTFkYWU5LWFiZWYtNGYzNS1iZTEwLTk1YWQ2OTgxYTY1NCIsImlkVG9rZW5BdCI6eyJpc3N1ZWRBdCI6IjIyLiA0LiA0IOyYpOyghCA5OjM1IiwiZXhwaXJlc0F0IjoiMjIuIDQuIDYg7Jik7KCEIDk6MzUifSwiZW1haWwiOiIifQ.sxZzMNp0HxZglWyw-QCoolUTIhqNfVSbITL_cBD5zvUb7IhA1lFlxGi8Ge1jmL_y7TuIET7KznTjtu4HILLB4hTWlY1Ictpma0DyLaPugvr7DBWQ0MeFaZxhHdPo4yCdQXOMXxogVKiXzSW0YNrHy9SWPINvdZNj4lCCi1GDxyO0rGL-WwhueRt4s2n95GupvJKuY6Sdsp-L2Z7QYXqOF0-0Wtiy1uP21ys5sPXZsLIDGqlz2ku-BUjCkr481M9Xtj_gVadpb52G7Jcjgsk2RdLmczbrfSYoDZDpLqLPFwFH6DJxbI27DJaI_WLA3F0wqpvZfFhAlNXuih_ocpqI2A` 

2. refresh_token:
> `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJjbGllbnRSZWdpc3RyYXRpb25JZCI6ImlTY3JlYW0iLCJwcmluY2lwYWxOYW1lIjoiaGljbGFzczM5IiwiZXhwIjoxNjQ5NjM3MzA2LCJ1dWlkIjoiOGVhMWZjNzUtZWMxOS00YWI0LTgwZTMtOTRjYTYzMzVmMjUzIiwiaWF0IjoxNjQ5MDMyNTA2fQ.dPmO2b6hU0mqhjet8Rs0oRPXoZvZw6xg_FB2fUMls4XUGBmiyTqoB4YcZqFXRw3SmInZk4u2wMSJR6Q0-1-yJVuLfcD1kTSZBVn26HHncEan9JdJETn7C6__07v6Iv6Frj2Api5Bcwagx_YIo8KNLoaJV_EQI6aCrMMsPfHEdr8PURCRX4yYNZYU5uWWDCuTMqTL6twNfTHVyAABWOJBA9hzYAvSqu0e6p0uofhv16u6Ol0_-zlfZN2Bp3xBQwLsBPteOANJHsgkzNtICdGqnBojNaUCuY3S_lBjyJzKAYzpPkeMEkrPe1gPaAWQE_ALIiYJsn9ujqcJpcLh-dX2PA`


## 테스트 케이스
하이클래스에 로그인 된 계정과 하이스토어에 로그인 된 계정이 상이할 수 있으므로 다음과 같은 케이스를 고려해 주시길 바랍니다.<br>

1. 하이클래스 A 계정 - 하이스토어 로그인 되어 있지 않은 경우<br>
> A 계정으로 로그인 처리 후 요청한 상품 페이지 호출
 
2. 하이스토어 A 계정 - 하이스토어 A 계정으로 로그인 되어 있는 경우<br>
> 로그인 요청 무시 및 URL 파라미터 삭제 후 요청한 상품 페이지 호출

3. 하이스토어 A 계정 - 하이스토어 B 계정으로 로그인 되어 있는 경우<br>
> B 계정 로그아웃 및 A 계정으로 로그인 처리 후 요청한 상품 페이지 호출