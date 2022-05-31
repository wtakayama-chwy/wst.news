import Link from 'next/link'
import React from 'react'
import { PageComponent } from '..'
import { PostsPageProps } from '../../../pages/posts'
import styles from './styles.module.scss'

export function PostsPageComponent({ posts }: PostsPageProps) {
  return (
    <PageComponent
      mainClassName={styles.container}
      seo={{
        title: 'Posts | wst.news',
        description: 'posts page',
      }}
    >
      <>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </>
    </PageComponent>
  )
}
