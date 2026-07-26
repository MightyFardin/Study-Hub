import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { Download, AlertCircle } from 'lucide-react';
import packageJson from '../../package.json';

export default function AppUpdater() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const currentVersion = packageJson.version; 
  const REPO_OWNER = 'MightyFardin';
  const REPO_NAME = 'Study-Hub';

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`);
      const data = await response.json();
      
      if (data && data.tag_name) {
        const latestVersion = data.tag_name.replace('v', '');
        
        if (latestVersion !== currentVersion && isNewerVersion(currentVersion, latestVersion)) {
           const apkAsset = data.assets.find(a => a.name.endsWith('.apk'));
           if (apkAsset) {
             setUpdateInfo({
               version: latestVersion,
               downloadUrl: apkAsset.browser_download_url,
               notes: data.body
             });
           }
        }
      }
    } catch (err) {
      console.error("Failed to check for updates", err);
    }
  };

  const isNewerVersion = (current, latest) => {
     const curr = current.split('.').map(Number);
     const lat = latest.split('.').map(Number);
     for(let i=0; i<3; i++) {
        if((lat[i] || 0) > (curr[i] || 0)) return true;
        if((lat[i] || 0) < (curr[i] || 0)) return false;
     }
     return false;
  };

  const downloadAndInstall = async () => {
    if (!updateInfo) return;
    setDownloading(true);
    setError(null);
    setProgress(0);

    let progressListener;
    try {
      progressListener = await Filesystem.addListener('progress', (status) => {
         if (status && status.bytes && status.contentLength) {
             setProgress(Math.round((status.bytes / status.contentLength) * 100));
         }
      });

      const fileName = `StudyHub-Update-v${updateInfo.version}.apk`;
      
      const downloadResult = await Filesystem.downloadFile({
        url: updateInfo.downloadUrl,
        path: fileName,
        directory: Directory.Cache,
        progress: true
      });

      await FileOpener.openFile({
        path: downloadResult.path,
        mimeType: 'application/vnd.android.package-archive'
      });
      
      setUpdateInfo(null);
    } catch (err) {
      console.error('Update failed', err);
      setError('Failed to download or install the update. Please check permissions.');
    } finally {
      if (progressListener) progressListener.remove();
      setDownloading(false);
    }
  };

  if (!updateInfo) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#151515] w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 flex flex-col items-center text-center relative overflow-hidden">
        
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-inner shadow-indigo-500/20">
          <Download size={36} className={downloading ? "animate-bounce" : ""} />
        </div>
        
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Update Available!</h2>
        <p className="text-sm text-slate-500 font-medium mb-8 px-4">
          A new version <span className="font-bold text-indigo-500">v{updateInfo.version}</span> is ready to download and install.
        </p>

        {error && (
           <div className="mb-6 w-full text-xs font-bold text-red-500 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50">
             <AlertCircle size={16} /> {error}
           </div>
        )}

        <div className="w-full space-y-4">
          {downloading ? (
            <div className="w-full space-y-3">
               <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                 <div className="bg-indigo-500 h-full rounded-full transition-all duration-300 relative overflow-hidden" style={{ width: `${progress}%` }}>
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_1s_infinite]"></div>
                 </div>
               </div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Downloading... {progress}%</p>
            </div>
          ) : (
            <>
              <button 
                onClick={downloadAndInstall}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Download size={20} /> Update Now
              </button>
              <button 
                onClick={() => setUpdateInfo(null)}
                className="w-full py-3 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
              >
                Later
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
