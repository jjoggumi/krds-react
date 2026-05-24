/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AbstractJsonSchemaPropertyObject {
  title?: string;
  readOnly?: boolean;
}

export interface Item {
  type?: string;
  properties?: Record<string, AbstractJsonSchemaPropertyObject>;
  requiredProperties?: string[];
}

export interface JsonSchema {
  title?: string;
  description?: string;
  properties?: Record<string, AbstractJsonSchemaPropertyObject>;
  requiredProperties?: string[];
  definitions?: Record<string, Item>;
  type?: string;
  $schema?: string;
}

export interface RepresentationModelObject {
  _links?: Links;
}

export interface EntityModelAppVersion {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  version?: string;
  versionMin?: string;
  versionCode?: string;
  versionMinCode?: string;
  forceUsed?: boolean;
  osType?: "ANDROID" | "IOS" | "ETC";
  optionMessage?: string;
  memo?: string;
  _version?: string;
  _osType?: "ANDROID" | "IOS" | "ETC";
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export type Links = Record<string, Link>;

export interface UserView {
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  userName?: string;
  userPhoto?: string;
  userMobile?: string;
  userSns?: string;
  loginId?: string;
  userChatDay?: string;
  userChatStartTime?: string;
  userChatEndTime?: string;
  userStatus?: "ACTIVATE" | "DEACTIVATE";
  userPushUsed?: boolean;
  maskingUserName?: boolean;
  maskingUserMobile?: boolean;
  /** @format uuid */
  currentId?: string;
  isChat?: boolean;
}

export interface EntityModelSchool {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  alarmPlusUsed?: boolean;
  alarmUsed?: boolean;
  noticeUsed?: boolean;
  mealUsed?: boolean;
  alarmEduOfficeUsed?: boolean;
  timetableNeisUsed?: boolean;
  schoolArea?:
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU";
  /** @format int32 */
  schoolSigungu?: number;
  schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  /** @format int32 */
  schoolCodeIscream?: number;
  schoolCodeNeis?: string;
  neisOpenApiCode?: string;
  crawlingNeisInfo?: string;
  crawlingNeisMenu?: string;
  crawlingNeisSchedule?: string;
  crawlingHomeAlert?: string;
  crawlingHomeNotice?: string;
  crawlingHomeMenu?: string;
  crawlingNeisInfoEnable?: boolean;
  crawlingNeisMenuEnable?: boolean;
  crawlingNeisScheduleEnable?: boolean;
  crawlingHomeAlertEnable?: boolean;
  crawlingHomeNoticeEnable?: boolean;
  crawlingHomeMenuEnable?: boolean;
  schoolName?: string;
  schoolAddress?: string;
  schoolImagePath?: string;
  schoolStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING";
  schoolUrl?: string;
  memo?: string;
  _schoolName?: string;
  _schoolStatus?: ("ACTIVATE" | "DEACTIVATE" | "CLOSING")[];
  _schoolArea?:
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU";
  _schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  _schoolCodeNeis?: string;
  /** @format int32 */
  _schoolCodeIscream?: number;
  _neisOpenApiCode?: string;
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface EntityModelUserAccount {
  roles?: string[];
  _links?: Links;
}

export interface ClazzView {
  className?: string;
  classImagePath?: string;
  classYear?: string;
  classGrade?: string;
  classGradeCode?:
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO";
  classBan?: string;
  classStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING" | "CLOSED";
  school?: SchoolView;
  classOwner?: UserView;
  /** @format uuid */
  currentId?: string;
}

export interface EntityModelClazzInviteCard {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  invitePhone?: string;
  clazz?: ClazzView;
  school?: SchoolView;
  _invitePhone?: string;
  _links?: Links;
}

export interface SchoolView {
  schoolName?: string;
  schoolAddress?: string;
  schoolImagePath?: string;
  schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  schoolStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING";
  schoolArea?:
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU";
  /** @format int32 */
  schoolCodeIscream?: number;
  alarmPlusUsed?: boolean;
  alarmEduOfficeUsed?: boolean;
  timetableNeisUsed?: boolean;
  /** @format uuid */
  currentId?: string;
}

export interface EntityModelCertification {
  /** @format int64 */
  seq?: number;
  phone?: string;
  certNumber?: string;
  /** @format int64 */
  timestamp?: number;
  last?: boolean;
  result?:
    | "SUCCESS"
    | "FAIL"
    | "INVALID_PHONE"
    | "INVALID_NAME"
    | "DUPLICATE_SNS";
  resultCertNumber?:
    | "SUCCESS"
    | "FAIL"
    | "INVALID_PHONE"
    | "INVALID_NAME"
    | "DUPLICATE_SNS";
  resultUpdate?:
    | "SUCCESS"
    | "FAIL"
    | "INVALID_PHONE"
    | "INVALID_NAME"
    | "DUPLICATE_SNS";
  resultUserName?:
    | "SUCCESS"
    | "FAIL"
    | "INVALID_PHONE"
    | "INVALID_NAME"
    | "DUPLICATE_SNS";
  reason?: string;
  snsType?: string;
  userName?: string;
  _phone?: string;
  _certNumber?: string;
  _links?: Links;
}

export interface EntityModelHelpSuggest {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  title?: string;
  content?: string;
  phone?: string;
  proceedStatus?: "UNTREATED" | "COMPLETE" | "INPROGRESS" | "HOLD";
  memo?: string;
  /** @uniqueItems true */
  files?: File[];
  _timestamp?: number[];
  _proceedStatus?: "UNTREATED" | "COMPLETE" | "INPROGRESS" | "HOLD";
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  _keyword?: string;
  _insertedUserName?: string;
  _updatedUserName?: string;
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface File {
  /** @format int64 */
  seq?: number;
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileFlag?: "FILE" | "THUMBNAIL" | "IMAGE_PACK";
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  /** @format int64 */
  insertedTimestamp?: number;
}

export interface EntityModelSectionDetail {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  sectionId?: number;
  /** @format int32 */
  sortNo: number;
  type: "CONTENTS" | "LINK_TEXT";
  contentsType:
    | "POST"
    | "LINK"
    | "MENU"
    | "POST_FEED"
    | "KEYWORD"
    | "CP_HOME"
    | "OFFERWALL_BANNER"
    | "OFFERWALL_GROUP";
  contents?: string;
  titlePoint?: string;
  title?: string;
  titleSub?: string;
  del: boolean;
  file?: SectionDetailFile;
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export interface SectionDetailFile {
  /** @format int64 */
  seq?: number;
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileFlag?: "FILE" | "THUMBNAIL" | "IMAGE_PACK";
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  /** @format int64 */
  insertedTimestamp?: number;
}

export interface EntityModelEducationLetterPushLog {
  /** @format uuid */
  pushGroupId?: string;
  /** @format uuid */
  elEducationLetterId?: string;
  /** @format uuid */
  elStudentId?: string;
  mobile?: string;
  /** @format uuid */
  userId?: string;
  /** @format uuid */
  insertedUser?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  notificationType?: "PUSH" | "SMS";
  mid?: string;
  sendType?: "IMMEDIATELY" | "RESERVATION";
  /** @format int64 */
  sendTimestamp?: number;
  /** @format uuid */
  postsId?: string;
  pushYn?: "Y" | "N";
  /** @format int64 */
  pushTimestamp?: number;
  pushStatus?: "I" | "C" | "E" | "D";
  _links?: Links;
}

export interface EntityModelMvoip {
  channelId?: string;
  /** @format uuid */
  sendId?: string;
  sendIuid?: string;
  sendAuthkey?: string;
  /** @format uuid */
  recvId?: string;
  recvIuid?: string;
  recvAuthkey?: string;
  /** @format uuid */
  classId?: string;
  status?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  sendDelete?: string;
  recvDelete?: string;
  /** @format uuid */
  id?: string;
  _links?: Links;
}

export interface EducationLetterFileView {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  fileName?: string;
  fileContentType?: string;
  /** @format int64 */
  fileSize?: number;
  /** @format int64 */
  lastModified?: number;
  fileOriginalPath?: string;
  fileConvertPath?: string;
  originalFileName?: string;
  /** @format uuid */
  currentId?: string;
}

export interface EntityModelSchoolManager {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  year?: string;
  name?: string;
  mobile?: string;
  job?: string;
  domain?: string;
  approvalStatus?: "CONSENT" | "REJECTION" | "WAITING";
  /** @format int64 */
  approvalTimestamp?: number;
  memo?: string;
  mid?: string;
  hasMaster?: boolean;
  /** @format uuid */
  masterUserId?: string;
  masterUserName?: string;
  school?: SchoolView;
  user?: UserView;
  approvalUser?: UserView;
  file?: EducationLetterFileView;
  _approvalTimestamp?: number[];
  _schoolName?: string;
  _name?: string;
  _approvalStatus?: "CONSENT" | "REJECTION" | "WAITING";
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface User {
  /** @format uuid */
  userId?: string;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  userSns?: string;
  userName?: string;
  userPhoto?: string;
  loginId?: string;
  loginPassword?: string;
  userGender?: "MALE" | "FEMALE";
  /** @format int32 */
  userNumber?: number;
  userBirthday?: string;
  userTel?: string;
  userMobile?: string;
  userEmail?: string;
  userAddressZipcode?: string;
  userAddress1?: string;
  userAddress2?: string;
  userMarketingUsed?: boolean;
  /** @format int64 */
  userMarketingTimestamp?: number;
  userPushUsed?: boolean;
  /** @format int64 */
  userPushTimestamp?: number;
  userBlockStart?: string;
  userBlockEnd?: string;
  userStatus?: "ACTIVATE" | "DEACTIVATE";
  userTeacherAuth?: "GPKIAUTH" | "ADMINAUTH" | "HICLASS" | "NOAUTH";
  userChatDay?: string;
  userChatStartTime?: string;
  userChatEndTime?: string;
  /** @format int64 */
  expiredTimestamp?: number;
  memo?: string;
  department?: string;
  userAdminRole?: string;
  userCpId?: string;
  userSignImagePath?: string;
  /** @format int64 */
  userSignTimestamp?: number;
  userApprovalSignImagePath?: string;
  /** @format int64 */
  userApprovalSignTimestamp?: number;
  deviceInfo?: "PC" | "ANDROID" | "IOS";
  insertedUser?: UserView;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  _userId?: string;
  _loginId?: string;
  _userSns?: string;
  _userName?: string;
  _userEmail?: string;
  _userMobile?: string;
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  _userStatus?: "ACTIVATE" | "DEACTIVATE";
  _insertedTimestamp?: number[];
  /** @format uuid */
  currentId?: string;
  isChat?: boolean;
}

export interface EntityModelUser {
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  userSns?: string;
  userName?: string;
  userPhoto?: string;
  loginId?: string;
  loginPassword?: string;
  userGender?: "MALE" | "FEMALE";
  /** @format int32 */
  userNumber?: number;
  userBirthday?: string;
  userTel?: string;
  userMobile?: string;
  userEmail?: string;
  userAddressZipcode?: string;
  userAddress1?: string;
  userAddress2?: string;
  userMarketingUsed?: boolean;
  /** @format int64 */
  userMarketingTimestamp?: number;
  userPushUsed?: boolean;
  /** @format int64 */
  userPushTimestamp?: number;
  userBlockStart?: string;
  userBlockEnd?: string;
  userStatus?: "ACTIVATE" | "DEACTIVATE";
  userTeacherAuth?: "GPKIAUTH" | "ADMINAUTH" | "HICLASS" | "NOAUTH";
  userChatDay?: string;
  userChatStartTime?: string;
  userChatEndTime?: string;
  /** @format int64 */
  expiredTimestamp?: number;
  memo?: string;
  department?: string;
  userAdminRole?: string;
  userCpId?: string;
  userSignImagePath?: string;
  /** @format int64 */
  userSignTimestamp?: number;
  userApprovalSignImagePath?: string;
  /** @format int64 */
  userApprovalSignTimestamp?: number;
  deviceInfo?: "PC" | "ANDROID" | "IOS";
  insertedUser?: UserView;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  _userId?: string;
  _loginId?: string;
  _userSns?: string;
  _userName?: string;
  _userEmail?: string;
  _userMobile?: string;
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  _userStatus?: "ACTIVATE" | "DEACTIVATE";
  _insertedTimestamp?: number[];
  /** @format uuid */
  currentId?: string;
  isChat?: boolean;
  _links?: Links;
}

export interface ClazzSubscribe {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  memberId?: string;
  memberChildName?: string;
  /** @format int32 */
  memberClassNumber?: number;
  memberStatus?: "APPLY" | "ACCEPT" | "DENIAL";
  memberRole?: "OWNER" | "MANAGER" | "MEMBER";
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  /** @format int64 */
  acceptedTimestamp?: number;
  /** @format int64 */
  specifiedTimestamp?: number;
  memberStatusCheck?: string;
  user?: UserView;
  clazz?: ClazzView;
  /** @format int32 */
  sortNo?: number;
  /** @format uuid */
  profileId?: string;
  _clazz?: ClazzView;
  _user?: UserView;
  _userName?: string;
  _memberRole?: ("OWNER" | "MANAGER" | "MEMBER")[];
  _memberStatus?: "APPLY" | "ACCEPT" | "DENIAL";
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  /** @format int64 */
  _insertedTimestampLte?: number;
  /** @format uuid */
  currentId?: string;
}

export interface EntityModelNotificationBox {
  title?: string;
  messageCode?: string;
  content?: string;
  /** @format int64 */
  timestamp?: number;
  isRead?: boolean;
  user?: UserView;
  writeUser?: UserView;
  clazz?: ClazzView;
  school?: SchoolView;
  clazzSubscribe?: ClazzSubscribe;
  post?: PostView;
  survey?: SurveyView;
  /** @format uuid */
  contentId?: string;
  _user?: UserView;
  _isRead?: boolean;
  _messageCode?: string[];
  _links?: Links;
}

export interface PostView {
  postTitle?: string;
  postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
  del?: boolean;
  parentId?: string;
  /** @format uuid */
  boardId?: string;
  pushTarget?: "ALL" | "TEACHER" | "PARENTS" | "STUDENT";
  version?: "V1" | "V2";
  /** @format uuid */
  currentId?: string;
}

export interface SurveyView {
  surveyType:
    | "SURVEY"
    | "VOTE"
    | "AFTER_SCHOOL"
    | "CONSULTATION"
    | "FCFS"
    | "DRAW";
  surveyStatus:
    | "SHARE"
    | "KEEP"
    | "TEMPORARY"
    | "COMPLETE"
    | "RESERVATION"
    | "WAITING"
    | "DOING"
    | "END";
  isDel: boolean;
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  currentId?: string;
}

export interface EntityModelPushSchedule {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  channelType?: "PUSH" | "SMS" | "MMS";
  title?: string;
  content?: string;
  linkType?: string;
  link?: string;
  disclosureType?: boolean;
  /** @format int64 */
  reservationTimestamp?: number;
  pushStatus?: "RESERVATION" | "COMPLETE" | "CANCEL" | "FAIL";
  marketingCheckUsed?: boolean;
  mid?: string;
  messageCode?: string;
  /** @uniqueItems true */
  target?: string[];
  _reservationTimestamp?: number[];
  _linkType?: string;
  _content?: string;
  _pushStatus?: ("RESERVATION" | "COMPLETE" | "CANCEL" | "FAIL")[];
  _channelType?: ("PUSH" | "SMS" | "MMS")[];
  /** @uniqueItems true */
  userType?: string[];
  /** @uniqueItems true */
  osType?: string[];
  /** @uniqueItems true */
  classGrade?: string[];
  /** @uniqueItems true */
  schoolArea?: string[];
  _links?: Links;
}

export interface EntityModelUserDevice {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  osType?: "ANDROID" | "IOS" | "ETC";
  osVersion?: string;
  model?: string;
  version?: string;
  last?: boolean;
  user?: UserView;
  _user?: UserView;
  _userId?: string[];
  _last?: boolean;
  pushTokenId?: string;
  _links?: Links;
}

export interface EntityModelCalenderHoliday {
  /** @format int32 */
  year?: number;
  /** @format int32 */
  month?: number;
  /** @format int32 */
  day?: number;
  name?: string;
  yyyymmdd?: string;
  _year?: string[];
  _month?: string[];
  _day?: string[];
  _yyyymmdd?: string[];
  _links?: Links;
}

export interface EntityModelUserLike {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  post?: PostView;
  user?: UserView;
  _user?: UserView;
  _post?: PostView[];
  _posted?: number[];
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface EntityModelBannedWord {
  word?: string;
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export interface EntityModelInformation {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  infoTitle?: string;
  infoType?: "EDUCATION" | "EVENT" | "BANNER" | "HINOTICE";
  infoStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING";
  infoImagePath?: string;
  _infoTitle?: string;
  _infoType?: string;
  _infoStatus?: string;
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface CsAdviceCategory {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  csCategorySeq?: number;
  /** @format int64 */
  prntsCategorySeq?: number;
  prntsCategoryTitle?: string;
  categoryTitle?: string;
  /** @format int64 */
  categoryDepth?: number;
  del?: boolean;
  /** @format int64 */
  _prntsCategorySeq?: number;
  _categoryTitle?: string;
  /** @format int64 */
  _categoryDepth?: number;
  _del?: boolean;
  /** @format int64 */
  currentId?: number;
}

export interface EntityModelCsAdviceCategory {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  prntsCategorySeq?: number;
  prntsCategoryTitle?: string;
  categoryTitle?: string;
  /** @format int64 */
  categoryDepth?: number;
  del?: boolean;
  /** @format int64 */
  _prntsCategorySeq?: number;
  _categoryTitle?: string;
  /** @format int64 */
  _categoryDepth?: number;
  _del?: boolean;
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export interface EntityModelSurveyEditPage {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  surveyId: string;
  pageName?: string;
  isCustom: boolean;
  isDel: boolean;
  /** @format int32 */
  sortNo: number;
  /** @format uuid */
  linkPageId?: string;
  _links?: Links;
}

export interface EntityModelOnceCheck {
  flag?: string;
  user?: UserView;
  _flag?: string;
  _user?: UserView;
  _links?: Links;
}

export interface EntityModelHelpChat {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  email?: string;
  phone?: string;
  userName?: string;
  pcSpec?: string;
  browser?: string;
  modelName?: string;
  softwareVersion?: string;
  modelNumber?: string;
  appVersion?: string;
  contentQuestion?: string;
  contentAnswer?: string;
  memo?: string;
  proceedStatus?:
    | "INPROGRESS"
    | "COMPLETE"
    | "TRANSREQUEST"
    | "TRANSCOMPLETE"
    | "CSREQUEST"
    | "CSRECOMPLETE"
    | "ALLCOMPLETE";
  user?: UserView;
  helpChatCategory?: HelpChatCategoryView;
  /** @uniqueItems true */
  files?: File[];
  _deviceInfo?: string[];
  _contentQuestion?: string;
  _contentAnswer?: string;
  _keyword?: string;
  _timestamp?: number[];
  _helpChatCategory?: HelpChatCategoryView;
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  _proceedStatus?:
    | "INPROGRESS"
    | "COMPLETE"
    | "TRANSREQUEST"
    | "TRANSCOMPLETE"
    | "CSREQUEST"
    | "CSRECOMPLETE"
    | "ALLCOMPLETE";
  _phone?: string;
  _insertedLoginId?: string;
  _insertedUserName?: string;
  _updatedUserName?: string;
  _user?: UserView;
  /** @format uuid */
  currentId?: string;
  /** @uniqueItems true */
  deviceInfo?: string[];
  _links?: Links;
}

export interface HelpChatCategoryView {
  categoryTitle?: string;
  used?: boolean;
  /** @format int64 */
  currentId?: number;
}

export interface EntityModelSticker {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  packName?: string;
  packThumbnail?: string;
  /** @format int64 */
  packVersion?: number;
  /** @format int64 */
  packOrder?: number;
  del?: boolean;
  userType?: string;
  /** @uniqueItems true */
  userTypes?: StickerUserType[];
  /** @uniqueItems true */
  stickerItem?: StickerItems[];
  _timestamp?: number[];
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  _packName?: string;
  _del?: boolean;
  /** @format int64 */
  _packOrder?: number;
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export interface StickerItems {
  /** @format int64 */
  stickerSeq?: number;
  stickerName?: string;
  stickerThumbnail?: string;
  stickerUrl?: string;
  contentType?: string;
  /** @format int64 */
  stickerOrder?: number;
  used?: boolean;
  /** @format int64 */
  currentId?: number;
}

export interface StickerUserType {
  userType?: string;
}

export interface EntityModelUserAdminSearch {
  loginId?: string;
  userName?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  userStatus?: "ACTIVATE" | "DEACTIVATE";
  role?: UserAdminRole;
  /** @format uuid */
  _userId?: string;
  _loginId?: string;
  _userName?: string;
  _userAdminRole?: string;
  _userStatus?: "ACTIVATE" | "DEACTIVATE";
  _insertedTimestamp?: number[];
  _links?: Links;
}

export interface UserAdminRole {
  /** @format uuid */
  userId?: string;
  userAdminRole?: string;
  userCpId?: string;
}

export interface EntityModelClazz {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  className?: string;
  classYear?: string;
  classGrade?: string;
  classGradeCode?:
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO";
  classBan?: string;
  classImagePath?: string;
  classInviteCode?: string;
  classStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING" | "CLOSED";
  /** @format int64 */
  classClosedTimestamp?: number;
  /** @format int64 */
  classDeactivateTimestamp?: number;
  applyUsed?: boolean;
  /** @format int32 */
  classAbsentMaxDays?: number;
  /** @format int32 */
  classFieldStudyMaxDays?: number;
  attendanceUsed?: boolean;
  attendanceFileUsed?: boolean;
  attendanceFieldStudyUsed?: boolean;
  classType?: "CLASS" | "SCHOOL";
  classSchoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  imageTitle?: string;
  imageBackgroundColor?: string;
  imageBackgroundPath?: string;
  /** @format int64 */
  classSubscribeCount?: number;
  school?: SchoolView;
  classOwner?: UserView;
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface PostHomeworkUserComment {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  commentId?: string;
  comment?: string;
  emoticonPath?: string;
  del?: boolean;
  writeUser?: object;
  postHomeworkUser?: PostHomeworkUserSearch;
  user?: UserView;
  /** @format uuid */
  currentId?: string;
}

export interface PostHomeworkUserSearch {
  /** @format uuid */
  workId?: string;
  workContent?: string;
  del?: boolean;
  /** @format int64 */
  insertedTimestamp?: number;
  /** @format int64 */
  updatedTimestamp?: number;
  post?: PostView;
  user?: UserView;
  /** @uniqueItems true */
  files?: File[];
  postIds?: string[];
  userIds?: string[];
  /** @format uuid */
  currentId?: string;
}

export interface EntityModelPostHomeworkUserComment {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  comment?: string;
  emoticonPath?: string;
  del?: boolean;
  writeUser?: object;
  postHomeworkUser?: PostHomeworkUserSearch;
  user?: UserView;
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface EntityModelHelpNotice {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  noticeTitle?: string;
  noticeContent?: string;
  noticeMustRead?: boolean;
  /** @format int64 */
  posted?: number;
  postStatus?:
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT";
  disclosureType?: boolean;
  /** @format int32 */
  readCount?: number;
  _keyword?: string;
  _noticeTitle?: string;
  _noticeContent?: string;
  /** @format int64 */
  _postedLte?: number;
  _postLand?: string[];
  _userType?: string[];
  _postStatus?: (
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT"
  )[];
  /** @uniqueItems true */
  userType?: string[];
  /** @format uuid */
  currentId?: string;
  /** @uniqueItems true */
  postLand?: string[];
  _links?: Links;
}

export interface EntityModelSectionLink {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  uniqueCode?: string;
  url?: string;
  linkType: "INTERNAL" | "EXTERNAL" | "POST" | "LINK" | "MENU" | "CP_HOME";
  cpId?: string;
  comment?: string;
  del: boolean;
  currentId?: string;
  _links?: Links;
}

export interface EntityModelHelpFaqCategory {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  categoryTitle?: string;
  /** @format int32 */
  sortNo?: number;
  used?: boolean;
  faqType?: "DEFAULT" | "NONMEMBER";
  isReadTeacher: boolean;
  isReadParents: boolean;
  isReadStudent: boolean;
  _categoryTitle?: string;
  _used?: boolean;
  _faqType?: ("DEFAULT" | "NONMEMBER")[];
  _isReadTeacher?: boolean;
  _isReadParents?: boolean;
  _isReadStudent?: boolean;
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export interface EntityModelPostCommentReport {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  reason?: string;
  status?: "WAITING" | "CONSENT" | "REJECTION";
  del?: boolean;
  memo?: string;
  postComment?: PostComment;
  _postComment?: PostComment;
  _status?: "WAITING" | "CONSENT" | "REJECTION";
  _del?: boolean;
  _postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
  _keyword?: string;
  _loginId?: string;
  _userName?: string;
  _insertedTimestamp?: number[];
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface PostComment {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  commentId?: string;
  comment?: string;
  emoticonPath?: string;
  del?: boolean;
  secret?: boolean;
  /** @format uuid */
  parentCommentId?: string;
  /** @format int32 */
  depth?: number;
  post?: PostCommentPostView;
  user?: UserView;
  /** @uniqueItems true */
  files?: PostCommentFile[];
  /** @format uuid */
  currentId?: string;
}

export interface PostCommentFile {
  /** @format int64 */
  seq?: number;
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileFlag?: "FILE" | "THUMBNAIL" | "IMAGE_PACK";
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  requestId?: string;
  /** @format int64 */
  currentId?: number;
}

export interface PostCommentPostView {
  postTitle?: string;
  postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
  del?: boolean;
  parentId?: string;
  categoryId?: string;
  /** @format uuid */
  boardId?: string;
  version?: "V1" | "V2";
  /** @format uuid */
  insertedUserId?: string;
  /** @format uuid */
  currentId?: string;
}

export interface BoardFolderResponseDto {
  folderId?: string;
  folderName?: string;
  color?: string;
}

export interface BoardPermissionDto {
  isReadable?: boolean;
  isWritable?: boolean;
  isCommentable?: boolean;
  /** @uniqueItems true */
  readUserTypes?: (
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER"
  )[];
  /** @format int64 */
  readCount?: number;
  /** @format int64 */
  writeCount?: number;
  /** @format int64 */
  commentCount?: number;
  permissionByBoardUser?: BoardUser;
  boardCounts?: SecretBoardCountDto;
}

export interface BoardResponseDto {
  /** @format uuid */
  boardId?: string;
  /** @format uuid */
  classId?: string;
  boardType?: "PUBLIC" | "SECRET";
  boardName?: string;
  isDefault?: boolean;
  boardStatus?: "ACTIVATE" | "DEACTIVATE";
  isUsedFolder?: boolean;
  postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
  isWriteParents?: boolean;
  isWriteStudent?: boolean;
  isReadParents?: boolean;
  isReadStudent?: boolean;
  isUsedComment?: boolean;
  isCommentParents?: boolean;
  isCommentStudent?: boolean;
  isUsedLike?: boolean;
  boardPermission?: BoardPermissionDto;
}

export interface BoardUser {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  boardId: string;
  /** @format uuid */
  userId: string;
  /** @format uuid */
  parentId: string;
  isWritable: boolean;
  isCommentable: boolean;
  isDel: boolean;
}

export interface ClazzPostPermission {
  /** @format uuid */
  classId?: string;
  classStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING" | "CLOSED";
  applyUsed?: boolean;
  /** @format int32 */
  classAbsentMaxDays?: number;
  /** @format int32 */
  classFieldStudyMaxDays?: number;
  attendanceUsed?: boolean;
}

export interface CpCategoryView {
  cpCategoryId?: string;
  name?: string;
  currentId?: string;
}

export interface EducationLetterUserView {
  /** @format uuid */
  educationLetterId?: string;
  /** @format uuid */
  currentId?: string;
  /** @format uuid */
  userId?: string;
  /** @format uuid */
  postId?: string;
  /** @format uuid */
  schoolId?: string;
  letterType?:
    | "CONSULTATION"
    | "QUESTIONNAIRE"
    | "AFTER_SCHOOL"
    | "GENERAL"
    | "TKBELL"
    | "EDU_OFFICE"
    | "MEAL_BREAKFAST"
    | "MEAL_LUNCH"
    | "MEAL_DINNER";
  title?: string;
  contents?: string;
  secretNameYn?: string;
  /** @format int64 */
  startTimestamp?: number;
  /** @format int64 */
  endTimestamp?: number;
  letterStatus?: string;
  letterStatusIcon?: string;
  replyYn?: string;
  answer?: "NONE" | "NO" | "YES";
  studentInfoArray?: string;
  studentNameArray?: string;
  detailUri?: string;
  detailUriPrefix?: string;
  teacherDetailUriPrefix?: string;
  isFirstCome?: boolean;
  replyYnTextSub?: string;
  replyYnText?: string;
}

export interface NotificationId {
  /** @format uuid */
  id?: string;
  /** @format int32 */
  notificationId?: number;
}

export interface Post {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  eventView?: string;
  /** @format uuid */
  postId?: string;
  /** @format int64 */
  posted?: number;
  postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
  postTitlePoint?: string;
  postTitle?: string;
  postTitleSub?: string;
  postContent?: string;
  postStatus?:
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT";
  postMustRead?: boolean;
  postPin?: boolean;
  parentUri?: string;
  /** @format uuid */
  boardId?: string;
  categoryId?: string;
  parent?: object;
  category?: CpCategoryView;
  board?: BoardResponseDto;
  folder?: BoardFolderResponseDto;
  /** @format int32 */
  readCount?: number;
  /** @format int32 */
  forwardingCount?: number;
  postCommentUsed?: boolean;
  del?: boolean;
  disclosureType?: boolean;
  pushUsed?: boolean;
  pushTarget?: "ALL" | "TEACHER" | "PARENTS" | "STUDENT";
  currentPushTarget?: "ALL" | "TEACHER" | "PARENTS" | "STUDENT";
  pushFlag?: boolean;
  /** @format uuid */
  alarmPlusId?: string;
  /** @format int64 */
  adWebId?: number;
  /** @format int64 */
  adAosId?: number;
  /** @format int64 */
  adIosId?: number;
  /** @uniqueItems true */
  schoolSigungu?: number[];
  /** @format int64 */
  statusCount?: number;
  postStatusCheck?: string;
  /** @format int64 */
  postReadUserCount?: number;
  /** @format int64 */
  scrapCount?: number;
  /** @format int64 */
  shareCount?: number;
  /** @format int64 */
  likeCount?: number;
  /** @format int64 */
  commentCount?: number;
  isLike?: boolean;
  isScrap?: boolean;
  isRead?: boolean;
  homeworkType?: string;
  version?: "V1" | "V2";
  deviceType?: "WEB" | "APP" | "IOS" | "ANDROID";
  bannerType?: "POPUP" | "BANNER";
  positionType?:
    | "WEB_POPUP_HOME"
    | "WEB_POPUP_CHAT"
    | "WEB_POPUP_EDUCATION"
    | "WEB_POPUP_CLASS"
    | "WEB_POPUP_SCHOOL"
    | "WEB_BANNER_HOME_FEED"
    | "WEB_BANNER_QUICK"
    | "WEB_BANNER_QUICK_CLASS"
    | "WEB_BANNER_LNB"
    | "WEB_BANNER_RNB"
    | "APP_POPUP_SPLASH_SCREEN"
    | "APP_POPUP_ENDING_SCREEN"
    | "APP_POPUP_HOME"
    | "APP_POPUP_CLASS"
    | "APP_POPUP_CALENDER"
    | "APP_POPUP_SCHOOL"
    | "APP_BANNER_HOME"
    | "APP_BANNER_CLASS"
    | "APP_BANNER_CLASS_B"
    | "APP_BANNER_CLASS_B_FOR_NEW_USER"
    | "APP_BANNER_CONTENT"
    | "APP_BANNER_TIMETABLE"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "FLOATING_BANNER"
    | "NOTIFICATION_BOX"
    | "BANNER_MORE_FEED"
    | "BANNER_TOP"
    | "HITALK_MAIN_TITLE"
    | "HITALK_MAIN_CARD"
    | "HITALK_MAIN_BANNER_A"
    | "HITALK_ROOM_LIST";
  /** @format int32 */
  positionOrderType?: number;
  popupType?: "LAYER" | "MODAL" | "WINDOW";
  /** @format int32 */
  locationX?: number;
  /** @format int32 */
  locationY?: number;
  /** @format int64 */
  timestampStart?: number;
  /** @format int64 */
  timestampEnd?: number;
  link?: string;
  linkTarget?: string;
  replayType?: "NONE" | "NOTTODAY" | "ANYMORE";
  adType?: "INTERNAL" | "EXTERNAL";
  linkType?: "INTERNAL" | "EXTERNAL" | "POST" | "LINK" | "MENU" | "CP_HOME";
  memo?: string;
  letterType?:
    | "CONSULTATION"
    | "QUESTIONNAIRE"
    | "AFTER_SCHOOL"
    | "GENERAL"
    | "TKBELL"
    | "EDU_OFFICE"
    | "MEAL_BREAKFAST"
    | "MEAL_LUNCH"
    | "MEAL_DINNER";
  /** @uniqueItems true */
  files?: File[];
  /** @uniqueItems true */
  parentRole?: string[];
  alarmPlus?: EducationLetterUserView;
  writeUser?: object;
  notificationId?: NotificationId;
  postOptions?: PostOption[];
  _keyword?: string;
  _postType?: (
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE"
  )[];
  _postStatus?: (
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT"
  )[];
  _pushTarget?: ("ALL" | "TEACHER" | "PARENTS" | "STUDENT")[];
  _posted?: number[];
  _insertedTimestamp?: number[];
  /** @format int64 */
  _postedLte?: number;
  /** @format int64 */
  _postedGte?: number;
  _parentUri?: string[];
  _schoolId?: string;
  _parentId?: string;
  _categoryId?: string[];
  _schoolArea?: string[];
  _classGrade?: string[];
  _postLand?: string[];
  _userType?: string[];
  _postKeyword?: string[];
  _del?: boolean;
  _parentRole?: string[];
  _deviceType?: ("WEB" | "APP" | "IOS" | "ANDROID")[];
  _bannerType?: ("POPUP" | "BANNER")[];
  _positionType?: (
    | "WEB_POPUP_HOME"
    | "WEB_POPUP_CHAT"
    | "WEB_POPUP_EDUCATION"
    | "WEB_POPUP_CLASS"
    | "WEB_POPUP_SCHOOL"
    | "WEB_BANNER_HOME_FEED"
    | "WEB_BANNER_QUICK"
    | "WEB_BANNER_QUICK_CLASS"
    | "WEB_BANNER_LNB"
    | "WEB_BANNER_RNB"
    | "APP_POPUP_SPLASH_SCREEN"
    | "APP_POPUP_ENDING_SCREEN"
    | "APP_POPUP_HOME"
    | "APP_POPUP_CLASS"
    | "APP_POPUP_CALENDER"
    | "APP_POPUP_SCHOOL"
    | "APP_BANNER_HOME"
    | "APP_BANNER_CLASS"
    | "APP_BANNER_CLASS_B"
    | "APP_BANNER_CLASS_B_FOR_NEW_USER"
    | "APP_BANNER_CONTENT"
    | "APP_BANNER_TIMETABLE"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "FLOATING_BANNER"
    | "NOTIFICATION_BOX"
    | "BANNER_MORE_FEED"
    | "BANNER_TOP"
    | "HITALK_MAIN_TITLE"
    | "HITALK_MAIN_CARD"
    | "HITALK_MAIN_BANNER_A"
    | "HITALK_ROOM_LIST"
  )[];
  _displayStatus?: "EXPECTED" | "PROGRESSING" | "CLOSED";
  /** @format int64 */
  _timestampStartGte?: number;
  /** @format int64 */
  _timestampEndLte?: number;
  _insertedUser?: UserView;
  _loginId?: string;
  _mode?: string;
  clazzPostPermission?: ClazzPostPermission;
  /** @format uuid */
  insertedUserId?: string;
  /** @format uuid */
  updatedUserId?: string;
  thumbnailPath?: string;
  /** @format int32 */
  fileCounts?: number;
  /** @uniqueItems true */
  userType?: string[];
  /** @format uuid */
  currentId?: string;
  /** @uniqueItems true */
  classGrade?: string[];
  /** @uniqueItems true */
  postLand?: string[];
  /** @uniqueItems true */
  schoolArea?: string[];
  displayStatus?: "EXPECTED" | "PROGRESSING" | "CLOSED";
  /** @uniqueItems true */
  postKeyword?: string[];
  listPostContent?: string;
  /** @uniqueItems true */
  commentUserType?: string[];
  imageAndTable?: boolean;
}

export interface PostOption {
  /** @format uuid */
  id?: string;
  name?: string;
  value?: string;
  post?: Post;
}

export interface SecretBoardCountDto {
  /** @format int64 */
  readCount?: number;
  /** @format int64 */
  writeCount?: number;
  /** @format int64 */
  commentCount?: number;
  /** @format uuid */
  boardId?: string;
}

export interface EntityModelUserScrap {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  post?: Post;
  user?: UserView;
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface EntityModelHelpChatCategory {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  categoryTitle?: string;
  used?: boolean;
  _categoryTitle?: string;
  _used?: boolean;
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export interface EntityModelPostReadUser {
  /** @format int64 */
  insertedTimestamp?: number;
  /** @format int64 */
  updatedTimestamp?: number;
  deviceType?: "PC" | "MOBILE";
  post?: PostView;
  user?: UserView;
  _user?: UserView;
  _post?: PostView;
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface EntityModelEventWinner {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  post?: PostView;
  user?: UserView;
  _user?: UserView;
  _post?: PostView;
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export interface EntityModelPostHomeworkUser {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  workContent?: string;
  del?: boolean;
  writeUser?: object;
  post?: PostView;
  user?: UserView;
  /** @uniqueItems true */
  files?: File[];
  postIds?: string[];
  userIds?: string[];
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface PostHomeworkUser {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  workId?: string;
  workContent?: string;
  del?: boolean;
  writeUser?: object;
  /** @format uuid */
  userId?: string;
  post?: PostView;
  user?: UserView;
  /** @uniqueItems true */
  files?: File[];
  postIds?: string[];
  userIds?: string[];
  /** @format uuid */
  currentId?: string;
}

export interface EntityModelSection {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  userType:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  /** @format int32 */
  sortNo: number;
  kind: "DEFAULT" | "ADD";
  type:
    | "USER_BAR"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "THUMBNAIL"
    | "TEXT_BAR"
    | "TAB_LIST"
    | "TAB_THUMBNAIL"
    | "TAB_IMAGE"
    | "MEAL"
    | "LIST"
    | "KEYWORD"
    | "CP_RECOMMEND"
    | "THUMBNAIL_BTN"
    | "QUICK_MENU"
    | "GUIDE"
    | "BANNER_TOP"
    | "QUIZ"
    | "GROUP_MAIN"
    | "GROUP_LIST"
    | "AD_SDK";
  title?: string;
  cpId?: string;
  /** @format int32 */
  displayCount: number;
  displayType: "PIN" | "ROTATE";
  displayRule: "ORDERLY" | "RANDOM";
  used: boolean;
  del: boolean;
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export interface HelpFaqCategoryView {
  categoryTitle?: string;
  used?: boolean;
  isReadTeacher?: boolean;
  isReadParents?: boolean;
  isReadStudent?: boolean;
  /** @format int64 */
  currentId?: number;
}

export interface EntityModelHelpFaq {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  faqTitle?: string;
  faqContent?: string;
  used?: boolean;
  /** @format int32 */
  priority?: number;
  /** @format int32 */
  readCount?: number;
  helpFaqCategory?: HelpFaqCategoryView;
  _helpFaqCategory?: HelpFaqCategoryView;
  _keyword?: string;
  _faqTitle?: string;
  _userType?: string[];
  _used?: boolean;
  /** @uniqueItems true */
  userType?: string[];
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface EntityModelNotificationBadge {
  /** @format int32 */
  badgeCount?: number;
  badgeCheck?: boolean;
  user?: UserView;
  _user?: UserView;
  _badgeCheck?: boolean;
  _links?: Links;
}

export interface CsAdviceDetail {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  csDetailSeq?: number;
  csContent?: string;
  nextUser?: UserView;
  /** @format int64 */
  currentId?: number;
}

export interface EntityModelCsAdvice {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  csStatus?:
    | "INPROGRESS"
    | "COMPLETE"
    | "TRANSREQUEST"
    | "TRANSCOMPLETE"
    | "CSREQUEST"
    | "CSRECOMPLETE"
    | "ALLCOMPLETE";
  csType?: "HICLASS" | "HISTORE";
  csContent?: string;
  ctiCallType?: "INCALL" | "OUTCALL";
  ctiCallId?: string;
  pcSpec?: string;
  browser?: string;
  modelName?: string;
  softwareVersion?: string;
  appVersion?: string;
  deviceInfo?: string;
  userActive?: boolean;
  nonUserType?: string;
  nonUserId?: string;
  nonUserName?: string;
  nonUserMobile?: string;
  /** @format int64 */
  processTimestamp?: number;
  /** @format uuid */
  processUserId?: string;
  /** @format int64 */
  transTimestamp?: number;
  user?: UserView;
  nextUser?: UserView;
  csAdviceCategory?: CsAdviceCategory;
  /** @uniqueItems true */
  csDetail?: CsAdviceDetail[];
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export interface EntityModelPostComment {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  comment?: string;
  emoticonPath?: string;
  del?: boolean;
  secret?: boolean;
  /** @format uuid */
  parentCommentId?: string;
  /** @format int32 */
  depth?: number;
  post?: PostCommentPostView;
  user?: UserView;
  /** @uniqueItems true */
  files?: PostCommentFile[];
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface EntityModelUserFile {
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileFlag?: "FILE" | "THUMBNAIL" | "IMAGE_PACK";
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  user?: UserView;
  _user?: UserView;
  _links?: Links;
}

export interface EntityModelAdvertisement {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  adType:
    | "SECTION"
    | "BANNER"
    | "POPUP"
    | "PUSH"
    | "OFFERWALL_BANNER"
    | "OFFERWALL_ENTRY_PATH";
  parentId: string;
  contentsType:
    | "POST"
    | "LINK"
    | "MENU"
    | "CP_HOME"
    | "OFFERWALL_IMAGE_LIST"
    | "OFFERWALL_ENTRY_PATH";
  contents: string;
  userType:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  device: "WEB" | "AOS" | "IOS" | "APP";
  del: boolean;
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export interface EntityModelCpCategory {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  cpId?: string;
  name: string;
  /** @format int32 */
  sortNo: number;
  viewTeacher: boolean;
  viewParents: boolean;
  viewStudent: boolean;
  used: boolean;
  del: boolean;
  currentId?: string;
  _links?: Links;
}

export interface CpFile {
  /** @format int64 */
  seq?: number;
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileFlag?: "FILE" | "THUMBNAIL" | "IMAGE_PACK";
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  /** @format int64 */
  insertedTimestamp?: number;
}

export interface EntityModelCp {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  name: string;
  viewTeacher: boolean;
  viewParents: boolean;
  viewStudent: boolean;
  recommendation: boolean;
  usedPage: boolean;
  pass: boolean;
  /** @uniqueItems true */
  contentsType?: ("POST" | "LINK" | "MENU" | "CP_HOME")[];
  used: boolean;
  del: boolean;
  thumbnail?: CpFile;
  thumbnailHeader?: CpFile;
  currentId?: string;
  _links?: Links;
}

export interface ClazzPhraseCategory {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  seq?: number;
  title?: string;
  _title?: string;
  /** @format int64 */
  currentId?: number;
}

export interface EntityModelClazzPhraseCategory {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  title?: string;
  _title?: string;
  /** @format int64 */
  currentId?: number;
  _links?: Links;
}

export interface EntityModelClazzImage {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @uniqueItems true */
  files?: File[];
  _links?: Links;
}

export interface EntityModelCpReview {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  cpId: string;
  /** @format uuid */
  postId: string;
  postStatus:
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT";
  comment: string;
  system: boolean;
  del: boolean;
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface EntityModelSchoolSubscribe {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  joinType?: "SCHOOL" | "CLASS";
  user?: UserView;
  school?: SchoolView;
  /** @format int32 */
  sortNo?: number;
  _school?: SchoolView;
  _user?: UserView;
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface EntityModelChatSetting {
  room?: string;
  user?: string;
  pushUsed?: boolean;
  _links?: Links;
}

export interface EntityModelHelpAdContact {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  title?: string;
  content?: string;
  phone?: string;
  name?: string;
  email?: string;
  proceedStatus?: "UNTREATED" | "COMPLETE" | "INPROGRESS" | "HOLD";
  memo?: string;
  /** @uniqueItems true */
  files?: File[];
  _timestamp?: number[];
  _proceedStatus?: "UNTREATED" | "COMPLETE" | "INPROGRESS" | "HOLD";
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  _keyword?: string;
  _name?: string;
  _email?: string;
  _insertedUserName?: string;
  _updatedUserName?: string;
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface EntityModelClazzPhrase {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  content?: string;
  phraseType?: "ADMIN" | "PERSON";
  clazzPhraseCategory?: ClazzPhraseCategory;
  user?: UserView;
  _clazzPhraseCategory?: ClazzPhraseCategory;
  _keyword?: string;
  _user?: UserView;
  _phraseType?: ("ADMIN" | "PERSON")[];
  /** @format uuid */
  currentId?: string;
  _links?: Links;
}

export interface AdvertisementRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  adId?: number;
  adType:
    | "SECTION"
    | "BANNER"
    | "POPUP"
    | "PUSH"
    | "OFFERWALL_BANNER"
    | "OFFERWALL_ENTRY_PATH";
  parentId: string;
  contentsType:
    | "POST"
    | "LINK"
    | "MENU"
    | "CP_HOME"
    | "OFFERWALL_IMAGE_LIST"
    | "OFFERWALL_ENTRY_PATH";
  contents: string;
  userType:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  device: "WEB" | "AOS" | "IOS" | "APP";
  del: boolean;
  /** @format int64 */
  currentId?: number;
}

export interface AppVersionRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  seq?: number;
  version?: string;
  versionMin?: string;
  versionCode?: string;
  versionMinCode?: string;
  forceUsed?: boolean;
  osType?: "ANDROID" | "IOS" | "ETC";
  optionMessage?: string;
  memo?: string;
  _version?: string;
  _osType?: "ANDROID" | "IOS" | "ETC";
  /** @format int64 */
  currentId?: number;
}

export interface BannedWordRequestBody {
  /** @format int64 */
  seq?: number;
  word?: string;
  /** @format int64 */
  currentId?: number;
}

export interface CalenderHolidayRequestBody {
  /** @format uuid */
  dayId?: string;
  /** @format int32 */
  year?: number;
  /** @format int32 */
  month?: number;
  /** @format int32 */
  day?: number;
  name?: string;
  yyyymmdd?: string;
  _year?: string[];
  _month?: string[];
  _day?: string[];
  _yyyymmdd?: string[];
}

export interface CertificationRequestBody {
  /** @format int64 */
  seq?: number;
  /** @format uuid */
  id?: string;
  phone?: string;
  certNumber?: string;
  /** @format int64 */
  timestamp?: number;
  last?: boolean;
  result?:
    | "SUCCESS"
    | "FAIL"
    | "INVALID_PHONE"
    | "INVALID_NAME"
    | "DUPLICATE_SNS";
  resultCertNumber?:
    | "SUCCESS"
    | "FAIL"
    | "INVALID_PHONE"
    | "INVALID_NAME"
    | "DUPLICATE_SNS";
  resultUpdate?:
    | "SUCCESS"
    | "FAIL"
    | "INVALID_PHONE"
    | "INVALID_NAME"
    | "DUPLICATE_SNS";
  resultUserName?:
    | "SUCCESS"
    | "FAIL"
    | "INVALID_PHONE"
    | "INVALID_NAME"
    | "DUPLICATE_SNS";
  reason?: string;
  snsType?: string;
  userName?: string;
  _phone?: string;
  _certNumber?: string;
}

export interface ChatSettingRequestBody {
  /** @format uuid */
  settingId?: string;
  room?: string;
  user?: string;
  pushUsed?: boolean;
}

export interface ClazzImageRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  imageId?: string;
  /** @uniqueItems true */
  files?: File[];
}

export interface ClazzInviteCardRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  inviteId?: string;
  invitePhone?: string;
  clazz?: ClazzView;
  school?: SchoolView;
  _invitePhone?: string;
}

export interface ClazzPhraseCategoryRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  seq?: number;
  title?: string;
  _title?: string;
  /** @format int64 */
  currentId?: number;
}

export interface ClazzPhraseRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  phraseId?: string;
  content?: string;
  phraseType?: "ADMIN" | "PERSON";
  clazzPhraseCategory?: ClazzPhraseCategory;
  user?: UserView;
  _clazzPhraseCategory?: ClazzPhraseCategory;
  _keyword?: string;
  _user?: UserView;
  _phraseType?: ("ADMIN" | "PERSON")[];
  /** @format uuid */
  currentId?: string;
}

export interface ClazzRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  classId?: string;
  className?: string;
  classYear?: string;
  classGrade?: string;
  classGradeCode?:
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO";
  classBan?: string;
  classImagePath?: string;
  classInviteCode?: string;
  classStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING" | "CLOSED";
  /** @format int64 */
  classClosedTimestamp?: number;
  /** @format int64 */
  classDeactivateTimestamp?: number;
  applyUsed?: boolean;
  /** @format int32 */
  classAbsentMaxDays?: number;
  /** @format int32 */
  classFieldStudyMaxDays?: number;
  attendanceUsed?: boolean;
  attendanceFileUsed?: boolean;
  attendanceFieldStudyUsed?: boolean;
  classType?: "CLASS" | "SCHOOL";
  classSchoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  imageTitle?: string;
  imageBackgroundColor?: string;
  imageBackgroundPath?: string;
  /** @format int64 */
  classSubscribeCount?: number;
  school?: SchoolView;
  classOwner?: UserView;
  /** @format uuid */
  currentId?: string;
}

export interface CpCategoryRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  cpCategoryId?: string;
  cpId?: string;
  name: string;
  /** @format int32 */
  sortNo: number;
  viewTeacher: boolean;
  viewParents: boolean;
  viewStudent: boolean;
  used: boolean;
  del: boolean;
  currentId?: string;
}

export interface CpReviewRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  reviewId?: string;
  cpId: string;
  /** @format uuid */
  postId: string;
  postStatus:
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT";
  comment: string;
  system: boolean;
  del: boolean;
  /** @format uuid */
  currentId?: string;
}

export interface CpRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  cpId?: string;
  name: string;
  viewTeacher: boolean;
  viewParents: boolean;
  viewStudent: boolean;
  recommendation: boolean;
  usedPage: boolean;
  pass: boolean;
  /** @uniqueItems true */
  contentsType?: ("POST" | "LINK" | "MENU" | "CP_HOME")[];
  used: boolean;
  del: boolean;
  thumbnail?: CpFile;
  thumbnailHeader?: CpFile;
  currentId?: string;
}

export interface CsAdviceCategoryRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  csCategorySeq?: number;
  /** @format int64 */
  prntsCategorySeq?: number;
  prntsCategoryTitle?: string;
  categoryTitle?: string;
  /** @format int64 */
  categoryDepth?: number;
  del?: boolean;
  /** @format int64 */
  _prntsCategorySeq?: number;
  _categoryTitle?: string;
  /** @format int64 */
  _categoryDepth?: number;
  _del?: boolean;
  /** @format int64 */
  currentId?: number;
}

export interface CsAdviceRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  csSeq?: number;
  csStatus?:
    | "INPROGRESS"
    | "COMPLETE"
    | "TRANSREQUEST"
    | "TRANSCOMPLETE"
    | "CSREQUEST"
    | "CSRECOMPLETE"
    | "ALLCOMPLETE";
  csType?: "HICLASS" | "HISTORE";
  csContent?: string;
  ctiCallType?: "INCALL" | "OUTCALL";
  ctiCallId?: string;
  pcSpec?: string;
  browser?: string;
  modelName?: string;
  softwareVersion?: string;
  appVersion?: string;
  deviceInfo?: string;
  userActive?: boolean;
  nonUserType?: string;
  nonUserId?: string;
  nonUserName?: string;
  nonUserMobile?: string;
  /** @format int64 */
  processTimestamp?: number;
  /** @format uuid */
  processUserId?: string;
  /** @format int64 */
  transTimestamp?: number;
  user?: UserView;
  nextUser?: UserView;
  csAdviceCategory?: CsAdviceCategory;
  /** @uniqueItems true */
  csDetail?: CsAdviceDetail[];
  /** @format int64 */
  currentId?: number;
}

export interface EducationLetterPushLogRequestBody {
  /** @format int64 */
  seq?: number;
  /** @format uuid */
  pushGroupId?: string;
  /** @format uuid */
  elEducationLetterId?: string;
  /** @format uuid */
  elStudentId?: string;
  mobile?: string;
  /** @format uuid */
  userId?: string;
  /** @format uuid */
  insertedUser?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  notificationType?: "PUSH" | "SMS";
  mid?: string;
  sendType?: "IMMEDIATELY" | "RESERVATION";
  /** @format int64 */
  sendTimestamp?: number;
  /** @format uuid */
  postsId?: string;
  pushYn?: "Y" | "N";
  /** @format int64 */
  pushTimestamp?: number;
  pushStatus?: "I" | "C" | "E" | "D";
}

export interface EventWinnerRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  seq?: number;
  post?: PostView;
  user?: UserView;
  _user?: UserView;
  _post?: PostView;
  /** @format int64 */
  currentId?: number;
}

export interface HelpAdContactRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  contactId?: string;
  title?: string;
  content?: string;
  phone?: string;
  name?: string;
  email?: string;
  proceedStatus?: "UNTREATED" | "COMPLETE" | "INPROGRESS" | "HOLD";
  memo?: string;
  /** @uniqueItems true */
  files?: File[];
  _timestamp?: number[];
  _proceedStatus?: "UNTREATED" | "COMPLETE" | "INPROGRESS" | "HOLD";
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  _keyword?: string;
  _name?: string;
  _email?: string;
  _insertedUserName?: string;
  _updatedUserName?: string;
  /** @format uuid */
  currentId?: string;
}

export interface HelpChatCategoryRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  seq?: number;
  categoryTitle?: string;
  used?: boolean;
  _categoryTitle?: string;
  _used?: boolean;
  /** @format int64 */
  currentId?: number;
}

export interface HelpChatRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  chatId?: string;
  email?: string;
  phone?: string;
  userName?: string;
  pcSpec?: string;
  browser?: string;
  modelName?: string;
  softwareVersion?: string;
  modelNumber?: string;
  appVersion?: string;
  contentQuestion?: string;
  contentAnswer?: string;
  memo?: string;
  proceedStatus?:
    | "INPROGRESS"
    | "COMPLETE"
    | "TRANSREQUEST"
    | "TRANSCOMPLETE"
    | "CSREQUEST"
    | "CSRECOMPLETE"
    | "ALLCOMPLETE";
  user?: UserView;
  helpChatCategory?: HelpChatCategoryView;
  /** @uniqueItems true */
  files?: File[];
  _deviceInfo?: string[];
  _contentQuestion?: string;
  _contentAnswer?: string;
  _keyword?: string;
  _timestamp?: number[];
  _helpChatCategory?: HelpChatCategoryView;
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  _proceedStatus?:
    | "INPROGRESS"
    | "COMPLETE"
    | "TRANSREQUEST"
    | "TRANSCOMPLETE"
    | "CSREQUEST"
    | "CSRECOMPLETE"
    | "ALLCOMPLETE";
  _phone?: string;
  _insertedLoginId?: string;
  _insertedUserName?: string;
  _updatedUserName?: string;
  _user?: UserView;
  /** @format uuid */
  currentId?: string;
  /** @uniqueItems true */
  deviceInfo?: string[];
}

export interface HelpFaqCategoryRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  seq?: number;
  categoryTitle?: string;
  /** @format int32 */
  sortNo?: number;
  used?: boolean;
  faqType?: "DEFAULT" | "NONMEMBER";
  isReadTeacher: boolean;
  isReadParents: boolean;
  isReadStudent: boolean;
  _categoryTitle?: string;
  _used?: boolean;
  _faqType?: ("DEFAULT" | "NONMEMBER")[];
  _isReadTeacher?: boolean;
  _isReadParents?: boolean;
  _isReadStudent?: boolean;
  /** @format int64 */
  currentId?: number;
}

export interface HelpFaqRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  faqId?: string;
  faqTitle?: string;
  faqContent?: string;
  used?: boolean;
  /** @format int32 */
  priority?: number;
  /** @format int32 */
  readCount?: number;
  helpFaqCategory?: HelpFaqCategoryView;
  _helpFaqCategory?: HelpFaqCategoryView;
  _keyword?: string;
  _faqTitle?: string;
  _userType?: string[];
  _used?: boolean;
  /** @uniqueItems true */
  userType?: string[];
  /** @format uuid */
  currentId?: string;
}

export interface HelpNoticeRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  noticeId?: string;
  noticeTitle?: string;
  noticeContent?: string;
  noticeMustRead?: boolean;
  /** @format int64 */
  posted?: number;
  postStatus?:
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT";
  disclosureType?: boolean;
  /** @format int32 */
  readCount?: number;
  _keyword?: string;
  _noticeTitle?: string;
  _noticeContent?: string;
  /** @format int64 */
  _postedLte?: number;
  _postLand?: string[];
  _userType?: string[];
  _postStatus?: (
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT"
  )[];
  /** @uniqueItems true */
  userType?: string[];
  /** @format uuid */
  currentId?: string;
  /** @uniqueItems true */
  postLand?: string[];
}

export interface HelpSuggestRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  suggestId?: string;
  title?: string;
  content?: string;
  phone?: string;
  proceedStatus?: "UNTREATED" | "COMPLETE" | "INPROGRESS" | "HOLD";
  memo?: string;
  /** @uniqueItems true */
  files?: File[];
  _timestamp?: number[];
  _proceedStatus?: "UNTREATED" | "COMPLETE" | "INPROGRESS" | "HOLD";
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  _keyword?: string;
  _insertedUserName?: string;
  _updatedUserName?: string;
  /** @format uuid */
  currentId?: string;
}

export interface InformationRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  infoId?: string;
  infoTitle?: string;
  infoType?: "EDUCATION" | "EVENT" | "BANNER" | "HINOTICE";
  infoStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING";
  infoImagePath?: string;
  _infoTitle?: string;
  _infoType?: string;
  _infoStatus?: string;
  /** @format uuid */
  currentId?: string;
}

export interface MvoipRequestBody {
  /** @format uuid */
  mvoipId?: string;
  channelId?: string;
  /** @format uuid */
  sendId?: string;
  sendIuid?: string;
  sendAuthkey?: string;
  /** @format uuid */
  recvId?: string;
  recvIuid?: string;
  recvAuthkey?: string;
  /** @format uuid */
  classId?: string;
  status?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  sendDelete?: string;
  recvDelete?: string;
  /** @format uuid */
  id?: string;
}

export interface NotificationBadgeRequestBody {
  /** @format uuid */
  badgeId?: string;
  /** @format int32 */
  badgeCount?: number;
  badgeCheck?: boolean;
  user?: UserView;
  _user?: UserView;
  _badgeCheck?: boolean;
}

export interface NotificationBoxRequestBody {
  /** @format uuid */
  notiId?: string;
  title?: string;
  messageCode?: string;
  content?: string;
  /** @format int64 */
  timestamp?: number;
  isRead?: boolean;
  user?: UserView;
  writeUser?: UserView;
  clazz?: ClazzView;
  school?: SchoolView;
  clazzSubscribe?: ClazzSubscribe;
  post?: PostView;
  survey?: SurveyView;
  /** @format uuid */
  contentId?: string;
  _user?: UserView;
  _isRead?: boolean;
  _messageCode?: string[];
}

export interface OnceCheckRequestBody {
  /** @format int64 */
  seq?: number;
  flag?: string;
  user?: UserView;
  _flag?: string;
  _user?: UserView;
}

export interface PostCommentRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  commentId?: string;
  comment?: string;
  emoticonPath?: string;
  del?: boolean;
  secret?: boolean;
  /** @format uuid */
  parentCommentId?: string;
  /** @format int32 */
  depth?: number;
  post?: PostCommentPostView;
  user?: UserView;
  /** @uniqueItems true */
  files?: PostCommentFile[];
  /** @format uuid */
  currentId?: string;
}

export interface PostCommentReportRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  reportId?: string;
  reason?: string;
  status?: "WAITING" | "CONSENT" | "REJECTION";
  del?: boolean;
  memo?: string;
  postComment?: PostComment;
  _postComment?: PostComment;
  _status?: "WAITING" | "CONSENT" | "REJECTION";
  _del?: boolean;
  _postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
  _keyword?: string;
  _loginId?: string;
  _userName?: string;
  _insertedTimestamp?: number[];
  /** @format uuid */
  currentId?: string;
}

export interface PostHomeworkUserCommentRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  commentId?: string;
  comment?: string;
  emoticonPath?: string;
  del?: boolean;
  writeUser?: object;
  postHomeworkUser?: PostHomeworkUserSearch;
  user?: UserView;
  /** @format uuid */
  currentId?: string;
}

export interface PostHomeworkUserRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  workId?: string;
  workContent?: string;
  del?: boolean;
  writeUser?: object;
  /** @format uuid */
  userId?: string;
  post?: PostView;
  user?: UserView;
  /** @uniqueItems true */
  files?: File[];
  postIds?: string[];
  userIds?: string[];
  /** @format uuid */
  currentId?: string;
}

export interface PostReadUserRequestBody {
  /** @format int64 */
  insertedTimestamp?: number;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  readId?: string;
  deviceType?: "PC" | "MOBILE";
  post?: PostView;
  user?: UserView;
  _user?: UserView;
  _post?: PostView;
  /** @format uuid */
  currentId?: string;
}

export interface PushScheduleRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  seq?: number;
  channelType?: "PUSH" | "SMS" | "MMS";
  title?: string;
  content?: string;
  linkType?: string;
  link?: string;
  disclosureType?: boolean;
  /** @format int64 */
  reservationTimestamp?: number;
  pushStatus?: "RESERVATION" | "COMPLETE" | "CANCEL" | "FAIL";
  marketingCheckUsed?: boolean;
  mid?: string;
  messageCode?: string;
  /** @uniqueItems true */
  target?: string[];
  _reservationTimestamp?: number[];
  _linkType?: string;
  _content?: string;
  _pushStatus?: ("RESERVATION" | "COMPLETE" | "CANCEL" | "FAIL")[];
  _channelType?: ("PUSH" | "SMS" | "MMS")[];
  /** @uniqueItems true */
  userType?: string[];
  /** @uniqueItems true */
  osType?: string[];
  /** @uniqueItems true */
  classGrade?: string[];
  /** @uniqueItems true */
  schoolArea?: string[];
}

export interface SchoolManagerRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  elSchoolManagerId?: string;
  year?: string;
  name?: string;
  mobile?: string;
  job?: string;
  domain?: string;
  approvalStatus?: "CONSENT" | "REJECTION" | "WAITING";
  /** @format int64 */
  approvalTimestamp?: number;
  memo?: string;
  mid?: string;
  hasMaster?: boolean;
  /** @format uuid */
  masterUserId?: string;
  masterUserName?: string;
  school?: SchoolView;
  user?: UserView;
  approvalUser?: UserView;
  file?: EducationLetterFileView;
  _approvalTimestamp?: number[];
  _schoolName?: string;
  _name?: string;
  _approvalStatus?: "CONSENT" | "REJECTION" | "WAITING";
  /** @format uuid */
  currentId?: string;
}

export interface SchoolSubscribeRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  memberId?: string;
  joinType?: "SCHOOL" | "CLASS";
  user?: UserView;
  school?: SchoolView;
  /** @format int32 */
  sortNo?: number;
  _school?: SchoolView;
  _user?: UserView;
  /** @format uuid */
  currentId?: string;
}

export interface SchoolRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  schoolId?: string;
  alarmPlusUsed?: boolean;
  alarmUsed?: boolean;
  noticeUsed?: boolean;
  mealUsed?: boolean;
  alarmEduOfficeUsed?: boolean;
  timetableNeisUsed?: boolean;
  schoolArea?:
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU";
  /** @format int32 */
  schoolSigungu?: number;
  schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  /** @format int32 */
  schoolCodeIscream?: number;
  schoolCodeNeis?: string;
  neisOpenApiCode?: string;
  crawlingNeisInfo?: string;
  crawlingNeisMenu?: string;
  crawlingNeisSchedule?: string;
  crawlingHomeAlert?: string;
  crawlingHomeNotice?: string;
  crawlingHomeMenu?: string;
  crawlingNeisInfoEnable?: boolean;
  crawlingNeisMenuEnable?: boolean;
  crawlingNeisScheduleEnable?: boolean;
  crawlingHomeAlertEnable?: boolean;
  crawlingHomeNoticeEnable?: boolean;
  crawlingHomeMenuEnable?: boolean;
  schoolName?: string;
  schoolAddress?: string;
  schoolImagePath?: string;
  schoolStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING";
  schoolUrl?: string;
  memo?: string;
  _schoolName?: string;
  _schoolStatus?: ("ACTIVATE" | "DEACTIVATE" | "CLOSING")[];
  _schoolArea?:
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU";
  _schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  _schoolCodeNeis?: string;
  /** @format int32 */
  _schoolCodeIscream?: number;
  _neisOpenApiCode?: string;
  /** @format uuid */
  currentId?: string;
}

export interface SectionDetailRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  detailId?: number;
  /** @format int64 */
  sectionId?: number;
  /** @format int32 */
  sortNo: number;
  type: "CONTENTS" | "LINK_TEXT";
  contentsType:
    | "POST"
    | "LINK"
    | "MENU"
    | "POST_FEED"
    | "KEYWORD"
    | "CP_HOME"
    | "OFFERWALL_BANNER"
    | "OFFERWALL_GROUP";
  contents?: string;
  titlePoint?: string;
  title?: string;
  titleSub?: string;
  del: boolean;
  file?: SectionDetailFile;
  /** @format int64 */
  currentId?: number;
}

export interface SectionLinkRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  sectionLinkId?: string;
  uniqueCode?: string;
  url?: string;
  linkType: "INTERNAL" | "EXTERNAL" | "POST" | "LINK" | "MENU" | "CP_HOME";
  cpId?: string;
  comment?: string;
  del: boolean;
  currentId?: string;
}

export interface SectionRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  sectionId?: number;
  userType:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  /** @format int32 */
  sortNo: number;
  kind: "DEFAULT" | "ADD";
  type:
    | "USER_BAR"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "THUMBNAIL"
    | "TEXT_BAR"
    | "TAB_LIST"
    | "TAB_THUMBNAIL"
    | "TAB_IMAGE"
    | "MEAL"
    | "LIST"
    | "KEYWORD"
    | "CP_RECOMMEND"
    | "THUMBNAIL_BTN"
    | "QUICK_MENU"
    | "GUIDE"
    | "BANNER_TOP"
    | "QUIZ"
    | "GROUP_MAIN"
    | "GROUP_LIST"
    | "AD_SDK";
  title?: string;
  cpId?: string;
  /** @format int32 */
  displayCount: number;
  displayType: "PIN" | "ROTATE";
  displayRule: "ORDERLY" | "RANDOM";
  used: boolean;
  del: boolean;
  /** @format int64 */
  currentId?: number;
}

export interface StickerRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  packSeq?: number;
  packName?: string;
  packThumbnail?: string;
  /** @format int64 */
  packVersion?: number;
  /** @format int64 */
  packOrder?: number;
  del?: boolean;
  userType?: string;
  /** @uniqueItems true */
  userTypes?: StickerUserType[];
  /** @uniqueItems true */
  stickerItem?: StickerItems[];
  _timestamp?: number[];
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  _packName?: string;
  _del?: boolean;
  /** @format int64 */
  _packOrder?: number;
  /** @format int64 */
  currentId?: number;
}

export interface SurveyEditPageRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  pageId: string;
  /** @format uuid */
  surveyId: string;
  pageName?: string;
  isCustom: boolean;
  isDel: boolean;
  /** @format int32 */
  sortNo: number;
  /** @format uuid */
  linkPageId?: string;
}

export interface UserDeviceRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  pushToken?: string;
  osType?: "ANDROID" | "IOS" | "ETC";
  osVersion?: string;
  model?: string;
  version?: string;
  last?: boolean;
  user?: UserView;
  _user?: UserView;
  _userId?: string[];
  _last?: boolean;
  pushTokenId?: string;
}

export interface UserFileRequestBody {
  /** @format int64 */
  seq?: number;
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileFlag?: "FILE" | "THUMBNAIL" | "IMAGE_PACK";
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  user?: UserView;
  _user?: UserView;
}

export interface UserLikeRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  likeId?: string;
  post?: PostView;
  user?: UserView;
  _user?: UserView;
  _post?: PostView[];
  _posted?: number[];
  /** @format uuid */
  currentId?: string;
}

export interface UserScrapRequestBody {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  scrapId?: string;
  post?: Post;
  user?: UserView;
  /** @format uuid */
  currentId?: string;
}

export interface UserRequestBody {
  /** @format uuid */
  userId?: string;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  userSns?: string;
  userName?: string;
  userPhoto?: string;
  loginId?: string;
  loginPassword?: string;
  userGender?: "MALE" | "FEMALE";
  /** @format int32 */
  userNumber?: number;
  userBirthday?: string;
  userTel?: string;
  userMobile?: string;
  userEmail?: string;
  userAddressZipcode?: string;
  userAddress1?: string;
  userAddress2?: string;
  userMarketingUsed?: boolean;
  /** @format int64 */
  userMarketingTimestamp?: number;
  userPushUsed?: boolean;
  /** @format int64 */
  userPushTimestamp?: number;
  userBlockStart?: string;
  userBlockEnd?: string;
  userStatus?: "ACTIVATE" | "DEACTIVATE";
  userTeacherAuth?: "GPKIAUTH" | "ADMINAUTH" | "HICLASS" | "NOAUTH";
  userChatDay?: string;
  userChatStartTime?: string;
  userChatEndTime?: string;
  /** @format int64 */
  expiredTimestamp?: number;
  memo?: string;
  department?: string;
  userAdminRole?: string;
  userCpId?: string;
  userSignImagePath?: string;
  /** @format int64 */
  userSignTimestamp?: number;
  userApprovalSignImagePath?: string;
  /** @format int64 */
  userApprovalSignTimestamp?: number;
  deviceInfo?: "PC" | "ANDROID" | "IOS";
  insertedUser?: UserView;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  _userId?: string;
  _loginId?: string;
  _userSns?: string;
  _userName?: string;
  _userEmail?: string;
  _userMobile?: string;
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  _userStatus?: "ACTIVATE" | "DEACTIVATE";
  _insertedTimestamp?: number[];
  /** @format uuid */
  currentId?: string;
  isChat?: boolean;
}

export interface HiTalkScheduleStatusRequestDto {
  /** @format uuid */
  userId: string;
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  scheduleIds: string[];
}

export interface ClazzReportDto {
  bodyText?: string;
  contentType?: string;
}

export interface HiTalkReactionSaveRequestDto {
  /** @format uuid */
  messageId: string;
  /** @format uuid */
  iconId: string;
  /** @format uuid */
  userId: string;
  /** @format uuid */
  roomId: string;
  parentId: string;
}

export interface ChatMessageDto {
  /** @format uuid */
  id?: string;
  room?: string;
  sender?: string;
  contentType?: string;
  content?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  /** @format int64 */
  updatedTimestamp?: number;
  classId?: string;
  settings?: object;
  roomType?: string;
  roomName?: string;
  personRoomName?: string;
  memberType?: string;
  noticeMessage?: string;
  /** @format int64 */
  expiredTimestamp?: number;
  errorMessage?: string;
  errorCode?: string;
  notificationId?: object;
  /** @uniqueItems true */
  invitedMembers?: string[];
  /** @uniqueItems true */
  joinedMembers?: string[];
  /** @uniqueItems true */
  connectedMembers?: string[];
  /** @uniqueItems true */
  readMembers?: string[];
  /** @uniqueItems true */
  leaveMembers?: string[];
  /** @format uuid */
  tempId?: string;
  isPin?: boolean;
  isReservation?: boolean;
  /** @format uuid */
  iconId?: string;
  /** @uniqueItems true */
  reactions?: HiTalkMessageReactionCountDto[];
  groupType?: "NOTICE" | "GENERAL" | "LIMIT";
  /** @format int64 */
  limitTimestamp?: number;
  pushUsed?: boolean;
  chatUsed?: boolean;
  resultMap?: Record<string, HiTalkVoteChatMessageDto>;
  /** @format uuid */
  currentId?: string;
}

export interface HiTalkMessageReactionCountDto {
  /** @format uuid */
  iconId?: string;
  /** @format int32 */
  count?: number;
  isReaction?: boolean;
}

export interface HiTalkVoteChatMessageDto {
  /** @format uuid */
  id?: string;
  /** @format uuid */
  roomId?: string;
  /** @format uuid */
  sender?: string;
  content?: string;
  contentType?: string;
}

export interface UserSchoolSortingSaveDto {
  /** @format uuid */
  schoolId: string;
  /** @format uuid */
  beforeSchoolId?: string;
}

export interface UserClassSortingSaveDto {
  /** @format uuid */
  classId: string;
  /** @format uuid */
  beforeClassId?: string;
}

export interface ChooseClassProfileRequestDto {
  /** @format uuid */
  profileId: string;
}

export interface UserProfileRequestDto {
  profileName: string;
  /**
   * @minLength 10
   * @maxLength 2147483647
   */
  profileImage?: string;
}

export interface SurveyReadUserRequestDto {
  /** @format uuid */
  surveyId?: string;
  deviceType?: "PC" | "MOBILE";
}

export interface SurveyEditQuestionAfterSchoolTargetDto {
  /** @format uuid */
  targetId?: string;
  schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  classGrade?:
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO";
}

export interface SurveyEditQuestionAfterSchoolTimetableDto {
  /** @format uuid */
  timetableId?: string;
  /**
   * @format int32
   * @min 1
   * @max 7
   */
  dayOfWeek?: number;
  /** @pattern ([0-1]?[0-9]|2[0-3]):[0-5][0-9] */
  timeStart?: string;
  /** @pattern ([0-1]?[0-9]|2[0-3]):[0-5][0-9] */
  timeEnd?: string;
}

export interface SurveyEditQuestionConsultationSettingDto {
  /** @format uuid */
  settingId?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateStart?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateEnd?: string;
  /** @pattern ([0-1]?[0-9]|2[0-3]):[0-5][0-9] */
  timeStart?: string;
  /** @pattern ([0-1]?[0-9]|2[0-3]):[0-5][0-9] */
  timeEnd?: string;
  /**
   * @format int32
   * @min 0
   * @max 99
   */
  timeConsultation?: number;
  /**
   * @format int32
   * @min 0
   * @max 99
   */
  timeRecess?: number;
  isPhone?: boolean;
  isVisit?: boolean;
  isRemote?: boolean;
}

export interface SurveyEditQuestionDto {
  /** @format uuid */
  questionId?: string;
  /** @format uuid */
  surveyId?: string;
  /** @format uuid */
  pageId?: string;
  questionType:
    | "CHOICE"
    | "SUBJECTIVE"
    | "SIGN"
    | "DROPDOWN"
    | "STAR"
    | "ATTACHMENTS"
    | "DESCRIPTION"
    | "CONSULTATION"
    | "AFTER_SCHOOL"
    | "VOTE";
  questionTitle?: string;
  questionDescription?: string;
  /** @format int32 */
  sortNo?: number;
  isValidated: boolean;
  isRequired: boolean;
  isAddedAnswer: boolean;
  isLinkedPage: boolean;
  isUsedHalfStar: boolean;
  isAllowedOverlapTime: boolean;
  isMultipleAnswer: boolean;
  /** @format int32 */
  answerLimit?: number;
  /** @format uuid */
  linkPageId?: string;
  /** @format uuid */
  beforePageId?: string;
  /** @format uuid */
  beforeQuestionId?: string;
  items?: SurveyEditQuestionItemDto[];
  itemGroups?: SurveyEditQuestionItemGroupDto[];
  files?: SurveyEditQuestionFileDto[];
  consultationSetting?: SurveyEditQuestionConsultationSettingDto;
}

export interface SurveyEditQuestionFileDto {
  /** @format uuid */
  fileId?: string;
  /** @format uuid */
  originalFileId?: string;
  fileTargetType?: "SURVEY" | "QUESTION" | "ITEM" | "ANSWER";
  /** @format int32 */
  sortNo: number;
  fileCategory:
    | "IMAGE"
    | "VIDEO"
    | "AUDIO"
    | "URL"
    | "SIGN"
    | "DOC"
    | "ZIP"
    | "ETC";
  fileLinkUrl?: string;
  fileName: string;
  fileContentType: string;
  fileSize?: string;
  fileOriginalPath: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  fileAlign: "LEFT" | "RIGHT" | "CENTER";
}

export interface SurveyEditQuestionItemDto {
  /** @format uuid */
  itemId?: string;
  itemTitle?: string;
  /** @format float */
  itemWeight?: number;
  itemDescription?: string;
  /** @format int32 */
  sortNo?: number;
  isEtcAnswer?: boolean;
  isAddedAnswer?: boolean;
  /** @format uuid */
  respondentId?: string;
  selectionType?: "FCFS" | "DRAW";
  isLimitedTotal?: boolean;
  isLimitedWait?: boolean;
  isWeekTime?: boolean;
  isCanceled?: boolean;
  itemField1?: string;
  itemField2?: string;
  itemDate?: string;
  itemTimeStart?: string;
  itemTimeEnd?: string;
  /** @format uuid */
  linkPageId?: string;
  isUsedResponse?: boolean;
  files?: SurveyEditQuestionFileDto[];
  afterSchoolTimetables?: SurveyEditQuestionAfterSchoolTimetableDto[];
  afterSchoolTargets?: SurveyEditQuestionAfterSchoolTargetDto[];
  limit?: SurveyEditQuestionLimitDto;
}

export interface SurveyEditQuestionItemGroupDto {
  /** @format uuid */
  itemGroupId?: string;
  itemGroupName?: string;
  isRequired?: boolean;
  /** @format int32 */
  sortNo?: number;
  items?: SurveyEditQuestionItemDto[];
}

export interface SurveyEditQuestionLimitDto {
  /** @format uuid */
  limitId?: string;
  /** @format int32 */
  totalMax?: number;
  /** @format int32 */
  waitMax?: number;
}

export interface SurveyEditQuestionSortRequestDto {
  /** @format uuid */
  questionId: string;
  /** @format uuid */
  pageId?: string;
  /** @format uuid */
  beforePageId?: string;
  /** @format uuid */
  beforeQuestionId?: string;
}

export interface SurveyEditPageSortRequestDto {
  /** @format uuid */
  pageId: string;
  /** @format uuid */
  beforePageId?: string;
}

export interface SurveyEditPageMergeRequestDto {
  pageIds: string[];
}

export interface HiTalkVoteUpdateStatusDto {
  /** @format uuid */
  userId: string;
  isClosed: boolean;
}

export interface Answer {
  /** @format uuid */
  questionId: string;
  /** @format uuid */
  itemId: string;
}

export interface HiTalkVoteUpdateAnswerDto {
  /** @format uuid */
  userId: string;
  answers: Answer[];
}

export interface CommentReactionSaveRequestDto {
  /** @format uuid */
  commentId: string;
  /** @format uuid */
  iconId: string;
  /** @format uuid */
  userId: string;
  /** @format uuid */
  postId: string;
  parentId: string;
}

export interface ClassroomStudentInsertDto {
  /** @format uuid */
  userId: string;
  studentNames: string[];
}

export interface SeatPlanRequestDto {
  /**
   * @minLength 1
   * @maxLength 20
   */
  seatPlanName: string;
  seatPlanType: "DIVISION" | "GROUP" | "FREE";
  sectionType:
    | "SINGLE_COLUMN"
    | "DOUBLE_COLUMN"
    | "GROUP_THREE_PERSON"
    | "GROUP_FOUR_PERSON"
    | "GROUP_FIVE_PERSON"
    | "GROUP_SIX_PERSON"
    | "FREE_LAYOUT";
  /**
   * @format int32
   * @min 1
   */
  sectionCount: number;
  pairingType?: "RANDOM" | "GENDER_SAME" | "GENDER_DIFFERENT";
  avoidPreviousPartner: boolean;
  isMergeRemaining: boolean;
  viewMode: "SINGLE_VIEW" | "FULL_VIEW";
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  seatSections: SeatSectionDto[];
}

export interface SeatRequestDto {
  /** @format uuid */
  studentId?: string;
  /**
   * @format int32
   * @min 1
   */
  seatRow: number;
  /**
   * @format int32
   * @min 1
   */
  seatColumn: number;
  isActive: boolean;
  isFixed?: boolean;
}

export interface SeatSectionDto {
  seatSectionName: string;
  /**
   * @format int32
   * @min 1
   */
  seatSectionNo: number;
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  seats: SeatRequestDto[];
}

export interface ChangeStudentSeatRequestDto {
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  studentSeats?: StudentSeat[];
}

export interface StudentSeat {
  /** @format uuid */
  seatId: string;
  /** @format uuid */
  studentId?: string;
  isFixed: boolean;
  isActive: boolean;
}

export interface ClassroomRecordBookmarkSaveDto {
  /** @format uuid */
  bookmarkId?: string;
  /** @format int64 */
  bookmarkTime: number;
  bookmarkMemo?: string;
  isDel?: boolean;
}

export interface ClassroomRecordFileSaveDto {
  /** @format uuid */
  fileId?: string;
  fileCategory: "PHOTO" | "VIDEO" | "AUDIO" | "DOC";
  fileName: string;
  fileContentType: string;
  fileSize: string;
  fileOriginalPath: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  fileWaveformPath?: string;
  fileConvertPath?: string;
  fileConvertStatus?: string;
  /** @format int32 */
  filePlayTime?: number;
  /** @format int32 */
  fileWidth?: number;
  /** @format int32 */
  fileHeight?: number;
  bookmarks?: ClassroomRecordBookmarkSaveDto[];
}

export interface ClassroomRecordSaveDto {
  recordType: "PHOTO" | "VIDEO" | "AUDIO" | "MEMO" | "NUGA" | "CHECKLIST";
  /** @format int64 */
  recordTimestamp?: number;
  recordContent?: string;
  recordStyle?:
    | "WHITE"
    | "YELLOW"
    | "ORANGE"
    | "BLUE"
    | "PINK"
    | "BLUE_GREEN"
    | "RED"
    | "PURPLE"
    | "GREEN"
    | "GRAY";
  files?: ClassroomRecordFileSaveDto[];
  /**
   * @maxItems 5
   * @minItems 0
   * @uniqueItems true
   */
  tags?: string[];
  targets?: ClassroomRecordTargetSaveDto;
  recordIds?: string[];
}

export interface ClassroomRecordTargetSaveDto {
  studentIds?: string[];
  groupIds?: string[];
}

export interface ClassroomRecordFileInsertDto {
  files: ClassroomRecordFileSaveDto[];
}

export interface ClassroomGroupSaveDto {
  /** @format uuid */
  userId: string;
  groupName: string;
  studentIds?: string[];
}

export interface ClassroomChecklistStudentUpdateDto {
  /** @format uuid */
  userId: string;
  studentIds: string[];
}

export interface AttendanceFileDto {
  /** @format int64 */
  seq?: number;
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileFlag?: "FILE" | "THUMBNAIL" | "IMAGE_PACK";
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  /** @format int64 */
  insertedTimestamp?: number;
}

export interface AttendanceFileSaveRequestDto {
  /** @format uuid */
  attendanceId?: string;
  files?: AttendanceFileDto[];
}

export interface HiTalkScheduleDto {
  /** @format uuid */
  scheduleId?: string;
  /** @format int64 */
  reservationTime: number;
  roomType: "BATCH" | "GROUP" | "PERSON";
  /** @format uuid */
  userId: string;
  /** @format uuid */
  roomId?: string;
  /** @format uuid */
  classId: string;
  status?:
    | "RESERVATION"
    | "COMPLETE"
    | "DELETE"
    | "TEMPORARY"
    | "FAILURE"
    | "CANCEL"
    | "RESEND";
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  messages: HiTalkScheduleMessageDto[];
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  targets: HiTalkScheduleTargetDto[];
  schoolName?: string;
  targetName?: string;
  className?: string;
  classGrade?: string;
  classGradeCode?:
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO";
  classBan?: string;
  thumbnailPath?: string;
}

export interface HiTalkScheduleMessageDto {
  /** @format uuid */
  messageId?: string;
  contentType?: string;
  content?: string;
  /** @format int32 */
  sortNo?: number;
}

export interface HiTalkScheduleTargetDto {
  /** @format uuid */
  targetId?: string;
}

export interface ClassroomESSearchRequestDto {
  /** @pattern \d{4}-\d{2} */
  month?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  date?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateStart?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateEnd?: string;
  keyword?: string;
  studentIds?: string[];
  tagIds?: string[];
  /** @pattern latest|registration */
  sort?: string;
  recordTypes?: ("PHOTO" | "VIDEO" | "AUDIO" | "MEMO" | "NUGA" | "CHECKLIST")[];
  isPhoto?: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  isMemo?: boolean;
  pointIds?: string[];
  recordIds?: string[];
}

export interface Pageable {
  /**
   * @format int32
   * @min 0
   */
  page?: number;
  /**
   * @format int32
   * @min 1
   */
  size?: number;
  sort?: string[];
}

export interface ProfileImageInfoDto {
  imageTitle?: string;
  imageBgColor?: string;
  imageBgPath?: string;
  imagePath?: string;
}

export interface Student {
  /** @format uuid */
  userId?: string;
  classId?: string;
  /** @format int32 */
  memberClassNumber?: number;
  memberChildName?: string;
  userPhoto?: string;
  user?: string;
  /** @format uri */
  clazz?: string;
  loginId?: string;
  loginPassword?: string;
  userName?: string;
  /** @format int32 */
  userNumber?: number;
  /** @format uuid */
  profileId?: string;
  profileImageInfo?: ProfileImageInfoDto;
  tagIds?: string[];
  emptyUser?: boolean;
  emptyClass?: boolean;
}

export interface ExcelStudent {
  number: string;
  /**
   * @minLength 2
   * @maxLength 20
   */
  name: string;
  /**
   * @minLength 4
   * @maxLength 12
   */
  loginId: string;
  /**
   * @minLength 6
   * @maxLength 20
   */
  loginPassword: string;
  tagName?: string;
  profileImageInfo?: ProfileImageInfoDto;
  resultTarget?: string[];
  resultCode?: string[];
  resultMessage?: string;
}

export interface TempStudentDto {
  /** @format uuid */
  classId?: string;
  students?: ExcelStudent[];
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

export interface AccountInfoDto {
  loginId?: string;
  newPassword?: string;
}

export interface PostHomeworkUserRequestDto {
  /** @format uuid */
  postId?: string;
  /** @format uuid */
  classId?: string;
}

export interface AdminOfferwallBannerContentDto {
  textType: "TEXT" | "BODY" | "PRECAUTIONS";
  content?: string;
}

export interface AdminOfferwallBannerCreateDto {
  offerwallType: "A" | "B";
  bannerTitle: string;
  /** @format uuid */
  brandId: string;
  /** @format int64 */
  postingTimestampStart: number;
  /** @format int64 */
  postingTimestampEnd: number;
  /** @format int32 */
  dbPrice: number;
  dbGoalType: "NONE" | "GOAL_DEADLINE" | "GOAL_DELETE";
  /** @format int32 */
  dbLimit: number;
  listPoint1?: string;
  listPoint2?: string;
  listButtonText?: string;
  listButtonTextColor?: string;
  listButtonBackgroundColor?: string;
  /**
   * @maxItems 1
   * @minItems 1
   */
  listFiles: AdminOfferwallBannerFileDto[];
  /**
   * @maxItems 1
   * @minItems 1
   */
  thumbnailFiles: AdminOfferwallBannerFileDto[];
  /** @format uuid */
  groupId?: string;
  isListPoint1DefaultColor?: boolean;
  listPoint1Color?: string;
  isListPoint2DefaultColor?: boolean;
  listPoint2Color?: string;
  isListButtonTextDefaultColor?: boolean;
  s3ListPoint1?: string;
  isS3ListPoint1DefaultColor?: boolean;
  s3ListPoint1Color?: string;
  s3ListPoint2?: string;
  isS3ListPoint2DefaultColor?: boolean;
  s3ListPoint2Color?: string;
  s3ListPoint3?: string;
  isS3ListPoint3DefaultColor?: boolean;
  s3ListPoint3Color?: string;
  isS3ThumbnailBgDefaultColor?: boolean;
  s3ThumbnailBgColor?: string;
  isS3BannerBorderDefaultColor?: boolean;
  s3BannerBorderColor?: string;
  isGender?: boolean;
  isBirthday?: boolean;
  isQuestion?: boolean;
  questionTitle?: string;
  questionPlaceholder?: string;
  contentType:
    | "IMAGE"
    | "LINK"
    | "ONLY_IMAGES"
    | "CP_BOARD"
    | "HINOTICE"
    | "EVENT"
    | "OFFERWALL_BANNER"
    | "MENU"
    | "CP_HOME"
    | "EXTERNAL";
  linkUrl?: string;
  linkType?: "INTERNAL" | "EXTERNAL" | "POST" | "LINK" | "MENU" | "CP_HOME";
  contentFiles?: AdminOfferwallBannerFileDto[];
  contentButtonText?: string;
  contentButtonTextColor?: string;
  contentButtonBackgroundColor?: string;
  contents?: AdminOfferwallBannerContentDto[];
  popupMessage?: string;
  terms?: AdminOfferwallBannerTermsDto[];
  classGrades?: (
    | "A4"
    | "A5"
    | "A6"
    | "A7"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "AD"
  )[];
  isAddress: boolean;
  adminMemo?: string;
}

export interface AdminOfferwallBannerFileDto {
  /** @format uuid */
  fileId?: string;
  /** @format uuid */
  bannerId?: string;
  fileName: string;
  fileOriginalPath: string;
  fileContentType: string;
  /** @format int64 */
  fileSize: number;
  isUsed: boolean;
  /** @format int64 */
  insertedTimestamp?: number;
}

export interface AdminOfferwallBannerTermsDto {
  termsType:
    | "PERSONAL"
    | "PERSONAL_COMMON"
    | "PERSONAL_COMPANY"
    | "THIRD_PARTY"
    | "THIRD_PARTY_COMMON"
    | "THIRD_PARTY_COMPANY";
  termContent?: string;
}

export interface HiTalkBatchRequestDto {
  /** @format uuid */
  classId: string;
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  targetIds: string[];
}

export interface ClassroomBulkRewardRequestDto {
  /** @format uuid */
  userId: string;
  memo?: string;
  issueDt?: string;
  isVisiblePoint?: boolean;
  studentGroups: StudentGroup[];
  pointIssues: PointIssue[];
}

export interface PointIssue {
  /** @format uuid */
  pointId: string;
  /** @format int32 */
  issueCount: number;
}

export interface StudentGroup {
  /** @format int32 */
  orderNo: number;
  studentIds: string[];
}

export interface UserSwitchRequestDto {
  c: string;
  n: string;
}

export interface UserBoardGroupCreateDto {
  groupName: string;
  list?: UserBoardGroupListCreateDto[];
}

export interface UserBoardGroupListCreateDto {
  /** @format uuid */
  groupId: string;
  /** @format uuid */
  classId: string;
  /** @format uuid */
  boardId: string;
  /** @format uuid */
  folderId: string;
}

export interface UserRequest {
  /** @format uuid */
  userId?: string;
  userMobile?: string;
  userName?: string;
  certNumber?: string;
  userSns?: string;
  principal?: string;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  userPhoto?: string;
  loginId?: string;
  userGender?: "MALE" | "FEMALE";
  /** @format int32 */
  userNumber?: number;
  userBirthday?: string;
  userTel?: string;
  userEmail?: string;
  userAddressZipcode?: string;
  userAddress1?: string;
  userAddress2?: string;
  userMarketingUsed?: boolean;
  /** @format int64 */
  userMarketingTimestamp?: number;
  userPushUsed?: boolean;
  /** @format int64 */
  userPushTimestamp?: number;
  userBlockStart?: string;
  userBlockEnd?: string;
  userStatus?: "ACTIVATE" | "DEACTIVATE";
  userTeacherAuth?: "GPKIAUTH" | "ADMINAUTH" | "HICLASS" | "NOAUTH";
  userChatDay?: string;
  userChatStartTime?: string;
  userChatEndTime?: string;
  /** @format int64 */
  expiredTimestamp?: number;
  memo?: string;
  department?: string;
  userAdminRole?: string;
  userCpId?: string;
  userSignImagePath?: string;
  /** @format int64 */
  userSignTimestamp?: number;
  userApprovalSignImagePath?: string;
  /** @format int64 */
  userApprovalSignTimestamp?: number;
  schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  /** @format uuid */
  get_userId?: string;
  get_loginId?: string;
  get_userSns?: string;
  get_userName?: string;
  get_userEmail?: string;
  get_userMobile?: string;
  get_userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  get_userStatus?: "ACTIVATE" | "DEACTIVATE";
  get_insertedTimestamp?: number[];
  /** @format uuid */
  profileId?: string;
}

export interface UserScrapRequestDto {
  get_posted?: number[];
  get_keyword?: string;
  get_post?: string[];
  get_viewDeviceType?: "WEB" | "APP" | "IOS" | "ANDROID";
}

export interface UserLogRequestDto {
  deviceInfo?: "PC" | "ANDROID" | "IOS";
  logType?: "LOGIN" | "INSERT" | "UPDATE" | "DELETE";
  user?: string;
  get_logType?: "LOGIN" | "INSERT" | "UPDATE" | "DELETE";
  get_user?: string;
  /** @format uuid */
  userId?: string;
  get_deviceInfo?: ("PC" | "ANDROID" | "IOS")[];
}

export interface UserLikeRequestDto {
  /** @format uuid */
  postId?: string;
  get_user?: string;
}

export interface UserDeactivateRequest {
  user?: string;
  reason?: string;
  /** @format uuid */
  userId?: string;
}

export interface UserDeactivateSearch {
  get_userType?: string;
  get_insertedTimestamp?: number[];
  get_user?: string;
  /** @format uuid */
  userId?: string;
}

export interface TimetableConfigRequestDto {
  /** @format int32 */
  maxGrade: number;
  classDays: string;
  /** @format int32 */
  startPeriod: number;
  /** @format int32 */
  maxPeriod: number;
  maxClassCountList: number[];
  maxVirtualClassCountList: number[];
  gradeNames?: string[];
  classNames?: string[][];
  virtualClassNames?: string[][];
}

export interface TeacherInfo {
  teacherName: string;
  /** @format uuid */
  teacherUserId?: string;
}

export interface TimetableTeacherCreateDto {
  teachers: TeacherInfo[];
}

export interface TimetableSpecialtyRoomCreateDto {
  roomName?: string;
  /** @format int32 */
  maxClass?: number;
}

export interface RoomConfDto {
  /** @format uuid */
  courseId: string;
  /** @format uuid */
  teacherId: string;
  /** @format int32 */
  grade: number;
  /** @format int32 */
  periodCount: number;
  teacherName: string;
  /** @format uuid */
  concurrentCourseId?: string;
}

export interface TimetableSpecialtyRoomConfCreateDto {
  /** @format uuid */
  specialtyRoomId: string;
  roomConfs: RoomConfDto[];
}

export interface TimetableSimilarCourseConfCreateDto {
  groupName: string;
}

export interface TimetableSimilarCourseUpdateDto {
  courseIds?: string[];
}

export interface TimetableLessonHistoryRequestDto {
  memo?: string;
}

export interface TimetableLessonConfCreateDto {
  /** @format uuid */
  classId: string;
  /** @format uuid */
  courseId: string;
  /** @format uuid */
  teacherId: string;
  /** @format int32 */
  grade: number;
}

export interface TimetableDailyLessonDto {
  /** @format uuid */
  dailyLessonId?: string;
  lessonType?: "LESSON" | "EVENT";
  /** @format uuid */
  classId?: string;
  /** @format int32 */
  lessonDate?: number;
  /** @format int32 */
  dayOfWeek?: number;
  /** @format int32 */
  period?: number;
  /** @format uuid */
  courseId?: string;
  /** @format uuid */
  specialtyRoomId?: string;
  changeType?:
    | "EXCHANGE"
    | "ADJUSTMENT"
    | "REPLACEMENT"
    | "ADDITION"
    | "COMBINATION"
    | "MULTIPLE"
    | "CANCEL"
    | "EVENT"
    | "REASSIGNMENT"
    | "DUPLICATION"
    | "REMOVAL"
    | "INTERNAL_SWAP"
    | "EXTERNAL_SWAP"
    | "NONE";
  isRemoved?: boolean;
  isMoved?: boolean;
  className?: string;
  courseName?: string;
  eventName?: string;
  teacherName?: string;
  roomName?: string;
  /** @format uuid */
  consecutiveGroupId?: string;
  /** @format uuid */
  concurrentCourseId?: string;
  concurrentCourseTitle?: string;
  /** @format uuid */
  combinedGroupId?: string;
  lessonTeacherIds?: string[];
}

export interface TimetableLessonReplacementRequestDto {
  changeType?: "LESSON" | "SCHEDULE";
  selectedType?: "ALL" | "GRADE" | "CLASS" | "NONE";
  lessonChangeType?:
    | "EXCHANGE"
    | "ADJUSTMENT"
    | "REPLACEMENT"
    | "ADDITION"
    | "COMBINATION"
    | "MULTIPLE"
    | "CANCEL"
    | "EVENT"
    | "REASSIGNMENT"
    | "DUPLICATION"
    | "REMOVAL"
    | "INTERNAL_SWAP"
    | "EXTERNAL_SWAP"
    | "NONE";
  status?: "PENDING" | "COMPLETED" | "CANCELED" | "REJECTED" | "IGNORED";
  sourceLesson: TimetableDailyLessonDto;
  targetLesson: TimetableDailyLessonDto;
  reason?: string;
}

export interface TimetableLessonMultipleRequestDto {
  changeType?: "LESSON" | "SCHEDULE";
  selectedType?: "ALL" | "GRADE" | "CLASS" | "NONE";
  lessonChangeType?:
    | "EXCHANGE"
    | "ADJUSTMENT"
    | "REPLACEMENT"
    | "ADDITION"
    | "COMBINATION"
    | "MULTIPLE"
    | "CANCEL"
    | "EVENT"
    | "REASSIGNMENT"
    | "DUPLICATION"
    | "REMOVAL"
    | "INTERNAL_SWAP"
    | "EXTERNAL_SWAP"
    | "NONE";
  status?: "PENDING" | "COMPLETED" | "CANCELED" | "REJECTED" | "IGNORED";
  sourceLesson: TimetableDailyLessonDto;
  targetTeacherIds: string[];
  reason?: string;
}

export interface TimetableLessonExchangeInfoDto {
  status?: "PENDING" | "COMPLETED" | "CANCELED" | "REJECTED" | "IGNORED";
  exchangeDailyLessons?: TimetableDailyLessonDto[];
  reason?: string;
  /** @format uuid */
  lessonChangeId?: string;
  /** @format uuid */
  timetableId?: string;
}

export interface TimetableLessonCombinationRequestDto {
  changeType?: "LESSON" | "SCHEDULE";
  selectedType?: "ALL" | "GRADE" | "CLASS" | "NONE";
  lessonChangeType?:
    | "EXCHANGE"
    | "ADJUSTMENT"
    | "REPLACEMENT"
    | "ADDITION"
    | "COMBINATION"
    | "MULTIPLE"
    | "CANCEL"
    | "EVENT"
    | "REASSIGNMENT"
    | "DUPLICATION"
    | "REMOVAL"
    | "INTERNAL_SWAP"
    | "EXTERNAL_SWAP"
    | "NONE";
  status?: "PENDING" | "COMPLETED" | "CANCELED" | "REJECTED" | "IGNORED";
  sourceLesson: TimetableDailyLessonDto;
  targetLessons: TimetableDailyLessonDto[];
  /** @format uuid */
  specialtyRoomId?: string;
  roomName?: string;
  targetTeacherIds: string[];
  reason?: string;
}

export interface TimetableLessonAdjustmentRequestDto {
  changeType?: "LESSON" | "SCHEDULE";
  selectedType?: "ALL" | "GRADE" | "CLASS" | "NONE";
  lessonChangeType?:
    | "EXCHANGE"
    | "ADJUSTMENT"
    | "REPLACEMENT"
    | "ADDITION"
    | "COMBINATION"
    | "MULTIPLE"
    | "CANCEL"
    | "EVENT"
    | "REASSIGNMENT"
    | "DUPLICATION"
    | "REMOVAL"
    | "INTERNAL_SWAP"
    | "EXTERNAL_SWAP"
    | "NONE";
  status?: "PENDING" | "COMPLETED" | "CANCELED" | "REJECTED" | "IGNORED";
  sourceLesson: TimetableDailyLessonDto;
  /** @format uuid */
  targetTeacherId: string;
  reason?: string;
}

export interface TimetableLessonAdditionRequestDto {
  changeType?: "LESSON" | "SCHEDULE";
  selectedType?: "ALL" | "GRADE" | "CLASS" | "NONE";
  lessonChangeType?:
    | "EXCHANGE"
    | "ADJUSTMENT"
    | "REPLACEMENT"
    | "ADDITION"
    | "COMBINATION"
    | "MULTIPLE"
    | "CANCEL"
    | "EVENT"
    | "REASSIGNMENT"
    | "DUPLICATION"
    | "REMOVAL"
    | "INTERNAL_SWAP"
    | "EXTERNAL_SWAP"
    | "NONE";
  status?: "PENDING" | "COMPLETED" | "CANCELED" | "REJECTED" | "IGNORED";
  targetLesson: TimetableDailyLessonDto;
  reason?: string;
}

export interface CreateDto {
  /** @format uuid */
  courseId: string;
  /** @format uuid */
  consecutiveGroupId?: string;
  /** @format int32 */
  grade: number;
  /** @format int32 */
  dayOfWeek: number;
  /** @format int32 */
  period: number;
}

export interface TimetableFixedConfRequestDto {
  createDtos: CreateDto[];
}

export interface TimetableConcurrentCourseFixRequestDto {
  confIdsToDelete: string[];
  confsToAdd: CreateDto[];
}

export interface TimetableCourseRequestDto {
  /** @format uuid */
  courseBaseId?: string;
  standardCourseTitle?: string;
  displayedTitle: string;
  /** @format int32 */
  periodCount: number;
  isDoubleTeacher?: boolean;
}

export interface TimetableCourseBaseRequestDto {
  standardCourseTitle?: string;
  /** @format uuid */
  standardCourseId?: string;
  displayedTitle: string;
  isDoubleTeacher?: boolean;
  /** @format uuid */
  courseBaseId?: string;
  /** @format uuid */
  timetableId?: string;
}

export interface ConsecutiveConfDto {
  /** @format uuid */
  courseId: string;
  /** @format uuid */
  teacherId: string;
  /** @format int32 */
  grade: number;
  consecutivePeriod: string;
  teacherName: string;
}

export interface TimetableConsecutiveConfCreateDto {
  consecutiveConfDtos: ConsecutiveConfDto[];
}

export interface TimetableConcurrentConfCreateDto {
  /** @format int32 */
  grade: number;
  displayedTitle: string;
  /** @format int32 */
  periodCount?: number;
  isCombinedClass?: boolean;
}

export interface TimetableConcurrentCourseUpdateDto {
  /** @format uuid */
  courseId: string;
  /** @format uuid */
  classId: string;
}

export interface TimetableBasicLessonDto {
  /** @format uuid */
  lessonId?: string;
  /** @format uuid */
  classId: string;
  /** @format int32 */
  dayOfWeek: number;
  /** @format int32 */
  period: number;
  /** @format uuid */
  courseId?: string;
  /** @format uuid */
  specialtyRoomId?: string;
  isFixedCourse?: boolean;
  isManuallyAssigned?: boolean;
  /** @format uuid */
  concurrentCourseId?: string;
  concurrentCourseTitle?: string;
  /** @format uuid */
  consecutiveGroupId?: string;
  courseName?: string;
  lessonTeachers?: TimetableLessonTeacherDto[];
}

export interface TimetableLessonTeacherDto {
  /** @format uuid */
  teacherId?: string;
  /** @format uuid */
  lessonConfId?: string;
}

export interface TimetableBasicLessonsBatchDto {
  isReplaceAll?: boolean;
  memo?: string;
  lessons?: TimetableBasicLessonDto[];
}

export interface TimetableLessonTossRequestDto {
  lessonIdsToUpdate: string[];
  sourceConfIds: string[];
  sourceTeacher: TeacherInfo;
  targetTeacher: TeacherInfo;
  memo?: string;
}

export interface TimetableLessonSwapRequestDto {
  lessonIdsToDelete: string[];
  lessonsToAdd: TimetableBasicLessonDto[];
  sourceConfIds: string[];
  targetConfIds: string[];
  memo?: string;
}

export interface TimetableLessonCreateDeleteRequestDto {
  isReplaceAll?: boolean;
  memo?: string;
  lessonsToAdd?: TimetableBasicLessonDto[];
  lessonIdsToDelete?: string[];
}

export interface TimetableIndexRequestDto {
  timetableName: string;
  /** @format uuid */
  schoolId: string;
  /** @format int32 */
  operationStartDate: number;
  /** @format int32 */
  operationEndDate: number;
}

export interface SurveyCopyRequestDto {
  purpose?: "SHARE_TO_LIST" | "USE_FOR_NEW_SURVEY" | "KEEP_MY_STORAGE";
  /** @format uuid */
  userId?: string;
  originSurveyStatus?:
    | "SHARE"
    | "KEEP"
    | "TEMPORARY"
    | "COMPLETE"
    | "RESERVATION"
    | "WAITING"
    | "DOING"
    | "END";
  /** @format uuid */
  schoolId?: string;
  /** @format uuid */
  classId?: string;
}

export interface SurveyEditCopyRequest {
  /** @format uuid */
  userId?: string;
  originSurveyStatus?:
    | "SHARE"
    | "KEEP"
    | "TEMPORARY"
    | "COMPLETE"
    | "RESERVATION"
    | "WAITING"
    | "DOING"
    | "END";
  /** @format uuid */
  schoolId?: string;
  /** @format uuid */
  classId?: string;
}

export interface SurveyStatRespondentsRequest {
  waitStatus?: "COMPLETE" | "WAIT" | "APPLY" | "OVER";
  /** @format int32 */
  page?: number;
  /** @format int32 */
  size?: number;
}

export interface SurveySharedFormRequestV2 {
  recommend: boolean;
  sharedByMe: boolean;
  myFavorite: boolean;
  /** @format uuid */
  userId: string;
  get_surveyTitle?: string;
  sort?: "INSERTED_DESC" | "INSERTED_ASC" | "USED_DESC" | "USED_ASC";
  surveyType?:
    | "SURVEY"
    | "VOTE"
    | "AFTER_SCHOOL"
    | "CONSULTATION"
    | "FCFS"
    | "DRAW";
}

export interface SurveyKeptFormRequest {
  /** @format uuid */
  userId?: string;
  get_surveyTitle?: string;
  sort?: "INSERTED_DESC" | "INSERTED_ASC" | "USED_DESC" | "USED_ASC";
  surveyType?:
    | "SURVEY"
    | "VOTE"
    | "AFTER_SCHOOL"
    | "CONSULTATION"
    | "FCFS"
    | "DRAW";
}

export interface SurveySharedFormRequest {
  recommend: boolean;
  /** @format int32 */
  recommendLabelScore?: number;
  sharedByMe: boolean;
  myFavorite: boolean;
  /** @format uuid */
  userId: string;
  get_surveyTitle?: string;
  sort?: "INSERTED_DESC" | "INSERTED_ASC" | "USED_DESC" | "USED_ASC";
  surveyType?:
    | "SURVEY"
    | "VOTE"
    | "AFTER_SCHOOL"
    | "CONSULTATION"
    | "FCFS"
    | "DRAW";
}

export interface SurveyFavoriteDto {
  /** @format uuid */
  surveyId?: string;
  /** @format uuid */
  userId?: string;
}

export interface SurveyEditDto {
  /** @format uuid */
  surveyId?: string;
  surveyType:
    | "SURVEY"
    | "VOTE"
    | "AFTER_SCHOOL"
    | "CONSULTATION"
    | "FCFS"
    | "DRAW";
  surveyTitle: string;
  surveyDescription?: string;
  surveyStatus?:
    | "SHARE"
    | "KEEP"
    | "TEMPORARY"
    | "COMPLETE"
    | "RESERVATION"
    | "WAITING"
    | "DOING"
    | "END";
  isAnonymous: boolean;
  isRejectable: boolean;
  isUsedUrl: boolean;
  isVisibleResult: boolean;
  isAutoRemind: boolean;
  isReservation: boolean;
  /** @format int64 */
  surveyPosted: number;
  /** @format int64 */
  timestampStart?: number;
  /** @format int64 */
  timestampEnd?: number;
  /** @format int64 */
  completeTimestamp?: number;
  /** @format int32 */
  rankScore: number;
  /** @format uuid */
  schoolId: string;
  /** @format uuid */
  classId: string;
  isApply?: boolean;
  isPush?: boolean;
  targetUserIds?: string[];
  /** @format int64 */
  targetCount?: number;
  /** @format int64 */
  editedTimestamp?: number;
  files?: SurveyEditFileDto[];
  editPages?: SurveyEditPageResponseDto[];
  /** @format int32 */
  totalMax?: number;
  /** @format int32 */
  waitMax?: number;
}

export interface SurveyEditFileDto {
  /** @format uuid */
  fileId?: string;
  /** @format uuid */
  originalFileId?: string;
  /** @format int32 */
  sortNo: number;
  fileCategory:
    | "IMAGE"
    | "VIDEO"
    | "AUDIO"
    | "URL"
    | "SIGN"
    | "DOC"
    | "ZIP"
    | "ETC";
  fileLinkUrl?: string;
  fileName: string;
  fileContentType: string;
  fileSize?: string;
  fileOriginalPath: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  fileAlign: "LEFT" | "RIGHT" | "CENTER";
}

export interface SurveyEditPageQuestionResponseDto {
  /** @format uuid */
  questionId?: string;
  questionType?:
    | "CHOICE"
    | "SUBJECTIVE"
    | "SIGN"
    | "DROPDOWN"
    | "STAR"
    | "ATTACHMENTS"
    | "DESCRIPTION"
    | "CONSULTATION"
    | "AFTER_SCHOOL"
    | "VOTE";
  questionTitle?: string;
  /** @format int32 */
  sortNo?: number;
  isValidated?: boolean;
  isMultipleAnswer?: boolean;
  isLinkedPage?: boolean;
  linkPages?: SurveyEditPageSimpleDto[];
}

export interface SurveyEditPageResponseDto {
  /** @format uuid */
  pageId?: string;
  /** @format uuid */
  surveyId?: string;
  pageName?: string;
  isCustom?: boolean;
  /** @format int32 */
  sortNo?: number;
  linkPage?: SurveyEditPageSimpleDto;
  questions?: SurveyEditPageQuestionResponseDto[];
}

export interface SurveyEditPageSimpleDto {
  /** @format uuid */
  pageId?: string;
  pageName?: string;
  /** @format int32 */
  sortNo?: number;
}

export interface StickerParam {
  /** @format int64 */
  packSeq?: number;
  userType?: string;
}

export interface SheetMediaSaveDto {
  /** @format uuid */
  sheetId?: string;
  /** @format int64 */
  mediaSeq?: number;
  mediaCd?: string;
  contentNo?: string;
  youtubeId?: string;
  linkUrl?: string;
  thumbUrl?: string;
  mediaTitle?: string;
  filePath?: string;
  realFileName?: string;
  saveFileName?: string;
  fileExt?: string;
  /** @format int64 */
  fileSize?: number;
  /** @format int64 */
  sortNum?: number;
  useYn?: string;
}

export interface SheetQuesAnswerSaveDto {
  /** @format int64 */
  answerSeq?: number;
  /** @format int32 */
  sheetPage?: number;
  answer?: string;
}

export interface SheetQuesExampleSaveDto {
  /** @format int64 */
  wsQuesExamSeq?: number;
  /** @format int32 */
  sheetPage?: number;
  toolCd?: string;
  /** @format int64 */
  x?: number;
  /** @format int64 */
  y?: number;
  /** @format int64 */
  width?: number;
  /** @format int64 */
  height?: number;
  fontFamily?: string;
  /** @format int64 */
  fontSize?: number;
  fontStyle?: string;
  fontColor?: string;
  /** @format int64 */
  borderSize?: number;
  borderColor?: string;
  backgroundColor?: string;
  opacity?: string;
  txt?: string;
}

export interface SheetSaveDto {
  /** @format uuid */
  parentId?: string;
  sheetStatus?: "USED" | "NOT_USED" | "TEMP";
  applyType?: "ABSENT" | "FIELD_STUDY" | "MEDICATION_ORDER" | "ETC";
  sheetType?: "H" | "W";
  share?: boolean;
  title?: string;
  description?: string;
  del?: boolean;
  /** @format int64 */
  sortNum?: number;
  sheetTools?: SheetToolSaveDto[];
  sheetMedias?: SheetMediaSaveDto[];
}

export interface SheetToolSaveDto {
  /** @format uuid */
  sheetId?: string;
  /** @format int64 */
  toolSeq?: number;
  /** @format int32 */
  sheetPage?: number;
  quesNo?: string;
  toolCd?: string;
  /** @format int64 */
  x?: number;
  /** @format int64 */
  y?: number;
  /** @format int64 */
  width?: number;
  /** @format int64 */
  height?: number;
  fontFamily?: string;
  /** @format int64 */
  fontSize?: number;
  fontStyle?: string;
  fontColor?: string;
  /** @format int64 */
  borderSize?: number;
  borderColor?: string;
  backgroundColor?: string;
  opacity?: string;
  lineStartType?: string;
  lineEndType?: string;
  lineType?: string;
  lineColor?: string;
  /** @format double */
  allot?: number;
  txt?: string;
  essential?: boolean;
  exampleList?: SheetQuesExampleSaveDto[];
  answerList?: SheetQuesAnswerSaveDto[];
}

export interface SheetResponseRequestDto {
  /** @format uuid */
  applyId?: string;
  sheetResponses?: SheetResponseSaveDto[];
}

export interface SheetResponseSaveDto {
  /** @format uuid */
  applyId?: string;
  /** @format int64 */
  responseSeq?: number;
  /** @format int64 */
  toolSeq?: number;
  response?: string;
  result?: string;
}

export interface SheetRejectSaveDto {
  clazzApplyId?: string;
  content?: string;
}

export interface SheetInfoRequestDto {
  /** @format uuid */
  parentId?: string;
  applyTypes?: ("ABSENT" | "FIELD_STUDY" | "MEDICATION_ORDER" | "ETC")[];
  sheetStatus?: "USED" | "NOT_USED" | "TEMP";
  title?: string;
  sheetType?: "H" | "W";
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  schoolId?: string;
}

export interface IScreamEduSendMessage {
  channel?: "APP" | "SMS" | "MMS" | "TALK";
  title?: string;
  body?: string;
  datas?: Record<string, string>;
  files?: string;
  tempCode?: string;
  reType?: "SMS" | "MMS";
  reBody?: string;
  /** @format int64 */
  sendDate?: number;
  test?: boolean;
  users?: User[];
  isPriority?: boolean;
  /** @format int32 */
  sleep?: number;
  sendTelNo?: string;
  options?: Record<string, object>;
}

export interface AttendanceDto {
  /** @format uuid */
  attendanceId?: string;
  /** @format uuid */
  classId?: string;
  student?: ClazzStudentResponseDto;
  attendanceDate?: string;
  attendanceType?:
    | "ABSENCE"
    | "EARLY_LEAVE"
    | "LATENESS"
    | "OUT"
    | "FIELD_STUDY";
  attendanceConfirmType?: "ILLNESS" | "NOT_ACCEPT" | "ETC" | "ATTENDANCE";
  /** @format int64 */
  confirmTimestamp?: number;
  reason: string;
  memo?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  insertedUser?: AttendanceUserDto;
  fileExists?: boolean;
  /** @format int64 */
  fileCount?: number;
  isConfirmed?: boolean;
}

export interface AttendancePushDto {
  /** @format uuid */
  attendanceId?: string;
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  studentId?: string;
  studentName?: string;
  attendanceDate?: string;
  attendanceType?:
    | "ABSENCE"
    | "EARLY_LEAVE"
    | "LATENESS"
    | "OUT"
    | "FIELD_STUDY";
  attendanceConfirmType?: "ILLNESS" | "NOT_ACCEPT" | "ETC" | "ATTENDANCE";
  /** @format uuid */
  insertedUserId?: string;
}

export interface AttendanceUserDto {
  /** @format uuid */
  userId?: string;
  userName?: string;
  memberChildName?: string;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
}

export interface ClazzStudentResponseDto {
  /** @format uuid */
  studentId?: string;
  /** @format uuid */
  tagId?: string;
  tagName?: string;
  /** @format int32 */
  studentNo?: number;
  studentName?: string;
  isUsed?: boolean;
  /** @format int64 */
  notUsedTimestamp?: number;
  isMatchTag?: boolean;
}

export interface SendMessage {
  messageCode?: string;
  user?: UserView;
  userId?: string;
  /** @format uuid */
  writeUserId?: string;
  phone?: string;
  phones?: string[];
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  postId?: string;
  /** @format uuid */
  surveyId?: string;
  itemIds?: string[];
  /** @format uuid */
  chatId?: string;
  /** @format uuid */
  schoolId?: string;
  clazzSubscribe?: ClazzSubscribe;
  postComment?: PostComment;
  /** @format uuid */
  pushGroupId?: string;
  title?: string;
  message?: string;
  healthChecks?: SendMessageHealthCheck[];
  /** @format uuid */
  workId?: string;
  /** @format uuid */
  applyId?: string;
  /** @format uuid */
  sheetId?: string;
  sheetType?: "H" | "W";
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  userName?: string;
  chatMessage?: ChatMessageDto;
  userIds?: string[];
  currentPushTarget?: "ALL" | "TEACHER" | "PARENTS" | "STUDENT";
  attendance?: AttendanceDto;
  attendancePushDto?: AttendancePushDto;
  /** @format uuid */
  attendanceId?: string;
  /** @format int64 */
  reservationTime?: number;
  /** @format uuid */
  scheduleId?: string;
  errorCode?:
    | "W00"
    | "S00"
    | "E10"
    | "E20"
    | "E30"
    | "E40"
    | "E50"
    | "E60"
    | "E99";
  /** @format int32 */
  failCount?: number;
}

export interface SendMessageHealthCheck {
  phone?: string;
  schoolName?: string;
  sidoEducationOfficeUrl?: string;
  studentName?: string;
  certificationCode?: string;
  shortcutUrl?: string;
}

export interface SectionRequest {
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  /** @format int32 */
  sortNo?: number;
  kind?: "DEFAULT" | "ADD";
  type?:
    | "USER_BAR"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "THUMBNAIL"
    | "TEXT_BAR"
    | "TAB_LIST"
    | "TAB_THUMBNAIL"
    | "TAB_IMAGE"
    | "MEAL"
    | "LIST"
    | "KEYWORD"
    | "CP_RECOMMEND"
    | "THUMBNAIL_BTN"
    | "QUICK_MENU"
    | "GUIDE"
    | "BANNER_TOP"
    | "QUIZ"
    | "GROUP_MAIN"
    | "GROUP_LIST"
    | "AD_SDK";
  title?: string;
  cpId?: string;
  /** @format int32 */
  displayCount?: number;
  displayType?: "PIN" | "ROTATE";
  displayRule?: "ORDERLY" | "RANDOM";
  used?: boolean;
  del?: boolean;
}

export interface SectionPostListRequest {
  postId?: string;
  postTitle?: string;
  del?: boolean;
  parentId?: string;
  categoryId?: string;
  /** @uniqueItems true */
  userType?: (
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER"
  )[];
  postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
  postStatus?:
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT";
  insertedTimestamp?: number[];
  posted?: number[];
  /** @format int32 */
  readCount?: number;
  /** @format int32 */
  forwardingCount?: number;
  /** @format int64 */
  commentCount?: number;
  recommendation?: boolean;
}

export interface SectionListRequest {
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  /** @format int32 */
  sortNo?: number;
  kind?: "DEFAULT" | "ADD";
  type?:
    | "USER_BAR"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "THUMBNAIL"
    | "TEXT_BAR"
    | "TAB_LIST"
    | "TAB_THUMBNAIL"
    | "TAB_IMAGE"
    | "MEAL"
    | "LIST"
    | "KEYWORD"
    | "CP_RECOMMEND"
    | "THUMBNAIL_BTN"
    | "QUICK_MENU"
    | "GUIDE"
    | "BANNER_TOP"
    | "QUIZ"
    | "GROUP_MAIN"
    | "GROUP_LIST"
    | "AD_SDK";
  title?: string;
  cpId?: string;
  /** @format int32 */
  displayCount?: number;
  displayType?: "PIN" | "ROTATE";
  displayRule?: "ORDERLY" | "RANDOM";
  used?: boolean;
  del?: boolean;
  detailType?: "CONTENTS" | "LINK_TEXT";
  contents?: string;
}

export interface SectionLinkRequest {
  uniqueCode?: string;
  url?: string;
  linkType?: "INTERNAL" | "EXTERNAL" | "POST" | "LINK" | "MENU" | "CP_HOME";
  cpId?: string;
  comment?: string;
  del?: boolean;
}

export interface CpView {
  cpId?: string;
  name?: string;
  used?: boolean;
  del?: boolean;
  recommendation?: boolean;
  currentId?: string;
}

export interface SectionLinkListRequest {
  currentId?: string;
  uniqueCode?: string;
  url?: string;
  linkType?: "INTERNAL" | "EXTERNAL" | "POST" | "LINK" | "MENU" | "CP_HOME";
  cpId?: string;
  cp?: CpView;
  comment?: string;
  del?: boolean;
}

export interface SectionDetailRequest {
  /** @format int64 */
  sectionId?: number;
  /** @format int32 */
  sortNo?: number;
  type?: "CONTENTS" | "LINK_TEXT";
  contentsType?:
    | "POST"
    | "LINK"
    | "MENU"
    | "POST_FEED"
    | "KEYWORD"
    | "CP_HOME"
    | "OFFERWALL_BANNER"
    | "OFFERWALL_GROUP";
  contents?: string;
  titlePoint?: string;
  title?: string;
  titleSub?: string;
  del?: boolean;
}

export interface SchoolRequestDto {
  /** @format uuid */
  schoolId?: string;
  schoolName?: string;
  keyword?: string;
  schoolStatus?: string;
  get_schoolName?: string;
  get_schoolStatus?: ("ACTIVATE" | "DEACTIVATE" | "CLOSING")[];
  get_schoolArea?:
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU";
  get_schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  get_schoolCodeNeis?: string;
  /** @format int32 */
  get_schoolCodeIscream?: number;
  get_neisOpenApiCode?: string;
  schoolTypes?: (
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP"
  )[];
  schoolStatuses?: ("ACTIVATE" | "DEACTIVATE" | "CLOSING")[];
}

export interface NeisOpenApiRequest {
  /** @format int32 */
  size?: number;
  /** @format int32 */
  number?: number;
  schoolKeyword?: string;
  eduOffice?: string;
}

export interface SchoolSubscribeRequestDto {
  user?: UserView;
  school?: SchoolView;
  joinType?: "SCHOOL" | "CLASS";
}

export interface SchoolSubscribeView {
  /** @format uuid */
  memberId?: string;
  joinType?: "SCHOOL" | "CLASS";
  schoolId?: string;
  schoolName?: string;
  schoolStatus?: string;
  schoolImagePath?: string;
  schoolArea?:
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU";
  userId?: string;
  userName?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  alarmPlusUsed?: boolean;
  alarmEduOfficeUsed?: boolean;
  timetableNeisUsed?: boolean;
  /** @format int32 */
  sortNo?: number;
  /** @format uuid */
  currentId?: string;
}

export interface SchoolApplyRequestDto {
  schoolName?: string;
  /** @format int32 */
  schoolKind?: number;
  address1?: string;
  address2?: string;
  tel1?: string;
  tel2?: string;
  tel3?: string;
  homepage?: string;
  applyStatus?: "WAITING" | "COMPLETE" | "DUPLICATE" | "ETC";
  /** @format uuid */
  applyUserId?: string;
  applyTimestamp?: number[];
  memo?: string;
}

export interface SampleRequestDto {
  /** @format int64 */
  seq?: number;
  name?: string;
  address?: string;
}

export interface UserSafetyRolesSaveDto {
  /** @format uuid */
  safetyId?: string;
  /** @format uuid */
  categoryId: string;
  /** @format uuid */
  userId: string;
  safetyType?: string;
  message: string;
  /** @format int32 */
  sortNo?: number;
}

export interface UserSafetyRolesCategorySaveDto {
  /** @format uuid */
  categoryId?: string;
  /** @format uuid */
  userId: string;
  categoryType?: string;
  categoryName: string;
  isDel?: boolean;
  /** @format int32 */
  sortNo?: number;
}

export interface UserDeleteDevice {
  insertedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  userId?: string;
  pushToken?: string;
  osType?: "ANDROID" | "IOS" | "ETC";
  mid?: string;
}

export interface Board {
  /** @format uuid */
  classId: string;
  /** @format uuid */
  boardId: string;
  /** @format uuid */
  folderId: string;
}

export interface PostValidRequestDto {
  /** @format uuid */
  userId: string;
  boards: Board[];
}

export interface PostMealRequestDto {
  /** @format uuid */
  schoolId?: string;
  posted?: number[];
  yyyyMM?: string;
  /** @format uuid */
  userId?: string;
}

export interface BoardFolderInfoResponseDto {
  /** @format uuid */
  boardId?: string;
  /** @format uuid */
  classId?: string;
  boardType?: "PUBLIC" | "SECRET";
  boardName?: string;
  boardStatus?: "ACTIVATE" | "DEACTIVATE";
  isDefault?: boolean;
  isUsedFolder?: boolean;
  postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
  isDelBoard?: boolean;
  isReadTeacher?: boolean;
  isReadParents?: boolean;
  isReadStudent?: boolean;
  isWriteParents?: boolean;
  isWriteStudent?: boolean;
  isUsedComment?: boolean;
  isCommentTeacher?: boolean;
  isCommentParents?: boolean;
  isCommentStudent?: boolean;
  isUsedLike?: boolean;
  folderId?: string;
  folderName?: string;
  folderColor?: string;
  isDelFolder?: boolean;
  boardPermission?: BoardPermissionDto;
}

export interface PostDslRequest {
  get_keyword?: string;
  get_postType?: (
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE"
  )[];
  get_postStatus?: (
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT"
  )[];
  get_postStatusUser?: string;
  get_pushTarget?: ("ALL" | "TEACHER" | "PARENTS" | "STUDENT")[];
  get_posted?: number[];
  get_insertedTimestamp?: number[];
  /** @format int64 */
  get_postedLte?: number;
  /** @format int64 */
  get_postedGte?: number;
  get_parentUri?: string[];
  get_parentId?: string[];
  parentRole?: string[];
  get_schoolId?: string;
  get_schoolArea?: string[];
  get_classGrade?: string[];
  get_postLand?: string[];
  get_userType?: string[];
  get_postKeyword?: string[];
  get_del?: boolean;
  get_deviceType?: ("WEB" | "APP" | "IOS" | "ANDROID")[];
  get_bannerType?: ("POPUP" | "BANNER")[];
  get_positionType?: (
    | "WEB_POPUP_HOME"
    | "WEB_POPUP_CHAT"
    | "WEB_POPUP_EDUCATION"
    | "WEB_POPUP_CLASS"
    | "WEB_POPUP_SCHOOL"
    | "WEB_BANNER_HOME_FEED"
    | "WEB_BANNER_QUICK"
    | "WEB_BANNER_QUICK_CLASS"
    | "WEB_BANNER_LNB"
    | "WEB_BANNER_RNB"
    | "APP_POPUP_SPLASH_SCREEN"
    | "APP_POPUP_ENDING_SCREEN"
    | "APP_POPUP_HOME"
    | "APP_POPUP_CLASS"
    | "APP_POPUP_CALENDER"
    | "APP_POPUP_SCHOOL"
    | "APP_BANNER_HOME"
    | "APP_BANNER_CLASS"
    | "APP_BANNER_CLASS_B"
    | "APP_BANNER_CLASS_B_FOR_NEW_USER"
    | "APP_BANNER_CONTENT"
    | "APP_BANNER_TIMETABLE"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "FLOATING_BANNER"
    | "NOTIFICATION_BOX"
    | "BANNER_MORE_FEED"
    | "BANNER_TOP"
    | "HITALK_MAIN_TITLE"
    | "HITALK_MAIN_CARD"
    | "HITALK_MAIN_BANNER_A"
    | "HITALK_ROOM_LIST"
  )[];
  get_displayStatus?: "EXPECTED" | "PROGRESSING" | "CLOSED";
  /** @format int64 */
  get_timestampStartGte?: number;
  /** @format int64 */
  get_timestampEndLte?: number;
  get_insertedUser?: string;
  get_loginId?: string;
  get_classOwnerUserName?: string;
  get_mode?: string;
  get_userId?: string;
  get_categoryId?: string[];
  get_boardId?: string[];
  get_folderId?: string[];
  get_classStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING" | "CLOSED";
  get_classPermissionTeacherIds?: string[];
  get_classPermissionParentsIds?: string[];
  get_classPermissionStudentsIds?: string[];
  get_homeworkType?: "ALL" | "SUBMIT" | "NOT_SUBMIT";
  get_letterType?: (
    | "CONSULTATION"
    | "QUESTIONNAIRE"
    | "AFTER_SCHOOL"
    | "GENERAL"
    | "TKBELL"
    | "EDU_OFFICE"
    | "MEAL_BREAKFAST"
    | "MEAL_LUNCH"
    | "MEAL_DINNER"
  )[];
  get_reply?: boolean;
  get_teacherMode?: boolean;
  flagForExpiredReplies?: boolean;
  get_personal?: boolean;
  get_viewDeviceType?: "WEB" | "APP" | "IOS" | "ANDROID";
  isSearchClazzPost?: boolean;
  isSearchBoardPost?: boolean;
  isSearchSchoolPost?: boolean;
  isSearchInfoPost?: boolean;
  alarmPlusTeacherSchoolIds?: string[];
  schoolIds?: string[];
  /** @format uuid */
  userId?: string;
  postIds?: string[];
  reply?: string;
  boardInfo?: BoardFolderInfoResponseDto[];
}

export interface PostMainParam {
  keyword?: string;
  postType?: (
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE"
  )[];
  postStatus?: (
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT"
  )[];
  pushTarget?: ("ALL" | "TEACHER" | "PARENTS" | "STUDENT")[];
  posted?: number[];
  insertedTimestamp?: number[];
  /** @format int64 */
  postedLte?: number;
  /** @format int64 */
  postedGte?: number;
  parentUri?: string[];
  schoolArea?: string[];
  classGrade?: string[];
  postLand?: string[];
  userType?: string[];
  postKeyword?: string[];
  del?: boolean;
  parentRole?: string[];
  deviceType?: ("WEB" | "APP" | "IOS" | "ANDROID")[];
  bannerType?: ("POPUP" | "BANNER")[];
  positionType?: (
    | "WEB_POPUP_HOME"
    | "WEB_POPUP_CHAT"
    | "WEB_POPUP_EDUCATION"
    | "WEB_POPUP_CLASS"
    | "WEB_POPUP_SCHOOL"
    | "WEB_BANNER_HOME_FEED"
    | "WEB_BANNER_QUICK"
    | "WEB_BANNER_QUICK_CLASS"
    | "WEB_BANNER_LNB"
    | "WEB_BANNER_RNB"
    | "APP_POPUP_SPLASH_SCREEN"
    | "APP_POPUP_ENDING_SCREEN"
    | "APP_POPUP_HOME"
    | "APP_POPUP_CLASS"
    | "APP_POPUP_CALENDER"
    | "APP_POPUP_SCHOOL"
    | "APP_BANNER_HOME"
    | "APP_BANNER_CLASS"
    | "APP_BANNER_CLASS_B"
    | "APP_BANNER_CLASS_B_FOR_NEW_USER"
    | "APP_BANNER_CONTENT"
    | "APP_BANNER_TIMETABLE"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "FLOATING_BANNER"
    | "NOTIFICATION_BOX"
    | "BANNER_MORE_FEED"
    | "BANNER_TOP"
    | "HITALK_MAIN_TITLE"
    | "HITALK_MAIN_CARD"
    | "HITALK_MAIN_BANNER_A"
    | "HITALK_ROOM_LIST"
  )[];
  displayStatus?: "EXPECTED" | "PROGRESSING" | "CLOSED";
  /** @format int64 */
  timestampStartGte?: number;
  /** @format int64 */
  timestampEndLte?: number;
  mode?: string;
  postedFromTo?: number[];
}

export interface PostHomeworkUserCommentParam {
  /** @format uuid */
  workId?: string;
  del?: boolean;
}

export interface PostCommentInsertRequestDto {
  post?: string;
  user?: string;
  comment?: string;
  emoticonPath?: string;
  secret?: boolean;
  /** @format uuid */
  parentCommentId?: string;
  /** @uniqueItems true */
  files?: PostCommentFile[];
  del?: boolean;
  /** @format uuid */
  userId?: string;
  /** @format uuid */
  postId?: string;
}

export interface PostCommentSearchRequestDto {
  /** @format uuid */
  postId?: string;
  /** @format uuid */
  userId?: string;
  /** @format uuid */
  parentCommentId?: string;
  /** @format int32 */
  depth?: number;
  del?: boolean;
  insertedTimestamp?: number[];
  postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
}

export interface PostCommentReportSaveRequestDto {
  postComment?: string;
  reason?: string;
  status?: "WAITING" | "CONSENT" | "REJECTION";
  memo?: string;
  del?: boolean;
  commentDel?: boolean;
  /** @format uuid */
  postCommentId?: string;
}

export interface PostBanner {
  /** @format int64 */
  insertedTimestamp?: number;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format int64 */
  posted?: number;
  postTitlePoint?: string;
  postTitle?: string;
  postTitleSub?: string;
  postStatus?:
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT";
  del?: boolean;
  postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
  /** @format int32 */
  readCount?: number;
  /** @format int32 */
  forwardingCount?: number;
  deviceType?: "WEB" | "APP" | "IOS" | "ANDROID";
  bannerType?: "POPUP" | "BANNER";
  positionType?:
    | "WEB_POPUP_HOME"
    | "WEB_POPUP_CHAT"
    | "WEB_POPUP_EDUCATION"
    | "WEB_POPUP_CLASS"
    | "WEB_POPUP_SCHOOL"
    | "WEB_BANNER_HOME_FEED"
    | "WEB_BANNER_QUICK"
    | "WEB_BANNER_QUICK_CLASS"
    | "WEB_BANNER_LNB"
    | "WEB_BANNER_RNB"
    | "APP_POPUP_SPLASH_SCREEN"
    | "APP_POPUP_ENDING_SCREEN"
    | "APP_POPUP_HOME"
    | "APP_POPUP_CLASS"
    | "APP_POPUP_CALENDER"
    | "APP_POPUP_SCHOOL"
    | "APP_BANNER_HOME"
    | "APP_BANNER_CLASS"
    | "APP_BANNER_CLASS_B"
    | "APP_BANNER_CLASS_B_FOR_NEW_USER"
    | "APP_BANNER_CONTENT"
    | "APP_BANNER_TIMETABLE"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "FLOATING_BANNER"
    | "NOTIFICATION_BOX"
    | "BANNER_MORE_FEED"
    | "BANNER_TOP"
    | "HITALK_MAIN_TITLE"
    | "HITALK_MAIN_CARD"
    | "HITALK_MAIN_BANNER_A"
    | "HITALK_ROOM_LIST";
  /** @format int32 */
  positionOrderType?: number;
  popupType?: "LAYER" | "MODAL" | "WINDOW";
  /** @format int32 */
  locationX?: number;
  /** @format int32 */
  locationY?: number;
  /** @format int64 */
  timestampStart?: number;
  /** @format int64 */
  timestampEnd?: number;
  link?: string;
  linkTarget?: string;
  replayType?: "NONE" | "NOTTODAY" | "ANYMORE";
  adType?: "INTERNAL" | "EXTERNAL";
  linkType?: "INTERNAL" | "EXTERNAL" | "POST" | "LINK" | "MENU" | "CP_HOME";
  memo?: string;
  /** @format int64 */
  adWebId?: number;
  /** @format int64 */
  adAosId?: number;
  /** @format int64 */
  adIosId?: number;
  /** @uniqueItems true */
  schoolSigungu?: number[];
  /** @uniqueItems true */
  files?: File[];
  _postStatus?: (
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT"
  )[];
  _postTitle?: string;
  _deviceType?: ("WEB" | "APP" | "IOS" | "ANDROID")[];
  _bannerType?: ("POPUP" | "BANNER")[];
  _positionType?: (
    | "WEB_POPUP_HOME"
    | "WEB_POPUP_CHAT"
    | "WEB_POPUP_EDUCATION"
    | "WEB_POPUP_CLASS"
    | "WEB_POPUP_SCHOOL"
    | "WEB_BANNER_HOME_FEED"
    | "WEB_BANNER_QUICK"
    | "WEB_BANNER_QUICK_CLASS"
    | "WEB_BANNER_LNB"
    | "WEB_BANNER_RNB"
    | "APP_POPUP_SPLASH_SCREEN"
    | "APP_POPUP_ENDING_SCREEN"
    | "APP_POPUP_HOME"
    | "APP_POPUP_CLASS"
    | "APP_POPUP_CALENDER"
    | "APP_POPUP_SCHOOL"
    | "APP_BANNER_HOME"
    | "APP_BANNER_CLASS"
    | "APP_BANNER_CLASS_B"
    | "APP_BANNER_CLASS_B_FOR_NEW_USER"
    | "APP_BANNER_CONTENT"
    | "APP_BANNER_TIMETABLE"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "FLOATING_BANNER"
    | "NOTIFICATION_BOX"
    | "BANNER_MORE_FEED"
    | "BANNER_TOP"
    | "HITALK_MAIN_TITLE"
    | "HITALK_MAIN_CARD"
    | "HITALK_MAIN_BANNER_A"
    | "HITALK_ROOM_LIST"
  )[];
  _displayStatus?: "EXPECTED" | "PROGRESSING" | "CLOSED";
  _schoolArea?: string[];
  _classGrade?: string[];
  _userType?: string[];
  /** @format int64 */
  _timestampStart?: number;
  /** @format int64 */
  _timestampEnd?: number;
  _del?: boolean;
  /** @uniqueItems true */
  userType?: string[];
  /** @format uuid */
  currentId?: string;
  /** @uniqueItems true */
  classGrade?: string[];
  /** @uniqueItems true */
  schoolArea?: string[];
  displayStatus?: "EXPECTED" | "PROGRESSING" | "CLOSED";
  /** @uniqueItems true */
  getcommentUserType?: string[];
}

export interface MvoipCallRequestDto {
  /** @format uuid */
  sendId?: string;
  /** @format uuid */
  recvId?: string;
  /** @format uuid */
  classId?: string;
  callStatus?:
    | "disconnected_s"
    | "disconnected_r"
    | "rejected_s"
    | "rejected_r"
    | "missed"
    | "calling";
  isSendMissedCallPush?: boolean;
  /** @format uuid */
  callId?: string;
}

export interface MessageTargetFileDto {
  /** @format uuid */
  messageTargetFileId?: string;
  attachType?: "EXTRACTED_LIST" | "SENT_LIST";
  fileName?: string;
  fileContentType?: string;
  fileSize?: string;
  fileOriginalPath?: string;
  insertedUser?: UserView;
}

export interface MessageTargetUpdateDto {
  messageTitle: string;
  messageContent?: string;
  isMarketingUsed: boolean;
  /** @format int64 */
  joinTimestampStart?: number;
  /** @format int64 */
  joinTimestampEnd?: number;
  /** @format int32 */
  lastLoginDateStart?: number;
  /** @format int32 */
  lastLoginDateEnd?: number;
  isExcludeRecentUser: boolean;
  isExcludeTarget: boolean;
  /** @format uuid */
  adAgencyId?: string;
  campaignInfo?: string;
  /** @format int32 */
  requestCount?: number;
  /** @format int32 */
  extractedCount?: number;
  /** @format int64 */
  extractedTimestamp?: number;
  /** @format int32 */
  sentCount?: number;
  /** @format int64 */
  sentTimestamp?: number;
  processStatus:
    | "REGISTRATION"
    | "EXTRACTION_REQUEST"
    | "EXTRACTION_COMPLETE"
    | "SENT"
    | "REQUEST_UPDATE_SENT"
    | "COMPLETE_UPDATE_SENT"
    | "CANCEL";
  memo?: string;
  /** @uniqueItems true */
  userTypes: (
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER"
  )[];
  /** @uniqueItems true */
  classGrades: (
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO"
  )[];
  /** @uniqueItems true */
  schoolAreas: (
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU"
  )[];
  /** @uniqueItems true */
  schoolSigungu: number[];
  /** @uniqueItems true */
  excludeTargets: string[];
  /** @uniqueItems true */
  files: MessageTargetFileDto[];
}

export interface MessageTargetSearchRequestDto {
  /** @format int64 */
  sentTimestampStart?: number;
  /** @format int64 */
  sentTimestampEnd?: number;
  progressStatus?: "DOING" | "COMPLETE" | "CANCEL";
  processStatus?:
    | "REGISTRATION"
    | "EXTRACTION_REQUEST"
    | "EXTRACTION_COMPLETE"
    | "SENT"
    | "REQUEST_UPDATE_SENT"
    | "COMPLETE_UPDATE_SENT"
    | "CANCEL";
  /** @uniqueItems true */
  userTypes?: (
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER"
  )[];
  /** @uniqueItems true */
  classGrades?: (
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO"
  )[];
  /** @uniqueItems true */
  schoolAreas?: (
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU"
  )[];
  /** @format uuid */
  adAgencyId?: string;
  messageTitle?: string;
  messageContent?: string;
}

export interface UserAllergyRequestDto {
  /** @format uuid */
  userId?: string;
  /** @uniqueItems true */
  allergyCodes?: string[];
}

export interface HiTalkVoteCreateDto {
  roomIds: string[];
  resultStatus: "PUBLIC" | "COUNT_ONLY" | "PRIVATE";
  /** @format int64 */
  closedTimestamp?: number;
  /** @format uuid */
  userId: string;
  /**
   * @maxItems 3
   * @minItems 1
   * @uniqueItems true
   */
  questions: Question[];
}

export interface Question {
  questionType: "TEXT" | "DATE" | "IMAGE";
  questionTitle: string;
  questionDescription?: string;
  /**
   * @maxItems 50
   * @minItems 1
   * @uniqueItems true
   */
  items: Item[];
  isMultipleChoice: boolean;
  isAnonymous: boolean;
}

export interface HiTalkVoteSearchRequestDto {
  /** @format uuid */
  userId?: string;
  isMyPublished?: boolean;
}

export interface HiTalkBlockRequestDto {
  /** @format uuid */
  blockerUserId: string;
  /** @format uuid */
  blockedUserId: string;
  /** @format uuid */
  classId?: string;
}

export interface FileCreateDto {
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileFlag?: "FILE" | "THUMBNAIL" | "IMAGE_PACK";
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  /** @format int32 */
  sortNo?: number;
}

export interface HomeworkCreateDto {
  postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
  postStatus?:
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT";
  pushTarget?: "ALL" | "TEACHER" | "PARENTS" | "STUDENT";
  parentUri?: string;
  /** @format int64 */
  posted?: number;
  postTitle?: string;
  postContent?: string;
  /** @format uuid */
  boardId?: string;
  /** @format uuid */
  categoryId?: string;
  /** @format uuid */
  insertedUserId?: string;
  /** @format uuid */
  updatedUserId?: string;
  /** @uniqueItems true */
  files?: FileCreateDto[];
}

export interface EventChoiceQuestionDto {
  questionId?: string;
  /** @format int32 */
  choiceQuestionNo?: number;
  choiceQuestion?: string;
  /** @format int32 */
  pickCount?: number;
}

export interface EventProductRequestDto {
  productId?: string;
  /** @format int32 */
  productCount?: number;
  productName?: string;
  /** @format double */
  productProb?: number;
  exc?: boolean;
}

export interface EventQuestionDto {
  questionId?: string;
  /** @format int32 */
  questionNo?: number;
  question?: string;
  questionDesc?: string;
  answer?: string;
  questionType?: "CHOICE" | "WRITE" | "MIX";
  choiceQuestions?: EventChoiceQuestionDto[];
}

export interface EventRequestDto {
  postId?: string;
  eventType?: "APPLY" | "CHECK" | "ROULETTE";
  eventDetailType?:
    | "NONE"
    | "QUIZ"
    | "SURVEY"
    | "COMMENT"
    | "LANDING"
    | "AWARDS"
    | "COMMON"
    | "SAME_GRADE"
    | "RECOMMEND_CODE"
    | "PARENT_TO_TEACHER"
    | "TEACHER_VERIFICATION";
  showResultType?: "NONE" | "ALWAYS" | "JOIN" | "EVENT_END";
  showCurrentJoinType?: "NONE" | "JOIN" | "ANSWERING";
  texts?: EventTextRequestDto[];
  products?: EventProductRequestDto[];
  questions?: EventQuestionDto[];
  winningType?: "ALL" | "ORDER" | "AFTER";
  noticeResultType?: "NONE" | "JOIN";
  commentTimestampType?:
    | "POSTED_EVENTEND"
    | "EVENTSTART_EVENTEND"
    | "CLOSED"
    | "NONE";
  commentSecretStatus?: boolean;
  landingUrl?: string;
  /** @format int32 */
  personCount?: number;
  /** @format int32 */
  checkCount?: number;
  /** @format int32 */
  joinCount?: number;
  joinStatus?: boolean;
  backgroundColor?: string;
  repStatus?: boolean;
  repEventId?: string;
  beforeStampFilePath?: string;
  afterStampFilePath?: string;
}

export interface EventTextRequestDto {
  eventTextId?: string;
  eventTextType?:
    | "APPLY"
    | "WINNING"
    | "NOT_WINNING"
    | "JOIN"
    | "ANSWER"
    | "WRONG_ANSWER";
  text?: string;
}

export interface EventGameRequestDto {
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  schoolId?: string;
  /** @format int64 */
  classCount?: number;
  classGrade?: string;
  replies?: EventReplyRequestDto[];
}

export interface EventReplyRequestDto {
  /** @format int32 */
  questionNo?: number;
  /** @format int32 */
  choiceReply?: number;
  writeReply?: string;
}

export interface EventSearchCondition {
  get_dateType?: "POSTED" | "EVENT_START";
  /** @format int64 */
  get_timestampGoe?: number;
  /** @format int64 */
  get_timestampLoe?: number;
  get_eventType?: "APPLY" | "CHECK" | "ROULETTE";
  get_userType?: string;
  get_searchType?: string;
  get_keyword?: string;
  get_repStatus?: boolean;
  get_del?: boolean;
}

export interface EventDateSearchCondition {
  eventId?: string;
  get_dateType?: "POSTED" | "EVENT_START";
  /** @format int64 */
  get_timestampGoe?: number;
  /** @format int64 */
  get_timestampLoe?: number;
  get_eventUserDateType?: string;
  get_eventUserCorrectStatus?: boolean;
}

export interface EventTeacherAuthApplyRequestDto {
  /** @format uuid */
  applyUserId: string;
  applyUserType:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  applyUserMobile: string;
  applyUserName: string;
  applyUserSns: string;
  applyType: "PARENT_TO_TEACHER" | "TEACHER_VERIFICATION";
  applyEntryPathType: "EVENT" | "DIRECT";
  /** @format uuid */
  applyEntryPath: string;
  authType: "CERTIFICATE" | "GPKI";
  schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  userMarketingUsed?: boolean;
  fileName: string;
  filePath: string;
  contentType: string;
  size: string;
}

export interface EventTeacherAuthSwitchRequestDto {
  /** @format uuid */
  userId?: string;
  /** @format uuid */
  applyEntryPath: string;
  c: string;
  n: string;
}

export interface EventSameGradeRequestDto {
  cond1?: string;
  keyword1?: string;
  cond2?: string;
  keyword2?: string;
  classGrade?: string;
  complete?: boolean;
}

export interface EventRecommendFileDto {
  /** @format uuid */
  fileId?: string;
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  /** @format int64 */
  insertedTimestamp?: number;
}

export interface EventRecommendInsertDto {
  eventId: string;
  /** @format uuid */
  postId: string;
  /** @format uuid */
  userId: string;
  /** @format uuid */
  recommendUserId: string;
  recommendCode: string;
  schoolArea:
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU";
  schoolName: string;
  file: EventRecommendFileDto;
}

export interface SchoolManagerRequestDto {
  /** @format uuid */
  elSchoolManagerId?: string;
  name?: string;
  schoolName?: string;
  insertedTimestamp?: number[];
  approvalStatus?: "CONSENT" | "REJECTION" | "WAITING";
  approvalUserType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  hasMaster?: boolean;
}

export interface ElParentsSubscriptionRequest {
  /** @format uuid */
  elParentsSubscriptionId?: string;
  /** @format uuid */
  elGroupStudentClassId?: string;
  studentNo?: string;
  studentName?: string;
  parentsMobile?: string;
  approvalStatus?: "CONSENT" | "REJECTION" | "WAITING";
  /** @format uuid */
  approvalUser?: string;
  /** @format int64 */
  approbalInsertedTimestamp?: number;
  /** @format uuid */
  userId?: string;
  /** @format uuid */
  insertedUser?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  mobile?: string;
}

export interface MultiValueMapStringObject {
  all?: Record<string, object>;
  empty?: boolean;
  [key: string]: any;
}

export interface CsAdviceRequestDto {
  timestamp?: number[];
  processTimestamp?: number[];
  processUserName?: string;
  csStatus?:
    | "INPROGRESS"
    | "COMPLETE"
    | "TRANSREQUEST"
    | "TRANSCOMPLETE"
    | "CSREQUEST"
    | "CSRECOMPLETE"
    | "ALLCOMPLETE";
  csType?: "HICLASS" | "HISTORE";
  ctiCallType?: "INCALL" | "OUTCALL";
  userActive?: boolean;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  /** @format int64 */
  csCategorySeq?: number;
  /** @format int64 */
  prntsCategorySeq?: number;
  userMobile?: string;
  loginId?: string;
  /** @format int64 */
  csSeq?: number;
  userName?: string;
  csContent?: string;
}

export interface CpRequest {
  name?: string;
  viewTeacher?: boolean;
  viewParents?: boolean;
  viewStudent?: boolean;
  usedPage?: boolean;
  pass?: boolean;
  contentsType?: string[];
  used?: boolean;
  del?: boolean;
}

export interface CpReviewRequest {
  cpId?: string;
  /** @format uuid */
  postId?: string;
  postStatus?:
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT";
  comment?: string;
  del?: boolean;
}

export interface CpReviewList {
  /** @format uuid */
  reviewId?: string;
  cpId: string;
  /** @format uuid */
  postId: string;
  postStatus:
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT";
  system: boolean;
  comment: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedUser?: UserView;
  cp?: CpView;
  /** @format uuid */
  currentId?: string;
}

export interface CpList {
  cpId?: string;
  name?: string;
  viewTeacher?: boolean;
  viewParents?: boolean;
  viewStudent?: boolean;
  recommendation?: boolean;
  usedPage?: boolean;
  pass?: boolean;
  /** @uniqueItems true */
  contentsType?: ("POST" | "LINK" | "MENU" | "CP_HOME")[];
  used?: boolean;
  del?: boolean;
  /** @format int64 */
  insertedTimestamp?: number;
  /** @format int64 */
  updatedTimestamp?: number;
  updatedUser?: UserView;
  thumbnail?: CpFile;
  thumbnailHeader?: CpFile;
  /** @format int64 */
  postReadCount?: number;
  /** @uniqueItems true */
  cpCategories?: CpCategoryView[];
  currentId?: string;
  /** @format int32 */
  categoryCount?: number;
}

export interface CpCategoryList {
  cpCategoryId?: string;
  cpId?: string;
  name?: string;
  /** @format int32 */
  sortNo?: number;
  viewTeacher?: boolean;
  viewParents?: boolean;
  viewStudent?: boolean;
  used?: boolean;
  del?: boolean;
  /** @format int64 */
  insertedTimestamp?: number;
  /** @format int64 */
  postReadCount?: number;
  cp?: CpView;
  currentId?: string;
}

export interface CpCategoryRequest {
  cpId?: string;
  name?: string;
  /** @format int32 */
  sortNo?: number;
  viewTeacher?: boolean;
  viewParents?: boolean;
  viewStudent?: boolean;
  used?: boolean;
  del?: boolean;
}

export interface ClazzTagDto {
  /** @format uuid */
  tagId?: string;
  tagName?: string;
  /** @format int32 */
  sortNo?: number;
}

export interface ClazzMemberTagDto {
  /** @format uuid */
  tagId?: string;
  tagName?: string;
}

export interface ClazzMemberTagBatchDto {
  memberIds?: string[];
  /** @format uuid */
  tagId?: string;
  overwrite?: boolean;
}

export interface ClazzMemberRequestDto {
  keyword?: string;
  tagId?: string[];
  status?: string;
  memberIds?: string[];
}

export interface ClazzInviteUserSendDto {
  isSendNonSubscriber: boolean;
  sendTargets: ClazzInviteUserSendTargetDto[];
}

export interface ClazzInviteUserSendTargetDto {
  /** @pattern ^\S+$ */
  tagName?: string;
  /**
   * @format int32
   * @min 1
   * @max 99
   */
  studentNo: number;
  studentName: string;
  mobileNumbers: string[];
}

export interface ClazzInviteUserSendSmsDto {
  isSendNonSubscriber: boolean;
  mobileNumbers: string[];
}

export interface ClazzInviteUserCountRequestDto {
  /** @uniqueItems true */
  mobileNumbers: string[];
}

export interface ClazzConsentSaveDto {
  /** @format uuid */
  userId: string;
  /** @format uuid */
  classId: string;
  consentType: "tempStudent";
}

export interface ClazzRequestDto {
  /** @format uuid */
  get_classId?: string;
  get_className?: string;
  get_classGrade?: string[];
  get_classGradeCode?: (
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO"
  )[];
  get_classYear?: string;
  get_classStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING" | "CLOSED";
  get_schoolName?: string;
  get_schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  get_schoolArea?:
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU";
  /** @format int32 */
  get_schoolCodeIscream?: number;
  get_classInviteCode?: string;
  get_insertedTimestamp?: number[];
  /** @format uuid */
  get_classOwnerId?: string;
  get_classOwnerUserName?: string;
  get_classOwnerUserNameId?: string;
  get_classOwnerLoginId?: string;
  get_classOwnerUserType?: string;
}

export interface ClazzSubscribeRequest {
  /** @format uuid */
  memberId?: string;
  memberChildName?: string;
  /** @format int32 */
  memberClassNumber?: number;
  memberStatus?: "APPLY" | "ACCEPT" | "DENIAL";
  memberRole?: "OWNER" | "MANAGER" | "MEMBER";
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  /** @format int64 */
  acceptedTimestamp?: number;
  /** @format int64 */
  specifiedTimestamp?: number;
  /** @format uuid */
  userId?: string;
  user?: string;
  /** @format uuid */
  classId?: string;
  clazz?: string;
  loginId?: string;
  /** @format int64 */
  insertedTimestampLte?: number;
  userTypes?: (
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER"
  )[];
  memberRoles?: ("OWNER" | "MANAGER" | "MEMBER")[];
  memberStatuses?: ("APPLY" | "ACCEPT" | "DENIAL")[];
  /** @format uuid */
  insertedUserId?: string;
  userSns?: string;
  userName?: string;
  classYear?: string;
  classStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING" | "CLOSED";
  masking?: string;
  /** @format uuid */
  profileId?: string;
  tagIds?: string[];
  isInviteCode?: boolean;
  isApplyCheck?: boolean;
}

export interface ClassSubscribeSearchDto {
  /** @format uuid */
  memberId?: string;
  memberChildName?: string;
  /** @format int32 */
  memberClassNumber?: number;
  memberStatus?: "APPLY" | "ACCEPT" | "DENIAL";
  memberRole?: "OWNER" | "MANAGER" | "MEMBER";
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  /** @format int64 */
  acceptedTimestamp?: number;
  /** @format int64 */
  specifiedTimestamp?: number;
  memberStatusCheck?: string;
  /** @format int32 */
  sortNo?: number;
  /** @format uuid */
  profileId?: string;
  _clazz?: string;
  _user?: string;
  _userName?: string;
  _memberRole?: ("OWNER" | "MANAGER" | "MEMBER")[];
  _memberStatus?: "APPLY" | "ACCEPT" | "DENIAL";
  _userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  /** @format int64 */
  _insertedTimestampLte?: number;
  user?: UserView;
  clazz?: ClazzView;
  insertedUser?: UserView;
  updatedUser?: UserView;
  insertedAddress?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  updatedAddress?: string;
  /** @format int64 */
  updatedTimestamp?: number;
  /** @format uuid */
  currentId?: string;
}

export interface ClazzStudentSaveRequestDto {
  /** @format uuid */
  studentId?: string;
  /** @format uuid */
  tagId?: string;
  /** @pattern ^\S+$ */
  tagName?: string;
  /**
   * @format int32
   * @min 0
   * @max 9999
   */
  studentNo: number;
  studentName: string;
}

export interface ClazzApplyStudentSearchRequestDto {
  /** @format uuid */
  classId: string;
  userIds?: string[];
  userTypes?: (
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER"
  )[];
  memberStatus?: "APPLY" | "ACCEPT" | "DENIAL";
  tagId?: string[];
  name?: string;
}

export interface ClazzApplyFile {
  /** @format int64 */
  seq?: number;
  fileFlag?: "FILE" | "THUMBNAIL" | "IMAGE_PACK";
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileThumbnailPath?: string;
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  /** @format uuid */
  workId?: string;
}

export interface ClazzApplyMedicationDto {
  /** @format uuid */
  medicationId?: string;
  medicationType: "LIQUID_POWDER" | "LIQUID" | "POWDER" | "ETC";
  /**
   * @minLength 0
   * @maxLength 10
   */
  medicationDetail?: string;
  /** @format int32 */
  dosageFrequency: number;
  /**
   * @minLength 0
   * @maxLength 10
   */
  dosageTime: string;
  /**
   * @minLength 0
   * @maxLength 10
   */
  dosageAmount: string;
  isMlCc: boolean;
  storageCondition: "ROOM" | "REFRIGERATED";
  /**
   * @minLength 0
   * @maxLength 50
   */
  memo?: string;
  /** @format int32 */
  sortNo?: number;
}

export interface ClazzApplyMedicationReportDto {
  /**
   * @minLength 0
   * @maxLength 10
   */
  reportUserName: string;
  /** @format int64 */
  dosageTimestamp: number;
  /**
   * @minLength 0
   * @maxLength 250
   */
  memo?: string;
  applyStatus?: "TEMP" | "UNIDENTIFIED" | "COMPLETE" | "REJECT";
}

export interface ClazzApplyRequest {
  /** @format uuid */
  classId?: string;
  classGrade?:
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO";
  applyType: "ABSENT" | "FIELD_STUDY" | "MEDICATION_ORDER" | "ETC";
  /** @format uuid */
  sheetId: string;
  sheetType?: "H" | "W";
  applyStatus?: "TEMP" | "UNIDENTIFIED" | "COMPLETE" | "REJECT";
  studentName?: string;
  parentName?: string;
  parentType?: "MOTHER" | "FATHER" | "GRANDPARENTS" | "COUSIN" | "ETC";
  parentTypeName?: string;
  parentPhone?: string;
  /** @format int64 */
  timestampStart?: number;
  /** @format int64 */
  timestampEnd?: number;
  /** @format int64 */
  halfDayStart?: number;
  /** @format int64 */
  halfDayEnd?: number;
  halfDayHours?: string;
  /** @format int64 */
  applyTimestamp?: number;
  absentType?: "SICKNESS" | "UNRECOGNIZED" | "RECOGNITION" | "ETC";
  reason?: string;
  leaderName?: string;
  leaderType?: "MOTHER" | "FATHER" | "GRANDPARENTS" | "COUSIN" | "ETC";
  leaderTypeName?: string;
  leaderPhone?: string;
  studyType?: "TRAVEL" | "VISITING" | "TOUR" | "EXPERIENCE" | "HOME";
  studyPlace?: string;
  accommodationPlace?: string;
  purpose?: string;
  plan?: string;
  medicationDates?: string[];
  medications?: ClazzApplyMedicationDto[];
  medicationFiles?: Record<string, ClazzApplyFile[]>;
  medicationReport?: ClazzApplyMedicationReportDto;
  /** @uniqueItems true */
  files?: ClazzApplyFile[];
  /** @format int32 */
  applyDays?: number;
}

export interface ClazzApplySearchRequestDto {
  /** @format uuid */
  classId: string;
  /** @format uuid */
  id?: string;
  /** @format uuid */
  userId?: string;
  applyType?: "ABSENT" | "FIELD_STUDY" | "MEDICATION_ORDER" | "ETC";
  applyTypes?: ("ABSENT" | "FIELD_STUDY" | "MEDICATION_ORDER" | "ETC")[];
  applyStatus?: "TEMP" | "UNIDENTIFIED" | "COMPLETE" | "REJECT";
  keyword?: string;
  tagId?: string[];
}

export interface ClassroomCreateDto {
  /** @format uuid */
  userId: string;
  classroomName: string;
}

export interface DrawTrialRequestDto {
  deviceType?: "WEB" | "IOS" | "AOS";
  /** @format uuid */
  classroomId?: string;
  drawType?: "RANDOM" | "GROUP" | "RANDOM_IN_GROUP";
  gender?: "ALL" | "MALE" | "FEMALE";
  /** @format int32 */
  targetNum?: number;
  /** @format uuid */
  targetGroupId?: string;
}

export interface ClassroomTagCreateDto {
  /** @format uuid */
  userId: string;
  /** @pattern ^[\dA-Za-z가-힣]{1,6}$ */
  tagName?: string;
}

export interface ClassroomStudentBulkInsertDto {
  studentInfos?: StudentInfoRequestDto[];
}

export interface StudentInfoRequestDto {
  /**
   * @format int32
   * @min 1
   */
  studentNo: number;
  studentName: string;
  studentBirthDay?: string;
  studentGender?: "MALE" | "FEMALE";
}

export interface ClassroomRewardRequestDto {
  /** @format uuid */
  userId: string;
  pointIds: string[];
  studentIds: string[];
  memo?: string;
}

export interface ClassroomPointCreateDto {
  /** @format uuid */
  userId: string;
  pointName: string;
  isNegative?: boolean;
  pointImage: string;
  pointColor: string;
  /**
   * @format int32
   * @min 0
   * @max 100
   */
  point: number;
}

export interface ClassroomChecklistCreateDto {
  /** @format uuid */
  userId: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  checklistDate: string;
  checklistTitle: string;
  checklistType: "CHECK" | "SCORE" | "MEMO" | "LEVEL_COMMENT";
  /**
   * @format int32
   * @min 0
   * @max 5
   */
  checklistCount: number;
}

export interface BoardUserRequestDto {
  /** @format uuid */
  userId?: string;
  isWritable?: boolean;
  isCommentable?: boolean;
}

export interface NewBoardFolderRequestDto {
  /** @format uuid */
  boardId: string;
  /** @format uuid */
  classId?: string;
  folderName: string;
  /** @format int32 */
  sortNo?: number;
  color?: string;
  isDefault?: boolean;
}

export interface NewBoardRequestDto {
  /** @format uuid */
  classId: string;
  boardType: "PUBLIC" | "SECRET";
  postType?:
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE";
  boardName?: string;
  isWriteParents: boolean;
  isWriteStudent: boolean;
  isReadParents: boolean;
  isReadStudent: boolean;
  isUsedComment: boolean;
  isCommentParents: boolean;
  isCommentStudent: boolean;
  isUsedLike: boolean;
  isUsedFolder: boolean;
  folders?: NewBoardFolderRequestDto[];
  boardUsers?: BoardUserRequestDto[];
}

export interface BenefitOfferwallApplyRequestDto {
  /** @format uuid */
  userId: string;
  /** @format uuid */
  brandId: string;
  /** @format uuid */
  bannerId: string;
  parentsName: string;
  /**
   * @minLength 10
   * @maxLength 11
   */
  phoneNumber: string;
  classGradeType?:
    | "A4"
    | "A5"
    | "A6"
    | "A7"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "AD";
  entryPathType:
    | "APP_TOP"
    | "APP_BOTTOM"
    | "MEAL"
    | "WEB_POPUP_HOME"
    | "WEB_POPUP_CHAT"
    | "WEB_POPUP_EDUCATION"
    | "WEB_POPUP_CLASS"
    | "WEB_POPUP_SCHOOL"
    | "WEB_BANNER_HOME_FEED"
    | "WEB_BANNER_QUICK"
    | "WEB_BANNER_QUICK_CLASS"
    | "WEB_BANNER_LNB"
    | "WEB_BANNER_RNB"
    | "APP_POPUP_SPLASH_SCREEN"
    | "APP_POPUP_ENDING_SCREEN"
    | "APP_POPUP_HOME"
    | "APP_POPUP_CLASS"
    | "APP_POPUP_CALENDER"
    | "APP_POPUP_SCHOOL"
    | "APP_BANNER_HOME"
    | "APP_BANNER_CLASS"
    | "APP_BANNER_CLASS_B"
    | "APP_BANNER_CLASS_B_FOR_NEW_USER"
    | "APP_BANNER_CONTENT"
    | "APP_BANNER_TIMETABLE"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "FLOATING_BANNER"
    | "NOTIFICATION_BOX"
    | "BANNER_MORE_FEED"
    | "BANNER_TOP"
    | "HITALK_MAIN_TITLE"
    | "HITALK_MAIN_CARD"
    | "HITALK_MAIN_BANNER_A"
    | "HITALK_ROOM_LIST"
    | "SMS"
    | "OFFERWALL_A"
    | "EVENT"
    | "CP_BOARD";
  entryPathTypeId: string;
  gender?: "NONE" | "MALE" | "FEMALE";
  birthday?: string;
  address?: string;
  questionAnswer?: string;
}

export interface BannerTargetCountRequestDto {
  /** @uniqueItems true */
  userType?: (
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER"
  )[];
  /** @uniqueItems true */
  classGrade?: (
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO"
  )[];
  /** @uniqueItems true */
  schoolSigungu?: number[];
}

export interface BannedWordRequest {
  /** @format int64 */
  seq?: number;
  keyword?: string;
}

export interface AttendanceSaveRequestDto {
  /** @format uuid */
  attendanceId?: string;
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  studentId: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  attendanceDate: string;
  attendanceType:
    | "ABSENCE"
    | "EARLY_LEAVE"
    | "LATENESS"
    | "OUT"
    | "FIELD_STUDY";
  attendanceConfirmType?: "ILLNESS" | "NOT_ACCEPT" | "ETC" | "ATTENDANCE";
  reason: string;
  memo?: string;
  files?: AttendanceFileDto[];
}

export interface AttendanceSaveMultipleDatesRequestDto {
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  studentId: string;
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  attendanceDates: string[];
  attendanceType:
    | "ABSENCE"
    | "EARLY_LEAVE"
    | "LATENESS"
    | "OUT"
    | "FIELD_STUDY";
  attendanceConfirmType?: "ILLNESS" | "NOT_ACCEPT" | "ETC" | "ATTENDANCE";
  reason: string;
  memo?: string;
  files?: Record<string, AttendanceFileDto[]>;
}

export interface OfferwallAdvertiserLogRequestDto {
  requestType: "DOWNLOAD";
  requestContent: string;
  fileName: string;
  companyId: string;
  companyName: string;
}

export interface AdvertisementRequest {
  adType?:
    | "SECTION"
    | "BANNER"
    | "POPUP"
    | "PUSH"
    | "OFFERWALL_BANNER"
    | "OFFERWALL_ENTRY_PATH";
  parentId: string;
  contents: string;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  adDeviceType?: "WEB" | "AOS" | "IOS" | "APP";
}

export interface AdvertisementStatRequest {
  adType?:
    | "SECTION"
    | "BANNER"
    | "POPUP"
    | "PUSH"
    | "OFFERWALL_BANNER"
    | "OFFERWALL_ENTRY_PATH";
  parentId: string;
  contents: string;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  adDeviceType?: "WEB" | "AOS" | "IOS" | "APP";
  /** @format int32 */
  dateGoe?: number;
  /** @format int32 */
  dateLoe?: number;
  /** @format int32 */
  hour?: number;
  isAggregate?: boolean;
}

export interface OfferwallBrandSettlementCreateDto {
  companyId?: string;
  /** @format uuid */
  brandId: string;
  adProductType: "DB_COLLECT";
  /** @format int32 */
  settlementYearMonth: number;
  /** @format int64 */
  postingTimestampStart: number;
  /** @format int64 */
  postingTimestampEnd: number;
  companyName: string;
  brandName: string;
  adTargets: string;
  /** @format int64 */
  applicantsCount: number;
  /** @format int64 */
  readCount: number;
  /** @format int64 */
  preTaxAmount: number;
  /** @format int64 */
  adjustmentAmount: number;
  /** @format int64 */
  netAmount: number;
  adminMemo?: string;
  details?: string;
}

export interface AdminOfferwallEntryPathFileDto {
  /** @format uuid */
  fileId?: string;
  fileName: string;
  fileOriginalPath: string;
  fileContentType: string;
  /** @format int64 */
  fileSize: number;
}

export interface AdminOfferwallEntryPathRequestDto {
  linkType: "LIST" | "DETAIL" | "GROUP";
  /** @format uuid */
  bannerId?: string;
  /** @format int64 */
  timestampStart: number;
  /** @format int64 */
  timestampEnd: number;
  deviceType: "APP" | "AOS" | "IOS";
  positionType: "APP_TOP" | "APP_BOTTOM" | "FLOATING" | "MEAL";
  entryTitle?: string;
  entryText?: string;
  entryTextColor?: string;
  entryBackgroundColor?: string;
  isUsed: boolean;
  adminMemo?: string;
  file?: AdminOfferwallEntryPathFileDto;
}

export interface AdminOfferwallCompanyRequestDto {
  companyName: string;
  businessLicenseNumber: string;
  isUsed: boolean;
  adminMemo?: string;
}

export interface AdminOfferwallCompanyBrandFileDto {
  /** @format uuid */
  fileId?: string;
  fileName?: string;
  fileOriginalPath?: string;
  fileContentType?: string;
  /** @format int64 */
  fileSize?: number;
}

export interface AdminOfferwallCompanyBrandRequestDto {
  companyId: string;
  brandName: string;
  brandDisplayName: string;
  brandSlogan: string;
  isDuplicateApplicationBlock: boolean;
  /** @format int32 */
  duplicateApplicationBlockDays?: number;
  isUsed: boolean;
  adminMemo?: string;
  brandLogoFile: AdminOfferwallCompanyBrandFileDto;
}

export interface AdminOfferwallAccountRequestDto {
  /** @format uuid */
  userId?: string;
  loginId: string;
  companyId: string;
  brandIdList: string[];
  userName: string;
  phoneNumber: string;
  adminMemo?: string;
  password?: string;
  userStatus?: "ACTIVATE" | "DEACTIVATE";
}

export interface AdAgencyUpdateDto {
  adAgencyName: string;
  businessLicenseNo?: string;
  isUsed: boolean;
  memo?: string;
}

export interface HiTalkRoomNameUpdateDto {
  /** @format uuid */
  userId: string;
  roomName: string;
}

export interface HiTalkLimitTimestampUpdateDto {
  /** @format uuid */
  userId: string;
  /** @format int64 */
  limitTimestamp: number;
}

export interface HiTalkScheduleTimeRequestDto {
  /** @format uuid */
  userId?: string;
  /** @format int64 */
  reservationTime?: number;
}

export interface HiTalkScheduleResendRequestDto {
  /** @format uuid */
  userId: string;
  sendType: "DELETE" | "RESEND";
}

export interface HiTalkScheduleBatchTargetDto {
  /** @format uuid */
  userId: string;
  sendType: "DELETE" | "RESEND";
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  targets: string[];
}

export interface ClazzUpdateRequestDto {
  className?: string;
  classYear?: string;
  classGrade?: string;
  classBan?: string;
  classImagePath?: string;
  classInviteCode?: string;
  classStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING" | "CLOSED";
  applyUsed?: boolean;
  /** @format int32 */
  classAbsentMaxDays?: number;
  /** @format int32 */
  classFieldStudyMaxDays?: number;
  attendanceUsed?: boolean;
  attendanceFileUsed?: boolean;
  attendanceFieldStudyUsed?: boolean;
  classOwner?: string;
  classGradeCode?:
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO";
}

export interface ClassroomChecklistStudentUpdateCheckDto {
  /** @format uuid */
  userId: string;
  itemKey: "A" | "B" | "C" | "D" | "E";
  check?: boolean;
  otherUncheck?: boolean;
}

export interface AdminOfferwallBannerUpdateDto {
  bannerTitle: string;
  /** @format int64 */
  postingTimestampStart: number;
  /** @format int64 */
  postingTimestampEnd: number;
  /** @format int32 */
  dbPrice: number;
  dbGoalType: "NONE" | "GOAL_DEADLINE" | "GOAL_DELETE";
  /** @format int32 */
  dbLimit: number;
  listPoint1?: string;
  listPoint2?: string;
  listButtonText?: string;
  listButtonTextColor?: string;
  listButtonBackgroundColor?: string;
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  listFiles: AdminOfferwallBannerFileDto[];
  /**
   * @maxItems 2147483647
   * @minItems 1
   */
  thumbnailFiles?: AdminOfferwallBannerFileDto[];
  /** @format uuid */
  groupId?: string;
  isListPoint1DefaultColor?: boolean;
  listPoint1Color?: string;
  isListPoint2DefaultColor?: boolean;
  listPoint2Color?: string;
  isListButtonTextDefaultColor?: boolean;
  s3ListPoint1?: string;
  isS3ListPoint1DefaultColor?: boolean;
  s3ListPoint1Color?: string;
  s3ListPoint2?: string;
  isS3ListPoint2DefaultColor?: boolean;
  s3ListPoint2Color?: string;
  s3ListPoint3?: string;
  isS3ListPoint3DefaultColor?: boolean;
  s3ListPoint3Color?: string;
  isS3ThumbnailBgDefaultColor?: boolean;
  s3ThumbnailBgColor?: string;
  isS3BannerBorderDefaultColor?: boolean;
  s3BannerBorderColor?: string;
  isGender?: boolean;
  isBirthday?: boolean;
  isQuestion?: boolean;
  questionTitle?: string;
  questionPlaceholder?: string;
  contentType:
    | "IMAGE"
    | "LINK"
    | "ONLY_IMAGES"
    | "CP_BOARD"
    | "HINOTICE"
    | "EVENT"
    | "OFFERWALL_BANNER"
    | "MENU"
    | "CP_HOME"
    | "EXTERNAL";
  linkUrl?: string;
  linkType?: "INTERNAL" | "EXTERNAL" | "POST" | "LINK" | "MENU" | "CP_HOME";
  contentFiles?: AdminOfferwallBannerFileDto[];
  contentButtonText?: string;
  contentButtonTextColor?: string;
  contentButtonBackgroundColor?: string;
  contents?: AdminOfferwallBannerContentDto[];
  popupMessage?: string;
  terms?: AdminOfferwallBannerTermsDto[];
  classGrades?: (
    | "A4"
    | "A5"
    | "A6"
    | "A7"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "AD"
  )[];
  isAddress: boolean;
  adminMemo?: string;
}

export interface ClassroomRewardMemoDto {
  /** @format uuid */
  userId: string;
  memo?: string;
}

export interface AdminOfferwallGroupUpdateRequestDto {
  /** @format uuid */
  groupId: string;
  groupName?: string;
  offerwallTitle?: string;
  offerwallStyleType?: "STYLE1" | "STYLE2" | "STYLE3";
  offerwallDisplayType?: "ORDERLY" | "RANDOM";
}

export interface AdminOfferwallGroupBannerUpdateDto {
  /** @format uuid */
  bannerId: string;
  timestampType?: "POSTING" | "PIN1" | "PIN2";
  /** @format int64 */
  timestampStart?: number;
  /** @format int64 */
  timestampEnd?: number;
  /** @format int32 */
  sortNo?: number;
}

export interface AdminOfferwallGroupBannersUpdateRequestDto {
  offerwallDisplayType?: "ORDERLY" | "RANDOM";
  groupBanners?: AdminOfferwallGroupBannerUpdateDto[];
}

export interface AdminOfferwallSequenceUpdateRequestDto {
  /** @format uuid */
  groupId: string;
  /** @format int32 */
  groupSortNo: number;
  isDisplay: boolean;
}

export interface UserSettingWorkTimeDto {
  userWorkStartTime: string;
  userWorkEndTime: string;
}

export interface UserTimeDto {
  userChatDay: string;
  userChatStartTime: string;
  userChatEndTime: string;
  userChatStartTime2?: string;
  userChatEndTime2?: string;
  userChatStartTime3?: string;
  userChatEndTime3?: string;
  userCallDay: string;
  userCallStartTime: string;
  userCallEndTime: string;
  userCallStartTime2?: string;
  userCallEndTime2?: string;
  userCallStartTime3?: string;
  userCallEndTime3?: string;
  userWorkStartTime?: string;
  userWorkEndTime?: string;
  isUseChat?: boolean;
  isUseCall?: boolean;
  isOverChat?: boolean;
  isOnlyWorkTime?: boolean;
}

export interface UserSettingRequestDto {
  /** @format uuid */
  userId?: string;
  record?: boolean;
  isOverChat?: boolean;
  isUseChat?: boolean;
  isUseCall?: boolean;
  isOnlyWorkTime?: boolean;
}

export interface UserSettingChatTimeDto {
  userChatDay: string;
  userChatStartTime: string;
  userChatEndTime: string;
  userChatStartTime2?: string;
  userChatEndTime2?: string;
  userChatStartTime3?: string;
  userChatEndTime3?: string;
  isChatTime?: boolean;
  isUseChat?: boolean;
  isOverChat?: boolean;
}

export interface UserSettingCallTimeDto {
  userCallDay: string;
  userCallStartTime: string;
  userCallEndTime: string;
  userCallStartTime2?: string;
  userCallEndTime2?: string;
  userCallStartTime3?: string;
  userCallEndTime3?: string;
  isUseChat?: boolean;
  isOverChat?: boolean;
  isCallTime?: boolean;
  isUseCall?: boolean;
}

export interface UserBoardGroupNameUpdateDto {
  groupName: string;
}

export interface TimetableElementRequestDto {
  timetableName?: string;
  memo?: string;
  gradeNames?: string[];
  classNames?: string[][];
}

export interface TimetableTeacherUpdateDto {
  teacherName: string;
  /** @format uuid */
  classId: string;
}

export interface TimetablePeriodDto {
  /** @format int32 */
  dayOfWeek: number;
  /** @format int32 */
  period: number;
}

export interface TimetableTeacherUpdateFreePeriodsRequestDto {
  freePeriods: TimetablePeriodDto[];
  /** @format uuid */
  timetableId?: string;
  /** @format uuid */
  teacherId?: string;
}

export type TimetableUpdateStatusDto = object;

export interface TimetableFinishStatusDto {
  /** @format int32 */
  applyStartDate: number;
  /** @format int32 */
  applyEndDate: number;
}

export interface TimetableSpecialtyRoomNameUpdateDto {
  roomName: string;
}

export interface TimetableSpecialtyRoomMaxClassUpdateDto {
  /** @format int32 */
  maxClass: number;
}

export interface TimetableSpecialtyRoomConfUpdateDto {
  /** @format int32 */
  periodCount?: number;
  consecutivePeriod?: string;
}

export interface TimetableLessonConfSpecialtyRoomUpdateDto {
  /** @format uuid */
  lessonConfId: string;
}

export interface TimetableSimilarCourseConfUpdateDto {
  similarCourseName: string;
}

export interface TimetableLessonConfTossRequestDto {
  /** @format uuid */
  sourceId: string;
  /** @format uuid */
  targetTeacherId: string;
}

export interface TimetableLessonConfSwapRequestDto {
  /** @format uuid */
  sourceId: string;
  /** @format uuid */
  targetId: string;
}

export interface TimetableGradeUpdateDto {
  /** @format int32 */
  beforeLunchPeriod?: number;
  freePeriods?: TimetablePeriodDto[];
}

export interface TimetableUpdateDailyTimeScheduleDto {
  /** @format int32 */
  startPeriod: number;
  isDisplayDailyScheduleTime: boolean;
  startTime?: string;
  /** @format int32 */
  classDuration?: number;
  /** @format int32 */
  breakDuration?: number;
  isDisplayLunchTime: boolean;
  /** @format int32 */
  lunchDuration?: number;
}

export interface TimetableUpdateDailyScheduleDto {
  /** @format uuid */
  userId: string;
  classDays: string;
  /** @format int32 */
  maxPeriod: number;
}

export interface TimetableCourseSortDto {
  /** @format int32 */
  updatedSortNo: number;
}

export interface TimetableCourseBaseSortDto {
  /** @format int32 */
  updatedSortNo: number;
}

export interface TimetableConsecutiveConfUpdateDto {
  consecutivePeriod: string;
}

export interface TimetableConcurrentConfUpdateRequestDto {
  /** @format int32 */
  grade: number;
  displayedTitle: string;
  consecutivePeriod?: string;
  /** @format int32 */
  periodCount?: number;
}

export interface TimetableBasicTemplateLessonsInitializeDto {
  initializeOptions?: (
    | "AUTO_ASSIGNED"
    | "FIXED_CONCURRENT_COURSE"
    | "MANUALLY_ASSIGNED"
    | "TEACHER_FREE_TIME"
  )[];
}

export interface SurveyAppendRequest {
  /** @format uuid */
  readyMadeSurveyId: string;
  readyMadeSurveyStatus:
    | "SHARE"
    | "KEEP"
    | "TEMPORARY"
    | "COMPLETE"
    | "RESERVATION"
    | "WAITING"
    | "DOING"
    | "END";
  readyMadeSurveyType:
    | "SURVEY"
    | "VOTE"
    | "AFTER_SCHOOL"
    | "CONSULTATION"
    | "FCFS"
    | "DRAW";
  surveyEditType:
    | "SURVEY"
    | "VOTE"
    | "AFTER_SCHOOL"
    | "CONSULTATION"
    | "FCFS"
    | "DRAW";
}

export interface SurveyEditPageRequestDto {
  /** @format uuid */
  surveyId: string;
  /** @format int32 */
  sortNoGoe?: number;
  pageName?: string;
}

export interface SurveyAnswerDto {
  /** @format uuid */
  answerId: string;
  /** @format uuid */
  surveyId?: string;
  /** @format uuid */
  pageId?: string;
  /** @format uuid */
  questionId?: string;
  /** @format uuid */
  respondentId?: string;
  /** @format uuid */
  itemId?: string;
  answerType?: "ANSWER" | "SKIP";
  /** @format int64 */
  editedTimestamp?: number;
  answerText?: string;
  waitStatus?: "COMPLETE" | "WAIT" | "APPLY" | "OVER";
  consultType?: "PHONE" | "VISIT" | "REMOTE";
  /** @format int64 */
  answeredTimestamp?: number;
  /** @uniqueItems true */
  files?: SurveyAnswerFileDto[];
}

export interface SurveyAnswerFileDto {
  /** @format uuid */
  fileId?: string;
  fileTargetType?: "SURVEY" | "QUESTION" | "ITEM" | "ANSWER";
  /** @format uuid */
  surveyId?: string;
  /** @format uuid */
  questionId?: string;
  /** @format uuid */
  itemId?: string;
  /** @format uuid */
  answerId?: string;
  /** @format uuid */
  respondentId?: string;
  /** @format int32 */
  sortNo?: number;
  fileCategory?:
    | "IMAGE"
    | "VIDEO"
    | "AUDIO"
    | "URL"
    | "SIGN"
    | "DOC"
    | "ZIP"
    | "ETC";
  fileLinkUrl?: string;
  fileName?: string;
  fileContentType?: string;
  fileSize?: string;
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
  fileAlign?: "LEFT" | "RIGHT" | "CENTER";
  isDel?: boolean;
}

export interface SurveyAnswerRequestDto {
  /** @format uuid */
  surveyId?: string;
  /** @format uuid */
  pageId?: string;
  /** @format uuid */
  userId?: string;
  /** @format uuid */
  respondentId?: string;
  answerStatus?: "NONE" | "WAIT" | "TEMPORARY" | "REJECT" | "COMPLETE";
  answerType?: "ANSWER" | "SKIP";
  /** @format int64 */
  editedTimestamp?: number;
  isEditData?: boolean;
  isApply?: boolean;
  /** @format uuid */
  questionId?: string;
  /** @format uuid */
  itemId?: string;
  waitStatus?: "COMPLETE" | "WAIT" | "APPLY" | "OVER";
  servedType?: "AFTER_SCHOOL" | "CONSULTATION";
  consultType?: "PHONE" | "VISIT" | "REMOTE";
  answers?: SurveyAnswerDto[];
}

export interface SurveyAnswerInfoRequestDto {
  /** @format uuid */
  surveyId: string;
  /** @format uuid */
  userId: string;
  /** @format uuid */
  respondentId: string;
  answerStatus: "NONE" | "WAIT" | "TEMPORARY" | "REJECT" | "COMPLETE";
  respondentName: string;
  respondentPhone: string;
  respondentPassword: string;
  userType:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  subjectName: string;
  schoolType:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  classGrade:
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO";
  classBan: string;
  /** @format int32 */
  classNumber: number;
  /** @format uuid */
  schoolId: string;
  /** @format uuid */
  classId: string;
  responseType: "MEMBER" | "ANONYMOUS" | "EXTERNAL";
}

export interface UserImageDto {
  imageTitle?: string;
  imageBgColor?: string;
  imageBgPath?: string;
  imagePath?: string;
}

export interface SectionPostListPatchRequest {
  recommendation?: boolean;
}

export interface SectionDetailDto {
  /** @format int64 */
  detailId?: number;
  /** @format int64 */
  sectionId?: number;
  /** @format int32 */
  sortNo?: number;
  type?: "CONTENTS" | "LINK_TEXT";
  contentsType?:
    | "POST"
    | "LINK"
    | "MENU"
    | "POST_FEED"
    | "KEYWORD"
    | "CP_HOME"
    | "OFFERWALL_BANNER"
    | "OFFERWALL_GROUP";
  contents?: string;
  titlePoint?: string;
  title?: string;
  titleSub?: string;
  del?: boolean;
  file?: SectionDetailFileDto;
}

export interface SectionDetailFileDto {
  /** @format int64 */
  seq?: number;
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileFlag?: "FILE" | "THUMBNAIL" | "IMAGE_PACK";
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
}

export interface SectionListDto {
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  /** @format int32 */
  sortNo?: number;
  kind?: "DEFAULT" | "ADD";
  type?:
    | "USER_BAR"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "THUMBNAIL"
    | "TEXT_BAR"
    | "TAB_LIST"
    | "TAB_THUMBNAIL"
    | "TAB_IMAGE"
    | "MEAL"
    | "LIST"
    | "KEYWORD"
    | "CP_RECOMMEND"
    | "THUMBNAIL_BTN"
    | "QUICK_MENU"
    | "GUIDE"
    | "BANNER_TOP"
    | "QUIZ"
    | "GROUP_MAIN"
    | "GROUP_LIST"
    | "AD_SDK";
  title?: string;
  cpId?: string;
  /** @format int32 */
  displayCount?: number;
  displayType?: "PIN" | "ROTATE";
  displayRule?: "ORDERLY" | "RANDOM";
  used?: boolean;
  del?: boolean;
  /** @uniqueItems true */
  sectionDetails?: SectionDetailDto[];
}

export interface IscreamSchoolRequestDto {
  /** @format int32 */
  scIdx: number;
  schoolName: string;
  /** @format int32 */
  schoolKind?: number;
  sido?: string;
  address1: string;
  address2?: string;
  domain?: string;
  schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
}

export interface SchoolManagerResponseDto {
  /** @format uuid */
  elSchoolManagerId?: string;
  year?: string;
  name?: string;
  mobile?: string;
  job?: string;
  domain?: string;
  school?: SchoolView;
  user?: UserView;
  fileOriginalPath?: string;
  /** @format int64 */
  insertedTimestamp?: number;
  hasMaster?: boolean;
  isFirstApplySchool?: boolean;
  approvalStatus?: "CONSENT" | "REJECTION" | "WAITING";
  /** @format int64 */
  approvalTimestamp?: number;
  approvalUser?: UserView;
  memo?: string;
  /** @format int64 */
  updatedTimestamp?: number;
}

export interface PostMoveRequestDto {
  /** @format uuid */
  boardId?: string;
  /** @format uuid */
  folderId?: string;
  pushTarget?: "ALL" | "TEACHER" | "PARENTS" | "STUDENT";
  isPush?: boolean;
}

export interface PostTransferScheduleDto {
  /** @format int32 */
  schoolCodeIscream?: number;
  dateStart?: string;
  dateEnd?: string;
}

export interface PostTransferNoticeDto {
  /** @format int32 */
  schoolCodeIscream?: number;
  /** @format int64 */
  seq?: number;
  noticeDateStart?: string;
  noticeDateEnd?: string;
  updateTimestampStart?: string;
  updateTimestampEnd?: string;
}

export interface PostTransferMealDto {
  /** @format int32 */
  schoolCodeIscream?: number;
  mealDateStart?: string;
  mealDateEnd?: string;
}

export interface PostCommentUpdateRequestDto {
  comment?: string;
  emoticonPath?: string;
  /** @uniqueItems true */
  files?: PostCommentFile[];
  del?: boolean;
}

export interface AdminOfferwallSectionDefaultUpdateDto {
  offerwallType?: "A" | "B";
  title?: string;
  styleType?: "STYLE1" | "STYLE2" | "STYLE3";
}

export interface AdminOfferwallSectionOrderUpdateDto {
  offerwallType?: "A" | "B";
  displayType?: "ORDERLY" | "RANDOM";
  /** @uniqueItems true */
  bannerIds?: string[];
}

export interface AdminOfferwallSectionPinUpdateDto {
  offerwallType?: "A" | "B";
  /** @format uuid */
  bannerId?: string;
  timestampType?: "POSTING" | "PIN1" | "PIN2";
  /** @format int64 */
  timestampStart?: number;
  /** @format int64 */
  timestampEnd?: number;
}

export interface AdminOfferwallToggleExternalAdminDisplayRequestDto {
  isExternalDisplay: boolean;
}

export interface NotificationUserSettingSchoolDto {
  notificationType?:
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "COMMENT"
    | "COMMENT_NESTED"
    | "BOARD"
    | "TEACHER_ALARM"
    | "CLAZZ_APPLIES"
    | "ATTENDANCE";
  isPush: boolean;
}

export interface NotificationUserSettingClazzRequestDto {
  notificationType:
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "COMMENT"
    | "COMMENT_NESTED"
    | "BOARD"
    | "TEACHER_ALARM"
    | "CLAZZ_APPLIES"
    | "ATTENDANCE";
  /** @format uuid */
  boardId?: string;
  isPush: boolean;
}

export interface NotificationUserSettingIgnoreTagsDto {
  notificationType:
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "COMMENT"
    | "COMMENT_NESTED"
    | "BOARD"
    | "TEACHER_ALARM"
    | "CLAZZ_APPLIES"
    | "ATTENDANCE";
  tagIds: string[];
}

export interface NotificationBadgeRequestDto {
  /** @format uuid */
  userId?: string;
  badgeCheck?: boolean;
  /** @format int32 */
  badgeCount?: number;
}

export interface Level {
  /** @format int32 */
  levelInt?: number;
  levelStr?: string;
}

export interface HiTalkVoteUpdateDto {
  /** @format uuid */
  messageId: string;
  resultStatus: "PUBLIC" | "COUNT_ONLY" | "PRIVATE";
  /** @format int64 */
  closedTimestamp?: number;
  /** @format uuid */
  userId: string;
  /**
   * @maxItems 3
   * @minItems 1
   * @uniqueItems true
   */
  questions: Question[];
}

export interface CpCategoryViewDto {
  cpCategoryId?: string;
  /** @format int32 */
  sortNo?: number;
}

export interface CpListDto {
  name?: string;
  viewTeacher?: boolean;
  viewParents?: boolean;
  viewStudent?: boolean;
  recommendation?: boolean;
  usedPage?: boolean;
  pass?: boolean;
  contentsType?: string[];
  used?: boolean;
  del?: boolean;
  thumbnail?: CpListFileDto;
  thumbnailHeader?: CpListFileDto;
  /** @uniqueItems true */
  cpCategories?: CpCategoryViewDto[];
}

export interface CpListFileDto {
  /** @format int64 */
  seq?: number;
  fileName?: string;
  fileSize?: string;
  fileContentType?: string;
  fileFlag?: "FILE" | "THUMBNAIL" | "IMAGE_PACK";
  fileOriginalPath?: string;
  fileConvertPath?: string;
  fileTranscodePath?: string;
  fileThumbnailPath?: string;
}

export interface ClazzTagReorderDto {
  /** @format uuid */
  tagId?: string;
  /** @format int32 */
  sortNo?: number;
}

export interface ClazzUpdateSchoolDto {
  /** @format uuid */
  prevSchoolId: string;
  /** @format uuid */
  schoolId: string;
}

export interface ClazzProfileImageDto {
  imageTitle?: string;
  imageBackgroundColor?: string;
  imageBackgroundPath?: string;
  classImagePath?: string;
}

export interface ClazzMemberNumberDto {
  /** @format int32 */
  memberClassNumber?: number;
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  memberId?: string;
}

export interface ClazzPostManagePatchRequestDto {
  originalFolderId?: string;
  patchFolderId?: string;
  postIds?: string[];
}

export interface ClassroomSortDto {
  /** @format uuid */
  userId: string;
  classroomIds: string[];
}

export interface ClassroomUpdateDto {
  /** @format uuid */
  userId: string;
  classroomName: string;
  studentViewType?: "NONE" | "CHARACTER";
  pointViewType?: "NONE" | "TOTAL";
}

export interface ClassroomTagUpdateDto {
  /** @format uuid */
  userId: string;
  /** @pattern ^[\dA-Za-z가-힣]{1,6}$ */
  tagName?: string;
}

export interface ClassroomStudentUpdateDto {
  /** @format uuid */
  userId: string;
  /**
   * @format int32
   * @min 1
   * @max 65535
   */
  studentNo: number;
  studentName: string;
  studentCharacter: string;
  studentPhoto?: string;
  groupIds?: string[];
  studentMemo?: string;
  studentBirthday?: string;
  studentGender?: "MALE" | "FEMALE";
}

export interface SeatPlanUpdateRequestDto {
  /**
   * @minLength 1
   * @maxLength 20
   */
  seatPlanName: string;
  pairingType?: "RANDOM" | "GENDER_SAME" | "GENDER_DIFFERENT";
  avoidPreviousPartner: boolean;
  viewMode: "SINGLE_VIEW" | "FULL_VIEW";
}

export interface ChangeStudentHiddenRequestDto {
  isStudentHidden: boolean;
}

export interface ChangeStudentSeatFixRequestDto {
  /** @format uuid */
  seatId: string;
  isFixed: boolean;
}

export interface SeatSectionRenameRequestDto {
  /**
   * @minLength 1
   * @maxLength 10
   */
  sectionName: string;
}

export interface ClassroomRewardResetDto {
  /** @format uuid */
  userId: string;
  studentIds: string[];
}

export interface ClassroomRecordStyleSaveDto {
  recordStyle:
    | "WHITE"
    | "YELLOW"
    | "ORANGE"
    | "BLUE"
    | "PINK"
    | "BLUE_GREEN"
    | "RED"
    | "PURPLE"
    | "GREEN"
    | "GRAY";
}

export interface ClassroomRecordSTTSaveDto {
  /** @format uuid */
  sttId: string;
  /** @format int32 */
  recordTimeStart: number;
  /** @format int32 */
  recordTimeEnd: number;
  recordMessage: string;
  /** @format int32 */
  sortNo?: number;
}

export interface ClassroomRecordSTTsSaveDto {
  messages?: ClassroomRecordSTTSaveDto[];
}

export interface ClassroomRecordContentSaveDto {
  recordContent: string;
}

export interface ClassroomRecordBookmarkMemoSaveDto {
  bookmarkMemo: string;
}

export interface ClassroomPointUpdateDto {
  /** @format uuid */
  userId: string;
  pointName: string;
  pointImage: string;
  pointColor: string;
  /**
   * @format int32
   * @min 0
   * @max 100
   */
  point: number;
}

export interface ClassroomPointSortDto {
  /** @format uuid */
  userId: string;
  isNegative: boolean;
  pointIds: string[];
}

export interface ClassroomChecklistItemDto {
  itemKey?: "A" | "B" | "C" | "D" | "E";
  itemLabel?: string;
  itemColor?: string;
  /**
   * @format int32
   * @min 1
   * @max 5
   */
  sortNo: number;
}

export interface ClassroomChecklistUpdateDto {
  /** @format uuid */
  userId: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  checklistDate: string;
  checklistTitle: string;
  /**
   * @maxItems 5
   * @minItems 0
   */
  items?: ClassroomChecklistItemDto[];
}

export interface ClassroomChecklistUpdateTitleDto {
  /** @format uuid */
  userId: string;
  checklistTitle: string;
}

export interface ClassroomChecklistStudentUpdateMemoDto {
  /** @format uuid */
  userId: string;
  checkMemo?: string;
}

export interface ClassroomChecklistStudentUpdateLevelCommentDto {
  /** @format uuid */
  userId: string;
  /** @format uuid */
  studentId: string;
  itemKey: "A" | "B" | "C" | "D" | "E";
  levelComment?: string;
}

export interface ClassroomChecklistUpdateItemDto {
  /** @format uuid */
  userId: string;
  /**
   * @maxItems 5
   * @minItems 1
   */
  items?: ClassroomChecklistItemDto[];
}

export interface ClassroomChecklistUpdateDateDto {
  /** @format uuid */
  userId: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  checklistDate: string;
}

export interface PatchBoardFolderRequestDto {
  folderId?: string;
  /** @format uuid */
  boardId: string;
  /** @format uuid */
  classId: string;
  folderName: string;
  /** @format int32 */
  sortNo: number;
  color: string;
  isDefault: boolean;
  isDel: boolean;
}

export interface PatchBoardRequestDto {
  /** @format uuid */
  boardId: string;
  /** @format uuid */
  classId: string;
  boardName: string;
  boardStatus: "ACTIVATE" | "DEACTIVATE";
  isWriteParents: boolean;
  isWriteStudent: boolean;
  isReadParents: boolean;
  isReadStudent: boolean;
  isUsedComment: boolean;
  isCommentParents: boolean;
  isCommentStudent: boolean;
  isUsedLike: boolean;
  isUsedFolder: boolean;
  folders?: PatchBoardFolderRequestDto[];
  boardUsers?: BoardUserRequestDto[];
}

export interface PatchBoardSortNoRequestDto {
  request?: SortNoRequest[];
}

export interface SortNoRequest {
  /** @format uuid */
  boardId: string;
  /** @format int32 */
  sortNo: number;
}

export interface PatchFolderSortNoRequestDto {
  request?: SortNoRequest[];
}

export interface AttendanceMultipleConfirm {
  /** @format uuid */
  classId: string;
  attendanceIds: string[];
  attendanceConfirmType: "ILLNESS" | "NOT_ACCEPT" | "ETC" | "ATTENDANCE";
  memo?: string;
}

export interface AttendanceRequestDto {
  /** @format uuid */
  classId: string;
  /** @format uuid */
  studentId?: string;
  studentName?: string;
  /** @format uuid */
  insertedUserId?: string;
  /** @pattern \d{4}-\d{2} */
  attendanceMonth?: string;
  /**
   * @maxItems 2
   * @minItems 2
   */
  attendanceDateBetween?: string[];
  isConfirmed?: boolean;
  isNeedFileCount?: boolean;
  attendanceType?: (
    | "ABSENCE"
    | "EARLY_LEAVE"
    | "LATENESS"
    | "OUT"
    | "FIELD_STUDY"
  )[];
  attendanceConfirmType?: ("ILLNESS" | "NOT_ACCEPT" | "ETC" | "ATTENDANCE")[];
  tagId?: string[];
}

export interface AttendanceGuideDto {
  /** @format uuid */
  classId?: string;
  empty?: boolean;
  [key: string]: any;
}

export interface AdId {
  /** @uniqueItems true */
  adIds?: number[];
}

export interface AdminTeacherAuthApplyDetailRequestDto {
  /** @format uuid */
  applyId?: string;
  applyStatus: "APPLIED" | "APPROVED" | "COMPLETED" | "PENDING" | "REJECTED";
  schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
  adminMemo?: string;
}

export interface AdminEventRecommendUpdateDto {
  /** @format uuid */
  recommendId?: string;
  isCancel: boolean;
  isConfirm: boolean;
  memo?: string;
}

export interface AdSdkUpdateDto {
  adSdkType?: "InHouse" | "AdFit" | "NAM" | "MezzoMedia" | "COVI" | "Coupang";
  adSdkKey?: string;
  /** @format int64 */
  timestampStart?: number;
  /** @format int64 */
  timestampEnd?: number;
  isView: boolean;
  memo?: string;
}

export interface SurveyRequestDto {
  viewType?: "ALL" | "MANAGER" | "TARGET";
  surveyType?:
    | "SURVEY"
    | "VOTE"
    | "AFTER_SCHOOL"
    | "CONSULTATION"
    | "FCFS"
    | "DRAW";
  surveyTitle?: string;
  surveyStatus?:
    | "SHARE"
    | "KEEP"
    | "TEMPORARY"
    | "COMPLETE"
    | "RESERVATION"
    | "WAITING"
    | "DOING"
    | "END";
  schoolId?: string[];
  classId?: string[];
  classStatus?: "ACTIVATE" | "DEACTIVATE" | "CLOSING" | "CLOSED";
  isDel?: boolean;
}

export interface PostCommentPositionRequestDto {
  /** @format uuid */
  commentId?: string;
  condition?: string;
  order?: string;
  /** @format int32 */
  depth?: number;
  postIds?: string[];
  /** @format int32 */
  size?: number;
  /** @format int64 */
  insertedTimestamp?: number;
}

export interface HiTalkReactionRequestDto {
  /** @format uuid */
  messageId?: string;
  iconId?: string[];
  userId?: string[];
  userIdNot?: string[];
}

export interface PostTranslateRequest {
  /** @format uuid */
  get_postId?: string;
  get_langType?:
    | "ko"
    | "en"
    | "zh_CN"
    | "zh_TW"
    | "id"
    | "vi"
    | "tl"
    | "th"
    | "ar"
    | "ru"
    | "ja"
    | "de"
    | "km"
    | "bn"
    | "fa"
    | "ur"
    | "pa"
    | "sd"
    | "af"
    | "sq"
    | "am"
    | "hy"
    | "as"
    | "ay"
    | "az"
    | "bm"
    | "eu"
    | "be"
    | "bho"
    | "bs"
    | "bg"
    | "ca"
    | "ceb"
    | "co"
    | "hr"
    | "cs"
    | "da"
    | "dv"
    | "doi"
    | "nl"
    | "eo"
    | "et"
    | "ee"
    | "fil"
    | "fi"
    | "fr"
    | "fy"
    | "gl"
    | "ka"
    | "el"
    | "gn"
    | "gu"
    | "ht"
    | "ha"
    | "haw"
    | "he"
    | "hi"
    | "hmn"
    | "hu"
    | "is"
    | "ig"
    | "ilo"
    | "ga"
    | "it"
    | "jv"
    | "kn"
    | "kk"
    | "rw"
    | "gom"
    | "kri"
    | "ku"
    | "ckb"
    | "ky"
    | "lo"
    | "la"
    | "lv"
    | "ln"
    | "lt"
    | "lg"
    | "lb"
    | "mk"
    | "mai"
    | "mg"
    | "ms"
    | "ml"
    | "mt"
    | "mi"
    | "mr"
    | "mni_Mtei"
    | "lus"
    | "mn"
    | "my"
    | "ne"
    | "no"
    | "ny"
    | "or"
    | "om"
    | "ps"
    | "pl"
    | "pt"
    | "qu"
    | "ro"
    | "sm"
    | "sa"
    | "gd"
    | "nso"
    | "sr"
    | "st"
    | "sn"
    | "si"
    | "sk"
    | "sl"
    | "so"
    | "es"
    | "su"
    | "sw"
    | "sv"
    | "tg"
    | "ta"
    | "tt"
    | "te"
    | "ti"
    | "ts"
    | "tr"
    | "tk"
    | "ak"
    | "uk"
    | "ug"
    | "uz"
    | "cy"
    | "xh"
    | "yi"
    | "yo"
    | "zu";
}

export interface PostRequestDto {
  postType?: string[];
  postStatus?: string;
  homeworkType?: "ALL" | "SUBMIT" | "NOT_SUBMIT";
  commentUsed?: boolean;
  teacherMode?: boolean;
  reply?: boolean;
  keyword?: string;
  keywordCommentUsed?: boolean;
  /** @format uuid */
  insertedUser?: string;
  dayOfPosted?: string;
  mode?: string;
  /** @format uuid */
  postId?: string;
  /** @format uuid */
  schoolId?: string;
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  userId?: string;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  parentType?:
    | "SCHOOL"
    | "SCHOOL_FILE"
    | "CLAZZ"
    | "CLAZZ_FILE"
    | "EVENT"
    | "BANNER"
    | "NEWS";
  postIds?: string[];
  parentIds?: string[];
  classGrades?: (
    | "NONE"
    | "K"
    | "E1"
    | "E2"
    | "E3"
    | "E4"
    | "E5"
    | "E6"
    | "M1"
    | "M2"
    | "M3"
    | "H1"
    | "H2"
    | "H3"
    | "U1"
    | "U2"
    | "U3"
    | "U4"
    | "U5"
    | "U6"
    | "KO"
    | "EN"
    | "EO"
    | "MN"
    | "MO"
    | "HN"
    | "HO"
    | "UN"
    | "UO"
    | "GN"
    | "GO"
    | "SN"
    | "SO"
  )[];
  schoolAreas?: (
    | "NONE"
    | "SEOUL"
    | "INCHEON"
    | "BUSAN"
    | "GWANGJU"
    | "DAEJEON"
    | "DAEGU"
    | "SEJONG"
    | "ULSAN"
    | "GYEONGGI"
    | "KANGWON"
    | "CHUNGBUK"
    | "CHUNGNAM"
    | "GYEONGBUK"
    | "GYEONGNAM"
    | "JEONBUK"
    | "JEONNAM"
    | "JEJU"
  )[];
  postStatuses?: (
    | "TEMPORARY"
    | "COMPLETE"
    | "CLOSED"
    | "HIDDEN"
    | "RESERVE"
    | "REVIEW"
    | "REJECT"
  )[];
  postTypes?: (
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE"
  )[];
  alarmPlusUsed?: boolean;
  parentRole?: string;
  isMemberRole?: boolean;
  /** @format uuid */
  boardId?: string;
  folderId?: string;
  viewDeviceType?: "WEB" | "APP" | "IOS" | "ANDROID";
  parentId?: string;
}

export interface ClazzPostTopRequest {
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  userId?: string;
  postType?: string;
  parentRole?: string[];
  postTypes?: (
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE"
  )[];
  /** @format uuid */
  boardId?: string;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
}

export interface ClassroomPointReportRewardRequestDto {
  /** @format uuid */
  userId: string;
  /** @format uuid */
  pointId?: string;
  isNegative?: boolean;
  /** @pattern \d{4}-\d{2} */
  month?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateStart?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateEnd?: string;
  /** @pattern latest|registration */
  sort?: string;
  /** @format int64 */
  dateStartMs?: number;
  /** @format int64 */
  dateEndMs?: number;
}

export interface UserBoardGroupRequestDto {
  isReadParents: boolean;
  isReadStudent: boolean;
}

export type TimetableBasicTemplateLessonsSearchDto = object;

export interface SurveyNewsRequestDto {
  /** @format int64 */
  timestamp: number;
  schoolId?: string[];
  classId?: string[];
}

export interface SurveyEditTargetRequestDto {
  /** @format uuid */
  classId: string;
  /** @format uuid */
  surveyId?: string;
  userType?: (
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER"
  )[];
  name?: string;
}

export interface SurveyEditQuestionRequestDto {
  /** @format uuid */
  questionId?: string;
  /** @format uuid */
  surveyId?: string;
  /** @format uuid */
  pageId?: string;
  questionType?:
    | "CHOICE"
    | "SUBJECTIVE"
    | "SIGN"
    | "DROPDOWN"
    | "STAR"
    | "ATTACHMENTS"
    | "DESCRIPTION"
    | "CONSULTATION"
    | "AFTER_SCHOOL"
    | "VOTE";
  questionTitle?: string;
  /** @format int32 */
  sortNo?: number;
  isValidated?: boolean;
  isRequired?: boolean;
  isAddedAnswer?: boolean;
  isLinkedPage?: boolean;
  isUsedHalfStar?: boolean;
  isAllowedOverlapTime?: boolean;
  isMultipleAnswer?: boolean;
  /** @format int32 */
  answerLimit?: number;
  /** @format int32 */
  pageSortNoGoe?: number;
  /** @format int32 */
  sortNoGoe?: number;
}

export interface SurveyCalendarRequestDto {
  startDate?: string;
  endDate?: string;
  isHoliday?: boolean;
  startTime?: string;
  endTime?: string;
  /** @format int32 */
  consultTime?: number;
  /** @format int32 */
  recessTime?: number;
}

export interface SurveyAnswerSearchDto {
  /** @format uuid */
  surveyId?: string;
  /** @format uuid */
  pageId?: string;
  /** @format uuid */
  questionId?: string;
  /** @format uuid */
  itemId?: string;
  isDel?: boolean;
  isDelRespondent?: boolean;
  /** @format uuid */
  userId?: string;
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  respondentId?: string;
  isAnonymous?: boolean;
  surveyStatus?:
    | "SHARE"
    | "KEEP"
    | "TEMPORARY"
    | "COMPLETE"
    | "RESERVATION"
    | "WAITING"
    | "DOING"
    | "END";
  answerStatuses?: ("NONE" | "WAIT" | "TEMPORARY" | "REJECT" | "COMPLETE")[];
  isRequired?: boolean;
  containsDel?: boolean;
  questionIds?: string[];
  itemIds?: string[];
}

export interface ShortcutRequest {
  /** @format uuid */
  userId?: string;
}

export interface PostTotalRequestDto {
  keyword?: string;
  dayOfPosted?: string;
  scope?: string;
}

export interface AdminOfferwallBannerSearchRequestDto {
  /** @format int64 */
  postingTimestampStart?: number;
  /** @format int64 */
  postingTimestampEnd?: number;
  displayStatus?: "EXPECTED" | "PROGRESSING" | "CLOSED";
  offerwallType?: "A" | "B";
  bannerTitle?: string;
  brandName?: string;
  listPoint1?: string;
  listPoint2?: string;
  isIncludeCount: boolean;
}

export interface AdminOfferwallApplicantsSearchRequestDto {
  /** @format int64 */
  startDate?: number;
  /** @format int64 */
  endDate?: number;
  searchType?: "APPLICANTS_NAME" | "APPLICANTS_PHONE_NUMBER";
  searchWord?: string;
}

export interface AdminOfferwallApplicantsExcelRequestDto {
  /** @format int64 */
  startDate?: number;
  /** @format int64 */
  endDate?: number;
}

export interface NotificationBoxRequestDto {
  /** @format uuid */
  userid?: string;
}

export interface MvoipDeviceRequestDto {
  /** @format uuid */
  userId?: string;
  pushIosToken?: string;
}

export interface ClazzBoardMenuRequestDto {
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  userId?: string;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  postType?: (
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE"
  )[];
  includeDefaultFolder?: boolean;
}

export interface CommentReactionRequestDto {
  /** @format uuid */
  commentId?: string;
  iconId?: string[];
  userId?: string[];
  userIdNot?: string[];
}

export type PostReadUserSearchRequestDto = object;

export interface ClazzConsentRequestDto {
  /** @format uuid */
  userId: string;
  /** @format uuid */
  classId: string;
}

export interface ClazzUncheckPostRequest {
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  userId?: string;
  postType?: string;
  parentRole?: string[];
  postTypes?: (
    | "NOTE"
    | "ALBUM"
    | "BOARD"
    | "NOTICE"
    | "ALARM"
    | "MEAL"
    | "EDUCATION"
    | "EVENT"
    | "CALENDAR_SCHOOL"
    | "CALENDAR_CLASS"
    | "ALARM_PLUS"
    | "BANNER"
    | "HOMEWORK"
    | "HINOTICE"
    | "CP_BOARD"
    | "NONE"
    | "ALARM_EDU_OFFICE"
  )[];
  /** @format int64 */
  timestamp?: number;
  /** @format uuid */
  boardId?: string;
  folderId?: string;
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
}

export interface ClazzPostManageSearchRequestDto {
  folderId?: string;
}

export interface ClazzBoardManageRequestDto {
  /** @format uuid */
  classId?: string;
  includePermissionCount?: boolean;
}

export interface CollectionModelEntityModelObject {
  _embedded?: {
    objects?: EntityModelObject[];
  };
  _links?: Links;
}

export interface EntityModelObject {
  content?: object;
  _links?: Links;
}

export interface ClazzUnSubscribeLogRequestDto {
  /** @format uuid */
  classId?: string;
  /** @format uuid */
  userId?: string;
  userName?: string;
  loginId?: string;
  userMobile?: string;
}

export interface ClazzStudentRequestDto {
  /** @format uuid */
  classId?: string;
  /** @format int32 */
  studentNo?: number;
  studentName?: string;
  isUsed?: boolean;
  isIncludeMatchTag?: boolean;
}

export interface ClazzStudentUserRequestDto {
  /** @format uuid */
  userId?: string;
  /** @format uuid */
  classId?: string;
  /** @format int32 */
  studentNo?: number;
  studentName?: string;
  isUsed?: boolean;
}

export interface ClazzInviteCardRequestDto {
  /** @format uuid */
  classId?: string;
  isNotApply?: boolean;
}

export interface ClassroomSearchRequestDto {
  /** @format uuid */
  userId: string;
  isUsed?: boolean;
  /** @format uuid */
  classId?: string;
}

export interface ClassroomTagSearchRequestDto {
  /** @format uuid */
  userId: string;
}

export interface ClassroomStudentSearchRequestDto {
  /** @format uuid */
  userId: string;
  isHidden?: boolean;
  isExcluded?: boolean;
  isIncludePoint?: boolean;
}

export interface ClassroomRecordReportStudentTotalRequestDto {
  /** @format uuid */
  userId: string;
  /** @pattern \d{4}-\d{2} */
  month?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateStart?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateEnd?: string;
  isHidden?: boolean;
  sort?: string;
  order?: string;
  /** @format int64 */
  dateStartMs?: number;
  sortName?: string;
}

export interface ClassroomPointReportTotalRequestDto {
  /** @format uuid */
  userId: string;
  /** @pattern \d{4}-\d{2} */
  month?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateStart?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateEnd?: string;
  /** @format uuid */
  studentId?: string;
  /** @format int64 */
  dateStartMs?: number;
  /** @format int64 */
  dateEndMs?: number;
}

export interface ClassroomPointReportStudentTotalRequestDto {
  /** @format uuid */
  userId: string;
  /** @pattern \d{4}-\d{2} */
  month?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateStart?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateEnd?: string;
  /** @format uuid */
  pointId?: string;
  isAllStudents?: boolean;
  /** @pattern studentNo|positive|negative|total */
  sort?: string;
  /** @format int64 */
  dateStartMs?: number;
  /** @format int64 */
  dateEndMs?: number;
}

export interface ClassroomPointReportPointTotalRequestDto {
  /** @format uuid */
  userId: string;
  /** @format uuid */
  studentId?: string;
  isNegative?: boolean;
  /** @pattern \d{4}-\d{2} */
  month?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateStart?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateEnd?: string;
  /** @format int64 */
  dateStartMs?: number;
  /** @format int64 */
  dateEndMs?: number;
}

export interface ClassroomRecordSearchRequestDto {
  /** @pattern \d{4}-\d{2} */
  month?: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  date?: string;
  /** @pattern latest|registration */
  sort?: string;
  isPhoto?: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  isMemo?: boolean;
  recordType?: ("PHOTO" | "VIDEO" | "AUDIO" | "MEMO" | "NUGA" | "CHECKLIST")[];
  /** @format uuid */
  studentId?: string;
  recordIds?: string[];
}

export interface ClassroomPointSearchRequestDto {
  /** @format uuid */
  userId: string;
  isNegative?: boolean;
}

export interface ClassroomMemberSearchRequestDto {
  /** @format uuid */
  userId: string;
  isHidden?: boolean;
  isIncludePoint?: boolean;
}

export interface ClassroomGroupSearchRequestDto {
  /** @format uuid */
  userId: string;
  isHidden?: boolean;
}

export interface ClassroomChecklistSearchRequestDto {
  /** @format uuid */
  userId: string;
  isCompleted?: boolean;
  isPin?: boolean;
}

export interface BoardUserSearchRequestDto {
  isReadable?: boolean;
  /** @format int32 */
  page?: number;
  /** @format int32 */
  size?: number;
}

export interface BannerSearchRequestDto {
  deviceType: "WEB" | "APP" | "IOS" | "ANDROID";
  /** @uniqueItems true */
  positionType: (
    | "WEB_POPUP_HOME"
    | "WEB_POPUP_CHAT"
    | "WEB_POPUP_EDUCATION"
    | "WEB_POPUP_CLASS"
    | "WEB_POPUP_SCHOOL"
    | "WEB_BANNER_HOME_FEED"
    | "WEB_BANNER_QUICK"
    | "WEB_BANNER_QUICK_CLASS"
    | "WEB_BANNER_LNB"
    | "WEB_BANNER_RNB"
    | "APP_POPUP_SPLASH_SCREEN"
    | "APP_POPUP_ENDING_SCREEN"
    | "APP_POPUP_HOME"
    | "APP_POPUP_CLASS"
    | "APP_POPUP_CALENDER"
    | "APP_POPUP_SCHOOL"
    | "APP_BANNER_HOME"
    | "APP_BANNER_CLASS"
    | "APP_BANNER_CLASS_B"
    | "APP_BANNER_CLASS_B_FOR_NEW_USER"
    | "APP_BANNER_CONTENT"
    | "APP_BANNER_TIMETABLE"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "FLOATING_BANNER"
    | "NOTIFICATION_BOX"
    | "BANNER_MORE_FEED"
    | "BANNER_TOP"
    | "HITALK_MAIN_TITLE"
    | "HITALK_MAIN_CARD"
    | "HITALK_MAIN_BANNER_A"
    | "HITALK_ROOM_LIST"
  )[];
}

export interface AttendanceStatsRequestDto {
  /** @format uuid */
  classId?: string;
  /** @pattern \d{4}-\d{2} */
  attendanceMonth?: string;
  /**
   * @maxItems 2
   * @minItems 2
   */
  attendanceDateBetween?: string[];
  /** @format uuid */
  studentId?: string;
  attendanceType?: (
    | "ABSENCE"
    | "EARLY_LEAVE"
    | "LATENESS"
    | "OUT"
    | "FIELD_STUDY"
  )[];
  attendanceConfirmType?: ("ILLNESS" | "NOT_ACCEPT" | "ETC" | "ATTENDANCE")[];
  tagId?: string[];
}

export interface AttendanceMonthRequestDto {
  /** @format uuid */
  classId?: string;
  attendanceMonth?: string;
  isConfirmed?: boolean;
  /** @format uuid */
  studentId?: string;
  attendanceType?: (
    | "ABSENCE"
    | "EARLY_LEAVE"
    | "LATENESS"
    | "OUT"
    | "FIELD_STUDY"
  )[];
  attendanceConfirmType?: ("ILLNESS" | "NOT_ACCEPT" | "ETC" | "ATTENDANCE")[];
}

export interface AttendanceGuideRequestDto {
  /** @format uuid */
  classId?: string;
  guideType?: (
    | "INFO"
    | "ABSENCE"
    | "EARLY_LEAVE"
    | "LATENESS"
    | "OUT"
    | "FIELD_STUDY"
  )[];
}

export interface OfferwallBrandSettlementsSearchRequestDto {
  /** @format uuid */
  settlementId?: string;
  /** @format int32 */
  settlementYearMonth?: number;
  companyId?: string;
  brandId?: string;
  /** @format int64 */
  startTimestamp?: number;
  /** @format int64 */
  endTimestamp?: number;
  /** @format int32 */
  startDate?: number;
  /** @format int32 */
  endDate?: number;
  isOnlyConfirmed?: boolean;
}

export interface AdvertiserOfferwallAdStatRequestDto {
  searchFieldType: "BRAND" | "APPLICANT" | "PHONE" | "GRADE";
  searchKeyword?: string;
  periodType: string;
  /** @format int64 */
  startDate: number;
  /** @format int64 */
  endDate: number;
  companyId: string;
}

export interface AdminTeacherAuthSearchRequestDto {
  /** @format int64 */
  applyTimestampStart?: number;
  /** @format int64 */
  applyTimestampEnd?: number;
  applyType?: "PARENT_TO_TEACHER" | "TEACHER_VERIFICATION";
  applyStatus?: "APPLIED" | "APPROVED" | "COMPLETED" | "PENDING" | "REJECTED";
  applyUserName?: string;
  applyUserMobile?: string;
  schoolType?:
    | "NONE"
    | "KINDERGARTEN"
    | "ELEMENTARY"
    | "MIDDLE"
    | "HIGH"
    | "SPECIAL"
    | "UNIVERSITY"
    | "GROUP";
}

export interface AdminOfferwallEntryPathSearchRequestDto {
  /** @format int64 */
  timestampStart?: number;
  /** @format int64 */
  timestampEnd?: number;
  displayStatus?: "EXPECTED" | "PROGRESSING" | "CLOSED";
  positionType?: "APP_TOP" | "APP_BOTTOM" | "FLOATING" | "MEAL";
  searchKeyword?: string;
  isUsed?: boolean;
}

export interface AdminOfferwallCompanySearchRequestDto {
  searchKeyword?: string;
  isUsed?: boolean;
}

export interface AdminOfferwallCompanyBrandSearchRequestDto {
  isUsed?: boolean;
  searchKeyword?: string;
  searchFieldType?: "COMPANY_NAME" | "BRAND_NAME";
}

export interface AdminOfferwallAdstatSearchRequestDto {
  searchKeyword?: string;
  searchFieldType?: "LOGIN_ID" | "COMPANY_NAME" | "BRAND_NAME";
  isUsed?: boolean;
}

export interface AdminEventRecommendRequestDto {
  eventId: string;
  /** @format uuid */
  userId?: string;
  /** @format uuid */
  recommendUserId?: string;
  /**
   * @maxItems 2
   * @minItems 2
   */
  insertedTimestamp: number[];
}

export interface ClassroomStatusCountRequestDto {
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateStart: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateEnd: string;
  /** @format int64 */
  dateStartMs?: number;
  /** @format int64 */
  dateEndMs?: number;
}

export interface ClassroomRecordsCountRequestDto {
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateStart: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateEnd: string;
  /** @format int64 */
  dateStartMs?: number;
  /** @format int64 */
  dateEndMs?: number;
}

export interface ClassroomMembersCountRequestDto {
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateStart: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateEnd: string;
  /** @format int64 */
  dateStartMs?: number;
  /** @format int64 */
  dateEndMs?: number;
}

export interface ClassroomChecklistsCountRequestDto {
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateStart: string;
  /** @pattern \d{4}-\d{2}-\d{2} */
  dateEnd: string;
  /** @format int64 */
  dateStartMs?: number;
  /** @format int64 */
  dateEndMs?: number;
}

export interface AdSdkSearchRequestDto {
  positionType?:
    | "WEB_POPUP_HOME"
    | "WEB_POPUP_CHAT"
    | "WEB_POPUP_EDUCATION"
    | "WEB_POPUP_CLASS"
    | "WEB_POPUP_SCHOOL"
    | "WEB_BANNER_HOME_FEED"
    | "WEB_BANNER_QUICK"
    | "WEB_BANNER_QUICK_CLASS"
    | "WEB_BANNER_LNB"
    | "WEB_BANNER_RNB"
    | "APP_POPUP_SPLASH_SCREEN"
    | "APP_POPUP_ENDING_SCREEN"
    | "APP_POPUP_HOME"
    | "APP_POPUP_CLASS"
    | "APP_POPUP_CALENDER"
    | "APP_POPUP_SCHOOL"
    | "APP_BANNER_HOME"
    | "APP_BANNER_CLASS"
    | "APP_BANNER_CLASS_B"
    | "APP_BANNER_CLASS_B_FOR_NEW_USER"
    | "APP_BANNER_CONTENT"
    | "APP_BANNER_TIMETABLE"
    | "BANNER_A"
    | "BANNER_B"
    | "BANNER_C"
    | "BANNER_D"
    | "FLOATING_BANNER"
    | "NOTIFICATION_BOX"
    | "BANNER_MORE_FEED"
    | "BANNER_TOP"
    | "HITALK_MAIN_TITLE"
    | "HITALK_MAIN_CARD"
    | "HITALK_MAIN_BANNER_A"
    | "HITALK_ROOM_LIST";
  bannerType?: "POPUP" | "BANNER";
  userType?:
    | "TEACHER"
    | "PARENTS"
    | "STUDENT"
    | "ADMIN"
    | "ADVERTISER"
    | "NONMEMBER";
  deviceType?: ("WEB" | "APP" | "IOS" | "ANDROID")[];
  adSdkType?: "InHouse" | "AdFit" | "NAM" | "MezzoMedia" | "COVI" | "Coupang";
  isSetAdSdkKey?: boolean;
  adSdkKey?: string;
  /** @format int64 */
  timestampStart?: number;
  /** @format int64 */
  timestampEnd?: number;
  isView?: boolean;
  displayStatus?: "EXPECTED" | "PROGRESSING" | "CLOSED";
}

export interface AdAgencySearchRequestDto {
  adAgencyName?: string;
  businessLicenseNo?: string;
  isUsed?: boolean;
}

export interface ClassroomRewardDeleteRequestDto {
  /** @format uuid */
  userId: string;
  /** @format uuid */
  rewardId: string;
  /** @format uuid */
  pointId?: string;
  /** @format uuid */
  studentId?: string;
  /** @format int32 */
  sortNo?: number;
}

export interface TimetableTeacherDeleteDto {
  teacherIds: string[];
}

export interface TimetableSpecialtyRoomConfDeleteDto {
  specialtyRoomConfs: string[];
}

export interface TimetableSimilarCourseConfDeleteDto {
  similarCourseConfIds: string[];
}

export interface TimetableLessonConfDeleteRequestDto {
  /** @format uuid */
  timetableId?: string;
  lessonConfIds?: string[];
}

export interface TimetableCourseDeleteDto {
  courseIds: string[];
}

export interface TimetableCourseBaseDeleteDto {
  /** @format uuid */
  timetableId?: string;
  courseBaseIds?: string[];
}

export interface TimetableConsecutiveConfDeleteDto {
  consecutiveConfIds: string[];
}

export interface TimetableConcurrentConfDeleteDto {
  concurrentCourseIds: string[];
}

export interface TimetableBasicLessonsDeleteBatchDto {
  lessonIds?: string[];
}

export interface SurveyDeleteRequestDto {
  surveyIds?: string[];
}

export interface ClazzPostManageDeleteRequestDto {
  folderId?: string;
  postIds?: string[];
}

export interface EducationLetterRequest {
  /** @format uuid */
  postId?: string;
  postIds?: string[];
  /** @format uuid */
  userId?: string;
  educationLetterIds?: string[];
  educationLetterSchoolIds?: string[];
}

export interface Link {
  href?: string;
  hreflang?: string;
  title?: string;
  type?: string;
  deprecation?: string;
  profile?: string;
  name?: string;
  templated?: boolean;
}

export interface ClazzSubscribeView {
  memberChildName: string;
  memberClassNumber: number;
  memberStatus: 'APPLY' | 'ACCEPT' | 'DENIAL';
  memberRole: 'OWNER' | 'MANAGER' | 'MEMBER';
  userType: 'TEACHER' | 'PARENTS' | 'STUDENT' | 'ADMIN' | 'ADVERTISER' | 'NONMEMBER';
  /** @format int32 */
  sortNo: number;
  /** @format int64 */
  insertedTimestamp: number;
  classGradeCode?: ClassGradeCode;
  userId: string;
  userName: string;
  userPhoto: string;
  userSns: string;
  userMobile: string;
  insertedUserId?: string;
  loginId: string;
  /** @format uuid */
  classId: string;
  className: string;
  classImagePath: string;
  /** @format uuid */
  classSchoolId: string;
  classStatus: 'ACTIVATE' | 'DEACTIVATE' | 'CLOSING' | 'CLOSED';
  classYear: string;
  classGrade: string;
  classBan: string;
  classOwnerId: string;
  classOwnerName: string;
  classApplyUsed: boolean;
  attendanceUsed: boolean;
  schoolType: 'NONE' | 'KINDERGARTEN' | 'ELEMENTARY' | 'MIDDLE' | 'HIGH' | 'SPECIAL' | 'UNIVERSITY' | 'GROUP';
  schoolName: string;
  schoolStatus: 'ACTIVATE' | 'DEACTIVATE' | 'CLOSING';
  /** @format uuid */
  profileId?: string;
  /** @format uuid */
  currentId?: string;
  _links: Links;
}