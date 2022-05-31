import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/client'
import { RichText } from 'prismic-dom'
import React from 'react'
import { PostPageComponent } from '../../components/PageComponents/Posts/PostPageComponent'
import { getPrismicClient } from '../../services/prismic'
import { getErrorMessage, someReportError } from '../../utils/error'

export interface PostPageProps {
  post: {
    slug: string
    title: string
    content: string
    updatedAt: string
  }
}

export type PrismicApiPostResponse = {
  title: { type: string; text: string }[]
  last_publication_date: string
  content: {
    type: string
    text: string
  }[]
}

export default function Post({ post }: PostPageProps) {
  return <PostPageComponent type="full" post={post} />
}

// every page that is static is a page that is not protected
// then everyone has access to it
export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  try {
    const session = await getSession({ req })
    const { slug } = params || {}

    if (!session?.activeSubscription) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

    const prismic = getPrismicClient(req)

    const postResponse = await prismic.getByUID<PrismicApiPostResponse>(
      'post',
      String(slug),
      {}
    )

    const post = {
      slug,
      title: RichText.asText(postResponse.data.title),
      content: RichText.asHtml(postResponse.data.content),
      updatedAt: new Date(
        String(postResponse.last_publication_date)
      ).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    }

    return {
      props: {
        post,
      },
    }
  } catch (error) {
    someReportError({ message: getErrorMessage(error) })
    return {
      notFound: true,
    }
  }
}
