"use client";

import { Button } from "@/features/shared/components/Button";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { detectBrowserLocale, getCookieLocale } from "@/i18n/useLocale";
import { Info, Mic, MicOff, Trash, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export const SpeechRecognitionAPISection = () => {
  const t = useTranslations();
  const [isSupported, setIsSupported] = useState(true);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [micError, setMicError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const recognition = useRef<SpeechRecognition | null>(null);
  const finalResultsByIndex = useRef<Map<number, string>>(new Map());

  const activeLocale = getCookieLocale() ?? detectBrowserLocale();

  useEffect(() => {
    type SpeechRecognitionWindow = Window &
      typeof globalThis & {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
      };
    const win = window as SpeechRecognitionWindow;
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setIsSupported(false);
      return;
    }

    const instance: SpeechRecognition = new SpeechRecognitionCtor();
    instance.continuous = true;
    instance.lang = activeLocale;
    instance.interimResults = true;

    instance.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalResultsByIndex.current.set(i, transcript);
        } else {
          interim += transcript;
        }
      }

      const finalText = [...finalResultsByIndex.current.entries()]
        .sort(([a], [b]) => a - b)
        .map(([, text]) => text)
        .join(" ");

      if (finalText) setFinalTranscript(finalText + " ");
      setInterimTranscript(interim);
    };

    instance.onerror = () => {
      setMicError(true);
      setMicOn(false);
    };

    instance.onend = () => {
      setMicOn(false);
      setInterimTranscript("");
    };

    recognition.current = instance;
  }, [activeLocale]);

  useEffect(() => {
    if (window.speechSynthesis === undefined) {
      setTtsSupported(false);
      return;
    }

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length === 0) return;

      const localeLang = activeLocale.split("-")[0];
      const sorted = [...available].sort((a, b) => {
        const aMatch = a.lang.startsWith(localeLang) ? -1 : 1;
        const bMatch = b.lang.startsWith(localeLang) ? -1 : 1;
        return aMatch - bMatch;
      });

      setVoices(sorted);

      setSelectedVoiceURI((prev) => {
        if (prev) return prev;
        return (
          sorted.find((v) => v.lang === activeLocale)?.voiceURI ??
          sorted[0]?.voiceURI ??
          ""
        );
      });
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [activeLocale]);

  const toggleRecording = () => {
    if (!recognition.current) return;

    if (micOn) {
      recognition.current.stop();
    } else {
      setMicError(false);
      setFinalTranscript("");
      setInterimTranscript("");
      finalResultsByIndex.current.clear();
      recognition.current.start();
      setMicOn(true);
    }
  };

  const clearTranscript = () => {
    setFinalTranscript("");
    setInterimTranscript("");
  };

  const speak = () => {
    const text = (finalTranscript + interimTranscript).trim();
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.voiceURI === selectedVoiceURI);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? activeLocale;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const displayValue = finalTranscript + interimTranscript;

  return (
    <div id="pwa-speech-recognition-api" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("voiceInterface.sectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("voiceInterface.srDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("voiceInterface.srDesc2")}</p>
        <br />
        <p>{t("voiceInterface.srCanDoIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("voiceInterface.srCanDoItem1")}</li>
          <li>{t("voiceInterface.srCanDoItem2")}</li>
          <li>{t("voiceInterface.srCanDoItem3")}</li>
          <li>{t("voiceInterface.srCanDoItem4")}</li>
        </ul>
        <br />
        <p>{t.rich("voiceInterface.ttsDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("voiceInterface.ttsDesc2")}</p>
        <br />
        <p>{t("voiceInterface.ttsCanDoIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("voiceInterface.ttsCanDoItem1")}</li>
          <li>{t("voiceInterface.ttsCanDoItem2")}</li>
          <li>{t("voiceInterface.ttsCanDoItem3")}</li>
          <li>{t("voiceInterface.ttsCanDoItem4")}</li>
        </ul>
        <br />
        <p>{t("voiceInterface.combinedNote")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <Info className="mt-1 shrink-0" />
          <p className="text-sm leading-relaxed">
            {t.rich("voiceInterface.warningText", renderHtmlText)}
          </p>
        </div>

        <p className="mt-2 font-bold">{t("voiceInterface.howToUseLabel")}</p>
        <p className="mt-2">{t("voiceInterface.howToUseText")}</p>

        <div className="mt-4">
          <div className="flex flex-col md:flex-row mt-4 gap-4 items-start">
            <Button
              type="primary"
              onClick={toggleRecording}
              disabled={!isSupported}
            >
              {micOn ? (
                <>
                  <MicOff className="w-5 h-5" />
                  {t("voiceInterface.capturingButton")}
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  {t("voiceInterface.captureButton")}
                </>
              )}
            </Button>
          </div>

          {micError && (
            <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {t("voiceInterface.micErrorMessage")}
            </p>
          )}

          <div className="flex flex-col mt-4 gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {t("voiceInterface.transcriptionLabel")}
              </span>
              <button
                onClick={clearTranscript}
                disabled={!displayValue}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-600 font-medium cursor-pointer"
              >
                <Trash size={14} />
                {t("voiceInterface.clearButton")}
              </button>
            </div>

            <textarea
              readOnly
              aria-label={t("voiceInterface.transcriptionLabel")}
              className="w-full h-40 resize-none p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-[var(--premium-red)] transition-all duration-300 text-sm text-gray-700"
              value={displayValue}
              placeholder={t("voiceInterface.transcriptionPlaceholder")}
            />

            {micOn && (
              <p className="text-xs text-red-600 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {t("voiceInterface.recordingHint")}
              </p>
            )}

            <div className="flex items-center gap-3 mt-1">
              {voices.length > 0 && (
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  aria-label={t("voiceInterface.voiceSelectLabel")}
                  className="w-[50%] sm:flex-1   text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[var(--premium-red)] transition-colors cursor-pointer"
                >
                  {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={speak}
                disabled={!displayValue.trim() || !ttsSupported}
                className={`w-[50%] sm:w-[150px] flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap ${
                  speaking
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                <Volume2 size={14} />
                {speaking
                  ? t("voiceInterface.playingButton")
                  : t("voiceInterface.playButton")}
              </button>
            </div>

            {!ttsSupported && (
              <p className="text-sm text-amber-700">
                {t("voiceInterface.ttsUnsupportedMessage")}
              </p>
            )}
          </div>
        </div>
      </div>

      {!isSupported && (
        <p className="mt-3 text-sm text-amber-700">
          {t("voiceInterface.unsupportedMessage")}
        </p>
      )}

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("voiceInterface.methodsTitle")}
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>{t.rich("voiceInterface.method1", renderHtmlText)}</li>
          <li>{t.rich("voiceInterface.method2", renderHtmlText)}</li>
          <li>{t.rich("voiceInterface.method3", renderHtmlText)}</li>
          <li>{t.rich("voiceInterface.method4", renderHtmlText)}</li>
          <li>{t.rich("voiceInterface.method5", renderHtmlText)}</li>
          <li>{t.rich("voiceInterface.method6", renderHtmlText)}</li>
          <li>{t.rich("voiceInterface.method7", renderHtmlText)}</li>
          <li>{t.rich("voiceInterface.method8", renderHtmlText)}</li>
          <li>{t.rich("voiceInterface.method9", renderHtmlText)}</li>
          <li>{t.rich("voiceInterface.method10", renderHtmlText)}</li>
          <li>{t.rich("voiceInterface.method11", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
