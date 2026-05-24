module.exports = {
  quit: app => {
    app.isQuitting = true
    app.quit()
  }
}