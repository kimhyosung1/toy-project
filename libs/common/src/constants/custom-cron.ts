/**
 * 커스텀 Cron 표현식
 * https://cronexpressiontogo.com/every-10-minutes 링크에서 cron 형태 참고하면 편함
 */
export enum CustomCronExpression {
  EVERY_SECOND = '* * * * * *',
  EVERY_5_SECONDS = '*/5 * * * * *',
  EVERY_10_SECONDS = '*/10 * * * * *',
  EVERY_30_SECONDS = '*/30 * * * * *',
  EVERY_30_SECOND = '30 * * * * *',
  EVERY_MINUTE = '*/1 * * * *',
  EVERY_5_MINUTES = '0 */5 * * * *',
  EVERY_9_MINUTES = '0 */9 * * * *', // 0,9,18,27,36,45,54
  EVERY_7_MINUTES = '0 3,10,17,24,31,38,45,52,59 * * * *', // 충돌 없음
  EVERY_10_MINUTES = '0 */10 * * * *',
  EVERY_15_MINUTES = '0 */15 * * * *',
  EVERY_30_MINUTES = '0 */30 * * * *',
  EVERY_55_MINUTES = '0 */55 * * * *',
  EVERY_HOUR = '0 0-23/1 * * *',
  EVERY_2_HOURS = '0 0-23/2 * * *',
  EVERY_3_HOURS = '0 0-23/3 * * *',
  EVERY_4_HOURS = '0 0-23/4 * * *',
  EVERY_5_HOURS = '0 0-23/5 * * *',
  EVERY_6_HOURS = '0 0-23/6 * * *',
  EVERY_7_HOURS = '0 0-23/7 * * *',
  EVERY_8_HOURS = '0 0-23/8 * * *',
  EVERY_9_HOURS = '0 0-23/9 * * *',
  EVERY_10_HOURS = '0 0-23/10 * * *',
  EVERY_11_HOURS = '0 0-23/11 * * *',
  EVERY_12_HOURS = '0 0-23/12 * * *',
  EVERY_4_HOURS_1_MINUTE = '1 0-23/4 * * *',
  EVERY_4_HOURS_2_MINUTE = '2 0-23/4 * * *',
  EVERY_6_HOURS_1_MINUTE = '1 0-23/6 * * *',
  EVERY_6_HOURS_2_MINUTES = '2 0-23/6 * * *',
  EVERY_6_HOURS_3_MINUTES = '3 0-23/6 * * *',
  EVERY_DAY_AT_1AM = '0 01 * * *',
  EVERY_DAY_AT_2AM = '0 02 * * *',
  EVERY_DAY_AT_3AM = '0 03 * * *',
  EVERY_DAY_AT_3AM_20_MINUTES = '20 03 * * *',
  EVERY_DAY_AT_3AM_40_MINUTES = '40 03 * * *',
  EVERY_DAY_AT_4AM = '0 04 * * *',
  EVERY_DAY_AT_5AM = '0 05 * * *',
  EVERY_DAY_AT_6AM = '0 06 * * *',
  EVERY_DAY_AT_7AM = '0 07 * * *',
  EVERY_DAY_AT_8AM = '0 08 * * *',
  EVERY_DAY_AT_8AM_10_MINUTES = '10 08 * * *',
  EVERY_DAY_AT_8AM_30_MINUTES = '30 08 * * *',
  EVERY_DAY_AT_9AM = '0 09 * * *',
  EVERY_DAY_AT_10AM = '0 10 * * *',
  EVERY_DAY_AT_11AM = '0 11 * * *',
  EVERY_DAY_AT_NOON = '0 12 * * *',
  EVERY_DAY_AT_1PM = '0 13 * * *',
  EVERY_DAY_AT_2PM = '0 14 * * *',
  EVERY_DAY_AT_3PM = '0 15 * * *',
  EVERY_DAY_AT_4PM = '0 16 * * *',
  EVERY_DAY_AT_5PM = '0 17 * * *',
  EVERY_DAY_AT_6PM = '0 18 * * *',
  EVERY_DAY_AT_7PM = '0 19 * * *',
  EVERY_DAY_AT_8PM = '0 20 * * *',
  EVERY_DAY_AT_9PM = '0 21 * * *',
  EVERY_DAY_AT_10PM = '0 22 * * *',
  EVERY_DAY_AT_11PM = '0 23 * * *',
  EVERY_DAY_AT_10PM_59MINUTE = '59 22 * * *',
  EVERY_DAY_AT_11PM_59MINUTE = '59 23 * * *',
  EVERY_DAY_AT_9AM_10MINUTE = '10 09 * * *',
  EVERY_DAY_AT_9AM_15MINUTE = '15 09 * * *',
  EVERY_DAY_AT_9AM_20MINUTE = '20 09 * * *',
  EVERY_DAY_AT_9AM_30MINUTE = '30 09 * * *',
  EVERY_DAY_AT_9AM_35MINUTE = '35 09 * * *',
  EVERY_DAY_AT_MIDNIGHT = '0 0 * * *',
  EVERY_DAY_AT_MIDNIGHT_5MINUTE = '05 0 * * *',
  EVERY_WEEK = '0 0 * * 0',
  EVERY_WEEKDAY = '0 0 * * 1-5',
  EVERY_WEEKEND = '0 0 * * 6,0',
  EVERY_MONDAY_AT_9AM = '0 9 * * 1',
  EVERY_TUESDAY_AT_8AM = '0 8 * * 2',
  EVERY_TUESDAY_AT_8AM_10_MINUTES = '10 8 * * 2',
  EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT = '0 0 1 * *',
  EVERY_1ST_DAY_OF_MONTH_AT_NOON = '0 12 1 * *',
  EVERY_1ST_DAY_OF_MONTH_AT_9AM = '0 9 1 * *',
  EVERY_7TH_DAY_OF_MONTH_AT_9AM = '0 9 7 * *',
  EVERY_2ND_HOUR = '0 */2 * * *',
  EVERY_2ND_HOUR_FROM_1AM_THROUGH_11PM = '0 1-23/2 * * *',
  EVERY_2ND_MONTH = '0 0 1 */2 *',
  EVERY_QUARTER = '0 0 1 */3 *',
  EVERY_6_MONTHS = '0 0 1 */6 *',
  EVERY_YEAR = '0 0 1 1 *',
  EVERY_30_MINUTES_BETWEEN_9AM_AND_5PM = '0 */30 9-17 * * *',
  EVERY_30_MINUTES_BETWEEN_9AM_AND_6PM = '0 */30 9-18 * * *',
  EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM = '0 */30 10-19 * * *',
  MONDAY_TO_FRIDAY_AT_1AM = '0 0 01 * * 1-5',
  MONDAY_TO_FRIDAY_AT_2AM = '0 0 02 * * 1-5',
  MONDAY_TO_FRIDAY_AT_3AM = '0 0 03 * * 1-5',
  MONDAY_TO_FRIDAY_AT_4AM = '0 0 04 * * 1-5',
  MONDAY_TO_FRIDAY_AT_5AM = '0 0 05 * * 1-5',
  MONDAY_TO_FRIDAY_AT_6AM = '0 0 06 * * 1-5',
  MONDAY_TO_FRIDAY_AT_7AM = '0 0 07 * * 1-5',
  MONDAY_TO_FRIDAY_AT_8AM = '0 0 08 * * 1-5',
  MONDAY_TO_FRIDAY_AT_9AM = '0 0 09 * * 1-5',
  MONDAY_TO_FRIDAY_AT_09_30AM = '0 30 09 * * 1-5',
  MONDAY_TO_FRIDAY_AT_10AM = '0 0 10 * * 1-5',
  MONDAY_TO_FRIDAY_AT_11AM = '0 0 11 * * 1-5',
  MONDAY_TO_FRIDAY_AT_11_30AM = '0 30 11 * * 1-5',
  MONDAY_TO_FRIDAY_AT_12PM = '0 0 12 * * 1-5',
  MONDAY_TO_FRIDAY_AT_1PM = '0 0 13 * * 1-5',
  MONDAY_TO_FRIDAY_AT_2PM = '0 0 14 * * 1-5',
  MONDAY_TO_FRIDAY_AT_3PM = '0 0 15 * * 1-5',
  MONDAY_TO_FRIDAY_AT_4PM = '0 0 16 * * 1-5',
  MONDAY_TO_FRIDAY_AT_5PM = '0 0 17 * * 1-5',
  MONDAY_TO_FRIDAY_AT_6PM = '0 0 18 * * 1-5',
  MONDAY_TO_FRIDAY_AT_7PM = '0 0 19 * * 1-5',
  MONDAY_TO_FRIDAY_AT_8PM = '0 0 20 * * 1-5',
  MONDAY_TO_FRIDAY_AT_9PM = '0 0 21 * * 1-5',
  MONDAY_TO_FRIDAY_AT_10PM = '0 0 22 * * 1-5',
  MONDAY_TO_FRIDAY_AT_11PM = '0 0 23 * * 1-5',

  EVERY_DAY_AT_11AM_00MINUTE = '00 11 * * *',
  EVERY_DAY_AT_11AM_05MINUTE = '05 11 * * *',
  EVERY_DAY_AT_11AM_10MINUTE = '10 11 * * *',
  EVERY_DAY_AT_11AM_15MINUTE = '15 11 * * *',
  EVERY_DAY_AT_11AM_20MINUTE = '20 11 * * *',
  EVERY_DAY_AT_11AM_25MINUTE = '25 11 * * *',
  EVERY_DAY_AT_11AM_30MINUTE = '30 11 * * *',
  EVERY_DAY_AT_11AM_35MINUTE = '35 11 * * *',

  EVERY_DAY_AT_11AM_AND_5PM = '0 11,17 * * *',
}

/**
 * 커스텀 밀리초 기반 인터벌 표현식
 * https://www.google.com/search?q=1초+ms 링크에서 원하는 시간 ms로 변환
 */
export enum CustomMsCronExpression {
  TEST = 6000, // 6초
  EVERY_MINUTE = 60000, // 1분
  EVERY_5_MINUTES = 300000, // 5분
  EVERY_10_MINUTES = 600000, // 10분
  EVERY_15_MINUTES = 900000, // 15분
  EVERY_20_MINUTES = 1200000, // 20분
  EVERY_27_MINUTES = 1620000, // 27분
  EVERY_28_MINUTES = 1680000, // 28분
  EVERY_29_MINUTES = 1740000, // 29분
  EVERY_30_MINUTES = 1800000, // 30분
  EVERY_31_MINUTES = 1860000, // 31분
  EVERY_32_MINUTES = 1920000, // 32분
  EVERY_33_MINUTES = 1980000, // 33분
  EVERY_34_MINUTES = 2040000, // 34분
  EVERY_35_MINUTES = 2100000, // 35분
  EVERY_HOUR = 3600000, // 1시간
  EVERY_2_HOURS = 7200000, // 2시간
  EVERY_4_HOURS = 14400000, // 4시간
  EVERY_6_HOURS = 21600000, // 6시간
  EVERY_12_HOURS = 43200000, // 12시간
  EVERY_DAY = 86400000, // 24시간
}

/**
 * 환경별 실행 제어
 */
export enum Environment {
  DEVELOPMENT = 'dev',
  QA = 'qa',
  PRODUCTION = 'prod',
}

/**
 * 스케줄러 작업 타입
 */
export enum SchedulerJobType {
  BOARD_CLEANUP = 'board_cleanup',
  NOTIFICATION_BATCH = 'notification_batch',
  DATA_ARCHIVE = 'data_archive',
  HEALTH_CHECK = 'health_check',
  STATISTICS = 'statistics',
  KEYWORD_MATCHING = 'keyword_matching',
}
