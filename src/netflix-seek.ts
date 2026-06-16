// Runs in the page's MAIN world so it can reach Netflix's player API.
// Content scripts live in an isolated world and cannot access window.netflix,
// so the isolated content script asks for a seek via a CustomEvent and this
// script performs it through Netflix's own engine (avoids corrupting the player).

interface NetflixPlayer {
  seek(timeMs: number): void;
}

interface NetflixVideoPlayer {
  getAllPlayerSessionIds(): string[];
  getVideoPlayerBySessionId(sessionId: string): NetflixPlayer | null;
}

interface NetflixGlobal {
  appContext?: {
    state?: {
      playerApp?: {
        getAPI?(): { videoPlayer: NetflixVideoPlayer };
      };
    };
  };
}

window.addEventListener("speedpilot-netflix-seek", (event) => {
  const timeMs = (event as CustomEvent<{ timeMs: number }>).detail?.timeMs;
  if (typeof timeMs !== "number") return;

  try {
    const netflix = (window as unknown as { netflix?: NetflixGlobal }).netflix;
    const videoPlayer = netflix?.appContext?.state?.playerApp?.getAPI?.().videoPlayer;
    if (!videoPlayer) return;

    const sessionIds = videoPlayer.getAllPlayerSessionIds();
    const sessionId = sessionIds.find((id) => id.startsWith("watch-")) ?? sessionIds[0];
    if (!sessionId) return;

    videoPlayer.getVideoPlayerBySessionId(sessionId)?.seek(timeMs);
  } catch (error) {
    console.error("SpeedPilot: Netflix seek failed", error);
  }
});
