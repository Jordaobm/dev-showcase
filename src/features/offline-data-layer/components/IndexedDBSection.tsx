"use client";

import { Button } from "@/features/shared/components/Button";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useIndexDB } from "../hooks/useIndexDB";
import { useNoteSync } from "../hooks/useNoteSync";
import { ModalNote } from "./ModalNote";
import { NotesTable } from "./NotesTable";

export const IndexedDBSection = () => {
  const t = useTranslations();
  const { save, data, del } = useIndexDB();
  const [openModal, setOpenModal] = useState(false);
  const { onCreateNote, onDeleteNote, syncUnsupported, showSyncing, isPending } =
    useNoteSync({ save, del });

  const handleCreateNote = async (text: string) => {
    await onCreateNote(text);
    setOpenModal(false);
  };

  return (
    <div id="pwa-indexdb" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("offlineDataLayer.idbSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("offlineDataLayer.idbDesc1", renderHtmlText)}</p>
        <br />
        <p>{t.rich("offlineDataLayer.idbDesc2", renderHtmlText)}</p>
        <br />
        <p>{t("offlineDataLayer.idbFlowIntro")}</p>
        <br />
        <p>{t("offlineDataLayer.idbHowItWorksIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("offlineDataLayer.idbHowItWorksItem1")}</li>
          <li>{t("offlineDataLayer.idbHowItWorksItem2")}</li>
          <li>{t.rich("offlineDataLayer.idbHowItWorksItem3", renderHtmlText)}</li>
          <li>{t("offlineDataLayer.idbHowItWorksItem4")}</li>
        </ul>
        <br />
        <p>{t("offlineDataLayer.idbUseCasesDesc")}</p>
        <br />
        <p>{t("offlineDataLayer.idbExampleNote")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <p className="font-bold">{t("offlineDataLayer.howToUseLabel")}</p>

        <p className="mt-2">{t("offlineDataLayer.idbHowToUseIntro")}</p>

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
          >
            <Plus className="w-5 h-5" />
            {t("offlineDataLayer.addButton")}
          </Button>

          {syncUnsupported && (
            <p className="mt-2 text-sm text-amber-700">
              {t("offlineDataLayer.backgroundSyncUnsupportedMessage")}
            </p>
          )}

          <NotesTable
            notes={data ?? []}
            showSyncing={showSyncing}
            onDeleteNote={onDeleteNote}
          />

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
          <li>{t.rich("offlineDataLayer.idbMethod1", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.idbMethod2", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.idbMethod3", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.idbMethod4", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.idbMethod5", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.idbMethod6", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
