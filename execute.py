import asyncio
import traceback
from backend.services.rocketride_service import rocketride_service
from backend.models.entities import Bid, RFP
from uuid import uuid4
async def r():
    try:
        b=Bid(id=uuid4(), bid_id=uuid4(), rfp=RFP(filename='real_test_rfp.docx', title='t', file_type='docx', file_size=1, document_text=''))
        print(await rocketride_service.analyze(b, open('real_test_rfp.docx', 'rb').read()))
    except Exception as e:
        with open('error3.log', 'w') as f:
            traceback.print_exc(file=f)
asyncio.run(r())
