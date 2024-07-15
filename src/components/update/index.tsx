import type { ProgressInfo } from "electron-updater";
import { useCallback, useEffect, useState } from "react";
import Modal from "@/components/update/Modal";
import Progress from "@/components/update/Progress";
import { useToast } from "@/components/ui/use-toast";
import "./update.css";

const Update = () => {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo>();
  const [updateError, setUpdateError] = useState<ErrorType>();
  const [progressInfo, setProgressInfo] = useState<Partial<ProgressInfo>>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalBtn, setModalBtn] = useState<{
    cancelText?: string;
    okText?: string;
    onCancel?: () => void;
    onOk?: () => void;
  }>({
    onCancel: () => setModalOpen(false),
    onOk: () => window.ipcRenderer.invoke("start-download"),
  });

  const checkUpdate = async () => {
    setChecking(true);
    /**
     * @type {import('electron-updater').UpdateCheckResult | null | { message: string, error: Error }}
     */
    const result = await window.ipcRenderer.invoke("check-update");
    console.log(result);
    setProgressInfo({ percent: 0 });
    setChecking(false);
    setModalOpen(true);
    if (result?.error) {
      setUpdateAvailable(false);
      setUpdateError(result?.error);
    }
  };

  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
      setVersionInfo(arg1);
      setUpdateError(undefined);
      console.log(arg1);
      // Can be update
      if (arg1.update) {
        setModalBtn((state) => ({
          ...state,
          cancelText: "Cancel",
          okText: "Update",
          onOk: () => window.ipcRenderer.invoke("start-download"),
        }));
        setUpdateAvailable(true);
      } else {
        setUpdateAvailable(false);
      }
    },
    []
  );

  const onUpdateError = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
      setUpdateAvailable(false);
      setUpdateError(arg1);
    },
    []
  );

  const onDownloadProgress = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
      setProgressInfo(arg1);
    },
    []
  );

  const onUpdateDownloaded = useCallback(
    (_event: Electron.IpcRendererEvent, ...args: any[]) => {
      setProgressInfo({ percent: 100 });
      setModalBtn((state) => ({
        ...state,
        cancelText: "Later",
        okText: "Install now",
        onOk: () => window.ipcRenderer.invoke("quit-and-install"),
      }));
    },
    []
  );

  const onAutoUpdate = (
    _event: Electron.IpcRendererEvent,
    arg1: VersionInfo
  ) => {
    if (arg1.update) {
      toast({
        title: "有新版本啦！请点击检查更新进行下载吧！",
      });
    } else {
      toast({
        variant: "destructive",
        title: "暂无版本更新",
      });
    }
  };

  useEffect(() => {
    // Get version information and whether to update
    window.ipcRenderer.on("auto-update", onAutoUpdate);
    window.ipcRenderer.on("update-can-available", onUpdateCanAvailable);
    window.ipcRenderer.on("update-error", onUpdateError);
    window.ipcRenderer.on("download-progress", onDownloadProgress);
    window.ipcRenderer.on("update-downloaded", onUpdateDownloaded);

    return () => {
      window.ipcRenderer.off("auto-update", onAutoUpdate);
      window.ipcRenderer.off("update-can-available", onUpdateCanAvailable);
      window.ipcRenderer.off("update-error", onUpdateError);
      window.ipcRenderer.off("download-progress", onDownloadProgress);
      window.ipcRenderer.off("update-downloaded", onUpdateDownloaded);
    };
  }, []);

  return (
    <>
      <Modal
        open={modalOpen}
        cancelText={modalBtn?.cancelText}
        okText={modalBtn?.okText}
        onCancel={modalBtn?.onCancel}
        onOk={modalBtn?.onOk}
        footer={updateAvailable ? /* hide footer */ null : undefined}
      >
        <div className="modal-slot">
          {updateError ? (
            <div className="py-2 px-8">
              <p className="font-bold">下载最新版本时出错/暂无新版本：</p>
              <p className="mt-4 mb-4">{updateError.message}</p>
            </div>
          ) : updateAvailable ? (
            <div>
              <div>最新版本为: v{versionInfo?.newVersion}</div>
              <div className="new-version__target">
                v{versionInfo?.version} -&gt; v{versionInfo?.newVersion}
              </div>
              <div className="update__progress">
                <div className="progress__title">更新进度:</div>
                <div className="progress__bar">
                  <Progress percent={progressInfo?.percent}></Progress>
                </div>
              </div>
            </div>
          ) : (
            <div className="can-not-available">
              {JSON.stringify(versionInfo ?? {}, null, 2)}
            </div>
          )}
        </div>
      </Modal>
      <button
        disabled={checking}
        onClick={checkUpdate}
        className="text-gray-900 fixed z-100 bottom-6 right-32 text-sm font-bold hover:border-b-gray-900 hover:border-b-2"
        style={{ marginBottom: "2px" }}
      >
        {checking ? "更新中..." : "检查更新"}
      </button>
    </>
  );
};

export default Update;
