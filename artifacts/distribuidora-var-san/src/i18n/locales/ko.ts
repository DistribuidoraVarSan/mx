import type { Dictionary } from '../types';

const ko: Dictionary = {
  "nav": {
    "inicio": "홈",
    "esencia": "핵심 가치",
    "familia": "기업 소개",
    "soluciones": "제품 솔루션",
    "eleccion": "선택 이유",
    "impulsamos": "서비스 산업",
    "marcas": "취급 브랜드",
    "atencion": "이용 안내",
    "contacto": "고객 문의",
    "solicitarCotizacion": "견적 요청",
    "portalClientes": "고객 포털",
    "iniciarSesion": "로그인",
    "crearCuenta": "회원가입",
    "miCuenta": "내 계정",
    "abrirMenu": "메뉴 열기",
    "cerrarMenu": "메뉴 닫기",
    "navegacionPrincipal": "주요 탐색"
  },
  "languageSelector": {
    "label": "언어 선택"
  },
  "common": {
    "close": "닫기",
    "closeProfileAria": "프로필 닫기",
    "previous": "이전",
    "next": "다음",
    "loading": "로딩 중...",
    "backToHome": "홈으로 돌아가기"
  },
  "cookies": {
    "ariaLabel": "쿠키 설정",
    "text": "고객님, 저희 웹사이트는 탐색 환경을 최적화하기 위해 쿠키 및 관련 기술을 사용합니다. 웹사이트를 계속 이용하시면 쿠키 사용에 동의하시는 것으로 간주됩니다. 자세한 내용은 {privacidad} 및 {cookies}에서 확인하실 수 있습니다.",
    "privacyLink": "개인정보 처리방침",
    "cookiesLink": "쿠키 정책",
    "accept": "수락",
    "reject": "거부"
  },
  "account": {
    "portalTitle": "고객 포털",
    "loginTitle": "로그인",
    "registerTitle": "회원가입",
    "loginIntro": "Distribuidora Var San 계정으로 로그인하세요.",
    "registerIntro": "Var San 고객 포털 이용을 위해 회원으로 가입하세요.",
    "tabLogin": "로그인",
    "tabRegister": "회원가입",
    "fieldName": "이름",
    "fieldNamePlaceholder": "성함을 입력하세요",
    "fieldCompany": "회사명",
    "fieldCompanyPlaceholder": "기업 또는 상호명",
    "fieldEmail": "이메일 주소",
    "fieldEmailPlaceholder": "email@company.com",
    "fieldPassword": "비밀번호",
    "fieldPasswordPlaceholderLogin": "비밀번호 입력",
    "fieldPasswordPlaceholderRegister": "최소 6자 이상",
    "fieldConfirmPassword": "비밀번호 확인",
    "fieldConfirmPasswordPlaceholder": "비밀번호 재입력",
    "submitLogin": "로그인",
    "submitRegister": "계정 생성",
    "continueWithGoogle": "Google 계정으로 계속하기",
    "secureAccessNote": "Firebase Authentication 및 Firestore 기반의 안전한 고객 전용 보안 접속.",
    "passwordMismatch": "비밀번호가 일치하지 않습니다.",
    "accountCreated": "계정이 성공적으로 생성되었습니다.",
    "loginSuccess": "로그인되었습니다.",
    "errorEmailInUse": "이미 등록된 이메일 주소입니다.",
    "errorWeakPassword": "비밀번호는 최소 6자 이상이어야 합니다.",
    "errorInvalidEmail": "유효한 이메일 형식이 아닙니다.",
    "errorInvalidCredential": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "errorTooManyRequests": "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    "errorGeneric": "Firebase: {code} — {message}",
    "errorGoogleSignIn": "Google 로그인에 실패했습니다.",
    "errorSaveProfile": "프로필 저장에 실패했습니다."
  },
  "portal": {
    "eyebrow": "고객 포털",
    "welcome": "{name}님 환영합니다.",
    "intro": "세션이 Firebase에 안전하게 연결되었으며 고객 정보는 Firestore에서 실시간 로드됩니다.",
    "fieldNameLabel": "이름",
    "fieldEmailLabel": "이메일",
    "fieldCompanyLabel": "회사명",
    "defaultClientName": "Var San 고객",
    "notSpecified": "미지정",
    "notAvailable": "정보 없음",
    "myProfile": "내 프로필",
    "logOut": "로그아웃",
    "closePortal": "포털 닫기",
    "profileHeading": "고객 정보 상세",
    "profileIntro": "변경사항은 Firestore 프로필에 실시간 저장됩니다.",
    "saveChanges": "변경사항 저장",
    "sessionsTitle": "접속 기기 및 활성 세션 관리",
    "sessionsSubtitle": "계정에 로그인된 기기 및 세션을 확인하고 관리하세요.",
    "currentDeviceBadge": "현재 기기 (현재 세션)",
    "lastActiveLabel": "최근 활동",
    "locationLabel": "위치 / IP",
    "revokeSession": "로그아웃",
    "revokeAllOthers": "다른 모든 기기에서 로그아웃",
    "confirmRevokeAll": "다른 모든 기기의 접속 세션을 종료하시겠습니까?",
    "noActiveSessions": "등록된 다른 활성 세션이 없습니다.",
    "sessionRevokedSuccess": "원격 세션이 성공적으로 종료되었습니다.",
    "sessionsRevokedAllSuccess": "다른 모든 활성 세션이 종료되었습니다.",
    "loadingSessions": "활성 세션 목록을 불러오는 중...",
    "refreshSessions": "세션 목록 새로고침"
  },
  "hero": {
    "eyebrow": "선도 브랜드 · 품질 보증",
    "titleLead": "귀사를 위한 최적의 ",
    "titleHighlight": "위생 청결 및 산업 안전 보호",
    "titleTail": " 솔루션.",
    "textBefore": "기업, 공장, 상업 시설 및 공공기관을 위한 ",
    "textAfter": " 이상의 엄선된 전문 공급품을 제공합니다.",
    "productsHighlight": "1,000여 개 제품",
    "extra": "Distribuidora Var San은 우수한 공급업체가 단순히 제품만 납품하는 것에 그치지 않고, 기업의 지속 성장을 뒷받침하는 신뢰와 품질의 파트너가 되어야 한다고 믿습니다.",
    "exploreSolutions": "제품 솔루션 보기",
    "requestQuote": "견적 요청하기",
    "imageAlt": "전문 위생 청결 및 산업 안전 공급품",
    "captionEyebrow": "귀사의 든든한 파트너",
    "captionText": "위생, 청결 및 개인 안전 보호의 전문 기업.",
    "statTitle": "1,000+ 공급 품목",
    "statSubtitle": "필요한 모든 것을 한 곳에서."
  },
  "essence": {
    "eyebrow": "핵심 가치",
    "title": "우리가 추구하는 확고한 신념.",
    "lede": "단순한 유통을 넘어, 품질과 신뢰를 바탕으로 고객과 오래 지속되는 파트너십을 구축합니다.",
    "values": {
      "quality": {
        "title": "품질 우선",
        "description": "엄격한 기준에 부합하는 신뢰성 높고 우수한 성능의 제품만을 엄선합니다."
      },
      "closeness": {
        "title": "밀착 소통",
        "description": "고객의 목소리에 귀 기울이며 견적부터 납품까지 맞춤형 전담 상담을 제공합니다."
      },
      "commitment": {
        "title": "책임 경영",
        "description": "정확한 납기와 성실한 서비스로 귀사의 비즈니스 연속성을 책임집니다."
      },
      "trust": {
        "title": "상호 신뢰",
        "description": "정직과 투명성을 바탕으로 흔들림 없는 장기적 신뢰 관계를 쌓아갑니다."
      }
    }
  },
  "family": {
    "eyebrow": "Var San 파트너십",
    "title": "고객사의 성장이 곧 우리의 성장입니다.",
    "subtitle": "Var San 서비스 경험",
    "label": "Var San 서비스 경험",
    "ariaLabel": "{slide} 경험 보기",
    "slides": [
      [
        "신뢰",
        "소규모 사업장부터 대규모 산업체까지 성장을 함께하는 든든한 공급 파트너입니다."
      ],
      [
        "책임",
        "첫 견적 문의부터 제품의 안전한 인도까지 전 과정을 완벽히 지원합니다."
      ],
      [
        "관계",
        "일회성 거래가 아닌, 고객 한 분 한 분과 지속 가능한 동반자 관계를 지향합니다."
      ],
      [
        "성장",
        "고객사의 비즈니스가 번창할 때 우리의 전문성 또한 빛을 발합니다."
      ],
      [
        "환영",
        "귀사의 든든한 비즈니스 파트너로 Distribuidora Var San을 선택해 주셔서 감사합니다."
      ]
    ]
  },
  "solutions": {
    "eyebrow": "제품 및 솔루션",
    "title": "귀사에 꼭 맞는 맞춤형 자재 솔루션",
    "lede": "“전체 카탈로그 보기” 버튼을 누르면 해당 제품 라인의 PDF 카탈로그가 열립니다. 각 제품군별 독립 카탈로그를 제공합니다.",
    "catalogPart1": "상세 안내는 ",
    "catalogStrongPart": "“전체 카탈로그 보기”",
    "catalogPart2": " 버튼을 누르면 해당 라인의 상세 PDF 카탈로그를 확인하실 수 있습니다. 각 라인별(",
    "catalogPart3": ") 독립 카탈로그가 구비되어 있습니다.",
    "tabListLabel": "제품 라인",
    "categoriesLabel": "카테고리",
    "categoriesScreenReader": "제품 카테고리 목록",
    "previousCategory": "이전 카테고리",
    "nextCategory": "다음 카테고리",
    "fullCatalog": "전체 카탈로그 보기",
    "lineIndustrial": "산업 안전 보호구",
    "lineMedical": "의료 및 위생 소모품",
    "andConjunction": " 및 ",
    "industrialProducts": [
      {
        "category": "산업 안전 보호구",
        "title": "안전 장갑",
        "tabTitle": "안전 장갑",
        "description": "다양한 위험 등급, 화학물질 취급, 절단 방지 및 기계 작업용 손 보호 솔루션.",
        "features": [
          "절단 방지",
          "코팅 장갑",
          "일회용",
          "내화학성",
          "섬유",
          "가죽"
        ]
      },
      {
        "category": "호흡기 보호",
        "title": "호흡 보호구",
        "tabTitle": "호흡 보호",
        "description": "분진, 유해가스, 유기용제 증기 및 분무 오염물질로부터 호흡기를 안전하게 보호하는 마스크 및 정화통.",
        "features": [
          "방진 마스크",
          "방독 마스크",
          "필터 및 정화통",
          "배기 밸브",
          "부속품",
          "자가구조기"
        ]
      },
      {
        "category": "안면 및 눈 보호",
        "title": "보안경 및 안면보호구",
        "tabTitle": "눈 보호",
        "description": "작업 중 발생하는 비산물, 충격 및 화학물질 튐으로부터 눈과 얼굴을 보호하는 장비.",
        "features": [
          "보안경",
          "밀착형 고글",
          "용접면",
          "보호 렌즈",
          "헤드기어"
        ]
      },
      {
        "category": "청력 보호",
        "title": "청력 보호구",
        "tabTitle": "청력 보호",
        "description": "소음 노출을 줄이고 작업장 내 청력을 확실하게 보호하는 방음 귀마개 및 귀덮개.",
        "features": [
          "방음 귀덮개",
          "안전모 장착용 귀덮개",
          "일회용 귀마개",
          "다회용 귀마개"
        ]
      },
      {
        "category": "머리 보호",
        "title": "안전모",
        "tabTitle": "안전모",
        "description": "건설 현장, 제조 공장, 정비 작업 및 고소 작업 전용 고강도 안전모.",
        "features": [
          "산업용 안전모",
          "통풍형 헬멧",
          "고소작업 헬멧",
          "충격흡수 내장재",
          "턱끈"
        ]
      },
      {
        "category": "고소 작업 안전",
        "title": "추락 방지 장비",
        "tabTitle": "추락 방지",
        "description": "추락을 예방하고 작업자의 위치를 안전하게 확보하는 전신 안전대 및 랜야드 시스템.",
        "features": [
          "전신 안전대",
          "생명줄",
          "자동 죔줄",
          "랜야드",
          "앵커 포인트",
          "충격 흡수대"
        ]
      },
      {
        "category": "작업복 및 보호의",
        "title": "산업용 작업복",
        "tabTitle": "작업복",
        "description": "다양한 산업 현장 및 제조 공정을 위한 전문 작업복, 보호의 및 안전화.",
        "features": [
          "산업용 작업복",
          "일회용 방호복",
          "방수복",
          "안전화",
          "작업 커버올",
          "인체공학적 디자인"
        ]
      },
      {
        "category": "교통 및 현장 안전 표지",
        "title": "도로 및 현장 안전 시설",
        "tabTitle": "교통 표지",
        "description": "작업 구역 구획 및 시인성 향상을 위한 반사 조끼 및 안전 표지 시설물.",
        "features": [
          "고휘도 반사조끼",
          "안전 테이프",
          "차단 체인",
          "안전 기둥",
          "드럼 안전통",
          "라바콘",
          "안내 표지판"
        ]
      },
      {
        "category": "에너지 차단 제어",
        "title": "잠금장치 및 태그 (LOTO)",
        "tabTitle": "LOTO 잠금",
        "description": "정비 및 보수 작업 중 위험 에너지원을 완벽히 차단하는 안전 잠금 및 경고 태그 장비.",
        "features": [
          "안전 자물쇠",
          "잠금 걸쇠",
          "잠금 박스",
          "전기 차단 잠금구",
          "밸브 잠금구",
          "경고 태그"
        ]
      }
    ],
    "medicalProducts": [
      {
        "category": "의료 소모품 · 감염성 폐기물 관리",
        "title": "손상성 폐기물 전용 용기",
        "tabTitle": "손상성 용기",
        "description": "주삿바늘, 메스 등 날카로운 손상성 폐기물 및 액상 감염성 폐기물의 안전한 수거 용기.",
        "features": [
          "손상성 전용통",
          "액상 폐기물",
          "고정 브래킷",
          "와이어 바스켓",
          "페달식 수거함"
        ]
      },
      {
        "category": "의료 소모품 · 의료용 폐기물 봉투",
        "title": "의료 폐기물 전용 봉투",
        "tabTitle": "의료 봉투",
        "description": "의료 폐기물의 규격별 분리수거 및 식별을 위한 고강도 전용 비닐 봉투.",
        "features": [
          "적색 봉투",
          "황색 봉투",
          "다양한 규격",
          "고인장 두께",
          "국제 바이오하자드 표기"
        ]
      },
      {
        "category": "의료 소모품 · 임시 보관 및 운반",
        "title": "임시 보관 시설",
        "tabTitle": "임시 보관",
        "description": "병원 및 의료 시설 내 자재와 폐기물의 안전한 임시 보관 및 원내 운반 솔루션.",
        "features": [
          "체계적 정리",
          "밀폐 안전성",
          "간편 이동",
          "내구성 강화",
          "안전 표식"
        ]
      },
      {
        "category": "의료 소모품 · 병원 전용 수거함",
        "title": "병원용 페달 수거함",
        "tabTitle": "의료 수거함",
        "description": "의료 기관의 위생적인 폐기물 관리를 위한 페달 개폐식 전용 수거함 및 용기.",
        "features": [
          "수거 용기",
          "밀폐형 뚜껑",
          "풋 페달",
          "분리 수거",
          "교차 감염 방지"
        ]
      }
    ]
  },
  "whyChoose": {
    "eyebrow": "선택 이유",
    "title": "왜 Distribuidora Var San을 선택해야 할까요?",
    "lede": "단순한 공급업체를 넘어, 귀사의 비즈니스 성장을 가속하는 신뢰의 파트너입니다.",
    "ariaLabel": "선택해야 하는 이유",
    "reasonLabel": "{number}번 이유 보기",
    "previousReason": "이전 이유",
    "nextReason": "다음 이유",
    "reasons": [
      [
        "풍부한 재고 보유",
        "수천 종의 품목을 항시 보유하여 다양한 산업군의 긴급 수요에 신속히 대응합니다."
      ],
      [
        "공인된 유명 브랜드",
        "글로벌 제조사와 협력하여 높은 성능과 안전 규격을 만족하는 검증된 제품만 공급합니다."
      ],
      [
        "맞춤형 전담 컨설팅",
        "고객사의 작업 환경을 면밀히 분석하여 최적의 제품 사양과 합리적인 솔루션을 제안합니다."
      ],
      [
        "정확한 책임 배송",
        "체계적인 물류 관리를 통해 약속된 기일 내에 정확하고 안전하게 제품을 납품합니다."
      ],
      [
        "원스톱 통합 공급",
        "산업 안전 보호구부터 전문 의료 소모품까지 비즈니스에 필요한 모든 자재를 일괄 공급합니다."
      ],
      [
        "지속 가능한 동반자",
        "정직과 성실을 바탕으로 고객사와 오랜 기간 함께 성장하는 굳건한 파트너십을 지향합니다."
      ]
    ]
  },
  "sectors": {
    "eyebrow": "서비스 산업군",
    "title": "다양한 산업 현장에 맞춘",
    "titleEmphasis": "전문 자재 솔루션.",
    "names": [
      "일반 기업 및 법인",
      "오피스 및 빌딩",
      "상업 및 유통 시설",
      "제조업 및 공장",
      "학교 및 교육기관",
      "병원 및 전문 클리닉",
      "외식 및 식품 가공업",
      "호텔 및 숙박시설",
      "공공기관 및 단체",
      "종합 사업체"
    ]
  },
  "brands": {
    "eyebrow": "취급 브랜드",
    "title": "공식 파트너 브랜드",
    "lede": "품질과 안전성을 국제적으로 인정받은 정품 브랜드 제품만을 공급합니다.",
    "distributed": "공식 유통 브랜드"
  },
  "process": {
    "eyebrow": "이용 안내",
    "title": "쉽고 간편한 주문 및 납품 절차",
    "titleEmphasis": "간편한",
    "steps": [
      [
        "1",
        "견적 문의 접수",
        "WhatsApp, 전화 또는 이메일로 필요한 품목과 수량을 문의해 주세요."
      ],
      [
        "2",
        "맞춤 견적서 발송",
        "요청 사항을 확인하여 가장 합리적이고 경쟁력 있는 맞춤 견적서를 신속히 제공합니다."
      ],
      [
        "3",
        "주문 확정 및 배송",
        "견적 승인 후 일정에 맞춰 신속하고 안전하게 배송 또는 방문 수령을 진행합니다."
      ]
    ]
  },
  "contact": {
    "eyebrow": "고객 문의",
    "title": "제품 상담 및 ",
    "titleEmphasis": "견적 요청",
    "lede": "문의 내용을 남겨주시면 전담 담당자가 확인 후 신속히 안내해 드리겠습니다.",
    "email": "이메일 주소",
    "phone": "전화 및 WhatsApp",
    "attention": "상담 대상",
    "attentionInfo": "기업, 공장, 상업 시설 및 공공기관",
    "upcoming": "서비스 준비 중.",
    "submitting": "전송 중...",
    "submitSuccess": "문의가 성공적으로 접수되었습니다! 빠른 시일 내에 연락드리겠습니다.",
    "form": {
      "nameLabel": "이름",
      "emailLabel": "이메일 주소",
      "companyLabel": "회사명",
      "messageLabel": "문의 내용",
      "submitButton": "문의 제출하기"
    }
  },
  "newsletter": {
    "title": "뉴스레터 구독하기!",
    "lede": "뉴스레터를 구독하고 신제품 출시 소식과 특별 할인 혜택을 가장 먼저 받아보세요",
    "placeholder": "이메일 주소를 입력하세요",
    "ariaLabelInput": "뉴스레터 구독용 이메일",
    "ariaLabelButton": "뉴스레터 구독",
    "alreadySubscribed": "이미 구독 중인 이메일 주소입니다.",
    "subscriptionSuccess": "구독 신청이 완료되었습니다!",
    "subscriptionError": "구독 신청에 실패했습니다. 다시 시도해 주세요.",
    "networkError": "서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요."
  },
  "chatbot": {
    "openButtonLabel": "챗봇 상담 열기",
    "closeButtonLabel": "챗봇 상담 닫기",
    "headerTitle": "Var San AI 도우미",
    "headerSubtitle": "제품 안내 및 고객 지원",
    "greeting": "안녕하세요! Var San AI 고객 도우미입니다. 제품 라인, 카탈로그, 배송 가능 지역 및 문의 방법에 대해 안내해 드릴 수 있습니다. 무엇을 도와드릴까요?",
    "inputPlaceholder": "문의 내용을 입력하세요 (Enter: 전송, Shift+Enter: 줄바꿈)",
    "inputAriaLabel": "챗봇 대화 입력창",
    "sendButtonLabel": "메시지 전송",
    "quickProducts": "어떤 제품들을 취급하나요?",
    "quickQuote": "견적 요청 방법",
    "quickSupport": "고객 지원",
    "quickContact": "담당자 연락처 안내",
    "loadingMessage": "답변 작성 중...",
    "errorMessage": "메시지를 처리할 수 없습니다. 잠시 후 다시 시도해 주세요."
  },
  "footer": {
    "navigationHeading": "사이트 메뉴",
    "contactHeading": "문의처",
    "requestQuote": "견적 요청",
    "rightsReserved": "© {year} Distribuidora Var San. All rights reserved. |",
    "tagline": "귀사를 위한 위생 청결 및 산업 안전 보호 솔루션.",
    "privacyNotice": "개인정보 처리방침",
    "cookiesPolicy": "쿠키 정책",
    "termsAndConditions": "이용약관",
    "brandDescription": "위생 청결 및 안전 보호 솔루션",
    "footerTagline": "귀사를 위한 위생 청결 및 산업 안전 보호 솔루션. 기업, 사업장 및 공공기관에 신뢰할 수 있는 위생용품과 개인 안전 보호구를 공급합니다.",
    "upcoming": "대표 전화 (서비스 준비 중)"
  },
  "splash": {
    "ariaLabel": "Distribuidora Var San 로딩 중",
    "tagline": "모든 공급품에 담긴 품질과 신뢰."
  },
  "legal": {
    "backToHome": "홈으로 돌아가기",
    "cookies": {
      "title": "쿠키 정책",
      "lastUpdated": "최종 수정일: 2026년 8월 8일",
      "intro": [
        "Distribuidora Var San은 웹사이트의 안정적 운영, 브라우징 환경 개선 및 기술적 성능 측정을 위해 쿠키 및 유사 기술을 사용합니다.",
        "본 쿠키 정책은 쿠키의 개념, 이용 목적 및 관리 방법에 대해 설명합니다."
      ],
      "sections": [
        {
          "title": "1. 쿠키란 무엇인가요?",
          "paragraphs": [
            "쿠키는 사용자가 웹사이트를 방문할 때 사용자의 기기에 저장되는 작은 텍스트 파일입니다.",
            "웹사이트가 사용자의 설정과 세션 정보를 기억하여 편리한 브라우징을 돕습니다.",
            "쿠키는 개인 파일이나 금융 비밀번호 등에 직접 접근할 수 없습니다."
          ]
        },
        {
          "title": "2. 쿠키 설정 관리 방법",
          "paragraphs": [
            "브라우저 설정을 통해 언제든지 쿠키의 저장을 거부하거나 삭제할 수 있습니다."
          ]
        },
        {
          "title": "3. 문의처",
          "paragraphs": [
            "쿠키 정책과 관련하여 궁금한 사항은 아래 이메일로 문의해 주시기 바랍니다."
          ]
        }
      ],
      "contactBlock": {
        "brand": "Distribuidora Var San",
        "email": "이메일: distribuidora.varsan@outlook.com"
      },
      "signoff": {
        "brand": "Distribuidora Var San",
        "tagline": "모든 공급품에 담긴 품질과 신뢰."
      }
    },
    "privacy": {
      "title": "개인정보 처리방침",
      "lastUpdated": "최종 수정일: 2026년 8월 8일",
      "intro": [
        "Distribuidora Var San은 고객과 웹사이트 방문자의 개인정보를 소중히 보호합니다.",
        "본 방침은 수집하는 개인정보의 항목, 이용 목적, 안전 보호 조치 및 정보주체의 권리에 대해 설명합니다."
      ],
      "sections": [
        {
          "title": "1. 수집하는 개인정보 항목",
          "paragraphs": [
            "견적 상담 및 주문 이행에 필요한 최소한의 정보를 수집합니다."
          ],
          "list": [
            "성명.",
            "전화번호 및 WhatsApp 번호.",
            "이메일 주소.",
            "배송지 주소.",
            "주문 제품 내역 및 계좌이체 영수증."
          ]
        },
        {
          "title": "2. 직접 배송 가능 지역",
          "paragraphs": [
            "현재 멕시코 타마울리파스주 다음 지역에 직접 배송 서비스를 제공합니다."
          ],
          "list": [
            "탐피코 (Tampico, Tamaulipas)",
            "시우다드 마데로 (Ciudad Madero, Tamaulipas)",
            "알타미라 (Altamira, Tamaulipas)"
          ]
        },
        {
          "title": "3. 정보주체의 권리 및 문의",
          "paragraphs": [
            "개인정보 열람, 정정, 삭제 요청은 아래 공식 이메일로 접수하실 수 있습니다."
          ],
          "highlight": "distribuidora.varsan@outlook.com"
        }
      ],
      "contactBlock": {
        "brand": "Distribuidora Var San",
        "email": "이메일: distribuidora.varsan@outlook.com"
      },
      "signoff": {
        "brand": "Distribuidora Var San",
        "tagline": "모든 공급품에 담긴 품질과 신뢰."
      }
    },
    "terms": {
      "title": "이용약관",
      "lastUpdated": "최종 수정일: 2026년 8월 9일",
      "intro": [
        "Distribuidora Var San 웹사이트 방문을 환영합니다.",
        "본 약관은 웹사이트 이용 및 디지털 채널을 통한 제품 견적, 주문 및 공급 거래 전반에 적용됩니다."
      ],
      "sections": [
        {
          "title": "1. 회사 정보 및 서비스 범위",
          "paragraphs": [
            "Distribuidora Var San은 산업 안전 보호구, 청결 위생용품 및 의료 소모품 전문 유통 기업입니다."
          ]
        },
        {
          "title": "2. 견적 및 결제",
          "paragraphs": [
            "견적은 재고 상황에 따라 변동될 수 있습니다. 결제는 현금 또는 은행 계좌이체 방식으로 진행됩니다."
          ]
        },
        {
          "title": "3. 문의 안내",
          "paragraphs": [
            "이용약관과 관련된 문의는 아래 이메일로 연락해 주시기 바랍니다."
          ]
        }
      ],
      "contactBlock": {
        "brand": "Distribuidora Var San",
        "email": "이메일: distribuidora.varsan@outlook.com"
      },
      "signoff": {
        "brand": "Distribuidora Var San",
        "tagline": "모든 공급품에 담긴 품질과 신뢰."
      }
    }
  }
};

export default ko;
