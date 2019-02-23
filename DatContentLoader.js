import Dat from './react-native-dat'
import DatURL from './DatURL'

export default class DatContentLoader {
  constructor (gateway) {
    this.gateway = gateway
    this.dats = new Map()
  }

  async isFile (url) {
    const parsed = new DatURL(url)
    const dat = await this.getDat(parsed.key)

    return new Promise((resolve, reject) => {
      dat.stat(parsed.path, (err, stat) => {
        if (err) return reject(err)
        resolve(stat.isFile())
      })
    })
  }

  async getAsText (url) {
    const parsed = new DatURL(url)
    const dat = await this.getDat(parsed.key)

    return new Promise((resolve, reject) => {
      dat.readFile(parsed.path, 'utf-8', (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  async getAsBinary (url) {
    const parsed = new DatURL(url)
    const dat = await this.getDat(parsed.key)

    return new Promise((resolve, reject) => {
      dat.readFile(parsed.path, (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  async getFolderContents (url) {
    const parsed = new DatURL(url)
    const dat = await this.getDat(parsed.key)

    return new Promise((resolve, reject) => {
      dat.readdir(parsed.path, (err, files) => {
        if (err) return reject(err)
        resolve(files)
      })
    })
  }

  async getDat (url) {
    if (!this.dats.has(url)) {
      this.dats.set(url, new Dat(url, {
        gateway: this.gateway
      }))
      await new Promise((resolve, reject) => {
        this.dats.get(url).metadata.update((err) => {
          if(err) reject(err)
          else resolve()
        })
      })
    }
    return this.dats.get(url)
  }

  close () {
    for (let dat of this.dats.values()) {
      dat.close()
    }
  }
}