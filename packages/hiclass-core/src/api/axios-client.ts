import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'
// @ts-ignore
import { loadProgressBar } from "axios-progress-bar";
import jwt_decode from 'jwt-decode';
import qs from "qs";

// JWT 토큰 관련 인터페이스
interface JWTDecoded {
    uuid: string;
    exp: number;
}

interface TokenResponse {
    idToken: string;
    refreshToken: string;
    expiresAt: string;
}

// axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.VUE_APP_BASE_API_URI || process.env.baseURL || "",
    headers: {
        'Content-Type': 'application/json',
    },
    paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
    }
})

// 토큰 갱신 함수
const refreshToken = async (): Promise<TokenResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken || refreshToken === 'undefined') {
        throw new Error('Refresh token not available');
    }

    const response = await axios.post(
        `${process.env.VUE_APP_BASE_LOGIN_URI}/oauth/token`,
        {},
        {
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
        }
    );

    return response.data;
};

// 토큰 유효성 검사 함수
const isTokenValid = (): boolean => {
    const idToken = localStorage.getItem('idToken');
    if (!idToken) return false;

    try {
        const decoded: JWTDecoded = jwt_decode(idToken);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp > currentTime;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};

// 토큰이 곧 만료되는지 확인 (24시간 전)
const isTokenExpiringSoon = (): boolean => {
    const idToken = localStorage.getItem('idToken');
    if (!idToken) return false;

    try {
        const decoded: JWTDecoded = jwt_decode(idToken);
        const currentTime = Math.floor(Date.now() / 1000);
        const fiveMinutesFromNow = currentTime + (60 * 60 * 24); // 24시간
        return decoded.exp <= fiveMinutesFromNow;
    } catch (error) {
        console.error('Token expiry check error:', error);
        return false;
    }
};

// Request Interceptor - 토큰 자동 갱신 및 설정
axiosInstance.interceptors.request.use(
    async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
        // 토큰이 곧 만료되거나 유효하지 않은 경우 갱신 시도
        if (!isTokenValid() || isTokenExpiringSoon()) {
            try {
                const tokenData = await refreshToken();
                localStorage.setItem('idToken', tokenData.idToken);
                localStorage.setItem('refreshToken', tokenData.refreshToken);
                localStorage.setItem('idTokenExpiresTimestamp', new Date(tokenData.expiresAt).getTime().toString());
            } catch (error) {
                console.error('Token refresh failed:', error);
                // 토큰 갱신 실패 시 로그아웃 처리
                localStorage.removeItem('idToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('idTokenExpiresTimestamp');
                window.location.href = '/logout';
                return Promise.reject(error);
            }
        }

        // Authorization 헤더 설정
        const idToken = localStorage.getItem('idToken');
        if (idToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${idToken}`;
        }

        return config;
    },
    (error: any) => Promise.reject(error)
);

// Response Interceptor - 401 에러 처리
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: any) => {
        const originalRequest = error.config;

        // 401 에러이고 재시도하지 않은 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const tokenData = await refreshToken();
                localStorage.setItem('idToken', tokenData.idToken);
                localStorage.setItem('refreshToken', tokenData.refreshToken);
                localStorage.setItem('idTokenExpiresTimestamp', new Date(tokenData.expiresAt).getTime().toString());

                // 새 토큰으로 원래 요청 재시도
                originalRequest.headers.Authorization = `Bearer ${tokenData.idToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed on 401:', refreshError);
                // 토큰 갱신 실패 시 로그아웃 처리
                localStorage.removeItem('idToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('idTokenExpiresTimestamp');
                window.location.href = '/logout';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Progress bar 설정
axiosInstance.interceptors.request.use(
    (config: AxiosRequestConfig): AxiosRequestConfig => {
        loadProgressBar({ showSpinner: false }, axiosInstance);
        return config;
    },
    (error: any) => Promise.reject(error)
);

export const Get = async <T>(
    url: string,
    config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
    return await axiosInstance.get(url, config);
};

export const Post = async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
    return await axiosInstance.post(url, data, config);
};

export const Patch = async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
    return await axiosInstance.patch(url, data, config);
};

export const Put = async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
    return await axiosInstance.put(url, data, config);
};

export const Delete = async <T>(
    url: string,
    config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
    return await axiosInstance.delete(url, config);
};