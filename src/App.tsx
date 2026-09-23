import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SenderPanel } from './components/SenderPanel';
import { ReceiverPanel } from './components/ReceiverPanel';
import { UserAuthModal } from './components/UserAuthModal';
import { TransmissionsInbox } from './components/TransmissionsInbox';
import { EnlargedViewerModal } from './components/EnlargedViewerModal';
import { VectorizerConfig, TransmissionResult, PresetSample, User, SavedTransmission, RawPixelResult, TransmissionMode } from './types';
import { SAMPLE_PRESETS } from './lib/sampleImages';
import { vectorizeImageData } from './lib/vectorizer';
import { renderSvgToBitmapDataUrl, applyAiReconstructionPipeline } from './lib/reconstructor';
import { calculateImageQualityMetrics, calculateNetworkBenchmarks } from './lib/metrics';
import { extractTextFromImage } from './lib/ocr';

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [vectorPreviewSvg, setVectorPreviewSvg] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('tech-logo');
  const [geminiAvailable, setGeminiAvailable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TransmissionResult | null>(null);

  // User Auth & DB state
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [recipientId, setRecipientId] = useState<string>('user_b');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [transmissions, setTransmissions] = useState<SavedTransmission[]>([]);
  const [showInbox, setShowInbox] = useState<boolean>(true);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  // Enlarged Viewer Modal State
  const [viewerModalOpen, setViewerModalOpen] = useState<boolean>(false);
  const [activeModalTx, setActiveModalTx] = useState<SavedTransmission | null>(null);

  // Transmission Mode & Raw Pixel Comparison State
  const [transmissionMode, setTransmissionMode] = useState<TransmissionMode>('vector');
  const [rawPixelResult, setRawPixelResult] = useState<RawPixelResult | null>(null);

  const [config, setConfig] = useState<VectorizerConfig>({
    colorPrecision: 6,
    colormode: 'color',
    mode: 'spline',
    filterSpeckle: 4,
    pathPrecision: 3,
    hierarchical: 'stacked',
  });

  // Fetch users & health check on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.geminiAvailable) setGeminiAvailable(true);
      })
      .catch(() => {});

    // Fetch registered users
    fetch('/api/users')
      .then((res) => res.json())
      .then((userList: User[]) => {
        setUsers(userList);
        if (userList.length > 0) {
          setCurrentUser(userList[0]); // Default to User A (Alice)
          if (userList.length > 1) {
            setRecipientId(userList[1].id); // Default recipient to User B (Bob)
          }
        }
      })
      .catch((err) => console.error('Failed to fetch users:', err));

    // Auto-select default logo preset
    const defaultPreset = SAMPLE_PRESETS[0];
    if (defaultPreset) {
      handleSelectPreset(defaultPreset);
    }
  }, []);

  // Fetch transmissions whenever currentUser changes
  useEffect(() => {
    if (!currentUser) return;
    fetchTransmissions(currentUser.id);
  }, [currentUser]);

  const fetchTransmissions = (userId?: string) => {
    const url = userId ? `/api/transmissions?userId=${userId}` : '/api/transmissions';
    fetch(url)
      .then((res) => res.json())
      .then((txList: SavedTransmission[]) => {
        setTransmissions(txList);
      })
      .catch((err) => console.error('Failed to fetch transmissions:', err));
  };

  const handleSelectPreset = (preset: PresetSample) => {
    setSelectedPresetId(preset.id);
    setOriginalImage(preset.dataUrl);
    setVectorPreviewSvg(null);
    setConfig((prev) => ({
      ...prev,
      colorPrecision: preset.recommendedPrecision,
    }));
    setResult(null);
    setSelectedTxId(null);
    setSentSuccess(false);
  };

  const handleFileSelected = (file: File) => {
    setSelectedPresetId('');
    setVectorPreviewSvg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setOriginalImage(e.target.result as string);
        setResult(null);
        setSelectedTxId(null);
        setSentSuccess(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    // Adjust default recipient if recipient is same as new current user
    const other = users.find((u) => u.id !== user.id);
    if (other) {
      setRecipientId(other.id);
    }
  };

  const handleRegisterUser = async (name: string, email: string) => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const newUser: User = await res.json();
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      const other = users.find((u) => u.id !== newUser.id);
      if (other) setRecipientId(other.id);
    } catch (err) {
      console.error('Failed to register user:', err);
    }
  };

  const handleTransmit = async () => {
    if (!originalImage || !currentUser) return;

    setLoading(true);
    setSentSuccess(false);
    try {
      // 0. Start OCR in parallel with vectorization (non-blocking)
      const ocrPromise = extractTextFromImage(originalImage).catch(() => '');

      // 1. Vectorize raster image into SVG XML
      const { svgContent, stats, colorPalette } = await vectorizeImageData(originalImage, config);

      // Show Vector directly in Sender Panel as well!
      setVectorPreviewSvg(svgContent);

      // 2. Render SVG back to uncompressed raster bitmap
      const renderedSvgBase64 = await renderSvgToBitmapDataUrl(svgContent, 2);

      // 3. Apply AI Edge-Smoothing and Sharpening Pipeline
      const reconstructedImageBase64 = await applyAiReconstructionPipeline(renderedSvgBase64);

      // 4. Send to Express API for AI enhancement analysis
      let aiNotes = '';
      try {
        const response = await fetch('/api/ai-enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ svgContent, stats }),
        });
        const aiData = await response.json();
        if (aiData.notes) aiNotes = aiData.notes;
      } catch {
        aiNotes = 'Local bilateral edge sharpening and contour restoration active.';
      }

      // 5. Calculate PSNR, SSIM, MSE, VIF quality metrics
      const metrics = await calculateImageQualityMetrics(originalImage, reconstructedImageBase64);

      // 6. Calculate Network benchmarks across 2G, 3G, 4G, 5G
      const networkBenchmarks = calculateNetworkBenchmarks(
        stats.originalSizeBytes,
        stats.svgSizeBytes
      );

      // Wait for OCR result (ran in parallel with vectorization)
      const extractedText = await ocrPromise;
      console.log("Extracted text:", extractedText);

      const transmissionResult: TransmissionResult = {
        stats,
        transmittedVectorSvg: svgContent,
        reconstructedImageBase64,
        renderedSvgBase64,
        metrics,
        networkBenchmarks,
        colorPalette,
        extractedText: extractedText || undefined,
        aiNotes,
      };

      setResult(transmissionResult);

      // 7. Compute Raw Pixel result for comparison
      const rawPixelStartTime = performance.now();
      const rawPayloadSizeBytes = stats.rawPixelSizeBytes || new Blob([originalImage]).size;
      const rawPixelEndTime = performance.now();
      const rawPixelNetworkBenchmarks = calculateNetworkBenchmarks(
        rawPayloadSizeBytes,
        rawPayloadSizeBytes // For raw pixel, both raster and "transmitted" are the same full payload
      );

      setRawPixelResult({
        payloadSizeBytes: rawPayloadSizeBytes,
        processingTimeMs: Math.round(rawPixelEndTime - rawPixelStartTime),
        imageBase64: originalImage,
        networkBenchmarks: rawPixelNetworkBenchmarks,
      });

      // 8. Save transmission payload to Database for Recipient
      const recipientObj = users.find((u) => u.id === recipientId);
      const presetObj = SAMPLE_PRESETS.find((p) => p.id === selectedPresetId);
      const title = presetObj ? presetObj.name : 'Custom Image Transmission';

      const txPayload = {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        recipientId: recipientId,
        recipientName: recipientObj?.name || 'Recipient',
        recipientEmail: recipientObj?.email || '',
        title,
        originalImage,
        result: transmissionResult,
        config,
      };

      const dbRes = await fetch('/api/transmissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txPayload),
      });
      const savedEntry: SavedTransmission = await dbRes.json();

      setTransmissions((prev) => [savedEntry, ...prev]);
      setSentSuccess(true);
      setSelectedTxId(savedEntry.id);
    } catch (err) {
      console.error('Vector transmission processing failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTransmission = (tx: SavedTransmission) => {
    setSelectedTxId(tx.id);
    setOriginalImage(tx.originalImage);
    setVectorPreviewSvg(tx.result.transmittedVectorSvg);
    setResult(tx.result);
    setConfig(tx.config);
    setRawPixelResult(null); // Clear raw pixel data from previous comparison
  };

  const handleDeleteTransmission = async (id: string) => {
    try {
      await fetch(`/api/transmissions/${id}`, { method: 'DELETE' });
      setTransmissions((prev) => prev.filter((t) => t.id !== id));
      if (selectedTxId === id) setSelectedTxId(null);
    } catch (err) {
      console.error('Failed to delete transmission:', err);
    }
  };

  const receivedCount = currentUser
    ? transmissions.filter((t) => t.recipientId === currentUser.id).length
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Header
        onSelectPreset={handleSelectPreset}
        geminiAvailable={geminiAvailable}
        selectedPresetId={selectedPresetId}
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        receivedCount={receivedCount}
        showInbox={showInbox}
        onToggleInbox={() => setShowInbox(!showInbox)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Inbox DB Section */}
        {showInbox && currentUser && (
          <TransmissionsInbox
            transmissions={transmissions}
            currentUser={currentUser}
            onSelectTransmission={handleSelectTransmission}
            onDeleteTransmission={handleDeleteTransmission}
            onOpenViewer={(tx) => {
              handleSelectTransmission(tx);
              setActiveModalTx(tx);
              setViewerModalOpen(true);
            }}
            selectedTxId={selectedTxId}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SENDER PANEL - 5 cols on lg */}
          <div className="lg:col-span-5">
            <SenderPanel
              originalImage={originalImage}
              vectorPreviewSvg={vectorPreviewSvg}
              onFileSelected={handleFileSelected}
              config={config}
              onChangeConfig={setConfig}
              onTransmit={handleTransmit}
              loading={loading}
              onSelectPreset={handleSelectPreset}
              presets={SAMPLE_PRESETS}
              currentUser={currentUser}
              users={users}
              recipientId={recipientId}
              onSelectRecipient={setRecipientId}
              sentSuccess={sentSuccess}
              transmissionMode={transmissionMode}
              onChangeTransmissionMode={setTransmissionMode}
            />
          </div>

          {/* RECEIVER PANEL - 7 cols on lg */}
          <div className="lg:col-span-7">
            <ReceiverPanel
              result={result}
              originalImage={originalImage}
              loading={loading}
              rawPixelResult={rawPixelResult}
              onOpenEnlargedViewer={() => {
                setActiveModalTx(
                  transmissions.find((t) => t.id === selectedTxId) || null
                );
                setViewerModalOpen(true);
              }}
            />
          </div>
        </div>
      </main>

      <UserAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onRegisterUser={handleRegisterUser}
      />

      <EnlargedViewerModal
        isOpen={viewerModalOpen}
        onClose={() => setViewerModalOpen(false)}
        transmission={activeModalTx}
        currentResult={result}
        currentOriginalImage={originalImage}
      />

      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-4 text-center text-xs text-slate-400">
        <p>
          Vector-Based Bandwidth-Efficient Image Transmission & High-Fidelity AI Reconstruction Architecture
        </p>
      </footer>
    </div>
  );
}

