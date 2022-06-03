import cn from 'clsx'
import { useSession } from 'next-auth/client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { PageComponent } from '..'
import { PostPageProps } from '../../../pages/posts/[slug]'
import styles from './PostPageComponent.module.scss'

interface PostPageComponentProps extends PostPageProps {
  type: 'preview' | 'full'
}

export function PostPageComponent({ type, post }: PostPageComponentProps) {
  const [session] = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.activeSubscription && type === 'preview') {
      router.push(`/posts/${post.slug}`)
    }
  }, [post.slug, router, session, type])

  return (
    <PageComponent
      seo={{
        title: `${post.title} | wst.news`,
        description: 'post page',
      }}
      mainClassName={styles.container}
    >
      <>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={cn(styles.postContent, {
              [styles.previewContent]: type === 'preview',
            })}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {type === 'preview' ? (
            <div className={styles.continueReading}>
              Wanna continue reading?
              <Link href="/">
                <a>Subscribe now 🥰</a>
              </Link>
            </div>
          ) : null}
        </article>
      </>
    </PageComponent>
  )
}
