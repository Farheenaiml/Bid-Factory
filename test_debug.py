import asyncio
import traceback
from uuid import uuid4
from backend.services.rocketride_service import *
from backend.models.entities import Bid, RFP
from backend.main import app
from fastapi.testclient import TestClient

async def run_direct():
    service = RocketRideService()
    bid = Bid(id=uuid4(), bid_id=uuid4(), rfp=RFP(filename="test.pdf", title="t", file_type="pdf", file_size=10, document_text=""))
    try:
        res = await service.analyze(bid, b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n")
        print(res)
    except Exception as e:
        print("Error:", e)
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run_direct())
