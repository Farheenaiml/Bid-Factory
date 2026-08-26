import re
from collections.abc import Iterable

from backend.schemas.compliance import (
    ComplianceAnalysisResult,
    ComplianceResult,
    ComplianceStatus,
    EvidenceRetriever,
)
from backend.schemas.requirements import ExtractedRequirement
from backend.schemas.rag import RetrievalResult


class ComplianceAnalysisService:
    """Compare extracted requirements only against retrieved company evidence."""

    _STOP_WORDS = {
        "a", "an", "and", "are", "be", "by", "for", "from", "in", "is", "it", "of", "on",
        "or", "shall", "should", "that", "the", "their", "this", "to", "with",
    }

    def __init__(self, retriever: EvidenceRetriever) -> None:
        self._retriever = retriever

    def analyze(self, requirements: Iterable[ExtractedRequirement]) -> ComplianceAnalysisResult:
        results = [self._analyze_requirement(requirement) for requirement in requirements]
        return ComplianceAnalysisResult(
            results=results,
            message="compliance analysis completed" if results else "no requirements available for analysis",
        )

    def _analyze_requirement(self, requirement: ExtractedRequirement) -> ComplianceResult:
        response = self._retriever.search(requirement.requirement_text)
        evidence = self._retrieved_results(response)
        if not evidence:
            return ComplianceResult(
                requirement=requirement,
                status=ComplianceStatus.not_found,
                confidence=0.0,
                evidence_missing=True,
                explanation="No relevant company evidence was retrieved.",
            )

        strongest = max(evidence, key=lambda item: item.similarity_score)
        requirement_terms = self._terms(requirement.requirement_text)
        evidence_terms = self._terms(" ".join(item.retrieved_text for item in evidence))
        overlap = len(requirement_terms & evidence_terms) / len(requirement_terms) if requirement_terms else 0.0
        score = max(0.0, min(1.0, strongest.similarity_score))

        if score >= 0.75 and overlap >= 0.5:
            status = ComplianceStatus.covered
            confidence = min(1.0, 0.5 * score + 0.5 * overlap)
            explanation = "Retrieved evidence strongly supports the requirement."
        elif score >= 0.6 and overlap > 0:
            status = ComplianceStatus.partially_covered
            confidence = min(1.0, 0.5 * score + 0.5 * overlap)
            explanation = "Retrieved evidence supports only part of the requirement."
        else:
            status = ComplianceStatus.needs_human_review
            confidence = min(1.0, 0.5 * score + 0.5 * overlap)
            explanation = "Evidence was retrieved, but its relationship to the requirement is ambiguous."

        return ComplianceResult(
            requirement=requirement,
            status=status,
            confidence=confidence,
            supporting_evidence=evidence,
            evidence_missing=False,
            explanation=explanation,
        )

    @staticmethod
    def _retrieved_results(response: dict[str, object]) -> list[RetrievalResult]:
        raw_results = response.get("results", [])
        return [result for result in raw_results if isinstance(result, RetrievalResult)]

    @classmethod
    def _terms(cls, text: str) -> set[str]:
        return {
            term for term in re.findall(r"[a-z0-9]+", text.lower())
            if len(term) > 2 and term not in cls._STOP_WORDS
        }


def create_compliance_analysis_service(retriever: EvidenceRetriever) -> ComplianceAnalysisService:
    return ComplianceAnalysisService(retriever)