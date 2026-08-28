import time
import pprint
import asyncio
from backend.services.rocketride_service import rocketride_service
from backend.models.entities import Bid, RFP
from uuid import uuid4

async def run():
    b = Bid(id=uuid4(), bid_id=uuid4(), rfp=RFP(filename='real_test_rfp.docx', title='test', file_type='docx', file_size=1, content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', document_text=''))
    data = open('real_test_rfp.docx', 'rb').read()
    
    while True:
        res = await rocketride_service.analyze(b, data)
        reqs = res.get('data', {}).get('requirements', [])
        
        # Check if we hit the limit
        if reqs and "LLM error" in reqs[0]:
            print("Hit limit... sleeping 45 seconds")
            time.sleep(45)
        else:
            print("SUCCESS! Requirements Extracted:")
            pprint.pprint(reqs)
            break

asyncio.run(run())
