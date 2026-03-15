# Digital Customer Twin — 데이터 스키마 정의서

> 원본 파일: `Digital Customer Twin.xlsx`
> 구성: 고객 데이터 (내부 12종) + 외부 조사 데이터 3종 + Customer Voyager 집계 샘플 4종

---

## 데이터 구성 개요 (Summary)

| 분류 | 데이터 | 수량 | 주기 |
|---|---|---|---|
| 고객 데이터 | Demo | 190만 | 누적 |
| | 구매이력 | 1.6억 | 누적 |
| | 보유기기 | 34억 | 누적 |
| | 닷컴 방문이력 | 11억 | 누적 |
| | 삼성 리워즈 | 6억 | 누적 |
| | App Usage | 100억 | Weekly |
| | 관심사 | 100억 | Monthly |
| | CRM 반응 | 1,451억 | 누적 |
| | SAS 360 | 100만 | 누적 |
| | 닷컴 NPS 응답 | 400만 | 누적 |
| | 제품 NPS 응답 | 30만 | 누적 |
| | CLV | 9억 | Monthly |
| 외부 조사 데이터 | BAS (Brand Attitude Survey) | 10만 | Yearly |
| | Brand Personality (Sprinklr) | 500만 | Yearly |
| | S-CRET (광고 컨셉 사전 평가) | 1,000 | 누적 |

---

## 공통 키 구조

모든 테이블은 `index` 컬럼을 공통 고객 식별자로 사용한다. 고객 한 명이 여러 행을 가질 수 있으며 (구매/보유/앱사용 등), `index` 기준으로 테이블 간 조인한다.

---

## 1. 고객 데이터 (내부)

### 1.1 Demo — 고객 기본 정보

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `index` | int | 고객 고유 식별자 (PK) | 1 |
| `sa_activeness` | string | Samsung Account 활성 상태 | `Active (1M)`, `Inactive` |
| `usr_age` | int | 고객 나이 | 54 |
| `usr_gndr` | string | 성별 | `M`, `F` |
| `usr_cnty_name` | string | 국가명 | `France`, `South Korea` |
| `usr_cnty_ap2` | string | AP2 지역 코드 | `SEF`, `KOREA`, `SEA` |
| `relation_all_cnt` | int | 전체 관계 고객 수 | 1 |
| `relation_family_group_cnt` | int | 가족 그룹 관계 수 | 0 |
| `relation_estimated_cnt` | int | 추정 관계 고객 수 | 1 |
| `voyager_segment` | string (array) | Customer Voyager 세그먼트 목록 | `['Gamer', 'Premium Buyer', ...]` |

---

### 1.2 구매 — 구매 이력

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `index` | int | 고객 식별자 (FK → Demo) | 5 |
| `purc_cnty_ap2` | string | 구매 국가 AP2 코드 | `SEAU` |
| `purc_cnty_name` | string | 구매 국가명 | `Australia` |
| `order_id` | string | 주문 ID | `AU180926-31908257` |
| `order_date` | datetime | 주문 일자 | `2018-09-25` |
| `store_type` | string | 판매 채널 유형 | `EPP`, `D2C`, `Retail` |
| `site_name` | string | 판매 사이트/파트너명 | `Telstra` |
| `source_app` | string | 구매 디바이스 유형 | `PC`, `Mobile` |
| `order_entries_oe_sku` | string | 제품 SKU | `SM-R800NZSAXSA` |
| `order_entries_oe_name` | string | 제품명 | `Galaxy Watch 46mm - Bluetooth` |
| `sale_qty` | int | 판매 수량 | 1 |
| `sale_amt_local` | float | 현지 통화 실 결제금액 | 329.4 |
| `price_base_local` | float | 현지 통화 정가 | 329.4 |
| `price_discount_all_local` | float | 현지 통화 총 할인금액 | 0 |
| `price_discount_tradein_local` | float | 현지 통화 트레이드인 할인 | null |
| `price_discount_rewards_local` | float | 현지 통화 리워즈 할인 | null |
| `currency` | string | 통화 코드 | `AUD`, `KRW`, `USD` |
| `exchange_rate` | float | USD 환율 | 1.37165 |
| `sale_amt_usd` | float | USD 실 결제금액 | 240.15 |
| `price_base_usd` | float | USD 정가 | 240.15 |
| `price_discount_all_usd` | float | USD 총 할인금액 | 0 |
| `price_discount_tradein_usd` | float | USD 트레이드인 할인 | null |
| `price_discount_rewards_usd` | float | USD 리워즈 할인 | null |
| `pd_division` | string | 제품 사업부 | `MX`, `VD`, `DA` |
| `pd_group` | string | 제품 그룹 | `MOBILE`, `ME` |
| `pd_category` | string | 제품 카테고리 | `HHP`, `WEARABLE`, `TV` |
| `pd_type` | string | 제품 타입 | `SMART`, `WATCH` |
| `pd_rec_type` | string | 제품 분류명 | `Smartphones`, `Watches` |
| `pd_rec_sub_type` | string | 제품 세부 분류 | `Galaxy_S`, `Galaxy_Watch` |
| `pd_series` | string | 시리즈명 | `S`, `Watch1`, `Watch Active` |
| `pd_name` | string | 마케팅 제품명 | `Galaxy S10+` |
| `pd_color` | string | 색상 | `SILVER`, `WHITE` |
| `pd_size` | string | 사이즈 | null |
| `pd_smart` | string | 스마트 여부 | `N`, `Y` |
| `refurbished` | string | 리퍼비시 여부 | `N`, `Y` |
| `pd_screen` | string | 화면 크기 | `6.4_UB` |
| `pd_storage` | string | 저장용량 | `128GB`, `512GB` |
| `pd_marketing_name` | string | 마케팅 제품명 | `Galaxy S10+` |
| `pd_description` | string | 제품 설명 문자열 | `MOBILE,SM-G975F,WHITE,XSA` |
| `pd_mkt_attb01` | string | 마케팅 속성 1 | `SMART` |
| `pd_mkt_attb02` | string | 마케팅 속성 2 | `S` |
| `pd_mkt_attb03` | string | 마케팅 속성 3 | `Galaxy S10+` |
| `data_source` | string | 데이터 출처 | `hybris` |
| `sellin_price` | float | 셀인 가격 (USD) | 168.10 |
| `premium_flg` | int | 프리미엄 제품 여부 | `0`, `1` |

---

### 1.3 보유 — 기기 보유 현황

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `index` | int | 고객 식별자 (FK → Demo) | 4 |
| `dvc_index` | int | 고객별 기기 순번 | 1 |
| `usr_is_last_owner` | string | 현재 소유자 여부 | `Y`, `N` |
| `dvc_division` | string | 기기 사업부 | `MX`, `VD` |
| `dvc_group` | string | 기기 그룹 | `ME`, `MOBILE` |
| `dvc_category` | string | 기기 카테고리 | `WEARABLE`, `HHP` |
| `dvc_type` | string | 기기 타입 | `Watch`, `Smart Phone` |
| `dvc_pd_type` | string | 제품 타입 코드 | `WATCH`, `SMART` |
| `dvc_rec_type` | string | 분류명 | `Watches`, `Smartphones` |
| `dvc_rec_sub_type` | string | 세부 분류 | `Galaxy_Watch`, `Galaxy_S` |
| `dvc_mdl_id` | string | 모델 ID | `SM-G901F` |
| `dvc_mdl_nm` | string | 모델명 | `Galaxy S5 LTE-A` |
| `dvc_sku` | string | SKU 코드 | `SM-G901FZWAFTM` |
| `dvc_series` | string | 시리즈명 | `S`, `Gear S3` |
| `dvc_attb_color` | string | 색상 | `WHITE`, `BLUE` |
| `dvc_attb_size` | string | 사이즈 | null |
| `dvc_attb_smart` | string | 스마트 여부 | null |
| `dvc_attb_etc` | string | 기타 속성 | null |
| `dvc_acc_yn` | string | 액세서리 여부 | `N` |
| `dvc_is_cellular` | bool | 셀룰러 지원 여부 | `False` |
| `dvc_is_wifi` | bool | Wi-Fi 지원 여부 | null |
| `dvc_is_bluetooth` | bool | 블루투스 지원 여부 | `False` |
| `dvc_is_secondhand` | string | 중고 여부 | `N`, `Y` |
| `dvc_manufacturer` | string | 제조사 | `Samsung`, `Unknown` |
| `dvc_samsung_flag` | string | 삼성 제품 여부 | `Y`, `N` |
| `refurbished` | string | 리퍼비시 여부 | `N` |
| `dvc_reg_date` | datetime | 기기 등록일 | `2023-11-26` |
| `dvc_first_reg_date` | datetime | 최초 등록일 | `2015-06-02` |
| `dvc_last_reg_date` | datetime | 최근 등록일 | `2023-11-26` |
| `dvc_last_active_date` | datetime | 최근 활성화일 | null |
| `data_source` | string | 데이터 출처 | `MDE`, `OOD` |
| `sale_amt_usd` | float | 기기 판매가 (USD) | 575.20 |
| `sellin_price` | float | 셀인 가격 (USD) | 347.74 |
| `premium_flg` | int | 프리미엄 여부 | `0`, `1` |

---

### 1.4 닷컴 — Samsung.com 방문 이력

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `index` | int | 고객 식별자 (FK → Demo) | 2 |
| `site_cnty` | string | 방문 국가 코드 | `de`, `au` |
| `act_visit_num` | int | 방문 회차 번호 | 1 |
| `act_visit_date` | datetime | 방문 날짜 | `2020-03-29` |
| `act_visit_start_time` | datetime | 방문 시작 시각 | `2020-03-29 15:03:10` |
| `act_visit_start_page_url` | string | 시작 페이지 URL | `https://www.samsung.com/de/` |
| `act_source_app` | string | 접속 디바이스 | `Mobile`, `PC` |
| `act_duration_time` | int | 방문 체류 시간 (초) | 142 |
| `act_all_log_cnt` | int | 전체 로그 수 | 16 |
| `act_all_page_move_cnt` | int | 페이지 이동 횟수 | 8 |
| `act_page_url_kind_cnt` | int | 방문 고유 페이지 수 | 6 |
| `act_sch_pg_cnt` | int | 검색 페이지 수 | 0 |
| `act_pdp_pg_cnt` | int | 제품 상세 페이지 수 | 0 |
| `act_pf_cnt` | int | 즐겨찾기 추가 수 | 0 |
| `act_event_cnt` | int | 이벤트 클릭 수 | 0 |
| `act_marketing_cnt` | int | 마케팅 콘텐츠 조회 수 | 0 |
| `act_cart_cnt` | int | 장바구니 담기 수 | 0 |
| `act_page_url_arry` | string (array) | 방문 페이지 URL 목록 | `['https://...', ...]` |
| `act_pdp_product_list` | string (array) | 조회한 제품 상세 목록 | null |
| `act_cart_product_list` | string (array) | 장바구니 제품 목록 | null |
| `act_marketing_campaign_list` | string | 노출 마케팅 캠페인 | `au_paid_ppc_google_...` |

---

### 1.5 리워즈 — Samsung Rewards 포인트 이력

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `index` | int | 고객 식별자 (FK → Demo) | 5 |
| `rewards_cnt` | int | 리워즈 보유 건수 | 1 |
| `rewards_priority` | int | 우선순위 | 1 |
| `rwd_cnty_cd_2` | string | 국가 코드 (2자리) | `AU`, `KR` |
| `rwd_cnty_cd` | string | 국가 코드 (3자리) | `AUS`, `KOR` |
| `rwd_cnty_name` | string | 국가명 | `Australia` |
| `rwd_cnty_gc` | string | 지역 그룹 코드 | `S.E ASIA`, `KOREA` |
| `rwd_cnty_ap2` | string | AP2 코드 | `SEAU`, `KOREA` |
| `point_type` | string | 포인트 프로그램 유형 | `Samsung Rewards`, `삼성전자 멤버십` |
| `point_amt` | int | 현재 포인트 | 518 |
| `point_acc_amt` | int | 누적 적립 포인트 | 18741 |
| `point_rdm_amt` | int | 누적 사용 포인트 | -18223 |
| `point_exp_amt` | int | 소멸 포인트 | 0 |
| `exp_amount_1month` | int | 1개월 내 소멸 예정 포인트 | 0 |
| `exp_amount_3month` | int | 3개월 내 소멸 예정 포인트 | 0 |
| `last_date_acc` | datetime | 최근 적립일 | `2025-03-27` |
| `last_date_rdm` | datetime | 최근 사용일 | `2025-03-10` |
| `tier_level_code` | string | 현재 티어 코드 | `T003` |
| `tier_name` | string | 현재 티어명 | `Platinum`, `Gold` |
| `tier_level` | int | 현재 티어 레벨 | 3 |
| `tier_start_date` | datetime | 티어 시작일 | `2023-12-10` |
| `tier_end_date` | datetime | 티어 만료일 | `2025-12-09` |
| `best_tier_level_code` | string | 최고 달성 티어 코드 | `T003` |
| `best_tier_name` | string | 최고 달성 티어명 | `Platinum` |
| `best_tier_level` | int | 최고 달성 티어 레벨 | 3 |
| `best_tier_end_date` | datetime | 최고 티어 만료일 | `2025-12-09` |
| `currency` | string | 통화 코드 | `AUD`, `KRW` |
| `currency_rate` | float | USD 환율 | 1.53245 |
| `point_rate` | float | 포인트-USD 환산율 | 0.01 |
| `point_amt_usd` | float | 현재 포인트 (USD 환산) | 3.38 |
| `point_acc_amt_usd` | float | 누적 적립 (USD 환산) | 122.29 |
| `point_rdm_amt_usd` | float | 누적 사용 (USD 환산) | -118.91 |

---

### 1.6 앱사용 — App Usage (Weekly)

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `index` | int | 고객 식별자 (FK → Demo) | 1 |
| `usage_month` | string | 집계 주차 | `2025-W31` |
| `app_id` | string | 앱 패키지 ID | `com.supercell.hayday` |
| `app_title` | string | 앱 이름 | `Hay Day`, `Facebook` |
| `app_is_samsung` | bool | 삼성 앱 여부 | `False`, `True` |
| `app_category` | string | 앱 카테고리 | `GAME`, `SOCIAL`, `UTILITY` |
| `app_game_category` | string | 게임 세부 장르 | `CASUAL`, `PUZZLE` (게임만 해당) |
| `usage_cnt` | int | 해당 주차 실행 횟수 | 60 |
| `usage_duration_seconds` | int | 해당 주차 총 사용 시간 (초) | 26115 |
| `fst_usage_date` | datetime | 해당 주차 첫 사용일 | `2025-07-28` |
| `lst_usage_date` | datetime | 해당 주차 마지막 사용일 | `2025-08-03` |
| `dvc_cnt` | int | 사용 기기 수 | 1 |
| `dvc_model_list` | string (array) | 사용 기기 모델 목록 | `['SM-S926B']` |
| `usage_month_last_day` | datetime | 집계 주차 마지막 날 | `2025-08-03` |
| `cii_load_dt` | datetime | 데이터 적재 시각 | `2025-08-10 11:52:02` |

---

### 1.7 관심사 — Interest Score (Monthly)

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `index` | int | 고객 식별자 (FK → Demo) | 1 |
| `usr_cnty_cd` | string | 국가 코드 | `FRA`, `KOR` |
| `interest` | string | 관심사 대분류 | `ART & CUSTOMIZED`, `BANKING & FINANCE` |
| `category` | string | 관심사 중분류 | `ART_AND_DESIGN`, `FINANCE` |
| `SUB_SCORE` | float | 세부 카테고리 점수 | 0.000388 |
| `INTEREST_SCORE` | float | 최종 관심사 점수 | 0.000388 |

> 고객 1명이 관심사 카테고리 수만큼 행을 가짐. 점수 0은 해당 관심사 없음.

---

### 1.8 CRM — CRM 캠페인 반응 이력

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `index` | int | 고객 식별자 (FK → Demo) | 1 |
| `campaign_id` | string | 캠페인 ID | `-949025562` |
| `campaign_label` | string | 캠페인 라벨명 | `W02_20230111_SEF_fr_FR_EM_...` |
| `campaign_create_date` | datetime | 캠페인 생성일 | `2023-01-09` |
| `campaign_program` | string | 캠페인 프로그램 | `Shop`, `Push`, `IM`, `Ad-Hoc Product` |
| `campaign_category` | string | 캠페인 카테고리 | null |
| `delivery_id` | int | 발송 ID | 504212862 |
| `delivery_type` | string | 발송 유형 | `Email`, `Push Peppermint` |
| `delivery_date` | datetime | 발송 일시 | `2023-01-11 12:07:26` |
| `delivery_status` | string | 발송 상태 | `Sent` |
| `response_cnt` | int | 총 반응 수 | 1 |
| `resp_delivered_cnt` | int | 수신 성공 수 | 0 |
| `resp_display_cnt` | int | 노출 수 | 0 |
| `resp_open_cnt` | int | 열람 수 | 1 |
| `resp_click_cnt` | int | 클릭 수 | 0 |
| `resp_mirror_cnt` | int | 미러 수 | 0 |
| `resp_optout_cnt` | int | 수신 거부 수 | 0 |
| `resp_etc_cnt` | int | 기타 반응 수 | 0 |
| `response_hist` | string (array) | 반응 이력 상세 (날짜/상태) | `[{'resp_date': ..., 'resp_status': 'Open'}]` |
| `data_src` | string | 데이터 출처 시스템 | `ADOBE_EU` |

---

### 1.9 SAS 360 — 고객 접점 NPS 설문

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `index` | int | 고객 식별자 (FK → Demo) | 6 |
| `touchpoint` | string | 접점 유형 | `TP(p)` (구매), `TP(c)` (채널), `Ad-hoc` |
| `date` | datetime | 응답 날짜 | `2025-06-06` |
| `datetime` | datetime | 응답 일시 | `2025-06-06 07:17:13` |
| `survey_id` | string/int | 설문 ID | 59970956 |
| `region` | string | 지역명 | `Europe`, `L.America` |
| `subsidiary` | string | 법인 코드 | `SEAS`, `SEASA` |
| `country` | string | 국가명 | `Austria`, `Argentina` |
| `q1` | int | NPS 추천 점수 (0-10) | 99 |
| `q2` | int | 현재 삼성 제품 소유 여부 | `0`, `1` |
| `q3_{제품군}` | int | 제품군별 소유 여부 (smartphone/tablet/smartwatch/buds/tv/audio 등) | `0`, `1` |
| `q4` | string (array) | 구매 예정 채널 | `['3']` |
| `q5` | int | 삼성 제품 관심도 | 1~5 |
| `q6_{제품군}` | int | 제품군별 만족도 | 1~5 |
| `q7` | string | 불만족 이유 | null |
| `q7_1` | string (array) | 불만족 이유 상세 | `[]` |
| `q8` | string (array) | 개선 희망 사항 | `['12']` |
| `q9` | int | 재구매 의향 | 1~5 |
| `q10_{제품군}` | int | 제품군별 재구매 의향 | 1~5 |
| `q11` | string | 향후 구매 의향 제품 | null |
| `q11_1` | string (array) | 구매 의향 제품 목록 | `[]` |
| `q12` | string (array) | 정보 탐색 채널 | `['2', '9', '12']` |
| `q13` | string (array) | 구매 결정 요인 | `['1', '5', '6']` |
| `q14` | string (array) | 선호 프로모션 유형 | `['1', '3', '4']` |
| `q15` | int | 브랜드 선호도 (NPS 계열) | 1~10 |
| `q16` | int | 경쟁사 대비 평가 | null |
| `q17` | string (array) | SNS 사용 채널 | `['4', '6']` |
| `q18` | string (array) | 생활 관심사 | `['7', '8']` |
| `q19` | string (array) | 라이프스타일 키워드 | `['9', '10', '12']` |

---

### 1.10 닷컴 NPS — Samsung.com 구매 후 NPS

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `index` | int | 고객 식별자 (FK → Demo) | 5 |
| `nps_cnty_gc` | string | 지역 그룹 | `S.E.Asia` |
| `nps_cnty_ap2` | string | AP2 코드 | `SEAU` |
| `nps_cnty_name` | string | 국가명 | `Australia` |
| `survey_id` | int | 설문 ID | 53147885 |
| `visit_channel` | string | 방문 채널 | `eStore` |
| `response_mode` | string | 응답 수집 방법 | `eStore : Order Confirmation email` |
| `response_date` | datetime | 응답 일시 | `2025-03-12 01:26:51` |
| `response_recommend_score` | int | NPS 추천 점수 (0-10) | 9 |
| `response_score_segment` | string | NPS 세그먼트 | `Promoter`, `Passive`, `Detractor` |
| `response_recommend_factor` | string | 추천 주요 이유 | `Online Purchasing` |
| `purchase_type` | string | 구매 유형 | `Purchase` |
| `send_point` | string | 설문 발송 시점 | `Order Complete` |
| `transaction_id` | string | 주문 ID | `AU250310-57880058` |
| `product_sku` | string | 구매 제품 SKU | `MS40DG5505ATSA` |
| `data_src` | string | 데이터 출처 | `Online` |

---

### 1.11 제품 NPS — 제품 경험 NPS

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `touchpoint` | string | 접점 유형 | `Product NPS (MX)`, `Product NPS (DA)` |
| `response_date` | datetime | 응답 날짜 | `2025-03-02` |
| `Ownership_Period` | string | 소유 기간 | `MX 1M` |
| `nps_usr_gender` | string | 성별 | `Male`, `Female` |
| `nps_usr_age_group` | string | 연령대 | `40-49`, `30-39` |
| `nps_cnty_gc` | string | 지역 그룹 | `N.America`, `Europe` |
| `nps_cnty_ap2` | string | AP2 코드 | `SECA`, `SEF` |
| `nps_cnty_name` | string | 국가명 | `Canada`, `France` |
| `nps_survey_device_type` | string | 응답 기기 유형 | `Mobile Phone` |
| `nps_survey_device_brand` | string | 응답 기기 브랜드 | `Android` |
| `Lifestyle_Statements` | string | 라이프스타일 진술 | `I am a rational and practical person,...` |
| `household_type` | string | 가구 유형 | `Two-person household` |
| `pet_owned` | string | 반려동물 소유 | `None` |
| `NPS_segment` | string | NPS 세그먼트 | `Promoter`, `Passive`, `Detractor` |
| `loyalty_type_mx` | string | 충성도 유형 (MX) | `Loyal` |
| `Likelihood_to_Recommend` | int | 추천 의향 (0-10) | 7 |
| `Repurchase_Intention` | int | 재구매 의향 (0-10) | 5 |
| `Proud_to_own` | int | 소유 자부심 (0-10) | 8 |
| `order_id` | string | 주문 ID (마스킹) | `CA250126-07******` |
| `product_category` | string | 제품 카테고리 | `Smartphone`, `Refrigerator` |
| `product_series` | string | 제품 시리즈 | `Galaxy S25 Ultra` |
| `product_model` | string | 제품 모델명 | `Galaxy S25 Ultra` |
| `sku_code` | string | SKU 코드 | `SM-S938WZKEXAC` |
| `purchasing_price` | int | 구매 가격 | 1108 |
| `purchase_type` | string | 구매 유형 | `This is the replacement of my existing device` |
| `purchase_reasons` | string | 구매 결정 요인 | `Camera performance, Samsung-specific features` |
| `satisfied_reasons` | string | 만족 이유 | `Camera performance, Processing speed` |
| `satisfaction_comment` | string | 만족 자유 응답 | `Great size and fast` |
| `dissatisfied_reasons` | string | 불만족 이유 | `Battery performance` |
| `dissatisfaction_comment` | string | 불만족 자유 응답 | `No bluetooth s-pen` |
| `own_samsung_devices_list` | string | 보유 삼성 기기 목록 | `TV, Smartwatch/band, Laptop` |
| `previous_hhp_used_period_mx` | string | 이전 폰 사용 기간 | `2 years 6 months` |
| `previous_hhp_brand_mx` | string | 이전 폰 브랜드 | `Samsung`, `Apple` |
| `previous_hhp_type_mx` | string | 이전 폰 타입 | `Normal Smartphone type (bar-type)` |
| `interested_promotions_mx` | string | 관심 프로모션 유형 | `Extended warranty, Trade-in your old device` |
| `product_information_channel_mx` | string | 정보 탐색 채널 | `YouTube, Social Media` |
| `product_information_seeking_mx` | string | 정보 탐색 방식 | `Reviews (YouTuber reviews, user reviews, etc.)` |

---

### 1.12 CLV — Customer Lifetime Value (Monthly)

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `index` | int | 고객 식별자 (FK → Demo) | 1 |
| `bs_date` | datetime | 기준 날짜 | `2024-12-27` |
| `gc` | string | 지역 그룹 코드 | `EUROPE`, `KOREA` |
| `cnty_cd` | string | 국가 코드 | `FRA`, `DEU` |
| `subsidiary` | string | 법인 코드 | `SEF`, `SEG` |
| `gender` | string | 성별 | `F`, `M` |
| `age` | int | 나이 | 54 |
| `age_band` | string | 연령대 | `50s`, `40s` |
| `product_mapping4` | string | 제품 매핑 (CLV 단위) | `HHP`, `WATCH`, `TV` |
| `division_fin` | string | 사업부 (재무 기준) | `MX`, `VD` |
| `retention_score` | float | 잔존 확률 점수 (0-1) | 0.866 |
| `retention_adj` | float | 보정된 잔존 확률 | 0.781 |
| `val_p` | float | 과거 구매 가치 (USD) | 1726.68 |
| `pchs_cnt` | int | 구매 건수 | 3 |
| `div_cnt` | int | 구매 사업부 수 | 1 |
| `prod_cnt` | int | 보유 제품 수 | 2 |
| `prod_cnt_bydiv` | int | 사업부 내 보유 제품 수 | 2 |
| `prd_cyc_adj_y` | float | 보정 구매 주기 (년) | 2.09 |
| `pchs_cyc_org_y` | float | 원 구매 주기 (년) | 2.09 |
| `val_f_r` | float | 미래 기대 가치 (USD) | 5589.63 |
| `ltv_r` | float | LTV (과거+미래, USD) | 7316.31 |
| `first_reg_dt` | datetime | 최초 구매/등록일 | `2020-01-08` |
| `last_reg_dt` | datetime | 최근 구매/등록일 | `2024-03-13` |
| `cum_repchs_flg` | int | 누적 재구매 여부 | `0`, `1` |
| `new_repchs_flg` | int | 신규 재구매 여부 | `0`, `1` |
| `cum_prod_repchs_flg` | int | 누적 동일제품 재구매 여부 | `0`, `1` |
| `new_prod_repchs_flg` | int | 신규 동일제품 재구매 여부 | `0`, `1` |
| `cum_upsell_flg` | int | 누적 업셀 여부 | `0`, `1` |
| `new_upsell_flg` | int | 신규 업셀 여부 | `0`, `1` |
| `d2c_flg` | int | D2C 구매 여부 | `0`, `1` |
| `rr_mapping` | string | 고객 등록 유형 | `GUID` |
| `age_null_yn` | int | 나이 결측 여부 | `0`, `1` |
| `st_act_flg` | int | SmartThings 활성 여부 | `0`, `1` |
| `st_div_flg` | int | SmartThings 사업부 여부 | `0`, `1` |
| `reg_diff` | int | 최초~최근 등록 경과일 | 713 |
| `flag_hhp_only` | bool | HHP 전용 고객 여부 | `True`, `False` |
| `flag_tv_only` | bool | TV 전용 고객 여부 | `False` |
| `samsungwallet_flag` | bool | Samsung Wallet 사용 여부 | `True` |
| `samsungwallet_first_dt` | datetime | Samsung Wallet 최초 사용일 | `2021-12-01` |
| `samsunghealth_flag` | bool | Samsung Health 사용 여부 | `True` |
| `samsunghealth_first_dt` | datetime | Samsung Health 최초 사용일 | `2020-03-01` |
| `smartthings_flag` | bool | SmartThings 사용 여부 | `False` |
| `smartthings_first_dt` | datetime | SmartThings 최초 사용일 | null |
| `premium_cnt` | int | 프리미엄 제품 보유 수 | 3 |

---

## 2. 외부 조사 데이터

### 2.1 BAS — Brand Attitude Survey (Yearly)

브랜드 태도 및 구매 행동에 관한 대규모 온라인 설문. `index` 컬럼 없음 (고객 내부 ID와 직접 조인 불가, 국가/인구통계 기반 매칭).

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `bas_year` | int/string | 조사 제품 카테고리 | `mobile` |
| `bas_product` | int | 조사 연도 | 2024 |
| `bas_survey_id` | string | 설문 ID | `2024_2h_mobile` |
| `idx` | int | 응답자 순번 | 1 |
| `bas_date` | datetime | 응답 날짜 | `2024-08-21` |
| `ppp_weight` | float | 설문 가중치 | 0.191 |
| `hhp_recent_brand` | string | 최근 사용 스마트폰 브랜드 | `Apple`, `Samsung` |
| `hhp_prev_usage_period` | int/string | 이전 기기 사용 기간 (개월) | 16 |
| `rimwt` | float | RIM 가중치 | 0.607 |
| `bas_country` | string | 국가명 | `USA` |
| `usr_city` | string | 도시명 | `Florida` |
| `usr_region` | string | 지역명 | `South` |
| `own_product_all_array` | string (array) | 전체 보유 제품 카테고리 | `["TV","Mobile phone","Laptop"]` |
| `usr_gndr` | string | 성별 | `Female`, `Male` |
| `usr_age` | int | 나이 | 24 |
| `usr_age_group` | string | 연령대 | `18-29`, `30-39` |
| `usr_income` | string | 소득 수준 | `$120,000 - $129,999` |
| `bas_sample_type` | string | 표본 유형 | `Random Sample` |
| `bas_survey_type` | string | 설문 방식 | `Online` |
| `bas_questionnaire_type` | string | 설문 유형 | `HHP` |
| `bas_env_type` | string | 응답 환경 | `PC`, `Mobile` |
| `hhp_recent_purchased_time` | string | 최근 구매 시기 | `0 to 1 month ago` |
| `kpi_pisa_next_purchase_period` | string | 다음 구매 예정 시기 | `In the next 6 months` |
| `bas_module` | string | 설문 모듈 | `Purchaser`, `PE` |
| `kpi_tom_brand` | string | Top of Mind 브랜드 | `Apple`, `Samsung` |
| `kpi_ua_top3_brand_array` | string (array) | 비보조 인지 상위 3개 브랜드 | `["Apple","Samsung"]` |
| `kpi_ua_total_brand_array` | string (array) | 비보조 인지 전체 브랜드 | `["Apple","Samsung"]` |
| `reason_funtional_for_pto_array` | string (array) | 브랜드별 기능적 구매 이유 | `[{"brand":"Apple","attributes":[...]}]` |
| `reason_emotional_for_pto_array` | string (array) | 브랜드별 감성적 구매 이유 | `[{"brand":"Apple","attributes":[...]}]` |
| `reason_funtional_for_not_pto_array` | string (array) | 브랜드별 비구매 기능적 이유 | `[{"brand":"Samsung","attributes":[...]}]` |
| `reason_emotional_for_not_pto_array` | string (array) | 브랜드별 비구매 감성적 이유 | `[{"brand":"Samsung","attributes":[...]}]` |
| `hhp_awareness_brand_array` | string (array) | 인지 브랜드 전체 목록 | `["Samsung","Apple",...]` |
| `kpi_mpsa_brand` | string | 가장 최근 구매 브랜드 | `Apple` |
| `kpi_pisa_brand` | string | 구매 의향 브랜드 | `Apple` |
| `kpi_pisa_model` | string | 구매 의향 모델 | `Apple iPhone 15 Pro Max` |
| `kpi_pto_score` | string (array) | 브랜드별 구매 의향 점수 | `[{"brand":"Samsung","attributes":9},...]` |
| `kpi_model_considered_array` | string (array) | 고려 모델 목록 | `["Google Pixel 9","Apple iPhone 15 Pro Max",...]` |
| `hhp_kbf` | string | 주요 구매 결정 요인 | `Camera performance`, `Package offer/promotion` |
| `hhp_kbf_array` | string (array) | 구매 결정 요인 전체 목록 | `["Camera performance","OS","Display quality"]` |
| `hhp_prev_brand` | string | 이전 기기 브랜드 | `Apple`, `Samsung` |
| `hhp_prev_model` | string | 이전 기기 모델 | `Apple iPhone 15 Pro Max` |
| `kpi_brand_image_array` | string (array) | 브랜드별 이미지 속성 | `[{"brand":"Samsung","attributes":[...]}]` |
| `hhp_brand_touch_point_array` | string (array) | 브랜드별 정보 접점 | `[{"brand":"Samsung","attributes":[...]}]` |
| `hhp_product_experience_array` | string (array) | 브랜드별 제품 경험 속성 | `[{"brand":"Samsung","attributes":[...]}]` |
| `hhp_ai_features_array` | string (array) | AI 기능 인식/활용 | `["Battery Usage Optimization",...]` |
| `hhp_emotion_evaluation_array` | string (array) | 브랜드별 감성 평가 | `[{"brand":"Samsung","attributes":[...]}]` |
| `bas_country_type` | string | 국가 유형 | `Advanced` |
| `bas_hhp_premium` | string | 프리미엄 구매자 여부 | `PremiumBuyer`, `Non PremiumBuyer` |
| `bas_income_level` | string | 소득 수준 분류 | `High`, `Middle`, `Low` |

> BAS는 컬럼이 130개 이상으로 주요 KPI 및 자주 사용하는 컬럼만 정의. 전체 컬럼은 원본 시트 참조.

---

### 2.2 Brand Personality — 소셜 리스닝 (Sprinklr, Yearly)

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `Label` | string | 데이터 레이블 | `C` |
| `Topic` | string | 분석 토픽 | `[MS] B.P_Samsung_All` |
| `Theme` | string | 세부 테마 | `[MS] B.P_Samsung_All_MX` |
| `Created Time` | datetime | 언급 생성 시각 | `2025-02-28` |
| `Mentions (SUM)` | int | 언급 수 합계 | 3 |
| `Sentiment` | string | 감성 분류 | `Positive`, `Negative`, `Neutral` |
| `Country` | string | 국가명 | `United Arab Emirates` |
| `Source` | string | 출처 채널 | `Forums`, `News`, `Social Media` |

---

### 2.3 S-CRET — 광고 컨셉 사전 평가

| 컬럼명 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `Country` | string | 국가명 | `India` |
| `Region` | string | 지역 코드 | `SWA` |
| `Production Source` | string | 소재 제작 주체 | `Local`, `GBM`, `Other` |
| `Creative Name` | string | 광고 소재명 | `Galaxy A Series_Robot Dance` |
| `Product Line` | string | 제품 라인 | `Galaxy A`, `Galaxy S` |
| `CATEGORY (VD/IM/DA/Corporate)` | string | 사업부 카테고리 | `IM`, `VD`, `DA` |
| `CATEGORY (Product)` | string | 제품 카테고리 | `HHP` |
| `Year` | int | 평가 연도 | 2019 |
| `1H/2H` | string | 상반기/하반기 | `1H`, `2H` |
| `Quarter` | string | 분기 | `Q1`, `Q2` |
| `Ad Agency` | string | 광고 대행사 | `Cheil` |
| `Ad Length` | int | 광고 길이 (초) | 66 |
| `CP (Creative Power)` | int | 종합 광고 효과 점수 | 79 |
| `Enjoyment` | int | 즐거움 점수 | 20 |
| `Engagement` | int | 몰입도 점수 | 99 |
| `Emotion` | int | 감성 점수 | 83 |
| `Branding` | int | 브랜딩 점수 | 94 |
| `Persuasion` | int | 설득력 점수 | 82 |
| `Brand Appeal` | int | 브랜드 매력도 | 92 |
| `Brand Focus` | int | 브랜드 집중도 | 89 |
| `Brand Fit` | int | 브랜드 적합성 | 88 |
| `Brand Cues` | int | 브랜드 단서 점수 | 45 |
| `Uniqueness of Impressions` | int | 독창성 점수 | 85 |
| `New Information` | int | 새로운 정보 점수 | 96 |
| `Relevance` | int | 관련성 점수 | 86 |
| `Credibility` | int | 신뢰성 점수 | 87 |
| `Brand Difference` | int | 브랜드 차별화 점수 | 90 |
| `Ease of Understanding` | int | 이해도 점수 | 91 |
| `Ad Distinctiveness` | int | 광고 차별성 점수 | 68 |
| `Message Check 1~3` | string | 핵심 메시지 인식 | `N/A` |

---

## 3. Customer Voyager 집계 샘플

Customer Voyager 데이터는 세그먼트 기반 집계 결과이며, `index` 없이 `seg_id` 기준으로 분석함.

### Sample1 — 세그먼트별 구매 의향 퍼센트

| 컬럼명 | 설명 |
|---|---|
| `usr_cnty_gc` | 지역 그룹 |
| `usr_cnty_ap2` | AP2 코드 |
| `purpose_main` | 마케팅 목적 대분류 |
| `purpose_sub` | 마케팅 목적 소분류 |
| `seg_id` | 세그먼트 ID |
| `pd_division` | 제품 사업부 |
| `pd_group` | 제품 그룹 |
| `pd_category` | 제품 카테고리 |
| `pd_rec_sub_type` | 제품 세부 분류 |
| `usr_re_cnt` | 해당 세그먼트 사용자 수 |
| `usr_sas_resp_flag` | SAS 응답 여부 |

### Sample2 — 세그먼트별 앱 사용 특성

| 컬럼명 | 설명 |
|---|---|
| `usr_cnty_gc` | 지역 그룹 |
| `usr_cnty_ap2` | AP2 코드 |
| `purpose_lv2` | 분석 목적 레벨 2 |
| `purpose_sub` | 분석 목적 소분류 |
| `seg_id` | 세그먼트 ID |
| `is_samsung` | 삼성 앱 여부 |
| `app_title` | 앱 이름 |
| `Customer` | 해당 앱 사용 고객 수 |
| `usr_sas_resp_flag` | SAS 응답 여부 |

### Sample3 — CLV 리포트 세그먼트 집계

| 컬럼명 | 설명 |
|---|---|
| `clv_bs_date` | CLV 기준 날짜 |
| `clv_usr_cnty_gc` | 지역 그룹 |
| `clv_usr_cnty_ap2` | AP2 코드 |
| `clv_division` | 사업부 |
| `clv_category` | 제품 카테고리 |
| `avg_rmn_period` | 평균 잔존 기간 |
| `avg_prd_cyc_adj_y` | 평균 보정 구매 주기 (년) |
| `avg_price` | 평균 구매 가격 |
| `avg_retention_score` | 평균 잔존 점수 |

### Sample4 — 세그먼트 성장률 (카테고리별)

| 컬럼명 | 설명 |
|---|---|
| `create_date` | 생성 날짜 |
| `usr_cnty_gc` | 지역 그룹 |
| `usr_cnty_ap2` | AP2 코드 |
| `MACRO_SEG_NM` | 매크로 세그먼트명 |
| `MICRO_SEG_NM` | 마이크로 세그먼트명 |
| `seg_id` | 세그먼트 ID |
| `pd_division` | 제품 사업부 |
| `pd_group` | 제품 그룹 |
| `pd_category` | 제품 카테고리 |
| `pd_premium_mass` | 프리미엄/매스 구분 |
| `seg_count` | 세그먼트 내 고객 수 |

---

## 4. 테이블 간 관계

```
Demo (index) ─┬─ 구매 (index)
              ├─ 보유 (index)
              ├─ 닷컴 (index)
              ├─ 리워즈 (index)
              ├─ 앱사용 (index)
              ├─ 관심사 (index)
              ├─ CRM (index)
              ├─ SAS 360 (index)
              ├─ 닷컴 NPS (index)
              └─ CLV (index)

BAS / Brand Personality / S-CRET
→ index 없음. 국가·인구통계·기간 기반으로 내부 데이터와 매칭

Customer Voyager (Sample1~4)
→ seg_id 기반 집계 결과. Demo의 voyager_segment와 연결
```

---

## 5. 지역 코드 체계

| AP2 코드 | 지역 |
|---|---|
| `SEA` | North America |
| `SEAU` | Australia / S.E. Asia |
| `SEF` | Europe (France 등) |
| `SEG` | Europe (Germany 등) |
| `SEAS` | Europe (Austria 등) |
| `SEASA` | Latin America |
| `KOREA` | Korea |
| `SEC` | Korea (법인) |
| `SECA` | Canada |
| `SWA` | South/West Asia (India 등) |