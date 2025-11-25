import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Package, BarChart3, Activity } from 'lucide-react';
import { productAnalysisService, AnalysisResult, AnalysisStats } from '../../services/productAnalysisService';

interface OzonProductAnalysisProps {
  onBack?: () => void;
}

const OzonProductAnalysis: React.FC<OzonProductAnalysisProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [analysisStats, setAnalysisStats] = useState<AnalysisStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadCategories = async () => {
    try {
      const result = await productAnalysisService.getCategories();
      setCategories(result || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load categories');
      setCategories([]);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await productAnalysisService.getAnalysisStats();
      setAnalysisStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Failed to load statistics');
    }
  };

  const loadResults = async () => {
    try {
      const results = await productAnalysisService.getAnalysisResults();
      setAnalysisResults(results || []);
    } catch (error) {
      console.error('Failed to load results:', error);
      setError('Failed to load analysis results');
      setAnalysisResults([]);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError('');

    try {
      await Promise.all([
        loadCategories(),
        loadStats(),
        loadResults()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAnalyzeCategory = async () => {
    if (!selectedCategory) return;

    setIsAnalyzing(true);
    setError('');

    try {
      await productAnalysisService.analyzeCategory(selectedCategory);
      await loadResults();
      await loadStats();
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: 'var(--spacing-3)'
      }}>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-3)' }}>
      <div style={{ marginBottom: 'var(--spacing-3)' }}>
        <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase" style={{ color: 'var(--accent)' }}>
          CATEGORIES
        </h2>
      </div>

      {analysisStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-2)',
          marginBottom: 'var(--spacing-3)'
        }}>
          <div style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
              <Package size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Total Groups</span>
            </div>
            <p className="text-kpi-value-mobile md:text-kpi-value-desktop" style={{ color: 'var(--text-primary)' }}>
              {analysisStats.totalGroups}
            </p>
          </div>

          <div style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
              <BarChart3 size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Total Products</span>
            </div>
            <p className="text-kpi-value-mobile md:text-kpi-value-desktop" style={{ color: 'var(--text-primary)' }}>
              {analysisStats.totalProducts}
            </p>
          </div>

          <div style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
              <Activity size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Categories</span>
            </div>
            <p className="text-kpi-value-mobile md:text-kpi-value-desktop" style={{ color: 'var(--text-primary)' }}>
              {analysisStats.categoriesAnalyzed}
            </p>
          </div>
        </div>
      )}

      <div style={{
        padding: 'var(--spacing-2)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--divider-standard)',
        marginBottom: 'var(--spacing-3)'
      }}>
        <h3 className="text-subsection uppercase" style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-2)' }}>
          Analyze Category
        </h3>

        <div style={{ display: 'flex', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={isAnalyzing}
            style={{
              flex: 1,
              padding: 'var(--spacing-1)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--divider-standard)',
              color: 'var(--text-primary)',
            }}
            className="text-body"
          >
            <option value="">Select a category...</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            onClick={handleAnalyzeCategory}
            disabled={!selectedCategory || isAnalyzing}
            style={{
              padding: 'var(--spacing-1) var(--spacing-2)',
              backgroundColor: selectedCategory && !isAnalyzing ? 'var(--accent)' : 'var(--bg-secondary)',
              border: '1px solid var(--divider-standard)',
              color: selectedCategory && !isAnalyzing ? 'var(--text-primary)' : 'var(--text-disabled)',
              cursor: selectedCategory && !isAnalyzing ? 'pointer' : 'not-allowed',
            }}
            className="text-body"
          >
            {isAnalyzing ? 'ANALYZING...' : 'ANALYZE'}
          </button>
        </div>

        {error && (
          <p className="text-body" style={{ color: '#D32F2F', marginTop: 'var(--spacing-1)' }}>
            {error}
          </p>
        )}
      </div>

      {analysisResults.length > 0 && (
        <div>
          <h3 className="text-subsection uppercase" style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-2)' }}>
            Analysis Results
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {analysisResults.map((result) => (
              <div
                key={result.id}
                style={{
                  padding: 'var(--spacing-2)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--divider-standard)'
                }}
              >
                <div style={{ marginBottom: 'var(--spacing-1)' }}>
                  <h4 className="text-menu-l2 uppercase" style={{ color: 'var(--accent)' }}>
                    {result.groupName}
                  </h4>
                  <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                    {result.groupDescription}
                  </p>
                </div>

                <div style={{ marginBottom: 'var(--spacing-1)' }}>
                  <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-0-5)' }}>
                    Products ({result.productNames.length})
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-0-5)' }}>
                    {result.productNames.map((name, index) => (
                      <span
                        key={index}
                        className="text-micro"
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--divider-standard)'
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                {result.priceAnalysis && (
                  <div style={{ marginTop: 'var(--spacing-1)' }}>
                    <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-0-5)' }}>
                      Price Analysis
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--spacing-1)' }}>
                      <div>
                        <p className="text-micro" style={{ color: 'var(--text-tertiary)' }}>Min Price</p>
                        <p className="text-body" style={{ color: 'var(--text-primary)' }}>
                          ₽{result.priceAnalysis.minPrice?.toFixed(0) || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-micro" style={{ color: 'var(--text-tertiary)' }}>Max Price</p>
                        <p className="text-body" style={{ color: 'var(--text-primary)' }}>
                          ₽{result.priceAnalysis.maxPrice?.toFixed(0) || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-micro" style={{ color: 'var(--text-tertiary)' }}>Avg Price</p>
                        <p className="text-body" style={{ color: 'var(--text-primary)' }}>
                          ₽{result.priceAnalysis.avgPrice?.toFixed(0) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OzonProductAnalysis;
