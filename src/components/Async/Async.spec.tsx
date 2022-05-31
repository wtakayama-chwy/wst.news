import { render, screen, waitFor } from '@testing-library/react'
import Async from '.'

describe('Async component', () => {
  it('should renders correctly', async () => {
    render(<Async />)

    expect(screen.getByText('Hello world')).toBeInTheDocument()

    // method 1 - findByXX - wait for element to be rendered
    // expect(
    //   await screen.findByText('Button', {}, { timeout: 3000 })
    // ).toBeInTheDocument()

    // method 2 - waitFor
    await waitFor(
      () => {
        return expect(screen.getByText('Button')).toBeInTheDocument()
      },
      {
        timeout: 3000,
      }
    )

    // await waitForElementToBeRemoved(screen.queryByText('Button Invisible'))
    await waitFor(
      () => {
        return expect(
          screen.queryByText('Button Invisible')
        ).not.toBeInTheDocument()
      },
      {
        timeout: 4000,
      }
    )
  })
})

// getByXX - get element synchronously - throws error
// queryByXX - try to get element synchronously, but if it's not found it doesn't throw an error
// findByXX - get element asynchronously - throws error
