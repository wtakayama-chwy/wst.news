import { render, screen } from '@testing-library/react'
import * as nextAuth from 'next-auth/client'
import * as nextRouter from 'next/router'
import { NextRouter } from 'next/router'
import { Header } from '.'

jest
  .spyOn(nextRouter, 'useRouter')
  .mockImplementation(() => ({ asPath: '/' } as NextRouter))

// null = user not authenticated & false = is loading user data
jest.spyOn(nextAuth, 'useSession').mockImplementation(() => [null, false])

describe('Header', () => {
  it('renders correctly', () => {
    render(<Header />)

    screen.logTestingPlaygroundURL()

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Posts')).toBeInTheDocument()
  })
})
