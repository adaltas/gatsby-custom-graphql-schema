const crypto = require("crypto")
const path = require("path")

exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    """
    BlogAuthor Node
    """
    type BlogAuthor implements Node @infer
  `)
}

exports.onCreateNode = ({ node, getNode, actions, createNodeId }) => {
  const { createNode, createNodeField } = actions
  // Filter non-markdown files
  if (node.internal.type !== `MarkdownRemark`) { return }
  // Filter non-authors files
  if (!/content\/authors/.test(node.fileAbsolutePath)) { return }
  // Define custom fields
  const username = node.frontmatter.username
  const slug = `/author/${username}/`
  const fullname = `${node.frontmatter.firstname} ${node.frontmatter.lastname}`
  // Create BlogAuthor node
  const copy = {}
  const filter = ['children', 'id', 'internal', 'fields', 'parent', 'type']
  Object.keys(node).map( key => {
    if(!filter.some(k => k === key)) copy[key] = node[key]
  })
  createNode({
    // Custom fields
    ...copy,
    username: username,
    fullname: fullname,
    slug: slug,
    // Gatsby fields
    id: createNodeId(slug),
    parent: node.id,
    children: [],
    internal: {
      type: `BlogAuthor`,
      contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify(node))
        .digest(`hex`)
    }
  })
}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    BlogAuthor: {
      articles: {
        type: [`BlogArticle`],
        resolve(source, args, context, info) {
          return context.nodeModel
          .getAllNodes({
            type: `BlogArticle`,
          })
          .filter(article =>
            source.frontmatter.username === article.frontmatter.author
          )
          .sort( (first, second) =>
            first.date.getTime() > second.date.getTime() ? -1 : 1
          )
        } } } } ) }

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions
  const authorTemplate = path.resolve(`src/templates/author.js`)
  return graphql(`
    {
      authors: allBlogAuthor {
        nodes {
          slug
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }
    const {authors} = result.data
    authors.nodes.forEach( author => {
      if (author.disabled) return
      createPage({
        path: author.slug,
        component: authorTemplate,
      })
    } ) } ) }
