import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse'
import { render, screen } from '@testing-library/react'
import * as NextRouter from 'next/router'
import { NextRouter as NextRouterType } from 'next/router'
import Posts, {
  getStaticProps,
  Post,
  PrismicApiPostsResponse,
} from '../../pages/posts'
import * as Prismic from '../../services/prismic'

const posts: Post[] = [
  {
    slug: 'my-new-post',
    title: 'My new post',
    excerpt: 'Post excerpt',
    updatedAt: 'April 19, 2022',
  },
]

jest.spyOn(NextRouter, 'useRouter').mockImplementationOnce(
  () =>
    ({
      route: '',
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    } as unknown as NextRouterType)
)

describe('Posts page', () => {
  it('should renders correctly', () => {
    render(<Posts posts={posts} />)

    expect(screen.getByText('My new post')).toBeInTheDocument()
  })

  describe('getStaticProps - with jest.spyOn', () => {
    let prismicClientMock: jest.SpyInstance<
      ReturnType<typeof Prismic.getPrismicClient>
    >

    beforeEach(() => {
      prismicClientMock = jest.spyOn(Prismic, 'getPrismicClient')
    })

    afterEach(() => {
      prismicClientMock.mockRestore()
    })

    it('should load initial data on success', async () => {
      prismicClientMock.mockReturnValueOnce({
        query: jest.fn().mockResolvedValueOnce({
          results: [
            {
              uid: 'my-new-post',
              data: {
                title: [{ type: 'heading', text: 'My new post' }],
                content: [{ type: 'paragraph', text: 'Post excerpt' }],
              },
              last_publication_date: '04-19-2022',
            },
          ],
        } as ApiSearchResponse<PrismicApiPostsResponse>),
      } as never)

      const response = await getStaticProps({})

      expect(response).toEqual(
        expect.objectContaining({
          props: {
            posts,
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
