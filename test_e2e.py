import asyncio
import pprint
from dotenv import load_dotenv
load_dotenv()
from backend.main import app
from fastapi.testclient import TestClient

def test():
    client = TestClient(app)

    # upload bid
    import time
    time.sleep(1) # ensure quota is fine
    with open("real_test_rfp.docx", "rb") as test_file:
        res = client.post("/api/bids/upload", files={"file": ("real_test_rfp.docx", test_file, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")})
        bid_id = res.json()["bid_id"]
        
    print(f"Uploaded bid: {bid_id}")
    
    # analyze
    res = client.post(f"/api/bids/{bid_id}/analyze")
    print("Analysis status_code:", res.status_code)
    try:
        data = res.json()
        if data.get("processing_status") == "failed":
            print("FAILED. Errors:", data.get("errors"))
        elif "requirements" in data:
            print(f"extraction mode = {data.get('extraction_mode')}")
            print(f"requirements = {len(data.get('requirements', []))}")
            print(f"compliance results = {len(data.get('compliance_results', []))}")
            print(f"proposed responses = {len(data.get('proposed_responses', []))}")
            print(f"review items = {len(data.get('review_ids', []))}")
            print("\n----- COMPLIANCE RESULTS -----")
            for cr in data.get("compliance_results", []):
                req = cr.get("requirement", {}).get("requirement_text", "")
                status = cr.get("status")
                ca = cr.get("conflict_analysis", {})
                print(f"Req: {req}")
                print(f"  Status: {status} | Conf: {cr.get('confidence')}")
                if ca and ca.get("conflict_detected"):
                    print(f"  Conflict: {ca.get('severity')} - {ca.get('reason')}")
                for ev in cr.get("supporting_evidence", []):
                    # We output the evidence details
                    hs = ev.get("metadata", {}).get("hybrid_scores", {})
                    print(f"  [Evidence] doc: {ev.get('document_name')}, section: {ev.get('section')}")
                    print(f"    Text: {ev.get('retrieved_text')[:50]}...")
                    print(f"    Scores -> Sem: {hs.get('semantic')}, Lex: {hs.get('lexical')}, Comb: {ev.get('similarity_score')}")
                print()
            
            print("\n----- PROPOSED RESPONSES -----")
            for pr in data.get("proposed_responses", []):
                print(f"Response (needs_review={pr.get('needs_human_review')}): {pr.get('proposed_response')}")
        else:
            print("Errors:", data.get("errors"))
    except Exception as e:
        print(e)
        print(res.text)

if __name__ == "__main__":
    test()
