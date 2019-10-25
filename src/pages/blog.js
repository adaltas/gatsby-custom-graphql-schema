import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

export default ({
  data: {
    articles
  }
}) => (
  <Layout>
    <SEO title="Blog" />
    <h1>Blog</h1>
    <div>
      <h2>All blog articles</h2>
      {articles.nodes.map(node => (
        <div key={node.slug}>
          <h4>
            <Link to={node.slug}>{node.frontmatter.title}</Link>
          </h4>
          <p>By <Link to={node.author.slug}>{node.author.fullname}</Link>, {node.date}</p>
          <p>{node.parent.excerpt}</p>
        </div>
      ))}
    </div>
  </Layout>
)

export const query = graphql`
  query {
    articles: allBlogArticle {
      nodes {
        slug
        parent {
          ... on MarkdownRemark {
            id
            excerpt(pruneLength: 100)
          }
        }
        author {
          slug
          fullname
        }
        categories {
          slug
          title
        }
        frontmatter {
          title
        }
        date(formatString: "ll")
      }
    }
  }
`
