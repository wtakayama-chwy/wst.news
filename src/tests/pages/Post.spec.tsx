import { Document } from '@prismicio/client/types/documents'
import { render, screen } from '@testing-library/react'
import * as NextAuth from 'next-auth/client'
import * as NextRouter from 'next/router'
import { NextRouter as NextRouterType } from 'next/router'
import Post, {
  getServerSideProps,
  PostPageProps,
  PrismicApiPostResponse,
} from '../../pages/posts/[slug]'
import * as Prismic from '../../services/prismic'

const post: PostPageProps['post'] = {
  slug: 'my-new-post',
  title: 'My new post',
  updatedAt: 'April 19, 2022',
  content: '<p>Post content</p>',
}

jest.spyOn(NextRouter, 'useRouter').mockImplementation(
  () =>
    ({
      route: '/posts/my-new-post',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    } as unknown as NextRouterType)
)

describe('Post page', () => {
  let useSessionMock: jest.SpyInstance<ReturnType<typeof NextAuth.useSession>>

  beforeEach(() => {
    useSessionMock = jest.spyOn(NextAuth, 'useSession')
  })

  afterEach(() => {
    useSessionMock.mockRestore()
  })

  it('should renders correctly', () => {
    useSessionMock.mockReturnValueOnce([
      {
        user: { name: 'John Doe' },
        expires: 'fake-expires',
        activeSubscription: 'fake-active-subscription',
      },
      false,
    ])

    render(<Post post={post} />)

    expect(screen.getByText('My new post')).toBeInTheDocument()
    expect(screen.getByText('Post content')).toBeInTheDocument()
  })

  describe('getServerSideProps - with jest.spyOn', () => {
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

    it('should redirects user if no subscription is found', async () => {
      getSessionMock.mockResolvedValueOnce({
        activeSubscription: null,
      })

      const response = await getServerSideProps({
        params: { slug: 'my-new-post' },
      } as never)

      expect(response).toEqual(
        expect.objectContaining({
          redirect: {
            destination: '/',
            permanent: false,
          },
        })
      )
    })

    it('should load initial data on success when user is authenticated', async () => {
      getSessionMock.mockResolvedValueOnce({
        activeSubscription: 'fake-active-subscription',
      })

      prismicClientMock.mockReturnValueOnce({
        getByUID: jest.fn().mockResolvedValueOnce({
          data: {
            title: [{ type: 'heading', text: 'My new post' }],
            content: [{ type: 'paragraph', text: 'Post content' }],
          },
          last_publication_date: '04-01-2022',
        } as Document<PrismicApiPostResponse>),
      } as never)

      const response = await getServerSideProps({
        params: { slug: 'my-new-post' },
      } as never)

      expect(response).toEqual(
        expect.objectContaining({
          props: {
            post: {
              slug: 'my-new-post',
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
