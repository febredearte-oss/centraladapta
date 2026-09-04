import baseWorker from "./worker-holiday-local-import.js";
import { handleBoardAcknowledgement } from "./board-ack.js";
import { handleSharedBoardAcknowledgement } from "./board-shared-ack.js";

async function withBoardTheme(response) {
  if (!response) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  const text = await response.text();
  const themed = text.includes("/board-officio.css")
    ? text
    : text.replace("</head>", '<link rel="stylesheet" href="/board-officio.css"></head>');
  return new Response(themed, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const sharedBoardResponse = await handleSharedBoardAcknowledgement(request, env);
    if (sharedBoardResponse) return withBoardTheme(sharedBoardResponse);
    const boardResponse = await handleBoardAcknowledgement(request, env);
    if (boardResponse) return withBoardTheme(boardResponse);
    return baseWorker.fetch(request, env, ctx);
  },
};
