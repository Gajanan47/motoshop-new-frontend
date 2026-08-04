import { useState } from "react"
import {useNavigate} from "react-router-dom"

export default function WelcomeIntro() {
  const navigate = useNavigate()
  const [videoFailed, setVideoFailed] = useState(false)

  function goHome() {
    navigate("/", { replace: true })
  }

  function handleError(e) {
    console.error("Welcome video failed to load:", e.target.error)
    setVideoFailed(true)
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {videoFailed ? (
        <p className="text-white/70 text-sm">
          Couldn't load the video — check the console for details.
        </p>
      ) : (
        <video
          src="/videos/Animation_video.mp4"
          autoPlay
          muted
          playsInline
          onEnded={goHome}
          onError={handleError}
          onLoadedData={() => console.log("Welcome video loaded successfully")}
          className="max-h-full max-w-full"
        />
      )}

      <button
        onClick={goHome}
        className="absolute top-6 right-6 text-white/80 hover:text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/30 hover:border-white/60 transition cursor-pointer"
      >
        Skip
      </button>
    </div>
  )
}