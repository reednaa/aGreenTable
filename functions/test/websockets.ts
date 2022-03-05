export async function onRequest(context) {
  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;
  try {
    const url = new URL(request.url)
    switch (url.pathname) {
      case '/ws':
        return websocketHandler(request)
      case '/wss':
        return websocketHandler(request)
      default:
        return new Response("Not found", { status: 404 })
    }
  } catch (err) {
    return new Response(err.toString())
  }
}

async function handleSession(websocket) {
  websocket.accept()
  websocket.addEventListener("message", async ({ data }) => {
    websocket.broadcast(data);
  });

  websocket.addEventListener("close", async evt => {
    // Handle when a client closes the WebSocket connection
    console.log(evt)
  })
}

const websocketHandler = async request => {
  const upgradeHeader = request.headers.get("Upgrade")
  if (upgradeHeader !== "websocket") {
    return new Response("Expected websocket", { status: 400 })
  }

  const [client, server] = Object.values(new WebSocketPair())
  await handleSession(server)

  return new Response(null, {
    status: 101,
    webSocket: client
  })
}
