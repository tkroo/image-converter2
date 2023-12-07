function formatTime(duration) {
  const m = new Date(duration).getMinutes()
  const s = new Date(duration).getSeconds()
  const ms = new Date(duration).getMilliseconds()
  const minutes = m == 0 ? '' : m + (m > 1 ? ' mins ' : ' min ')
  const seconds = s == 0 ? '' : s + (s > 1 ? ' seconds ' : ' second ')
  return minutes + seconds + ms + ' milliseconds'
}

export default formatTime