import React from 'react';
import './App.css';
import { useStickerMaker } from './hooks/useStickerMaker';
import { STEPS, COUNTS } from './utils/constants';

// Components
import ApiKeyInput from './components/ApiKeyInput';
import StepNavigator from './components/StepNavigator';
import CharacterGenerator from './components/CharacterGenerator';
import TextDescriptionEditor from './components/TextDescriptionEditor';
import StickerGrid from './components/StickerGrid';
import DownloadSection from './components/DownloadSection';
import ErrorMessage from './components/ErrorMessage';
import ProgressBar from './components/ProgressBar';

function App() {
  const { state, actions } = useStickerMaker();

  const {
    apiKey, count, characterDescription, theme, uploadedCharacterImage,
    characterImage, characterConfirmed, generatingCharacter,
    textStyle, generatingTextStyle, textStyleConfirmed,
    descriptions, generatingDescriptions, excludedTexts, characterStance,
    gridImages, processedGridImages, cutImages, mainImage, tabImage,
    backgroundThreshold, processingBackground, previewBackgroundDark,
    currentStep, loading, progress, progressPercent, error
  } = state;

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">LINE 貼圖製作</h1>

        <StepNavigator currentStep={currentStep} />

        <ErrorMessage message={error} onClose={actions.clearError} />

        {/* Step 1: API Key */}
        <ApiKeyInput apiKey={apiKey} setApiKey={actions.setApiKey} />

        {/* Step 2: Count Selection */}
        <div className="step-section">
          <h2>步驟 2: 選擇創作張數</h2>
          <div className="form-group">
            <select
              value={count}
              onChange={(e) => actions.setCount(Number(e.target.value))}
              className="form-input"
            >
              {COUNTS.map(c => (
                <option key={c} value={c}>{c} 張</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3 & 4: Character */}
        <CharacterGenerator
          apiKey={apiKey}
          theme={theme}
          setTheme={actions.setTheme}
          characterDescription={characterDescription}
          setCharacterDescription={actions.setCharacterDescription}
          uploadedCharacterImage={uploadedCharacterImage}
          setUploadedCharacterImage={actions.setUploadedCharacterImage}
          characterImage={characterImage}
          setCharacterImage={actions.setCharacterImage}
          characterConfirmed={characterConfirmed}
          setCharacterConfirmed={actions.setCharacterConfirmed}
          generatingCharacter={generatingCharacter}
          setGeneratingCharacter={actions.setGeneratingCharacter}
          setProgress={actions.setProgress}
          onError={actions.handleError}
        />

        {/* Step 5 & 6: Text & Descriptions */}
        {characterConfirmed && (
          <TextDescriptionEditor
            apiKey={apiKey}
            theme={theme}
            count={count}
            characterDescription={characterDescription}
            textStyle={textStyle}
            setTextStyle={actions.setTextStyle}
            textStyleConfirmed={textStyleConfirmed}
            setTextStyleConfirmed={actions.setTextStyleConfirmed}
            generatingTextStyle={generatingTextStyle}
            setGeneratingTextStyle={actions.setGeneratingTextStyle}
            descriptions={descriptions}
            setDescriptions={actions.setDescriptions}
            generatingDescriptions={generatingDescriptions}
            setGeneratingDescriptions={actions.setGeneratingDescriptions}
            excludedTexts={excludedTexts}
            setExcludedTexts={actions.setExcludedTexts}
            characterStance={characterStance}
            setCharacterStance={actions.setCharacterStance}
            setProgress={actions.setProgress}
            onNext={actions.handleGenerateStickers}
            onError={actions.handleError}
          />
        )}

        {/* Progress Display */}
        {/* Progress Display */}
        {progress && (
          <div className="progress-container" style={{ margin: '20px 0' }}>
            <div className="progress-text" style={{ marginBottom: '8px', fontWeight: 'bold' }}>{progress}</div>
            <ProgressBar progress={progressPercent} total={100} />
          </div>
        )}

        {/* Step 7: Sticker Grid & Background Removal */}
        {processedGridImages.length > 0 && (
          <StickerGrid
            gridImages={gridImages}
            processedGridImages={processedGridImages}
            setProcessedGridImages={actions.setProcessedGridImages}
            backgroundThreshold={backgroundThreshold}
            setBackgroundThreshold={actions.setBackgroundThreshold}
            processingBackground={processingBackground}
            setProcessingBackground={actions.setProcessingBackground}
            previewBackgroundDark={previewBackgroundDark}
            setPreviewBackgroundDark={actions.setPreviewBackgroundDark}
            onNext={actions.handleSplitGrids}
          />
        )}

        {/* Step 8 & 9: Download */}
        {cutImages.length > 0 && (
          <DownloadSection
            cutImages={cutImages}
            mainImage={mainImage}
            tabImage={tabImage}
            descriptions={descriptions}
            theme={theme}
            onError={actions.handleError}
          />
        )}
      </div>
    </div>
  );
}

export default App;
