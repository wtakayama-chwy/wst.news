import React, { useEffect, useState } from 'react'

export default function Async() {
  const [isButtonVisible, setIsButtonVisible] = useState(false)
  const [isInvisibleButtonVisible, setIsInvisibleButtonVisible] =
    useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsButtonVisible(true)
    }, 3000)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setIsInvisibleButtonVisible(true)
    }, 4000)
  }, [])

  return (
    <div>
      <div>Hello world</div>
      {isButtonVisible && <button>Button</button>}
      {!isInvisibleButtonVisible && <button>Button Invisible</button>}
    </div>
  )
}
