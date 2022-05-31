import Prismic from '@prismicio/client'
import { GetStaticProps } from 'next'
import { RichText } from 'prismic-dom'
import { PostsPageComponent } from '../../components/PageComponents/Posts'
import { getPrismicClient } from '../../services/prismic'
import { getErrorMessage, someReportError } from '../../utils/error'

export type Post = {
  slug: string
  title: string
  excerpt: string
  updatedAt: string
}

export type PrismicApiPostsResponse = {
  title: { type: string; text: string }[]
  text: string
  content: {
    type: string
    text: string
  }[]
}
export interface PostsPageProps {
  posts: Post[]
}

export default function PostsPage({ posts }: PostsPageProps) {
  return <PostsPageComponent posts={posts} />
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const prismic = getPrismicClient()

    const prismicResponse = await prismic.query<PrismicApiPostsResponse>(
      [Prismic.predicates.at('document.type', 'post')],
      {
        fetch: ['post.title', 'post.content'],
        pageSize: 100,
      }
    )

    const posts = prismicResponse.results.map((post) => {
      return {
        slug: post.uid,
        title: RichText.asText(post.data.title),
        excerpt:
          post.data.content.find(
            (content: { type: string }) => content.type === 'paragraph'
          )?.text ?? '',
        updatedAt: new Date(
          String(post.last_publication_date)
        ).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      }
    })

    return {
      props: {
        posts,
      },
    }
  } catch (error) {
    someReportError({ message: getErrorMessage(error) })
    return {
      notFound: true,
    }
  }
}
