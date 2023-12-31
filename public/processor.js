import Profiler from './profiler.js'
import global from './global.js'

// Fuck CORS
const processor = async (src) => {
  Profiler.logs.processor.set()
  try {
    let response = await fetch('https://eulaquery.glitch.me', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ link: src.replace(/api-cdn(-mp4)?/g, global.api.server) })
    })
    let blob = await response.blob()
    let url = URL.createObjectURL(blob)
    let buffer = await blob.arrayBuffer().then(arrayBuffer => new Uint8Array(arrayBuffer))
    Profiler.logs.processor.mark()

    if (global.debug)
      console.log('Processor time:', `${Profiler.logs.processor.sum()}ms`)

    return { url, buffer }
  } catch (err) {
    console.error('Failed to retrieve video source.', err)
    return null
  }
}

export default processor
