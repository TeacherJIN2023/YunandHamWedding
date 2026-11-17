/* ============================================================
 *  청첩장 내용은 이 파일만 고치면 됩니다.
 *  - 값이 비어 있으면("" 또는 []) 해당 항목은 화면에서 자동으로 네 숨겨져요.
 *  - 사진은 images 폴더에 같은 파일명으로 덮어쓰기 하면 됩니다.
 * ============================================================ */
window.INVITE = {
  groom: {
    name: "윤성진",
    shortName: "성진",
    father: "광현",           // 예: "윤OO"  (비워두면 혼주 소개 줄이 숨겨져요)
    mother: "선아",
    phone: "010-8589-5508",            // 본인 연락처 (선택)
    fatherPhone: "",
    motherPhone: "",
    accounts: [           // 마음 전하실 곳 (신랑측)
       { bank: "카카오뱅크", number: "3333-03-3630450", holder: "윤성진" }
    ]
  },
  bride: {
    name: "함지우",
    shortName: "지우",
    father: "원식",
    mother: "승희",
    phone: "010-8617-3342",
    fatherPhone: "",
    motherPhone: "",
    accounts: [
       { bank: "신한은행", number: "110-531-998746", holder: "함지우" }
    ]
  },

  // 예식 일시 (한국 시간)
  date: "2027-03-27T12:00:00+09:00",
  dateText: "2027년 3월 27일 토요일 낮 12시",

  venue: {
    name: "그래비티 조선 서울 판교 오토그래프 컬렉션",
    hall: "스페이스 볼룸 B1F",             // 예식 홀 이름·층 (확정되면 입력. 예: "스페이스 볼룸 3층")
    address: "경기 성남시 분당구 판교역로146번길 2",
    tel: "031-539-4800",
    // 지도 앱 검색어 (식장 이름으로 검색돼요)
    mapQuery: "그래비티 조선 서울 판교"
  },
  
 // 지도 (카카오맵)
  map: {
    key: "481eb9dc1e85280979ce2eac83b22694",
    lat: "",
    lng: "",
    level: 3
  },
  
  // 첫 화면 영문 문구
  coverScript: "We're getting married",

  greeting: {
    title: "저희 결혼합니다",
    lines: [
      "공들여 쌓아온 인연으로 만나",
      "항상 서로의 곁을 지켜주기로 약속했습니다.",
      "설렘과 기쁨, 웃음과 사랑으로 가득할",
      "그 시작을 함께해 주신다면",
      "더할 나위 없이 감사하겠습니다.",
      "",
    ]
  },

  // 사진 (images 폴더 안 파일명)
  photos: {
    cover: "images/cover.jpg",
    wide: "images/wide.jpg",
    gallery: [
      "images/gallery-01.jpg", "images/gallery-02.jpg", "images/gallery-03.jpg",
      "images/gallery-04.jpg", "images/gallery-05.jpg", "images/gallery-06.jpg",
      "images/gallery-07.jpg", "images/gallery-08.jpg", "images/gallery-09.jpg",
      "images/gallery-10.jpg", "images/gallery-11.jpg", "images/gallery-12.jpg"
    ],
    galleryVisible: 9        // '더 보기' 누르기 전에 보이는 장수
  },

  // 오시는 길 (식장 확인 후 수정하세요)
  directions: {
    subway: [
      "신분당선 판교역 3번 출구에서 도보 약 3분"
    ],
    bus: [],
    car: [
      "내비게이션: \"그래비티 조선 서울 판교\" 검색",
      "주소: 경기 성남시 분당구 판교역로146번길 2"
    ],
    parking: [
      "웨딩홀 이용하객 건물 무료주차 4시간 가능",
      "만차시 인근 판교역 공영주차장 이용 가능"
    ],
    notice: ""
  },

  // 참석 여부 전달 — 구글 폼 링크를 넣으면 버튼이 나타나요
  rsvpUrl: "",

  // 게스트스냅 업로드(구글 드라이브 업로드 폼 등) — 넣으면 섹션이 나타나요
  guestSnapUrl: "",

  // 배경음악: audio 폴더에 파일을 넣고 경로를 적으면 음악 버튼이 나타나요
  //  ※ 상업 음원은 저작권 때문에 공개 저장소에 올리지 않는 걸 권장해요. README 참고.
  music: { src: "" },

  closing: {
    title: "마음 전하실 곳",
    lines: [
      "멀리서도 함께 축하해 주시는",
      "그 마음에 깊이 감사드립니다.",
      "보내주신 마음 소중히 간직하며",
      "예쁘게 잘 살겠습니다."
    ],
    wreathNotice: 
      "화환은 정중히 사양합니다. 보내주시려는 마음만 감사히 받겠습니다." // 예: "화환은 정중히 사양합니다." 비워두면 숨김
    
  }
};
