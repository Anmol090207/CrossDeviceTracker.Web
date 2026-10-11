import { useCallback, useState } from "react";
import ActivityList, { ActivityHeader } from "../components/ActivityList";
import DevicePanel from "../components/DevicePanel";
import { ErrorBanner, SampleNotice, StatSkeleton } from "../components/Feedback";
import LinkDeviceModal from "../components/LinkDeviceModal";
import { usePageTitle } from "../hooks/usePageTitle";
import { useTracker } from "../hooks/useTracker";

export default function Devices() {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const { data, status, error, reload, isSample } = useTracker("recent");
  usePageTitle("Devices");

  return (
    <section className="page devices-page">
      {isSample && <SampleNotice />}
      {error && <ErrorBanner message={error.message} onRetry={reload} />}
      {status === "loading" && !data ? (
        <StatSkeleton />
      ) : (
        <div className="devices-layout">
          <DevicePanel devices={data?.devices ?? []} onAdd={() => setModalOpen(true)} />
          <section className="panel timeline-panel">
            <ActivityHeader />
            <ActivityList items={data?.activity ?? []} />
            {data?.integration && <p className="integration-note">{data.integration}</p>}
          </section>
        </div>
      )}
      <LinkDeviceModal open={modalOpen} onClose={closeModal} />
    </section>
  );
}
