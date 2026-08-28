import asyncio
import json
from backend.services.rocketride_service import rocketride_service
from backend.models.entities import Bid, RFP
from uuid import uuid4

async def r():
    b = Bid(id=uuid4(),bid_id=uuid4(),rfp=RFP(filename='real_test_rfp.docx',title='t',file_type='docx',file_size=1,document_text=''))
    res = await rocketride_service.analyze(b, open('real_test_rfp.docx', 'rb').read())
    reqs = res.get('data', {}).get('requirements', [])
    print(reqs)

asyncio.run(r())
