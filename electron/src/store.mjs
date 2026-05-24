import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import electron from 'electron'

const { app } = electron
const algorithm = 'aes-256-ctr'
const secretKey = crypto.createHash('sha256').update(String('hitalkdummysecret')).digest('base64').substring(0, 32)

const encrypt = (text) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

const decrypt = (hash) => {
  const [iv, encrypted] = hash.split(':')
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()])
  return decrypted.toString()
}

const loadStoreFrom = path => 
  fs.existsSync(path)
    ? JSON.parse(decrypt(fs.readFileSync(path, 'utf-8')))
    : {}

const saveStoreTo = (store, path) => 
  fs.writeFileSync(path, encrypt(JSON.stringify(store)), 'utf-8')

const updateStoreDataTo = (data, path) =>
  saveStoreTo({ ...loadStoreFrom(path), ...data }, path)

let storeFilePath = ''
export const defaultStoreFileName = 'default.enc'

export const loadEntryURL = () => {
  const relativePathOf = file => path.join(path.dirname(app.getPath('exe')), file)
  const defaultFilePath = relativePathOf(defaultStoreFileName)
  storeFilePath = path.join(app.getPath('userData'), 'hitalk.enc')

  if (![storeFilePath, defaultFilePath].some(p => fs.existsSync(p))) {
    console.log('No store file found.')
    return ''
  }

  return loadStoreFrom(storeFilePath).EntryURL || loadStoreFrom(defaultFilePath).EntryURL || ''
}

export const saveEntryURL = (url, path) => updateStoreDataTo({ EntryURL: url }, path)

export const processFirstExecution = callback => new Promise(async (resolve) => {
  if ((loadStoreFrom(storeFilePath).executed || false)) return resolve()
  updateStoreDataTo({ executed: true }, storeFilePath)
  await callback()
  resolve()
})

