import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ReactElement, useEffect, useState } from 'react'
import LoaderFrame from '../LoaderFrame'

type SEO = {
  title: string
  description: string
  siteName?: string
  previewImage?: string
}

interface PageComponentProps {
  seo: SEO
  children: ReactElement
  mainClassName?: string
}

export function PageComponent({
  seo,
  children,
  mainClassName,
}: PageComponentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const currentURL = router.route

  useEffect(() => {
    function handleStart() {
      setIsLoading(true)
    }

    function handleStop() {
      setIsLoading(false)
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router.events])

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta property="og:title" content={seo.title} key="ogtitle" />
        <meta
          property="og:description"
          content={seo.description}
          key="ogdesc"
        />
        <meta property="og:url" content={currentURL} key="ogurl" />
        {seo.previewImage ? (
          <meta property="og:image" content={seo.previewImage} key="ogimage" />
        ) : null}
        <meta
          property="og:site_name"
          content={seo.siteName ?? 'wst.news'}
          key="ogsitename"
        />
      </Head>

      <main className={mainClassName}>
        {children}
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 99998,
            pointerEvents: isLoading ? 'all' : 'none',
          }}
        >
          <LoaderFrame loading={isLoading} />
        </div>
      </main>
    </>
  )
}
