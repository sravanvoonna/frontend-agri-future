import React from 'react';
import { Check, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import useSatelliteWorkflow, { STEPS } from '../../hooks/useSatelliteWorkflow';
import Step1FarmDetails from './Step1FarmDetails';
import Step2SelectLocation from './Step2SelectLocation';
import Step3DrawFarm from './Step3DrawFarm';
import Step4SatelliteAnalysis from './Step4SatelliteAnalysis';
import Step5FarmReport from './Step5FarmReport';

const GuidedLandVisualizer = ({
  satelliteState,
  satelliteDistrict,
  customCoords,
  setCustomCoords,
  getSatelliteCoords,
  satelliteLoading,
}) => {
  const initialCoords = customCoords || getSatelliteCoords(satelliteState, satelliteDistrict);
  
  const workflow = useSatelliteWorkflow(initialCoords.lat, initialCoords.lon);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Step Progress Tracker Bar */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto pb-1 scrollbar-none">
          {STEPS.map((step, idx) => {
            const isDone = workflow.currentStep > step.id;
            const isCurrent = workflow.currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                {/* Step Item */}
                <button
                  type="button"
                  onClick={() => workflow.setCurrentStep(step.id)}
                  disabled={workflow.isAnalyzing}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-2xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'bg-emerald-50 border border-emerald-200/80 shadow-sm'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Step Number Circle */}
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : isCurrent
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-4 ring-emerald-200 shadow-md'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : step.id}
                  </div>

                  {/* Step Text Info */}
                  <div className="text-left hidden md:block">
                    <p
                      className={`text-xs font-black leading-tight ${
                        isCurrent
                          ? 'text-emerald-950'
                          : isDone
                          ? 'text-gray-800'
                          : 'text-gray-400'
                      }`}
                    >
                      Step {step.id}: {step.title}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold">{step.subtitle}</p>
                  </div>
                </button>

                {/* Arrow Connector */}
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mx-1 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Render Active Step Workflow View */}
      {workflow.currentStep === 1 && (
        <Step1FarmDetails
          farmDetails={workflow.farmDetails}
          updateFarmDetails={workflow.updateFarmDetails}
          onContinue={workflow.nextStep}
        />
      )}

      {workflow.currentStep === 2 && (
        <Step2SelectLocation
          locationState={workflow.locationState}
          setLocationState={workflow.setLocationState}
          onSearch={workflow.handleLocationSearch}
          onContinue={workflow.nextStep}
          onBack={workflow.prevStep}
        />
      )}

      {workflow.currentStep === 3 && (
        <Step3DrawFarm
          locationState={workflow.locationState}
          drawPoints={workflow.drawPoints}
          setDrawPoints={workflow.setDrawPoints}
          addDrawPoint={workflow.addDrawPoint}
          updateDrawPoint={workflow.updateDrawPoint}
          clearPolygon={workflow.clearPolygon}
          handleUndo={workflow.handleUndo}
          handleRedo={workflow.handleRedo}
          canUndo={workflow.canUndo}
          canRedo={workflow.canRedo}
          autoClosePolygon={workflow.autoClosePolygon}
          isDrawing={workflow.isDrawing}
          setIsDrawing={workflow.setIsDrawing}
          activeLayer={workflow.activeLayer}
          setActiveLayer={workflow.setActiveLayer}
          onContinue={workflow.nextStep}
          onBack={workflow.prevStep}
        />
      )}

      {workflow.currentStep === 4 && (
        <Step4SatelliteAnalysis
          progress={workflow.analysisProgress}
          stepIndex={workflow.analysisStepIndex}
          farmDetails={workflow.farmDetails}
          areaStats={workflow.fieldAreaStats}
        />
      )}

      {workflow.currentStep === 5 && (
        <Step5FarmReport
          farmDetails={workflow.farmDetails}
          locationState={workflow.locationState}
          drawPoints={workflow.drawPoints}
          areaStats={workflow.fieldAreaStats}
          reportData={workflow.reportData}
          analysisError={workflow.analysisError}
          historicalScenes={workflow.historicalScenes}
          activeSceneIndex={workflow.activeSceneIndex}
          setActiveSceneIndex={workflow.setActiveSceneIndex}
          onResetWorkflow={() => workflow.setCurrentStep(1)}
        />
      )}
    </div>
  );
};

export default GuidedLandVisualizer;
