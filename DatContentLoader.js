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

  async getAsDataURI (url) {
    const parsed = new DatURL(url)
    const mimeType = parsed.mimeType

    const buffer = await this.getAsBinary(url)
    return `data:${mimeType};base64,${buffer.toString('base64')}`
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
    const key = await Dat.resolveDNS(url)

    if (!this.dats.has(key)) {
      const archive = new Dat(key, {
        gateway: this.gateway
      })
      console.log(`Getting Archive: ${url} ${key}`)
      this.dats.set(key, archive)

      await new Promise((resolve, reject) => {
        archive.ready((err) => {
          if(err) reject(err)
          else resolve(null)
        })
      })

      await new Promise((resolve, reject) => {
        archive.metadata.update((err) => {
          if(err) reject(err)
          else resolve()
        })
      })
    }

    return this.dats.get(key)
  }

  close () {
    for (let dat of this.dats.values()) {
      dat.close()
    }
  }
}
