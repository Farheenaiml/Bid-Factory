import asyncio
from uuid import uuid4
from backend.models.entities import Bid, RFP
from backend.schemas.requirements import ExtractedRequirement
from backend.services.compliance_analysis import ComplianceAnalysisService
from backend.services.knowledge_base import knowledge_base_service
from backend.services.response_generation import response_generation_service
from backend.services.review import ReviewService
from backend.services.repository import repository

async def run_e2e_downstream():
    bid_id = uuid4()
    bid = repository.create_bid(filename="demo.pdf", title="Demo bid", content_type="application/pdf", file_type="pdf", file_size=1024, document=b"")
    
    requirements = [
        ExtractedRequirement(requirement_id=uuid4(), requirement_text="The vendor must natively support hosting on AWS Azure GCP platforms."),
        ExtractedRequirement(requirement_id=uuid4(), requirement_text="The vendor must possess SOC 2 certification."),
        ExtractedRequirement(requirement_id=uuid4(), requirement_text="The system must guarantee 99.9% availability for all clients."),
        ExtractedRequirement(requirement_id=uuid4(), requirement_text="The system must feature advanced AI/ML capabilities for MLOps and drift detection."),
        ExtractedRequirement(requirement_id=uuid4(), requirement_text="The vendor must have completed previous projects building a Healthcare Data Lake."),
        ExtractedRequirement(requirement_id=uuid4(), requirement_text="The vendor must hold active offices operating in Tokyo, Japan."),
        ExtractedRequirement(requirement_id=uuid4(), requirement_text="The vendor must enforce data encryption using AES-256 for all at-rest data, and utilize Quantum key distribution."),
        ExtractedRequirement(requirement_id=uuid4(), requirement_text="The vendor must have an RTO (Recovery Time Objective) of 15 minutes.")
    ]
    
    # 1. RAG + Compliance
    compliance_analysis_service = ComplianceAnalysisService(knowledge_base_service)
    compliance_result = compliance_analysis_service.analyze(requirements)
    print("Compliance Results Count:", len(compliance_result.results))
    
    for cr in compliance_result.results:
        print(f" Req: {cr.requirement.requirement_text} -> Status: {cr.status}, Evidence: {len(cr.supporting_evidence)} pieces")
        if cr.conflict_analysis and cr.conflict_analysis.conflict_detected:
            print(f"   [Conflict!!] {cr.conflict_analysis.reason}")
    
    # 2. Response Generation
    responses = response_generation_service.generate(requirements, compliance_result.results)
    print("\nResponses Count:", len(responses.responses))
    
    for r in responses.responses:
        print(f" Response: {r.proposed_response[:50]}... -> Needs Review: {r.needs_human_review}")
    
    # 3. Human Review Creation (mimicking orchestration)
    review_service = ReviewService(repository)
    review_ids = []
    for generated in responses.responses:
        r = review_service.create_pending(
            bid_id=bid.bid_id,
            requirement_id=generated.requirement_id,
            proposed_response=generated.proposed_response,
            compliance_status=generated.compliance_status,
            confidence=generated.confidence,
            supporting_evidence=generated.supporting_evidence,
        )
        review_ids.append(r.review_id)
        
    print("\nDrafted Reviews Count:", len(review_ids))

if __name__ == "__main__":
    asyncio.run(run_e2e_downstream())
