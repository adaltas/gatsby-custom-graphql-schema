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
        <h1>{page.fullname}</h1>
        <p>{page.frontmatter.jobtitle}</p>
        <p
          dangerouslySetInnerHTML={{ __html: page.parent.html }}
        />
      </div>
      <div>
        <h2>Published articles</h2>
        {page.articles.map(node => (
          <div key={node.slug}>
            <h4>
              <Link to={node.slug}>{node.frontmatter.title}</Link>
            </h4>
            <p>{node.parent.excerpt}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($path: String!) {
    page: blogAuthor(slug: { eq: $path }) {
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
      frontmatter {
        jobtitle
      }
      fullname
      parent {
        ... on MarkdownRemark {
          html
        }
      }
      slug
    }
  }
`
