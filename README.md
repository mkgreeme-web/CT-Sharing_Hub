# 코칭툴 나눔터 — tools.json 자동 카드 버전

단일 HTML 코칭 도구를 카드형 갤러리에서 바로 실행하고 다운로드하는 GitHub Pages용 웹앱입니다. 카드와 분류 버튼은 `tools.json`을 읽어 자동 생성됩니다.

## 실행 방법

- `index.html`을 더블클릭하면 기본 제공된 6개 도구가 즉시 표시됩니다.
- GitHub Pages 또는 로컬 웹서버에서는 `tools.json`을 읽어 최신 도구 목록을 자동 생성합니다.
- 신규 도구를 `tools.json`에 추가한 결과를 PC에서 미리 확인하려면 아래 로컬 서버 방식을 사용합니다. 브라우저 보안 정책상 `file://` 화면은 외부 JSON 파일을 직접 읽을 수 없습니다.

### Windows에서 최신 tools.json 미리보기

프로젝트 폴더의 주소 표시줄에 `cmd`를 입력하고 다음 명령을 실행합니다.

```text
py -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 엽니다. 종료할 때는 명령창에서 `Ctrl+C`를 누릅니다.

## 신규 도구 등록 — 3단계

예시: `강점진단` 도구를 추가하는 경우

1. HTML 파일을 `tools/strength-check.html`로 올립니다.
2. 대표 이미지를 `assets/images/strength-check.png`로 올립니다.
3. `tools.json`의 `tools` 배열 마지막에 다음 정보를 추가하고 커밋합니다.

```json
{
  "id": "strength-check",
  "order": 7,
  "title": "강점진단",
  "description": "나의 핵심 강점과 활용 방향을 발견합니다.",
  "category": "self",
  "badge": "강점",
  "badgeColor": "blue",
  "html": "tools/strength-check.html",
  "image": "assets/images/strength-check.png",
  "downloadName": "강점진단.html",
  "tags": ["강점", "자기이해", "성장"],
  "enabled": true
}
```

쉼표 규칙에 주의합니다. 기존 마지막 도구 객체 뒤에 쉼표를 붙인 후 새 객체를 추가해야 합니다.

## 필드 설명

| 필드 | 의미 | 규칙 |
|---|---|---|
| `id` | 도구 고유 ID | 영문 소문자와 하이픈, 중복 금지 |
| `order` | 카드 표시 순서 | 작은 숫자가 먼저 표시 |
| `title` | 화면 표시명 | 한글 가능 |
| `description` | 카드 설명 | 한두 문장 권장 |
| `category` | 분류 ID | `categories`에 등록된 ID 사용 |
| `badge` | 카드 작은 표식 | 짧은 단어 권장 |
| `badgeColor` | 표식 색상 | `purple`, `blue`, `green`, `orange`, `red`, `yellow` |
| `html` | 실행 HTML 경로 | `tools/파일명.html` |
| `image` | 썸네일 경로 | `assets/images/파일명.png` |
| `downloadName` | 다운로드 파일명 | 한글 가능, `.html` 포함 |
| `tags` | 카드 키워드 | 문자열 배열 |
| `enabled` | 공개 여부 | `true` 공개, `false` 숨김 |

## 신규 분류 추가

`tools.json`의 `categories` 배열에 분류를 한 건 추가합니다. 해당 분류를 사용하는 공개 도구가 하나 이상 있을 때 필터 버튼도 자동으로 나타납니다.

```json
{ "id": "relationship", "name": "관계 코칭" }
```

## 실행과 점검

`tools.json`은 브라우저 보안 때문에 `index.html`을 더블클릭하는 방식으로는 불러오지 못할 수 있습니다. GitHub Pages에서 확인하거나 폴더에서 로컬 서버를 실행합니다.

```bash
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`에 접속합니다.

## GitHub Pages 배포

1. 이 폴더의 모든 파일을 GitHub 저장소 최상단에 업로드합니다.
2. 저장소 `Settings → Pages`로 이동합니다.
3. `Deploy from a branch`, `main`, `/(root)`를 선택합니다.
4. 커밋 후 잠시 기다린 뒤 공개 주소에서 확인합니다.

## 안전한 운영 규칙

- HTML과 이미지 기본 파일명은 동일하게 맞춥니다.
- 저장소 파일명은 영문 소문자와 하이픈을 사용합니다.
- 외부 주소나 `../`가 포함된 경로는 등록하지 않습니다.
- 업로드 전 신규 HTML을 직접 열어 동작과 출처를 확인합니다.
- GitHub 토큰이나 비밀번호를 HTML·JavaScript에 넣지 않습니다.

일부 도구의 외부 라이브러리 기능은 인터넷 연결이 필요할 수 있습니다.
