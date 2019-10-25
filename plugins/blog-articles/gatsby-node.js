const crypto = require("crypto")
const path = require("path")

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    """
    BlogArticle Node
    """
    type BlogArticle implements Node @infer
  `)
}

exports.onCreateNode = ({ node, getNode, actions, createNodeId }) => {
  const { createNode } = actions
  // Only apply to `MarkdownRemark` node types (`node.internal.type`)
  if (node.internal.type !== `MarkdownRemark`) { return }
  // Filter non-blog files
  if(!/content\/articles/.test(node.fileAbsolutePath)){ return }
  // Validate permalink field
  if(!node.frontmatter.permalink) throw Error(`Invalid frontmatter.permalink in $(node.frontmatter.title || 'unknow article')`)
  // Define custom fields
  const date = new Date(node.frontmatter.date)
  const slug = `/blog/${node.frontmatter.permalink}/`
  // Create BlogArticle node
  const copy = {}
  const filter = ['children', 'id', 'internal', 'fields', 'parent', 'type']
  Object.keys(node).map( key => {
    if(!filter.some(k => k === key)) copy[key] = node[key]
  })
  createNode({
    // Custom fields
    ...copy,
    slug: slug,
    date: date,
    // Gatsby fields
    id: createNodeId(slug),
    parent: node.id,
    children: [],
    internal: {
      type: `BlogArticle`,
      contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify(node))
        .digest(`hex`)
    }
  }
)}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    BlogArticle: {
      author: {
        type: `BlogAuthor`,
        resolve(source, args, context, info) {
          return context.nodeModel
          .getAllNodes(
            { type: `BlogAuthor` },
            { connectionType: "BlogAuthor" }
          )
          .filter(author =>
            source.frontmatter.author === author.username
          )[0]
        },
      },
      categories: {
        type: [`BlogCategory`],
        resolve(source, args, context, info) {
          return context.nodeModel
          .getAllNodes(
            { type: `BlogCategory` }, 
            { connectionType: "BlogCategory" }
          )
          .filter(category =>
            (source.frontmatter.categories || []).some(key => key === category.key)
          )
        } } } } ) }

exports.createPages = ({ actions, graphql, reporter }) => {
  const { createPage } = actions
  const articleTemplate = path.resolve(`src/templates/article.js`)
  return graphql(`
    {
      articles: allBlogArticle {
        nodes {
          frontmatter {
            categories
          }
          parent {
            ... on MarkdownRemark {
              fileAbsolutePath
            }
          }
          slug
        }
      }
      categories: allBlogCategory {
        nodes {
          key
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }
    const {articles, categories} = result.data
    articles.nodes.forEach( article => {
      // Categories key validation
      const relpath = path.relative('.', article.parent.fileAbsolutePath)
      article.frontmatter.categories.map ( name => {
        const isCategoryValid = categories.nodes.some( (category) =>
          name === category.key
        )
        if (!isCategoryValid){
          reporter.warn(`Invalid category, found ${name} in ${relpath}`)
        }
      })
      // Page creation
      createPage({
        path: article.slug,
        component: articleTemplate,
      } 
    ) } ) } ) }
