import { render, screen } from '@testing-library/react'
// import { mocked } from 'jest-mock'
// import { useSession } from 'next-auth/client'
import * as NextAuth from 'next-auth/client'
import { SignInButton } from '.'

// with jest.mock
// jest.mock('next-auth/client')
// describe('SignInButton component', () => {
//   const useSessionMocker = mocked(useSession)

//   it('renders correctly when user is NOT authenticated', () => {
//     useSessionMocker.mockReturnValueOnce([null, false])

//     render(<SignInButton />)

//     expect(screen.getByText('Sign in with Github')).toBeInTheDocument()
//   })

//   it('renders correctly when user is authenticated', () => {
//     useSessionMocker.mockReturnValueOnce([
//       { user: { name: 'John Doe' }, expires: 'fake-expires' },
//       false,
//     ])

//     render(<SignInButton />)

//     expect(screen.getByText('John Doe')).toBeInTheDocument()
//   })
// })

// with jest.spyOn
describe('SignInButton component', () => {
  let useSessionMock: jest.SpyInstance<ReturnType<typeof NextAuth.useSession>>

  beforeEach(() => {
    useSessionMock = jest.spyOn(NextAuth, 'useSession')
  })

  afterEach(() => {
    useSessionMock.mockRestore()
  })

  it('renders correctly when user is NOT authenticated', () => {
    useSessionMock.mockReturnValueOnce([null, false])

    render(<SignInButton />)

    expect(screen.getByText('Sign in with Github')).toBeInTheDocument()
  })

  it('renders correctly when user is authenticated', () => {
    useSessionMock.mockReturnValueOnce([
      { user: { name: 'John Doe' }, expires: 'fake-expires' },
      false,
    ])

    render(<SignInButton />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
