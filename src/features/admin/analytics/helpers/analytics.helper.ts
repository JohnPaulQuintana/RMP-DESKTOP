export const formatEndpoint = ( endpoint?: string ) => {
  if(!endpoint){
    return ''
  }
  return endpoint.replace(
    /\//g,
    '/<wbr>'
  )
}

export function getEndpointColor(endpoint: string) {
  let hash = 0
  for (let i = 0; i < endpoint.length; i++) {
    hash = endpoint.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${Math.abs(hash % 360)}, 70%, 50%)`
}


