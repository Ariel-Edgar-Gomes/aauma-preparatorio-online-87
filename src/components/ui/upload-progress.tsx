import React from 'react';
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Upload, AlertCircle } from "lucide-react";

interface UploadProgressProps {
  isUploading: boolean;
  currentStep: string;
  progress: number;
  error?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  currentStep,
  progress,
  error
}) => {
  if (!isUploading && !error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {error ? (
            <>
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Erro no Upload</h3>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
            </>
          ) : (
            <>
              {progress === 100 ? (
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              ) : (
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
              )}
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {progress === 100 ? 'Concluído!' : 'Processando Inscrição'}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">{currentStep}</p>
              
              <Progress value={progress} className="w-full mb-4" />
              
              <p className="text-xs text-gray-500">{progress}% concluído</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};