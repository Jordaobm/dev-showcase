"use client";

import { Button } from "@/features/shared/components/Button";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import {
  Info,
  Pause,
  Play,
  Save,
  ScreenShare,
  ScreenShareOff,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useSeekablePlayer } from "../hooks/useSeekablePlayer";
import { useClientSnapshot } from "@/features/shared/hooks/useClientSnapshot";

export const CameraAPISection = () => {
  const t = useTranslations();
  const [shareScreenStatus, setShareScreenStatus] = useState(false);
  const [availableDownload, setAvailableDownload] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const {
    mediaRef: videoRef,
    playing,
    currentTime,
    duration,
    progressPercent,
    resetPlayback,
    togglePlay,
    handleLoadedMetadata,
    handleEnded,
    handleSeek,
    handleSeekKeyDown,
    formatTime,
  } = useSeekablePlayer<HTMLVideoElement>();

  const getSupportedMimeType = () => {
    const types = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
  };

  const isCameraSupported = useClientSnapshot(
    () => !!navigator.mediaDevices?.getUserMedia,
    true,
  );

  const shareScreen = async () => {
    if (!isCameraSupported) return;

    if (shareScreenStatus) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      return;
    }

    try {
      setError(null);
      setAvailableDownload(undefined);
      resetPlayback();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.src = "";
        videoRef.current.srcObject = stream;
      }

      setShareScreenStatus(true);

      const mimeType = getSupportedMimeType();
      mediaRecorder.current = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      mediaRecorder.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const type = getSupportedMimeType() || "video/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];

        const url = window.URL.createObjectURL(blob);
        setAvailableDownload(url);
        setShareScreenStatus(false);

        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
          videoRef.current.load();
        }
      };

      mediaRecorder.current.start();

      stream.getTracks()[0].onended = () => {
        mediaRecorder.current?.stop();
      };
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("mediaCapture.cameraGenericError"));
      }
    }
  };

  const download = () => {
    if (!availableDownload) return;
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = availableDownload;
    a.download = `dev_showcase_media_recorder_video_api_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const cameraStatusLabel = (() => {
    if (shareScreenStatus) return t("mediaCapture.cameraLivePreviewLabel");
    if (availableDownload) return t("mediaCapture.cameraRecordedLabel");
    return t("mediaCapture.cameraNoRecordingLabel");
  })();

  return (
    <div id="pwa-camera-api" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("mediaCapture.cameraSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("mediaCapture.cameraDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("mediaCapture.cameraDesc2")}</p>
        <br />
        <p>{t("mediaCapture.cameraCanDoIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("mediaCapture.cameraCanDoItem1")}</li>
          <li>{t("mediaCapture.cameraCanDoItem2")}</li>
          <li>{t("mediaCapture.cameraCanDoItem3")}</li>
          <li>{t("mediaCapture.cameraCanDoItem4")}</li>
          <li>{t("mediaCapture.cameraCanDoItem5")}</li>
          <li>{t("mediaCapture.cameraCanDoItem6")}</li>
        </ul>
        <br />
        <p>{t.rich("mediaCapture.cameraVsRecorderDesc", renderHtmlText)}</p>
        <br />
        <p>{t.rich("mediaCapture.cameraGetUserMediaDesc", renderHtmlText)}</p>
        <br />
        <p>{t.rich("mediaCapture.cameraRecorderRoleDesc", renderHtmlText)}</p>
        <br />
        <p>{t("mediaCapture.cameraSummaryIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t.rich("mediaCapture.cameraSummaryItem1", renderHtmlText)}</li>
          <li>{t.rich("mediaCapture.cameraSummaryItem2", renderHtmlText)}</li>
        </ul>
        <br />
        <p>{t("mediaCapture.cameraCombinedNote")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <Info className="mt-1 shrink-0" />
            <p className="text-sm leading-relaxed">
              {t.rich("mediaCapture.cameraWarningText", renderHtmlText)}
            </p>
          </div>
        </div>

        <p className="mt-2 font-bold">{t("mediaCapture.howToUseLabel")}</p>
        <p className="mt-2">{t("mediaCapture.cameraHowToUseText")}</p>

        <div className="mt-4">
          <div className="flex flex-col md:flex-row mt-4 gap-4 items-start">
            <Button
              type="primary"
              onClick={shareScreen}
              disabled={!isCameraSupported}
            >
              {shareScreenStatus ? (
                <>
                  <ScreenShareOff className="w-5 h-5" />
                  {t("mediaCapture.cameraStopButton")}
                </>
              ) : (
                <>
                  <ScreenShare className="w-5 h-5" />
                  {t("mediaCapture.cameraCaptureButton")}
                </>
              )}
            </Button>

            <Button
              type="primary"
              onClick={download}
              disabled={!availableDownload}
            >
              <Save className="w-5 h-5" />
              {t("mediaCapture.cameraDownloadButton")}
            </Button>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {!isCameraSupported && (
          <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            {t("mediaCapture.cameraUnsupportedMessage")}
          </p>
        )}

        <div className="mt-4">
          <div
            className="w-full max-w-xl rounded-2xl overflow-hidden text-white"
            style={{
              background: "linear-gradient(135deg, #141414, #0d0d0d)",
              border: "1px solid rgba(220, 38, 38, 0.15)",
              boxShadow:
                "0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(220, 38, 38, 0.05)",
            }}
          >
            <div className="relative w-full aspect-video bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                className="w-full h-full object-contain"
              />

              {shareScreenStatus && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-semibold tracking-widest text-white uppercase">
                    {t("mediaCapture.cameraRecordingBadge")}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase mb-3">
                {cameraStatusLabel}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  disabled={!availableDownload || shareScreenStatus}
                  aria-label={
                    playing
                      ? t("mediaCapture.mediaPauseButtonLabel")
                      : t("mediaCapture.mediaPlayButtonLabel")
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={
                    availableDownload && !shareScreenStatus
                      ? {
                          background:
                            "linear-gradient(135deg, #DC2626, #EA580C)",
                          boxShadow: "0 0 16px rgba(220, 38, 38, 0.45)",
                        }
                      : { background: "rgba(255,255,255,0.08)" }
                  }
                >
                  {playing ? (
                    <Pause size={15} fill="white" stroke="none" />
                  ) : (
                    <Play
                      size={15}
                      fill="white"
                      stroke="none"
                      className="ml-0.5"
                    />
                  )}
                </button>

                <div className="flex-1 flex flex-col gap-1.5">
                  <div
                    className="relative h-1 rounded-full cursor-pointer overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                    onClick={handleSeek}
                    onKeyDown={handleSeekKeyDown}
                    role="slider"
                    tabIndex={0}
                    aria-label={t("mediaCapture.mediaSeekBarLabel")}
                    aria-valuemin={0}
                    aria-valuemax={duration || 0}
                    aria-valuenow={currentTime}
                    aria-valuetext={formatTime(currentTime)}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${progressPercent}%`,
                        background:
                          "linear-gradient(to right, #DC2626, #EA580C)",
                        boxShadow: "0 0 6px rgba(220, 38, 38, 0.6)",
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("mediaCapture.methodsTitle")}
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>{t.rich("mediaCapture.cameraMethod1", renderHtmlText)}</li>
          <li>{t.rich("mediaCapture.cameraMethod2", renderHtmlText)}</li>
          <li>{t.rich("mediaCapture.cameraMethod3", renderHtmlText)}</li>
          <li>{t.rich("mediaCapture.cameraMethod4", renderHtmlText)}</li>
          <li>{t.rich("mediaCapture.cameraMethod5", renderHtmlText)}</li>
          <li>{t.rich("mediaCapture.cameraMethod6", renderHtmlText)}</li>
          <li>{t.rich("mediaCapture.cameraMethod7", renderHtmlText)}</li>
          <li>{t.rich("mediaCapture.cameraMethod8", renderHtmlText)}</li>
          <li>{t.rich("mediaCapture.cameraMethod9", renderHtmlText)}</li>
          <li>{t.rich("mediaCapture.cameraMethod10", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
