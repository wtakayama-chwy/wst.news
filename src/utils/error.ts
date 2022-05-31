export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export const someReportError = ({ message }: { message: string }) => {
  throw new Error(message)
}
