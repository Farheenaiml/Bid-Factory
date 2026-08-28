import asyncio
from backend.services.rocketride_service import *
from backend.models.entities import Bid, RFP
from uuid import uuid4
async def run():
    b = Bid(id=uuid4(), bid_id=uuid4(), rfp=RFP(filename='real_test_rfp.docx', title='t', file_type='docx', file_size=1, document_text=''))
    try:
        res = await rocketride_service.analyze(b, open('real_test_rfp.docx', 'rb').read())
        print(res)
    except Exception as e:
        import traceback
        with open('error.log', 'w') as f:
            traceback.print_exc(file=f)
asyncio.run(run())
