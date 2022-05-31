/* eslint-disable @typescript-eslint/ban-ts-comment */
import '@testing-library/jest-dom/extend-expect'

// workaround for motion library
//@ts-ignore
if (!SVGElement.prototype.getTotalLength) {
  //@ts-ignore
  SVGElement.prototype.getTotalLength = () => 1
}
