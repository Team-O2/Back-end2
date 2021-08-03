<br></br>
# Code Convention
### 명명법
---
1. **low camel case**를 사용한다.
2. 함수명 → 동사+명사 순서로 작성한다.
3. 변수명 → 명사들의 결합으로 작성한다.

### **주석 규칙**
---
1. 한줄은 //로 적고, 그 이상은 /** */로 적는다.

```jsx
// 한줄 주석일 때
/**
 * 여러줄
 * 주석일 때
 */
```

 2. **함수에 대한 주석**

1) backend에서 공통적으로 사용하는 함수의 경우, 모듈화를 통해 하나의 파일로 관리한다.

2) 하나의 파일의 시작 부분에 주석으로 상세 내용을 작성한다.

  - **함수의 전체 기능**에 대한 설명
  - **함수의 파라미터**에 대한 설명 (type: ..., 역할)
  - router 또는 api일 때에는 성공 여부도 적어준다.
  - 예시 코드

  ```jsx
  /**
   * @api {get} /study/:roomNumber/questions?sort_by=created&order_by=asc 방의 질문 목록을 가져옴
   * @apiName GetQuestions
   * @apiGroup Question
   *
   * @apiParam {String} roomNumber 유일한 방 번호
   *
   * @apiSuccess {Boolean} success API 호출 성공 여부
   * @apiSuccess {String} message 응답 메시지
   * @apiSuccess {Object} data 해당 방의 질문 리스트
   */
  router.get(
    "/study/:roomNumber/questions",
    [checkParamAndQuery("roomNumber").isNumeric()],
    getQuestions.default
  );
  ```

  나중에 배울 **apidoc**에 쓰일 형식이다!

### **비동기 함수의 사용**
---
Promise함수의 사용은 지양하고 **async, await**를 사용하도록 한다.

다만 로직을 짜는 데 있어 promise를 불가피하게 사용할 경우, 주석으로 표시하고 commit에 그 이유를 작성한다.

### **데이터 베이스 명명 규칙**
---
1. **DB 이름 (스키마)**
    - 데이터베이스 명은 영어 대문자로 구성한다.
    - 길이는 8자 이내로 구성한다.
2. **컬렉션**
    - 소문자사용
    - 's' 를 사용(ex, users profiles)
    - 컬렉션 명의 구성은 최대 3단어까지 사용할 수 있다.
    - 최대 길이는 26자 이내로 구성한다.
3. **컬럼**
    - 컬럼은 snake 표기법을 따르고, 의미있는 컬럼명_접미사 형태로 작성한다.
    - 컬럼의 성질을 나타내는 접미사를 사용한다. (사용하는 데이터의 타입을 나타내는 것이 아님에 유의)

### **접미사 list**
---
- **CNT :** count 조회수 등의 count에 사용된다.
- **DT :** date 날짜인 경우를 나타낸다.
- **FK :** foreign key를 나타내는데 사용한다.
- **FL :** flag 0, 1로 구성된 상태를 나타낸다.
- **ID :** id 계정 등의 아이디를 나타낸다.
- **NM :** name 이름, 별명 등 식별 가능하며 중복이 가능한 문자열 나타내는 데 사용한다.
- **NO :** number 나이, 휴대폰 번호 등 숫자를 나타낸다.
- **ORD :** order 정렬에 사용되는 index를 나타낸다.
- **PK :** primary key를 나타내는데 사용한다.
- **ST :** status 회원의 등급, 성별 등의 상태를 나타낸다.

