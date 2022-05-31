import { render } from '@testing-library/react'
import * as nextRouter from 'next/router'
import { NextRouter } from 'next/router'
import { ActiveLink } from '.'

// jest.mock('next/router', () => ({
//   useRouter: () => ({
//     asPath: '/',
//   }),
// }))

jest
  .spyOn(nextRouter, 'useRouter')
  .mockImplementation(() => ({ asPath: '/' } as NextRouter))

describe('ActiveLink component', () => {
  it('renders correctly', () => {
    const { debug, getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    )

    debug()
    expect(getByText('Home')).toBeInTheDocument()
  })

  it('adds active class if the link as currently active', () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    )

    expect(getByText('Home')).toHaveClass('active')
  })
})
