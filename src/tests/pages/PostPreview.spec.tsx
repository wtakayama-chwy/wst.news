import { Document } from '@prismicio/client/types/documents'
import { render, screen } from '@testing-library/react'
import * as NextAuth from 'next-auth/client'
import * as NextRouter from 'next/router'
import { NextRouter as NextRouterType } from 'next/router'
import Post, {
  getStaticProps,
  PostPreviewPageProps,
  PrismicApiPostPreviewResponse,
} from '../../pages/posts/preview/[slug]'
import * as Prismic from '../../services/prismic'

const post: PostPreviewPageProps['post'] = {
  slug: 'my-new-post-with-preview',
  title: 'My new post',
  updatedAt: 'April 19, 2022',
  content: '<p>Post content</p>',
}

const fullPost: PostPreviewPageProps['post'] = {
  slug: 'my-new-post-full',
  title: 'My new post full content',
  updatedAt: 'April 19, 2022',
  content: '<p>Post full content</p>',
}

const pushMock = jest.fn()
jest.spyOn(NextRouter, 'useRouter').mockImplementation(
  () =>
    ({
      route: '/posts/preview/my-new-post-with-preview',
      push: pushMock,
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    } as unknown as NextRouterType)
)

describe('Post preview page', () => {
  let useSessionMock: jest.SpyInstance<ReturnType<typeof NextAuth.useSession>>

  beforeEach(() => {
    useSessionMock = jest.spyOn(NextAuth, 'useSession')
  })

  afterEach(() => {
    useSessionMock.mockRestore()
  })

  it('should renders correctly', () => {
    useSessionMock.mockReturnValueOnce([null, false])

    render(<Post post={post} />)

    expect(screen.getByText('My new post')).toBeInTheDocument()
    expect(screen.getByText('Post content')).toBeInTheDocument()
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
  })

  describe('getStaticSideProps - with jest.spyOn', () => {
    let prismicClientMock: jest.SpyInstance<
      ReturnType<typeof Prismic.getPrismicClient>
    >
    let getSessionMock: jest.SpyInstance<ReturnType<typeof NextAuth.getSession>>

    beforeEach(() => {
      prismicClientMock = jest.spyOn(Prismic, 'getPrismicClient')
      getSessionMock = jest.spyOn(NextAuth, 'getSession')
    })

    afterEach(() => {
      prismicClientMock.mockRestore()
      getSessionMock.mockRestore()
    })

    it('should redirect user to full post when user is subscribed', async () => {
      useSessionMock.mockReturnValueOnce([
        { activeSubscription: 'fake-active-subscription' },
        false,
      ])

      render(<Post post={fullPost} />)

      expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post-full')
    })

    it('should load initial data on success when user is authenticated', async () => {
      prismicClientMock.mockReturnValueOnce({
        getByUID: jest.fn().mockResolvedValueOnce({
          data: {
            title: [{ type: 'heading', text: 'My new post' }],
            content: [{ type: 'paragraph', text: 'Post content' }],
          },
          last_publication_date: '04-01-2022',
        } as Document<PrismicApiPostPreviewResponse>),
      } as never)

      const response = await getStaticProps({
        params: { slug: 'my-new-post-with-preview' },
      } as never)

      expect(response).toEqual(
        expect.objectContaining({
          props: {
            post: {
              slug: 'my-new-post-with-preview',
              title: 'My new post',
              content: '<p>Post content</p>',
              updatedAt: 'April 01, 2022',
            },
          },
        })
      )
    })

    it('should throw error on failure', async () => {
      const message = 'Something went wrong'

      prismicClientMock.mockImplementationOnce(() => {
        throw new Error(message)
      })

      expect(() => {
        throw new Error(message)
      }).toThrow()
    })
  })
})
