import React from 'react'
import { graphql, Link } from 'gatsby'
// Local
import Layout from "../components/layout"
import SEO from "../components/seo"

export default function({
  data,
}) {
  const { page } = data
  return (
    <Layout>
      <SEO title={page.title} />
      <div>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
      </div>
      <div>
        <h2>Related articles</h2>
        {page.articles.map(node => (
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
}

export const pageQuery = graphql`
  query($key: String!) {
    page: blogCategory(key: { eq: $key }) {
      articles {
        author {
          fullname
          slug
        }
        categories {
          title
          slug
        }
        date(formatString: "ll")
        frontmatter {
          title
          date
        }
        parent {
          ... on MarkdownRemark {
            excerpt(pruneLength: 100)
          }
        }
        slug
      }
      description
      slug
      title
    }
  }
`
