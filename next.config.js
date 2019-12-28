var withMDX = require('@next/mdx')({
  extention: /\.mdx?$/
})
var withCSS = require('@zeit/next-css')

module.exports = withCSS(
  withMDX()
)
