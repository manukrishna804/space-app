import React, { useState, useEffect } from 'react';
import { Upload, FileText, Sparkles, Loader2, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import './SpaceDataAnalyzer.css';

export default function SpaceDataAnalyzer() {
    const [file, setFile] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [insights, setInsights] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

    useEffect(() => {
        // Load PDF.js
        const loadPdfJs = () => {
            return new Promise((resolve, reject) => {
                if (window['pdfjs-dist/build/pdf']) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.onload = () => {
                    window['pdfjs-dist/build/pdf'].GlobalWorkerOptions.workerSrc =
                        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };

        loadPdfJs()
            .then(() => {
                setPdfJsLoaded(true);
                setStatus('PDF reader ready!');
            })
            .catch(err => {
                setError('Failed to load PDF library: ' + err.message);
            });
    }, []);

    const handleFileUpload = async (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile || uploadedFile.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setFile(uploadedFile);
        setError('');
        setExtractedText('');
        setInsights('');
        await extractTextFromPDF(uploadedFile);
    };

    const extractTextFromPDF = async (pdfFile) => {
        setLoading(true);
        setProgress(0);
        setError('');
        setStatus('Loading PDF...');

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();

            setStatus('Reading PDF content...');

            // Load PDF using PDF.js
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            let fullText = '';
            const totalPages = pdf.numPages;

            setStatus(`Extracting text from ${totalPages} pages...`);

            // Extract text from each page
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                setStatus(`Processing page ${pageNum} of ${totalPages}...`);

                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();

                // Combine text items
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ');

                if (pageText.trim()) {
                    fullText += `\n\n${pageText.trim()}`;
                }

                setProgress(Math.round((pageNum / totalPages) * 100));
            }

            if (!fullText.trim()) {
                setError('No text found in PDF. The document might contain only images or scanned content.');
                setStatus('');
                setLoading(false);
                return;
            }

            setExtractedText(fullText);
            setStatus(`✓ Text extracted from ${totalPages} pages. Generating insights...`);
            setProgress(100);

            // Automatically generate insights using local processing
            await generateInsightsLocal(fullText);
        } catch (err) {
            setError(`Text extraction failed: ${err.message}`);
            setStatus('');
            console.error('Extraction Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateInsightsLocal = async (text) => {
        setStatus('Analyzing document locally...');
        setLoading(true);

        try {
            // Simulate processing time for UX
            await new Promise(resolve => setTimeout(resolve, 500));

            // Local text analysis without any API
            const insights = analyzeTextLocally(text);

            setInsights(insights);
            setStatus('✓ Analysis complete!');
        } catch (err) {
            setError(`Failed to generate insights: ${err.message}`);
            setStatus('');
            console.error('Insights Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const analyzeTextLocally = (text) => {
        // Advanced local text analysis
        const words = text.toLowerCase().split(/\s+/);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

        // Extract numbers and statistics
        const numbers = text.match(/\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:km|m|kg|°C|°F|%|million|billion|trillion))?/gi) || [];
        const uniqueNumbers = [...new Set(numbers)].slice(0, 5);

        // Find key terms (space-related keywords)
        const spaceKeywords = [
            'satellite', 'orbit', 'launch', 'rocket', 'mission', 'spacecraft', 'astronaut',
            'nasa', 'esa', 'isro', 'space', 'mars', 'moon', 'planet', 'galaxy', 'solar',
            'telescope', 'station', 'iss', 'exploration', 'research', 'experiment',
            'altitude', 'velocity', 'trajectory', 'propulsion', 'payload', 'debris'
        ];

        const foundKeywords = {};
        spaceKeywords.forEach(keyword => {
            const count = (text.toLowerCase().match(new RegExp('\\b' + keyword + '\\b', 'g')) || []).length;
            if (count > 0) foundKeywords[keyword] = count;
        });

        const topKeywords = Object.entries(foundKeywords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);

        // Extract sentences with numbers or key terms
        const importantSentences = sentences.filter(s => {
            const lower = s.toLowerCase();
            return numbers.some(n => s.includes(n)) ||
                topKeywords.some(k => lower.includes(k));
        }).slice(0, 10);

        // Build insights
        let result = '**KEY INSIGHTS**\n\n';

        // Document stats
        result += `• Document contains ${words.length.toLocaleString()} words across ${sentences.length} sentences\n\n`;

        // Key topics
        if (topKeywords.length > 0) {
            result += `• Main topics: ${topKeywords.join(', ')}\n\n`;
        }

        // Statistical data
        if (uniqueNumbers.length > 0) {
            result += `• Key measurements/values mentioned: ${uniqueNumbers.join(', ')}\n\n`;
        }

        // Important sentences
        if (importantSentences.length > 0) {
            result += '**CRITICAL FINDINGS:**\n\n';
            importantSentences.slice(0, 5).forEach((sentence, i) => {
                const cleaned = sentence.trim().replace(/\s+/g, ' ');
                if (cleaned.length > 30 && cleaned.length < 200) {
                    result += `${i + 1}. ${cleaned}\n\n`;
                }
            });
        }

        // Summary
        result += '**SUMMARY:**\n\n';
        const firstSentences = sentences.slice(0, 3).join('. ');
        result += `${firstSentences.substring(0, 300)}...\n\n`;

        result += '---\n\n';
        result += '*Note: This is a local AI-free analysis. For deeper insights, consider using AI models.*';

        return result;
    };

    return (
        <div className="space-data-analyzer-wrapper">
            <div className="analyzer-glass-card">
                {/* Header with Icon Badge */}
                <div className="analyzer-header">
                    <div className="analyzer-icon-badge">
                        <Sparkles className="icon-sparkle" />
                    </div>
                    <h2 className="analyzer-title">Space Data Simplifier</h2>
                    <p className="analyzer-subtitle">Extract and analyze PDFs locally - No API limits!</p>

                    {/* Status Badges */}
                    <div className="analyzer-badges">
                        <div className="badge badge-success">
                            <Zap className="badge-icon" />
                            <span>100% Local</span>
                        </div>
                        <div className="badge badge-info">
                            <FileText className="badge-icon" />
                            <span>Unlimited</span>
                        </div>
                        <div className="badge badge-warning">
                            <CheckCircle className="badge-icon" />
                            <span>Private</span>
                        </div>
                    </div>

                    {!pdfJsLoaded && (
                        <div className="loading-indicator">
                            <Loader2 className="spinner" />
                            <span>Loading PDF reader...</span>
                        </div>
                    )}
                    {pdfJsLoaded && !file && (
                        <div className="ready-indicator">
                            <CheckCircle className="check-icon" />
                            <span>Ready to process PDFs</span>
                        </div>
                    )}
                </div>

                {/* Upload Section */}
                <div className="upload-section">
                    <label className={`upload-area ${pdfJsLoaded && !loading ? 'upload-active' : 'upload-disabled'}`}>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileUpload}
                            className="upload-input"
                            disabled={!pdfJsLoaded || loading}
                        />
                        <div className="upload-icon-wrapper">
                            <Upload className="upload-icon" />
                            <div className="upload-pulse"></div>
                        </div>
                        <span className="upload-text">
                            {file ? file.name : 'Click to upload PDF'}
                        </span>
                        <span className="upload-hint">
                            {pdfJsLoaded
                                ? 'Space research papers, reports, and documents'
                                : 'Please wait for PDF reader to load...'}
                        </span>
                    </label>
                </div>

                {/* Status Display */}
                {status && (
                    <div className="status-box status-info">
                        <CheckCircle className="status-icon" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="status-box status-error">
                        <AlertCircle className="status-icon" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Progress Bar */}
                {loading && progress > 0 && (
                    <div className="progress-section">
                        <div className="progress-header">
                            <Loader2 className="spinner" />
                            <span>Processing PDF...</span>
                        </div>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="progress-shine"></div>
                            </div>
                        </div>
                        <span className="progress-text">{progress}% complete</span>
                    </div>
                )}

                {/* Analyzing Indicator */}
                {extractedText && !insights && loading && (
                    <div className="analyzing-section">
                        <Loader2 className="spinner" />
                        <span>Analyzing document locally...</span>
                        <div className="analyzing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                {/* AI Insights */}
                {insights && (
                    <div className="insights-section">
                        <div className="insights-header">
                            <Sparkles className="insights-icon" />
                            <h3>Document Analysis</h3>
                        </div>
                        <div className="insights-content">
                            {insights}
                        </div>
                        <button
                            onClick={() => {
                                setFile(null);
                                setExtractedText('');
                                setInsights('');
                                setError('');
                                setStatus('');
                            }}
                            className="reset-button"
                        >
                            <FileText className="button-icon" />
                            Analyze Another Document
                        </button>
                    </div>
                )}

                {/* Instructions */}
                {!file && pdfJsLoaded && (
                    <div className="instructions-section">
                        <h3 className="instructions-title">How it works:</h3>
                        <ol className="instructions-list">
                            <li>
                                <span className="step-number">1</span>
                                <span>Upload a PDF document containing space data or research</span>
                            </li>
                            <li>
                                <span className="step-number">2</span>
                                <span>Text is extracted locally in your browser (100% private)</span>
                            </li>
                            <li>
                                <span className="step-number">3</span>
                                <span>Advanced local analysis identifies key insights automatically</span>
                            </li>
                            <li>
                                <span className="step-number">4</span>
                                <span>Review findings, statistics, and important content</span>
                            </li>
                        </ol>
                        <div className="info-box info-success">
                            <strong>✓ Benefits:</strong> No API needed • Unlimited usage • Complete privacy • Works offline •
                            Instant analysis • No rate limits • Free forever
                        </div>
                        <div className="info-box info-note">
                            <strong>Note:</strong> Uses intelligent text analysis algorithms running entirely in your browser.
                            No data is sent to any server. Works best with text-based PDFs.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
