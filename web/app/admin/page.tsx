'use client';

import { useState } from 'react';
import { ImportSummary } from '@/types';

export default function AdminPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const file = formData.get('file') as File;
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/import/corelogic', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="font-syne text-2xl text-[#f7f5ee] mb-2">Admin - Data Import</h1>
      <p className="text-[#8a9bc4] text-sm mb-8">Phase 2A - MongoDB Schema & Address Pipeline</p>
      
      {/* CoreLogic Import */}
      <div className="bg-[#0a1a4a] border border-[#1a2d6b] rounded-xl p-6 mb-6">
        <h2 className="font-syne text-lg text-[#f7f5ee] mb-4">CoreLogic (RPData) Import</h2>
        
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-[#f7f5ee] text-sm font-medium mb-2">
              Select RPData XLSX File
            </label>
            <input
              type="file"
              name="file"
              id="file"
              accept=".xlsx"
              disabled={uploading}
              className="block w-full text-[#f7f5ee] border border-[#1a2d6b] rounded-lg px-3 py-2 bg-[#000e35] focus:border-[#ff1200] focus:outline-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={uploading}
            className="bg-[#ff1200] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#cc0f00] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Processing...' : 'Import Data'}
          </button>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-red-400 mb-2">Import Error</h3>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-[#0a1a4a] border border-[#1a2d6b] rounded-xl p-6">
          <h3 className="font-syne text-lg text-[#f7f5ee] mb-4">Import Results</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{result.inserted}</div>
              <div className="text-[#8a9bc4] text-sm">Inserted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{result.updated}</div>
              <div className="text-[#8a9bc4] text-sm">Updated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{result.skipped}</div>
              <div className="text-[#8a9bc4] text-sm">Skipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{result.geocodingFailures}</div>
              <div className="text-[#8a9bc4] text-sm">Geocoding Failures</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#8a9bc4]">Total Processed:</span>
              <span className="text-[#f7f5ee] ml-2">{result.totalProcessed}</span>
            </div>
            <div>
              <span className="text-[#8a9bc4]">Import Batch:</span>
              <span className="text-[#f7f5ee] ml-2 font-mono text-xs">{result.importBatch}</span>
            </div>
          </div>

          {result.issues.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-[#f7f5ee] mb-3">Import Issues ({result.issues.length})</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {result.issues.map((issue, index) => (
                  <div key={index} className="bg-[#000e35] border border-[#1a2d6b] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#ff1200] text-xs font-medium">{issue.issueType}</span>
                      <span className="text-[#8a9bc4] text-xs">Row {issue.rowNumber}</span>
                    </div>
                    <div className="text-[#f7f5ee] text-sm mb-1">{issue.rawAddress}</div>
                    <div className="text-[#8a9bc4] text-xs">{issue.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}