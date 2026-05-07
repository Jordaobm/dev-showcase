"use client";

import { Button } from "@/features/shared/components/Button";
import { Info, Mic, MicOff, Save, Play, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { useSeekablePlayer } from "../hooks/useSeekablePlayer";

export const MediaRecorderAudioAPISection = () => {
  const t = useTranslations();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string>();

  const {
    mediaRef: audioRef,
    playing,
    currentTime,
    duration,
    progressPercent,
    togglePlay,
    handleLoadedMetadata,
    handleEnded,
    handleSeek,
    handleSeekKeyDown,
    formatTime,
  } = useSeekablePlayer<HTMLAudioElement>();

  const chunks = useRef<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isAudioSupported, setIsAudioSupported] = useState(true);

  useEffect(() => {
    setIsAudioSupported(!!navigator.mediaDevices?.getUserMedia);
  }, []);

  const record = async () => {
    if (!isAudioSupported) return;

    try {
      if (recording) {
        mediaRecorder.current?.stop();
        setRecording(false);
        return;
      }

      setError(null);
      setAudioURL("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, {
          type: "audio/ogg; codecs=opus",
        });

        chunks.current = [];

        const audioURL = URL.createObjectURL(blob);

        setAudioURL(audioURL);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current = recorder;

      recorder.start();

      setRecording(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("mediaCapture.audioGenericError"),
      );
    }
  };

  const download = () => {
    if (!audioURL) return;

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = audioURL;
    a.download = `dev_showcase_media_recorder_audio_api_${Date.now()}`;

    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div id="pwa-media-recorder-audio-api" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("mediaCapture.audioSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("mediaCapture.audioDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("mediaCapture.audioDesc2")}</p>
        <br />
        <p>{t("mediaCapture.audioCanDoIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("mediaCapture.audioCanDoItem1")}</li>
          <li>{t("mediaCapture.audioCanDoItem2")}</li>
          <li>{t("mediaCapture.audioCanDoItem3")}</li>
          <li>{t("mediaCapture.audioCanDoItem4")}</li>
          <li>{t("mediaCapture.audioCanDoItem5")}</li>
        </ul>
        <br />
        <p>{t("mediaCapture.audioMessagingExample")}</p>
        <br />
        <p>{t("mediaCapture.audioOtherExamples")}</p>
        <br />
        <p>{t("mediaCapture.audioPermissionNote")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <Info className="mt-1 shrink-0" />
            <p className="text-sm leading-relaxed">
              {t.rich("mediaCapture.audioWarningText", renderHtmlText)}
            </p>
          </div>
        </div>

        <p className="mt-2 font-bold">{t("mediaCapture.howToUseLabel")}</p>
        <p className="mt-2">{t("mediaCapture.audioHowToUseText")}</p>

        <div className="mt-4">
          <div className="flex flex-col md:flex-row mt-4 gap-4 items-start">
            <Button
              type="primary"
              onClick={record}
              disabled={!isAudioSupported}
            >
              {recording ? (
                <>
                  <MicOff className="w-5 h-5" />
                  {t("mediaCapture.audioRecordingButton")}
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  {t("mediaCapture.audioRecordButton")}
                </>
              )}
            </Button>

            <Button disabled={!audioURL} type="primary" onClick={download}>
              <Save className="w-5 h-5" />
              {t("mediaCapture.audioDownloadButton")}
            </Button>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {!isAudioSupported && (
          <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            {t("mediaCapture.audioUnsupportedMessage")}
          </p>
        )}

        <div className="mt-4">
          <div className="flex flex-col md:flex-row mt-4 gap-4 items-start">
            <div
              className="w-full max-w-sm rounded-2xl p-4 text-white"
              style={{
                background: "linear-gradient(135deg, #141414, #0d0d0d)",
                border: "1px solid rgba(220, 38, 38, 0.15)",
                boxShadow:
                  "0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(220, 38, 38, 0.05)",
              }}
            >
              {/* eslint-disable-next-line jsx-a11y/media-has-caption -- reproduz a
                  própria gravação de voz do usuário feita agora via MediaRecorder;
                  não há fonte de legenda possível (nenhum pipeline de
                  speech-to-text neste projeto) */}
              <audio
                ref={audioRef}
                src={audioURL}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
              />

              <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase mb-3">
                {t("mediaCapture.audioPlayerLabel")}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  disabled={!audioURL}
                  aria-label={
                    playing
                      ? t("mediaCapture.mediaPauseButtonLabel")
                      : t("mediaCapture.mediaPlayButtonLabel")
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={
                    audioURL
                      ? {
                          background:
                            "linear-gradient(135deg, #DC2626, #EA580C)",
                          boxShadow: "0 0 16px rgba(220, 38, 38, 0.45)",
                          cursor: "pointer",
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
          <li>{t.rich("mediaCapture.audioMethod1", renderHtmlText)}</li>
          <li>{t.rich("mediaCapture.audioMethod2", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
