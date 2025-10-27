import { useState, useEffect } from "react";
import { mockMails } from "../data/mockMails.js";
import io from "socket.io-client";
import { API_BASE_URL } from "constants/api.js";

// Custom hook để load dữ liệu mail từ API server
export const useMailData = () => {
  const [mails, setMails] = useState([]); // Bắt đầu với array rỗng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedFromFiles, setLoadedFromFiles] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [socket, setSocket] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 [useMailData] Loading mail data from ${API_BASE_URL}...`);

      // Load dữ liệu từ API server
      const response = await fetch(`${API_BASE_URL}/api/mails`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const loadedMails = await response.json();

      if (loadedMails && loadedMails.length > 0) {
        setMails(loadedMails);
        setLoadedFromFiles(true);
        console.log(
          `✅ [useMailData] Successfully loaded ${loadedMails.length} mails from C:\\classifyMail\\`
        );
      } else {
        // Fallback nếu không có file nào
        console.log("⚠️ [useMailData] No files found, using fallback data");
        setMails(mockMails);
        setLoadedFromFiles(false);
      }
    } catch (err) {
      console.error(
        "❌ [useMailData] Error loading mail data from server, using fallback:",
        err
      );
      setError(err.message);
      setMails(mockMails);
      setLoadedFromFiles(false);
    } finally {
      setLoading(false);
      console.log(`✅ [useMailData] loadData() completed`);
    }
  };

  useEffect(() => {
    loadData();

    // Setup WebSocket connection for real-time updates
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    // Listen for mail stats updates
    newSocket.on("mailStatsUpdate", (stats) => {
      console.log("📡 Received mail stats update:", stats);
      loadData();
    });

    // Listen for new mails detected
    newSocket.on("newMailsDetected", (data) => {
      console.log("🆕 New mails detected:", data);
      loadData();
    });

    // Listen for mail moved events
    newSocket.on("mailMoved", (data) => {
      console.log("📧 Mail moved:", data);
      loadData();
    });

    // Listen for mailsUpdated events (when files added/changed manually)
    newSocket.on("mailsUpdated", (data) => {
      console.log("📡 [useMailData] Mails updated event received:", data);
      console.log("🔄 [useMailData] Triggering loadData() to fetch latest mails...");
      loadData();
    });

    // Listen for mailAssigned events (when auto-assignment happens)
    newSocket.on("mailAssigned", (data) => {
      console.log("👤 [useMailData] Mail assigned event received:", data);
      console.log("🔄 [useMailData] Triggering loadData() to fetch latest mails...");
      loadData();
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [reloadTrigger]);

  // Listen for reload events (only manual reload)
  useEffect(() => {
    const handleReload = (event) => {
      // Only reload if it's a manual reload
      if (event.detail && event.detail.manual) {
        console.log("🔄 Received manual reload signal - refreshing mail data");
        setReloadTrigger((prev) => prev + 1);
      } else {
        console.log("🔄 Ignoring automatic reload signal");
      }
    };

    window.addEventListener("mailDataReload", handleReload);

    return () => {
      window.removeEventListener("mailDataReload", handleReload);
    };
  }, []);

  return {
    mails,
    loading,
    error,
    loadedFromFiles,
    totalFiles: mails.length,
  };
};

// Hook để load một file mail cụ thể
export const useMailFile = (filePath) => {
  const [mailData, setMailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filePath) return;

    const loadFile = async () => {
      setLoading(true);
      setError(null);

      try {
        const module = await import(filePath);
        setMailData(module.default);
        console.log("✅ Loaded mail file:", filePath);
      } catch (err) {
        console.error("❌ Error loading mail file:", filePath, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [filePath]);

  return { mailData, loading, error };
};
