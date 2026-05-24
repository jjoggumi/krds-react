import { ApiError } from '@/components/text/api/error'
import { env } from '@/supporters/migrations'

let baseUrl = env.BASE_API_URI

export const setBaseUrl = (url) => {
  baseUrl = url
}

const filteredObject = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)))
const filterValidateValues = obj => Object.fromEntries(Object.entries(obj).filter(([_, value]) => value))

const toJSON = async body => {
  const reader = body.getReader();
  let chunks = [];
  let done, value;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    ({ done, value } = await reader.read());
    if (done) break;
    chunks.push(value);
  }
  const concatenated = new Uint8Array(chunks.reduce((acc, curr) => acc + curr.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    concatenated.set(chunk, offset);
    offset += chunk.length;
  }
  const text = new TextDecoder().decode(concatenated);
  if (!text || text.trim() === "") {
    return {};
  }

  return JSON.parse(text);
}

export const doRequest = async (url, options = {}) => {
  const query = options.query ? new URLSearchParams(filterValidateValues(options.query)).toString() : ''
  const requestUrl = (url.startsWith('http') ? url : `${baseUrl}${url}`) + (query ? `?${query}` : '')
  const response = await fetch(`${requestUrl}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('idToken') || ''}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    ...filteredObject(options, ['query', 'body']),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new ApiError(response.status, err.error, err.message);
  }
  return await toJSON(response.body)
}

export const doRequestWithoutToken = async (url, options = {}) => {
  const query = options.query ? new URLSearchParams(filterValidateValues(options.query)).toString() : ''
  const requestUrl = (url.startsWith('http') ? url : `${baseUrl}${url}`) + (query ? `?${query}` : '')
  const response = await fetch(`${requestUrl}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    ...filteredObject(options, ['query', 'body']),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new ApiError(response.status, err.error, err.message);
  }
  return await toJSON(response.body)
}

export const apiCall = (methodAndPath, options = {}) => {
  const [method, path] = methodAndPath.split(' ');
  return doRequest(path, { method: method.toUpperCase(), ...options })
}

export const apiCallWithoutToken = (methodAndPath, options = {}) => {
  const [method, path] = methodAndPath.split(' ');
  return doRequestWithoutToken(path, { method: method.toUpperCase(), ...options })
}
