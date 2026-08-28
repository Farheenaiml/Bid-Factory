import asyncio
import pprint
from backend.services.rocketride_service import rocketride_service
from backend.models.entities import Bid, RFP
from uuid import uuid4

async def run():
    b = Bid(id=uuid4(), bid_id=uuid4(), rfp=RFP(filename='demo_rfp_simple.docx', title='test', file_type='docx', file_size=1, content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', document_text=''))
    data = open('demo_rfp_simple.docx', 'rb').read()
    res = await rocketride_service.analyze(b, data)
    print("TEXT Extracted:")
    print(repr(res.get('data', {}).get('text', 'No text')))
    print("\nRequirements Extracted:")
    print(res.get('data', {}).get('requirements', []))

asyncio.run(run())
