import baseWorker from "./worker-holiday-local-import.js";
import { handleBoardAcknowledgement } from "./board-ack.js";

export default {
  async fetch(request, env, ctx) {
    const boardResponse = await handleBoardAcknowledgement(request, env);
    if (boardResponse) return boardResponse;
    return baseWorker.fetch(request, env, ctx);
  },
};
