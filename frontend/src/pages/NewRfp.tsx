import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, XCircle } from 'lucide-react';
import { API } from '../api';

const NewRfp = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [pipelineState, setPipelineState] = useState<any>(null);
    const [uploadError, setUploadError] = useState('');
    const [bidId, setBidId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadError('');
        }
    };

    const handleUpload = async () => {
        if (!file || isUploading) return;
        setIsUploading(true);
        setUploadError('');
        try {
            const res = await API.uploadBid(file);
            setBidId(res.bid_id);

            // Start processing pipeline
            setPipelineState('processing');
            try {
                const analysis = await API.analyzeBid(res.bid_id);

                if (analysis.errors && analysis.errors.some((e: string) => e.includes('429') || e.includes('503') || e.includes('LLM error'))) {
                    setPipelineState('quota_exceeded');
                } else if (analysis.processing_status === 'failed') {
                    setPipelineState('failed');
                } else {
                    setPipelineState('completed');
                    setTimeout(() => {
                        navigate(`/bids/${res.bid_id}`);
                    }, 1500);
                }
            } catch (err: any) {
                setUploadError(err.message || 'Pipeline Error');
                setPipelineState('failed');
            }
        } catch (err: any) {
            setUploadError(err.message || 'Upload failed');
            setIsUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {!isUploading && pipelineState === null ? (
                <div className="card">
                    <h2 className="mb-2">Upload RFP</h2>
                    <p className="text-muted mb-6">Drop your RFP document here to begin the BidFactory intelligence pipeline.</p>

                    <div
                        className="upload-zone"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud size={48} className="text-primary mb-4" style={{ margin: '0 auto' }} />
                        <h3>Click to browse or drag file here</h3>
                        <p className="text-muted mt-2">Supports .docx and .pdf (Max 10MB)</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                        />
                    </div>

                    {file && (
                        <div className="mt-4 flex justify-between items-center bg-gray-50 p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-color)' }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{file.name}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{(file.size / 1024).toFixed(1)} KB</div>
                            </div>
                            <button className="btn btn-primary" onClick={handleUpload}>Analyze RFP</button>
                        </div>
                    )}
                    {uploadError && <div className="text-error mt-4" style={{ color: 'var(--status-error)' }}>{uploadError}</div>}
                </div>
            ) : (
                <div className="card">
                    <h2>Analyzing RFP...</h2>
                    <p className="text-muted mb-6">BidFactory is orchestrating the intelligence pipeline.</p>

                    <div className="pipeline-container">
                        <div className={`pipeline-stage completed`}>
                            <div className="stage-icon"><CheckCircle size={24} /></div>
                            <div className="stage-content">
                                <div className="stage-title">RFP Upload</div>
                                <div className="stage-desc">Document binary securely ingested</div>
                            </div>
                        </div>

                        <div className={`pipeline-stage ${pipelineState === 'completed' || pipelineState === 'quota_exceeded' ? 'completed' : pipelineState === 'processing' ? 'processing' : 'waiting'}`}>
                            <div className="stage-icon">{pipelineState === 'completed' || pipelineState === 'quota_exceeded' ? <CheckCircle size={24} /> : <div className={pipelineState === 'processing' ? 'spinner' : ''} />}</div>
                            <div className="stage-content">
                                <div className="stage-title">Document Parser</div>
                                <div className="stage-desc">RocketRide cloud node extracting document structure</div>
                            </div>
                        </div>

                        <div className={`pipeline-stage ${pipelineState === 'completed' ? 'completed' : pipelineState === 'quota_exceeded' ? 'failed' : 'waiting'}`}>
                            <div className="stage-icon">{pipelineState === 'completed' ? <CheckCircle size={24} /> : pipelineState === 'quota_exceeded' ? <XCircle size={24} /> : null}</div>
                            <div className="stage-content">
                                <div className="stage-title">AI Requirement Extraction</div>
                                <div className="stage-desc">Gemini via RocketRide</div>
                                {pipelineState === 'quota_exceeded' && (
                                    <div style={{ color: 'var(--status-error)', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: 600 }}>Gemini unavailable — provider quota exceeded</div>
                                )}
                            </div>
                        </div>

                        {/* Stages blocked if quota failed */}
                        <div className={`pipeline-stage ${pipelineState === 'completed' ? 'completed' : 'waiting'} ${pipelineState === 'quota_exceeded' ? 'opacity-50' : ''}`}>
                            <div className="stage-icon">{pipelineState === 'completed' && <CheckCircle size={24} />}</div>
                            <div className="stage-content">
                                <div className="stage-title">Hybrid RAG</div>
                                <div className="stage-desc">Vector + lexical search for evidence</div>
                            </div>
                        </div>

                        <div className={`pipeline-stage ${pipelineState === 'completed' ? 'completed' : 'waiting'} ${pipelineState === 'quota_exceeded' ? 'opacity-50' : ''}`}>
                            <div className="stage-icon">{pipelineState === 'completed' && <CheckCircle size={24} />}</div>
                            <div className="stage-content">
                                <div className="stage-title">Compliance & Responses</div>
                                <div className="stage-desc">Evaluated statuses and drafted AI responses</div>
                            </div>
                        </div>

                    </div>

                    {pipelineState === 'completed' && (
                        <div className="flex justify-between items-center mt-6">
                            <p className="text-success" style={{ color: 'var(--status-success)', fontWeight: 600 }}>Analysis completed successfully!</p>
                            <button className="btn btn-primary" onClick={() => navigate(`/bids/${bidId}`)}>View Dashboard</button>
                        </div>
                    )}
                    {pipelineState === 'quota_exceeded' && (
                        <div className="panel mt-6" style={{ borderColor: 'var(--status-error)' }}>
                            <div className="panel-body flex-col gap-4">
                                <div className="flex gap-2 items-center text-error" style={{ color: 'var(--status-error)', fontWeight: 600 }}>
                                    <XCircle size={20} /> GEMINI PROVIDER QUOTA EXCEEDED
                                </div>
                                <p className="text-muted text-sm my-2">
                                    AI extraction is temporarily unavailable because the configured Gemini provider quota has been exhausted. Downstream stages cannot run until requirement extraction succeeds.
                                </p>
                                <div className="flex gap-4 mt-2">
                                    <button className="btn btn-outline" onClick={() => { setIsUploading(false); setPipelineState(null); setFile(null); }}>Upload Different RFP</button>
                                    <button className="btn btn-primary" onClick={() => navigate(`/bids/${bidId}`)}>View Partial Dashboard</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NewRfp;
