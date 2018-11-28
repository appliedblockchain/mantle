// TODO: Publish to npm as custom package

const UglifyJS = require('uglify-es')
const rimraf = require('rimraf')
const fs = require('fs')
const path = require('path')

function minifyDirectory(minifyPath, buildDirectory) {
  fs.readdir(path.join(minifyPath), (err, files) => {
    if (err) {
      console.log(`Error: ${err}`)
    }

    files.forEach(file => {
      const filePath = path.join(minifyPath, file)
      const stat = fs.statSync(filePath)
      const isDirectory = stat.isDirectory()

      if (isDirectory) {
        const writePath = minifyPath.replace('/src', buildDirectory) + '/' + file
        fs.mkdirSync(writePath)
        minifyDirectory(minifyPath + '/' + file, buildDirectory)
        return
      }

      const code = fs.readFileSync(filePath, 'utf8')

      let minified
      if (filePath.endsWith('.js')) {
        ({ code: minified } = UglifyJS.minify(code))
      } else {
        minified = code
      }

      const writePath = minifyPath.replace('/src', buildDirectory) + '/' + file
      fs.writeFileSync(writePath, minified, { encoding: 'utf8' })
    })
  })
}

rimraf('./dist', (err) => {
  if (err) {
    return
  }

  const rootPath = path.join(__dirname, './src')
  const buildPath = path.join(__dirname, './dist')
  fs.mkdirSync(buildPath)
  fs.mkdirSync(buildPath + '/src')
  minifyDirectory(rootPath, '/dist/src')
})
