import firebase from "firebase/compat/app"; // import firebase google analytics
import "firebase/compat/analytics"; // Add the Firebase products that you want to use
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/remote-config"

import {ClassGradeCode, ClassStatus, ClazzSubscribeView, MemberRole, SchoolType, User} from "@hiclass/core";


// 리모트 컨피그 키
const FirebaseRemoteConfigKey = Object.freeze({
	STUDENT_CHARACTERS_KEY: process.env.VUE_APP_REMOTE_CONFIG_STUDENT_CHARACTERS_KEY as string,
	IMAGE_EDITOR_STICKER: process.env.VUE_APP_IMAGE_EDITOR_STICKER_KEY as string,
	STICKER_PACKS: process.env.VUE_APP_STICKER_PACKS_KEY as string,
	EVENT_CONTROL: process.env.VUE_APP_REMOTE_CONFIG_EVENT_CONTROL as string,
  GROUP_MISSION_CHARACTERS: process.env.VUE_APP_GROUP_MISSION_CHARACTERS_KEY as string,
} as const);

// firebase app key
const firebaseConfig = Object.freeze({
	apiKey: "AIzaSyBMlftT-MLM_4uNXKH_nKHvAJBokKtGDys",
	authDomain: "newclass-bb938.firebaseapp.com",
	databaseURL: "https://newclass-bb938.firebaseio.com",
	projectId: "newclass-bb938",
	storageBucket: "newclass-bb938.appspot.com",
	messagingSenderId: "1028665832919",
	appId: "1:1028665832919:web:ba9018e7cdba9aea568792",
	measurementId: "G-MRHP5T0WM8"
} as const);

firebase.initializeApp(firebaseConfig)

const analytics = firebase.analytics()

const setUserProperties = (user: User) => {
	analytics.setUserId(user.currentId || '');
	analytics.setUserProperties({
		user_type: user.userType,
		marketing_push: user.userPushUsed ? 1 : 0,
	})
}

const setIsManagerAndGradeCodes = (clazzViews: ClazzSubscribeView[]) => {
	const gradeCodeSet = new Set<ClassGradeCode>()
	const schoolTypeSet = new Set<SchoolType>()
	const activatedClazzViews = clazzViews.filter(cz => cz.classStatus === ClassStatus.ACTIVATE) // 현재 삭제대기 및 삭제되지 않은 클래스만 반영
	let isManager = false;

	activatedClazzViews.forEach((clazzView) => {
		//ClazzSubscribeView 는 classGradeCode가 없으므로 schoolType + classGrade 로 classGradeCode 생성
		if ([SchoolType.ELEMENTARY, SchoolType.MIDDLE, SchoolType.HIGH, SchoolType.UNIVERSITY].includes(clazzView.schoolType) && clazzView.classGrade !== 'ANY') {
			const gradeCode = clazzView.schoolType[0] + clazzView.classGrade as ClassGradeCode
			gradeCodeSet.add(gradeCode)
		} else {
			gradeCodeSet.add(ClassGradeCode.NONE)
		}
		schoolTypeSet.add(clazzView.schoolType)
		// 권한이 있다면 isManager true 설정
		if (!isManager
			&& [MemberRole.OWNER, MemberRole.MANAGER].includes(clazzView.memberRole)
		) {
			isManager = true;
		}
	})

	const gradeCodes = [...gradeCodeSet].join(',')
	const schoolTypes = [...schoolTypeSet].join(',')

	analytics.setUserProperties({
		school_types: schoolTypes != "" ? schoolTypes : 'NONE',
		grade_codes: gradeCodes != "" ? gradeCodes : 'NONE',
		// 구독중인 클래스가 없다면 role NONE 처리
		role: activatedClazzViews.length === 0 ? 'NONE': isManager ? 'MANAGER' : 'MEMBER'
	})
}

const setInHouse = (isInHouse = false) => {
	analytics.setUserProperties({
		inhouse: isInHouse ? 1 : null
	})
}

const setIsEducationLetterManager = (isEducationLetterManager = false) => {
	analytics.setUserProperties({
		edu_letter_manager: isEducationLetterManager ? 1 : 0
	})
}

const firebaseAnalytics = {
	setInHouse,
	setUserProperties,
	setIsManagerAndGradeCodes,
	setIsEducationLetterManager,
	logEvent: (eventName: string, params?: Record<string, any>) => {
    analytics.logEvent(eventName, params)
  }
}

const remoteConfig = firebase.remoteConfig()

async function getBrowserVersion(): Promise<{
	name: string;
	version: string;
	fullVersion: string;
}> {
	// userAgentData 우선 (최신 브라우저)
	try {
		const uaData = (navigator as any).userAgentData;

		if (uaData && typeof uaData.getHighEntropyValues === "function") {
			const data = await uaData.getHighEntropyValues([
				"brands",
				"uaFullVersion",
			]);

			if (data && Array.isArray(data.brands) && data.uaFullVersion) {
				const brand = data.brands.find((b: any) => b.brand !== "Not;A=Brand");
				const fullVersion = data.uaFullVersion || "not set";
				const majorVersion = fullVersion.split(".")[0] || "not set";
				return {
					name: brand?.brand || "not set",
					version: majorVersion, // 예 : 139
					fullVersion: fullVersion,
				};
			}
		}
	} catch (e) {
		console.warn("userAgentData error:", e);
	}

	// fallback: userAgent 기반 (구형 브라우저)
	try {
		const ua = navigator.userAgent;
		let tem: RegExpMatchArray | null;
		let match =
			ua.match(
				/(opera|chrome|safari|firefox|edge|edg|msie|trident(?=\/))\/?\s*(\d+(\.\d+)+)/i,
			) || [];

		let name = "not set";
		let fullVersion = "not set";

		if (/trident/i.test(match[1])) {
			tem = /\brv[ :]+(\d+(\.\d+)+)/g.exec(ua);
			name = "IE";
			fullVersion = tem ? tem[1] : "not set";
		} else if (match[1] === "Chrome") {
			tem = ua.match(/\b(OPR|Edg)\/(\d+(\.\d+)+)/);
			if (tem) {
				name = tem[1].replace("OPR", "Opera").replace("Edg", "Edge");
				fullVersion = tem[2];
			} else {
				name = "Chrome";
				fullVersion = match[2];
			}
		} else {
			name = match[1] || navigator.appName || "not set";
			fullVersion = match[2] || navigator.appVersion || "not set";
		}

		const majorVersion =
			fullVersion && fullVersion !== "not set"
				? fullVersion.split(".")[0]
				: "not set";
		return {
			name,
			fullVersion,
			version: majorVersion,
		};
	} catch (e) {
		console.warn("userAgent fallback error:", e);
		return { name: "not set", version: "not set" , fullVersion: "not set" };
	}
}

// 브라우저 버전 수집용
getBrowserVersion().then(browserVersion => {
	analytics.setUserProperties({
		browser_name: browserVersion.name,
		browser_full_version: browserVersion.fullVersion,
		browser_version: browserVersion.version,
		browser: `${browserVersion.name} ${browserVersion.fullVersion}`,
	})
})

export {firebaseAnalytics, remoteConfig, FirebaseRemoteConfigKey, getBrowserVersion}
