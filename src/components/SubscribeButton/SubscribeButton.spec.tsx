import { fireEvent, render, screen } from '@testing-library/react'
import * as NextAuth from 'next-auth/client'
import * as NextRouter from 'next/router'
import { NextRouter as NextRouterType } from 'next/router'
import { SubscribeButton } from '.'

// jest.mock('next-auth/client')
// jest.mock('next/router')

// describe('SubscribeButton component', () => {
//   it('should renders correctly', () => {
//     const useSessionMock = mocked(useSession)

//     useSessionMock.mockReturnValueOnce([null, false])

//     render(<SubscribeButton />)

//     expect(screen.getByText('Subscribe now')).toBeInTheDocument()
//   })

//   it('should redirects user to sign in when not authenticated', () => {
//     const signInMock = mocked(signIn)
//     const useSessionMock = mocked(useSession)

//     useSessionMock.mockReturnValueOnce([null, false])

//     render(<SubscribeButton />)

//     const subscribeButton = screen.getByText('Subscribe now')

//     fireEvent.click(subscribeButton)

//     expect(signInMock).toHaveBeenCalled()
//   })

//   it('should redirects user to /posts when user already has a subscription', () => {
//     const signInMock = mocked(signIn)
//     const useSessionMock = mocked(useSession)
//     const pushMock = jest.fn()
//     const useRouterMock = mocked(useRouter)

//     useRouterMock.mockReturnValueOnce({
//       push: pushMock
//     } as unknown as NextRouterType)

//     useSessionMock.mockReturnValueOnce([{ user: { name: 'John Doe' }, expires: 'fake-expires', activeSubscription: 'fake-active-subscription', }, false])

//     render(<SubscribeButton />)

//     const subscribeButton = screen.getByText('Subscribe now')

//     fireEvent.click(subscribeButton)

//     expect(pushMock).toHaveBeenCalled()
//   })

// })

describe('SubscribeButton component', () => {
  let useSessionMock: jest.SpyInstance<ReturnType<typeof NextAuth.useSession>>
  let signInMock: jest.SpyInstance<ReturnType<typeof NextAuth.signIn>>
  let useRouterMock: jest.SpyInstance<ReturnType<typeof NextRouter.useRouter>>

  beforeAll(() => {
    useSessionMock = jest.spyOn(NextAuth, 'useSession')
    signInMock = jest.spyOn(NextAuth, 'signIn')
    useRouterMock = jest.spyOn(NextRouter, 'useRouter')
  })

  afterAll(() => {
    useSessionMock.mockRestore()
    signInMock.mockRestore()
    useRouterMock.mockRestore()
  })

  it('should renders correctly', () => {
    useSessionMock.mockReturnValueOnce([null, false])

    render(<SubscribeButton />)

    expect(screen.getByText('Subscribe now')).toBeInTheDocument()
  })

  it('should redirects user to sign in when not authenticated', () => {
    useSessionMock.mockReturnValueOnce([null, false])
    signInMock.mockImplementation(jest.fn())

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(signInMock).toHaveBeenCalled()
  })

  it('should redirects user to /posts when user already has a subscription', () => {
    const pushMock = jest.fn()

    useSessionMock.mockReturnValueOnce([
      {
        user: { name: 'John Doe' },
        expires: 'fake-expires',
        activeSubscription: 'fake-active-subscription',
      },
      false,
    ])
    useRouterMock.mockReturnValueOnce({
      push: pushMock,
    } as unknown as NextRouterType)

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(pushMock).toHaveBeenCalledWith('/posts')
  })
})
