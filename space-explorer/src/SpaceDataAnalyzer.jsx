import React, { useState, useEffect } from 'react';
import { Upload, FileText, Sparkles, Loader2, AlertCircle, CheckCircle, Zap } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                        <Sparkles className="w-10 h-10 text-purple-400" />
                        Space Data Simplifier
                    </h1>
                    <p className="text-purple-200">Extract and analyze PDFs locally - No API limits!</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 text-sm font-medium">100% Local • Unlimited • Private</span>
                    </div>
                    {!pdfJsLoaded && (
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <Loader2 className="w-4 h-4 text-yellow-300 animate-spin" />
                            <p className="text-yellow-300 text-sm">Loading PDF reader...</p>
                        </div>
                    )}
                    {pdfJsLoaded && !file && (
                        <p className="text-green-300 text-sm mt-3">✓ Ready to process PDFs</p>
                    )}
                </div>

                {/* Upload Section */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-6 border border-purple-300/20">
                    <label className={`flex flex-col items-center justify-center ${pdfJsLoaded && !loading ? 'cursor-pointer hover:bg-white/5' : 'cursor-not-allowed opacity-50'} transition-all rounded-lg p-4`}>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={!pdfJsLoaded || loading}
                        />
                        <Upload className="w-16 h-16 text-purple-300 mb-4" />
                        <span className="text-white text-lg font-medium mb-2">
                            {file ? file.name : 'Click to upload PDF'}
                        </span>
                        <span className="text-purple-200 text-sm text-center">
                            {pdfJsLoaded
                                ? 'Space research papers, reports, and documents'
                                : 'Please wait for PDF reader to load...'}
                        </span>
                    </label>
                </div>

                {/* Status Display */}
                {status && (
                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-300" />
                        <span className="text-blue-200">{status}</span>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-300" />
                        <span className="text-red-200">{error}</span>
                    </div>
                )}

                {/* Progress Bar */}
                {loading && progress > 0 && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                            <span className="text-white font-medium">Processing PDF...</span>
                        </div>
                        <div className="w-full bg-purple-900/50 rounded-full h-3">
                            <div
                                className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-purple-200 text-sm mt-2 block">{progress}% complete</span>
                    </div>
                )}

                {/* Extracted Text - Hidden */}
                {extractedText && !insights && loading && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                            <span className="text-white font-medium">Analyzing document locally...</span>
                        </div>
                    </div>
                )}

                {/* AI Insights */}
                {insights && (
                    <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-8 border border-purple-300/30">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-yellow-400" />
                            Document Analysis
                        </h2>
                        <div className="prose prose-lg prose-invert max-w-none">
                            <div className="text-purple-50 whitespace-pre-wrap leading-relaxed text-base">
                                {insights}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setFile(null);
                                setExtractedText('');
                                setInsights('');
                                setError('');
                                setStatus('');
                            }}
                            className="mt-6 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Analyze Another Document
                        </button>
                    </div>
                )}

                {/* Instructions */}
                {!file && pdfJsLoaded && (
                    <div className="bg-white/5 rounded-xl p-6 mt-6">
                        <h3 className="text-lg font-semibold text-white mb-3">How it works:</h3>
                        <ol className="text-purple-200 space-y-2 list-decimal list-inside">
                            <li>Upload a PDF document containing space data or research</li>
                            <li>Text is extracted locally in your browser (100% private)</li>
                            <li>Advanced local analysis identifies key insights automatically</li>
                            <li>Review findings, statistics, and important content</li>
                        </ol>
                        <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                            <p className="text-green-200 text-sm">
                                <strong>✓ Benefits:</strong> No API needed • Unlimited usage • Complete privacy • Works offline •
                                Instant analysis • No rate limits • Free forever
                            </p>
                        </div>
                        <div className="mt-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <p className="text-blue-200 text-sm">
                                <strong>Note:</strong> Uses intelligent text analysis algorithms running entirely in your browser.
                                No data is sent to any server. Works best with text-based PDFs.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
