import React, { Fragment } from 'react'
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
      <SEO title={page.frontmatter.title} />
      <div>
        <h1>{page.frontmatter.title}</h1>
        <div>
          <p>
            By <Link to={page.author.slug}>{page.author.fullname}</Link>
          </p>
          <p>{page.date}</p>
          <p>
            {'Categories: '}
            {page.categories.map((category, pos, all) => (
              <Fragment key={category.slug}>
                <a href={category.slug}>{category.title}</a>
                {pos === all.length - 1 || ', '}
              </Fragment>
            ))}
          </p>
        </div>
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: page.parent.html }}
      />
    </Layout>
  )
}

export const pageQuery = graphql`
  query($path: String!) {
    page: blogArticle(slug: { eq: $path }) {
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
      }
      parent {
        ... on MarkdownRemark {
          html
        }
      }
      slug
    }
  }
`
