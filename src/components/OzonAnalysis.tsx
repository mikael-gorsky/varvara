import { parseCSVFile, parseExcelFile, ParsedData, ProductRow } from '../utils/csvParser';

interface OzonAnalysisProps {
  onBack: () => void;
}

const OzonAnalysis: React.FC<OzonAnalysisProps> = ({ onBack }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setIsLoading(true);

    try {
      let data: ParsedData;
      
      if (selectedFile.name.endsWith('.csv')) {
        data = await parseCSVFile(selectedFile);
      } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        data = await parseExcelFile(selectedFile);
      } else {
        throw new Error('Unsupported file format. Please use .csv, .xlsx, or .xls files.');
      }

      setParsedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: parsedData.data }),
      });

      if (!response.ok) {
        throw new Error('Failed to import data');
      }

      alert('Data imported successfully!');
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">OZON Data Analysis</h1>
                  <p className="text-blue-200">Import and analyze OZON marketplace reports</p>
                  <p className="text-blue-300 text-sm">Supports OZON Excel/CSV exports</p>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          {!parsedData && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8 border border-white/20">
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-white/30 hover:border-white/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drop your file here or click to browse
                </h3>
                <p className="text-white/60 mb-6">
                  Supports .xlsx, .xls, and .csv files
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Choose File
                </label>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center mt-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <span className="ml-3 text-white">Processing file...</span>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <span className="text-red-200">{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data Preview */}
          {parsedData && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Data Preview</h2>
                  <p className="text-white/60">
                    Found {parsedData.data.length} rows with {parsedData.headers.length} columns
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setFile(null);
                      setParsedData(null);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={isLoading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Import to Database
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Headers */}
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">Columns Detected:</h3>
                <div className="flex flex-wrap gap-2">
                  {parsedData.headers.map((header, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/30 text-blue-200 rounded-full text-sm"
                    >
                      {header}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      {parsedData.headers.map((header, index) => (
                        <th key={index} className="text-left py-3 px-4 text-white font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.data.slice(0, 10).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-white/10 hover:bg-white/5">
                        {parsedData.headers.map((header, colIndex) => (
                          <td key={colIndex} className="py-3 px-4 text-white/80">
                            {String(row[header] || '').substring(0, 50)}
                            {String(row[header] || '').length > 50 && '...'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.data.length > 10 && (
                  <div className="text-center py-4 text-white/60">
                    ... and {parsedData.data.length - 10} more rows
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OzonAnalysis;