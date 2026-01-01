
export const handleTryCatch = (err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err)
  console.log('[try catch]: ' + msg)
}