import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import * as NextAuth from 'next-auth/client'
import * as NextRouter from 'next/router'
import { NextRouter as NextRouterType } from 'next/router'
import Stripe from 'stripe'
import Home, { getStaticProps } from '../../pages'
import { stripe } from '../../services/stripe'

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

jest.mock('../../services/stripe')

describe('Home page', () => {
  let useSessionMock: jest.SpyInstance<ReturnType<typeof NextAuth.useSession>>

  beforeEach(() => {
    useSessionMock = jest.spyOn(NextAuth, 'useSession')
  })

  afterEach(() => {
    useSessionMock.mockRestore()
  })

  it('should renders correctly', () => {
    useSessionMock.mockReturnValueOnce([null, false])
    render(
      <Home product={{ priceId: 'fake-price-id', priceAmount: '$ 10.00' }} />
    )

    expect(screen.getByText(new RegExp('\\$ 10.00', 'i'))).toBeInTheDocument()
  })

  describe('getStaticProps - with jest.spyOn', () => {
    let stripePricesRetrieveMock: jest.SpyInstance<
      ReturnType<typeof stripe.prices.retrieve>
    >

    beforeEach(() => {
      stripePricesRetrieveMock = jest.spyOn(stripe.prices, 'retrieve')
    })

    afterEach(() => {
      stripePricesRetrieveMock.mockRestore()
    })

    it('should load initial data on success', async () => {
      // for Promises
      stripePricesRetrieveMock.mockResolvedValueOnce({
        id: 'fake-price-id',
        unit_amount: 1000,
      } as Stripe.Response<Stripe.Price>)

      const response = await getStaticProps({})

      expect(response).toEqual(
        expect.objectContaining({
          props: {
            product: {
              priceId: 'fake-price-id',
              priceAmount: '$10.00',
            },
          },
          revalidate: 86400,
        })
      )
    })

    it('should throw error on failure', async () => {
      const message = 'Something went wrong'

      stripePricesRetrieveMock.mockImplementationOnce(() => {
        throw new Error(message)
      })

      expect(() => {
        throw new Error(message)
      }).toThrow()
    })
  })

  describe('getStaticProps - with jest.mock', () => {
    const stripePricesRetrieveMockWithJestMock = mocked(stripe.prices.retrieve)

    it('should load initial data on success', async () => {
      // for Promises
      stripePricesRetrieveMockWithJestMock.mockResolvedValueOnce({
        id: 'fake-price-id',
        unit_amount: 1000,
      } as Stripe.Response<Stripe.Price>)

      const response = await getStaticProps({})

      expect(response).toEqual(
        expect.objectContaining({
          props: {
            product: {
              priceId: 'fake-price-id',
              priceAmount: '$10.00',
            },
          },
          revalidate: 86400,
        })
      )
    })
  })
})
