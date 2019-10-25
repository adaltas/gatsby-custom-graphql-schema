const crypto = require("crypto")
const path = require("path")

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    """
    BlogCategory Node
    """
    type BlogCategory implements Node @infer {
      key: String!
      description: String!
      title: String!
      slug: String!
    }
  `)
}

exports.onCreateNode = ({ node, getNode, actions, createNodeId }) => {
  const { createNode } = actions
  // Filter non-markdown files
  if (node.internal.type !== `CategoriesYaml`) { return }
  // Define custom fields
  const slug = `/category/${node.key}/`
  // Create BlogCategory node
  createNode({
    // Custom fields
    key: node.key,
    title: node.title,
    slug: slug,
    description: node.description,
    // Gatsby fields
    id: createNodeId(`blog-category-${node.key}`),
    parent: node.id,
    children: [],
    internal: {
      type: `BlogCategory`,
      contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify(node))
        .digest(`hex`)
    }
  })
}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    BlogCategory: {
      articles: {
        type: [`BlogArticle`],
        resolve(source, args, context, info) {
          return context.nodeModel
          .getAllNodes({
            type: `BlogArticle`,
          })
          .filter(article =>
            (article.frontmatter.categories || []).some(key => source.key === key )
          )
          .sort( (first, second) =>
            first.date.getTime() > second.date.getTime() ? -1 : 1
          )
        }
      } } } ) }

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions
  const categoryTemplate = path.resolve(`src/templates/category.js`)
  return graphql(`
    {
      categories: allBlogCategory {
        nodes {
          key
          slug
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }
    result.data.categories.nodes.forEach( category => {
      createPage({
        path: category.slug,
        component: categoryTemplate,
        context: {
          key: category.key
        }
      })
    } ) } ) }
