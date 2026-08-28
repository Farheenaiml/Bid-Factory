import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API, Bid, Requirement, ReviewItem } from '../api';
import { FileText, AlertTriangle, ShieldCheck } from 'lucide-react';

const BidDetail = () => {
    const { bidId } = useParams();
    const [bid, setBid] = useState<Bid | null>(null);
    const [reqs, setReqs] = useState<Requirement[]>([]);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);

    useEffect(() => {
        if (!bidId) return;
        loadData();
    }, [bidId]);

    const loadData = () => {
        if (!bidId) return;
        API.getBid(bidId).then(setBid).catch(console.error);
        API.getRequirements(bidId).then(setReqs).catch(console.error);
        API.getReviews(bidId).then(r => setReviews(r.items)).catch(console.error);
    };

    const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject' | 'needs-revision') => {
        try {
            await API.reviewAction(reviewId, action);
            loadData(); // refresh the list
        } catch (err) {
            console.error('Failed to submit review', err);
        }
    };

    if (!bid) return <div>Loading...</div>;

    const findReview = (reqId: string) => reviews.find(r => r.requirement_id === reqId);

    const complianceMap = {
        covered: 0,
        partially_covered: 0,
        not_found: 0,
        needs_human_review: 0
    };

    let totalEvidence = 0;

    reviews.forEach(r => {
        if (r.compliance_status === 'COVERED') complianceMap.covered++;
        if (r.compliance_status === 'PARTIALLY_COVERED') complianceMap.partially_covered++;
        if (r.compliance_status === 'NOT_FOUND') complianceMap.not_found++;
        if (r.compliance_status === 'NEEDS_HUMAN_REVIEW') complianceMap.needs_human_review++;
        if (r.supporting_evidence) totalEvidence += r.supporting_evidence.length;
    });

    const getBadgeStyle = (status: string) => {
        if (status === 'COVERED') return 'badge-success';
        if (status === 'NOT_FOUND') return 'badge-error';
        if (status === 'PARTIALLY_COVERED') return 'badge-warning';
        return 'badge-info';
    };

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="mb-2">BID WORKSPACE: {bid.rfp.title}</h2>
                    <p className="text-muted text-sm">Document: {bid.rfp.filename} • Uploaded: {new Date(bid.rfp.uploaded_at).toLocaleString()}</p>
                </div>
                <span className={`badge badge-${bid.processing_status === 'completed' ? 'success' : bid.processing_status === 'failed' ? 'error' : 'info'}`}>
                    {bid.processing_status.toUpperCase()}
                </span>
            </div>

            <div className="tabs">
                <div className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview & Pipeline</div>
                <div className={`tab ${activeTab === 'requirements' ? 'active' : ''}`} onClick={() => setActiveTab('requirements')}>Requirements & Evidence</div>
                <div className={`tab ${activeTab === 'responses' ? 'active' : ''}`} onClick={() => setActiveTab('responses')}>AI Responses</div>
            </div>

            {activeTab === 'overview' && (
                <div>
                    <h3 className="mb-4 text-sm text-muted">BID OVERVIEW</h3>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-title flex gap-2 items-center"><FileText size={16} /> Requirements</div>
                            <div className="metric-value">{reqs.length}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-title flex gap-2 items-center"><ShieldCheck size={16} /> Covered</div>
                            <div className="metric-value text-success" style={{ color: 'var(--status-success)' }}>{complianceMap.covered}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-title flex gap-2 items-center">Evidence Retrieved</div>
                            <div className="metric-value text-primary">{totalEvidence}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-title flex gap-2 items-center"><AlertTriangle size={16} /> Reviews Pending</div>
                            <div className="metric-value text-warning" style={{ color: 'var(--status-warning)' }}>{reviews.filter(r => r.review_status === 'PENDING').length}</div>
                        </div>
                    </div>

                    <h3 className="mb-4 mt-6 text-sm text-muted">PIPELINE EXECUTION STATE</h3>
                    <div className="pipeline-container">

                        <div className="pipeline-stage completed">
                            <div className="stage-icon"><span className="badge badge-success">COMPLETED</span></div>
                            <div className="stage-content">
                                <div className="stage-title">RFP Upload</div>
                            </div>
                        </div>

                        <div className={`pipeline-stage ${bid.processing_status === 'failed' ? 'failed' : 'completed'}`}>
                            <div className="stage-icon"><span className={`badge badge-${bid.processing_status === 'failed' ? 'error' : 'success'}`}>{bid.processing_status === 'failed' ? 'FAILED' : 'COMPLETED'}</span></div>
                            <div className="stage-content">
                                <div className="stage-title">Document Parsing & Requirement Extraction</div>
                                {bid.processing_status === 'failed' && (
                                    <div className="text-error text-sm mt-1" style={{ color: 'var(--status-error)', fontWeight: 600 }}>GEMINI PROVIDER QUOTA EXCEEDED</div>
                                )}
                            </div>
                        </div>

                        <div className={`pipeline-stage ${bid.processing_status === 'completed' ? 'completed' : 'waiting'}`}>
                            <div className="stage-icon"><span className={`badge badge-${bid.processing_status === 'completed' ? 'success' : 'neutral'}`}>{bid.processing_status === 'completed' ? 'COMPLETED' : 'PENDING'}</span></div>
                            <div className="stage-content">
                                <div className="stage-title">Hybrid RAG & Conflict Detection</div>
                            </div>
                        </div>

                        <div className={`pipeline-stage ${bid.processing_status === 'completed' ? 'completed' : 'waiting'}`}>
                            <div className="stage-icon"><span className={`badge badge-${bid.processing_status === 'completed' ? 'success' : 'neutral'}`}>{bid.processing_status === 'completed' ? 'COMPLETED' : 'PENDING'}</span></div>
                            <div className="stage-content">
                                <div className="stage-title">Compliance Analysis & Response Generation</div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {activeTab === 'requirements' && (
                <div className="flex gap-6">
                    <div style={{ flex: 1 }}>
                        {reqs.length === 0 ? (
                            <div className="p-6 text-center text-muted border rounded-md">
                                Requirements will appear after successful AI extraction.
                            </div>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Requirement</th>
                                            <th>Category / Priority</th>
                                            <th>Compliance / Confidence</th>
                                            <th>Evidence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reqs.map(r => {
                                            const rev = findReview(r.requirement_id);
                                            return (
                                                <tr key={r.requirement_id} onClick={() => setSelectedReq(r)} style={{ cursor: 'pointer', background: selectedReq?.requirement_id === r.requirement_id ? 'var(--status-info-bg)' : '' }}>
                                                    <td style={{ maxWidth: '250px' }}>
                                                        <div style={{ fontWeight: 500 }} className="truncate">{r.requirement_text.length > 60 ? r.requirement_text.substring(0, 60) + "..." : r.requirement_text}</div>
                                                    </td>
                                                    <td className="text-sm">
                                                        <div>{r.category || '-'}</div>
                                                        <div className="text-xs text-muted">{r.priority || 'Normal'}</div>
                                                    </td>
                                                    <td>
                                                        {!rev ? <span className="badge badge-neutral">PENDING</span> : (
                                                            <div>
                                                                <span className={`badge ${getBadgeStyle(rev.compliance_status)} mb-1`}>{rev.compliance_status}</span>
                                                                <div className="text-xs text-muted">Conf: {(rev.confidence * 100).toFixed(0)}%</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-neutral">{rev?.supporting_evidence?.length || 0} items</span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    {selectedReq && (
                        <div className="panel" style={{ flex: 1 }}>
                            <div className="panel-header">Requirement Details</div>
                            <div className="panel-body">
                                <div className="p-4 bg-gray-50 border rounded-md mb-6" style={{ background: 'var(--bg-color)', lineHeight: 1.5 }}>
                                    {selectedReq.requirement_text}
                                </div>

                                {(() => {
                                    const rev = findReview(selectedReq.requirement_id);
                                    if (!rev) return <p className="text-muted">No evidence available.</p>;

                                    return (
                                        <>
                                            {rev.conflict_analysis && rev.conflict_analysis.conflict_detected && (
                                                <div className="p-4 mb-4 border rounded-md" style={{ borderColor: 'var(--status-error)', background: 'var(--status-error-bg)' }}>
                                                    <div className="text-error font-semibold flex items-center gap-2 mb-2" style={{ color: 'var(--status-error)' }}>
                                                        <AlertTriangle size={16} /> CONFLICT DETECTED ({rev.conflict_analysis.severity})
                                                    </div>
                                                    <p className="text-sm mb-2">{rev.conflict_analysis.reason}</p>
                                                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--status-error)' }}>Human review required</div>
                                                </div>
                                            )}

                                            <h4 className="text-sm font-semibold mb-4 text-muted uppercase">Evidence Retrieved</h4>
                                            {rev.supporting_evidence.length === 0 && <p className="text-muted text-sm italic">No supporting company evidence was found.</p>}
                                            <div className="flex-col gap-4">
                                                {rev.supporting_evidence.map((ev, i) => (
                                                    <div key={i} className="p-4 border rounded-md">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="font-semibold text-sm" style={{ color: 'var(--primary-color)' }}>{ev.document_name}</div>
                                                        </div>
                                                        <div className="flex gap-4 text-xs text-muted mb-3 opacity-50">
                                                            <span>Page: {ev.page_number || 'N/A'}</span>
                                                            <span>Section: {ev.section || 'Unknown'}</span>
                                                        </div>
                                                        <p className="text-sm mb-3">"{ev.retrieved_text}"</p>
                                                        <div className="flex gap-3 text-xs text-muted border-t pt-2">
                                                            <span>Combined Sim: {ev.similarity_score.toFixed(2)}</span>
                                                            {ev.metadata?.hybrid_scores && (
                                                                <>
                                                                    <span>Semantic: {ev.metadata.hybrid_scores.semantic?.toFixed(2)}</span>
                                                                    <span>Lexical: {ev.metadata.hybrid_scores.lexical?.toFixed(2)}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'responses' && (
                <div className="flex flex-col gap-6">
                    {reviews.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
                            <p>No AI responses or reviews are pending right now.</p>
                        </div>
                    ) : (
                        reviews.map(rev => (
                            <div key={rev.review_id} className="panel" style={{ borderLeft: rev.review_status === 'PENDING' ? '4px solid #f59e0b' : '4px solid #e5e7eb' }}>
                                <div className="panel-body">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-sm font-semibold text-muted mb-1" style={{ color: '#6b7280' }}>
                                                REQ-ID: {rev.requirement_id.substring(0, 8)} | COMPLIANCE: {rev.compliance_status}
                                            </div>
                                            <h3 className="text-lg font-bold" style={{ color: '#111827' }}>
                                                Proposed Response
                                            </h3>
                                        </div>
                                        {rev.review_status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleReviewAction(rev.review_id, 'approve')} className="btn" style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem' }}>Approve</button>
                                                <button onClick={() => handleReviewAction(rev.review_id, 'edit')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem' }}>Edit</button>
                                                <button onClick={() => handleReviewAction(rev.review_id, 'reject')} className="btn" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem' }}>Reject</button>
                                            </div>
                                        )}
                                        {rev.review_status !== 'PENDING' && (
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: rev.review_status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                                                color: rev.review_status === 'APPROVED' ? '#166534' : '#991b1b'
                                            }}>
                                                {rev.review_status ? rev.review_status.toUpperCase() : ''}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4 rounded-md mb-4" style={{ background: '#f9fafb', border: '1px solid #f3f4f6', color: '#374151', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                        {rev.proposed_response || <em style={{ color: '#9ca3af' }}>No response generated.</em>}
                                    </div>

                                    {rev.supporting_evidence && rev.supporting_evidence.length > 0 && (
                                        <div className="text-sm mt-4 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                                            <strong style={{ color: '#4b5563' }}>Based on Source Evidence:</strong>
                                            <div className="flex gap-2 mt-2">
                                                {rev.supporting_evidence.map((ev: any, idx: number) => (
                                                    <span key={idx} style={{ background: '#eef2ff', color: '#4f46e5', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                                        {ev.document_name || 'Source Document'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default BidDetail;
