const asyncWaitFor = cond => new Promise(resolve => {
  const interval = setInterval(() => {
    if (cond()) {
      clearInterval(interval)
      resolve()
    }
  }, 10)
})

export class PageContext {
  constructor({size = 20, onLoadPage}) {
    this.size = size
    this.page = 0;
    this.onLoadPage = onLoadPage;
    this.data = []
    this.busy = false;
  }

  next = async (getThisDataOnly = false) => {
    await asyncWaitFor(() => !this.busy)
    this.busy = true
    const newData = await this.onLoadPage(this.page++)
    this.data = this.data.concat(newData)
    this.busy = false
    return getThisDataOnly ? newData : this.data
  }

  loadAllRemains = async () => {
    console.log('loadAllRemains, ', this.page)
    while ((await this.next(true)).length > 0);
    return this.data
  }

  reset = () => {
    this.page = 0
    this.data = []
    return this.data
  }
}