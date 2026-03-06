'use client';

import { useState } from 'react';
import { ImportSummary } from '@/types';

type ImportMethod = 'file' | 'url';

export default function AdminPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<ImportMethod>('url');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadingBlob, setUploadingBlob] = useState(false);

  // Handle file upload to blob storage
  const handleBlobUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const file = formData.get('file') as File;
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploadingBlob(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/upload/blob', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFileUrl(data.fileUrl);
        setImportMethod('url');
        setError(null);
      } else {
        setError(data.error || 'File upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setUploadingBlob(false);
    }
  };

  // Handle URL-based import
  const handleUrlImport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!fileUrl.trim()) {
      setError('Please provide a file URL');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/import/corelogic-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl: fileUrl.trim() }),
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

  // Legacy direct file upload (for small files only)
  const handleDirectFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
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
        
        {/* Import Method Tabs */}
        <div className="flex space-x-1 mb-6 bg-[#000e35] p-1 rounded-lg">
          <button
            onClick={() => setImportMethod('url')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              importMethod === 'url' 
                ? 'bg-[#ff1200] text-white' 
                : 'text-[#8a9bc4] hover:text-[#f7f5ee]'
            }`}
          >
            URL Import (Large Files)
          </button>
          <button
            onClick={() => setImportMethod('file')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              importMethod === 'file' 
                ? 'bg-[#ff1200] text-white' 
                : 'text-[#8a9bc4] hover:text-[#f7f5ee]'
            }`}
          >
            Direct Upload (Small Files)
          </button>
        </div>

        {/* URL Import Method */}
        {importMethod === 'url' && (
          <div className="space-y-6">
            {/* Step 1: Upload to Blob Storage */}
            <div className="border border-[#1a2d6b] rounded-lg p-4">
              <h3 className="font-medium text-[#f7f5ee] mb-3">Step 1: Upload File to Temporary Storage</h3>
              <form onSubmit={handleBlobUpload} className="space-y-4">
                <div>
                  <label htmlFor="blob-file" className="block text-[#f7f5ee] text-sm font-medium mb-2">
                    Select RPData XLSX File (up to 4MB)
                  </label>
                  <input
                    type="file"
                    name="file"
                    id="blob-file"
                    accept=".xlsx"
                    disabled={uploadingBlob || uploading}
                    className="block w-full text-[#f7f5ee] border border-[#1a2d6b] rounded-lg px-3 py-2 bg-[#000e35] focus:border-[#ff1200] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploadingBlob || uploading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingBlob ? 'Uploading...' : 'Upload to Storage'}
                </button>
              </form>
            </div>

            {/* Step 2: Import from URL */}
            <div className="border border-[#1a2d6b] rounded-lg p-4">
              <h3 className="font-medium text-[#f7f5ee] mb-3">Step 2: Import from URL</h3>
              <form onSubmit={handleUrlImport} className="space-y-4">
                <div>
                  <label htmlFor="file-url" className="block text-[#f7f5ee] text-sm font-medium mb-2">
                    File URL (from Step 1 or external URL)
                  </label>
                  <input
                    type="url"
                    id="file-url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    disabled={uploading}
                    placeholder="https://blob.vercel-storage.com/..."
                    className="block w-full text-[#f7f5ee] border border-[#1a2d6b] rounded-lg px-3 py-2 bg-[#000e35] focus:border-[#ff1200] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading || !fileUrl.trim()}
                  className="bg-[#ff1200] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#cc0f00] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Processing...' : 'Import Data'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Direct File Upload Method */}
        {importMethod === 'file' && (
          <div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <p className="text-yellow-300 text-sm">
                ⚠️ Direct upload limited to ~4MB due to Vercel constraints. For large files, use URL Import method.
              </p>
            </div>
            
            <form onSubmit={handleDirectFileUpload} className="space-y-4">
              <div>
                <label htmlFor="direct-file" className="block text-[#f7f5ee] text-sm font-medium mb-2">
                  Select RPData XLSX File (Small Files Only)
                </label>
                <input
                  type="file"
                  name="file"
                  id="direct-file"
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
        )}
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