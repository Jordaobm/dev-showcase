"use client";

import { Button } from "@/features/shared/components/Button";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useOPFS } from "../hooks/useOPFS";
import { useNoteSync } from "../hooks/useNoteSync";
import { ModalNote } from "./ModalNote";
import { NotesTable } from "./NotesTable";

export const OPFSSection = () => {
  const t = useTranslations();
  const { save, data, del, initError } = useOPFS();
  const [openModal, setOpenModal] = useState(false);
  const { onCreateNote, onDeleteNote, syncUnsupported, showSyncing, isPending } =
    useNoteSync({ save, del });

  const handleCreateNote = async (text: string) => {
    await onCreateNote(text);
    setOpenModal(false);
  };

  return (
    <div id="pwa-opfs" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("offlineDataLayer.opfsSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("offlineDataLayer.opfsDesc1", renderHtmlText)}</p>
        <br />
        <p>{t.rich("offlineDataLayer.opfsDesc2", renderHtmlText)}</p>
        <br />
        <p>{t.rich("offlineDataLayer.opfsDesc3", renderHtmlText)}</p>
        <br />
        <p>{t("offlineDataLayer.opfsFlowIntro")}</p>
        <br />
        <p>{t("offlineDataLayer.opfsHowItWorksIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("offlineDataLayer.opfsHowItWorksItem1")}</li>
          <li>{t.rich("offlineDataLayer.opfsHowItWorksItem2", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.opfsHowItWorksItem3", renderHtmlText)}</li>
          <li>{t("offlineDataLayer.opfsHowItWorksItem4")}</li>
        </ul>
        <br />
        <p>{t("offlineDataLayer.opfsUseCasesDesc")}</p>
        <br />
        <p>{t("offlineDataLayer.opfsValueNote")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <p className="font-bold">{t("offlineDataLayer.howToUseLabel")}</p>

        <p className="mt-2">{t("offlineDataLayer.opfsHowToUseIntro")}</p>

        <ul className="space-y-1 list-disc list-inside">
          <li>{t.rich("offlineDataLayer.flowStep1", renderHtmlText)}</li>
          <li>
            {t.rich("offlineDataLayer.flowStep2Prefix", renderHtmlText)}{" "}
            <Link
              href="/showcase/pwa-core#pwa-status"
              className="underline text-blue-500"
            >
              {t("offlineDataLayer.flowStep2Link")}
            </Link>
          </li>
          <li>{t.rich("offlineDataLayer.flowStep3", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.flowStep4", renderHtmlText)}</li>
        </ul>

        <div className="mt-4">
          <Button
            type="primary"
            onClick={() => setOpenModal(true)}
            className="mt-4"
            disabled={initError}
          >
            <Plus className="w-5 h-5" />
            {t("offlineDataLayer.addButton")}
          </Button>

          {syncUnsupported && (
            <p className="mt-2 text-sm text-amber-700">
              {t("offlineDataLayer.backgroundSyncUnsupportedMessage")}
            </p>
          )}

          {initError && (
            <div className="mt-4 w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md p-8 text-center">
              <p className="text-red-700 font-semibold text-lg">
                {t("offlineDataLayer.opfsInitErrorMessage")}
              </p>
            </div>
          )}
          {!initError && (
            <NotesTable
              notes={data ?? []}
              showSyncing={showSyncing}
              onDeleteNote={onDeleteNote}
            />
          )}

          <ModalNote
            isLoading={isPending}
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            onSubmit={handleCreateNote}
          />
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("offlineDataLayer.methodsTitle")}
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>{t.rich("offlineDataLayer.opfsMethod1", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.opfsMethod2", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.opfsMethod3", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.opfsMethod4", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.opfsMethod5", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.opfsMethod6", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.opfsMethod7", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.opfsMethod8", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
