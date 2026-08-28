import asyncio
import json
from backend.services.rocketride_service import rocketride_service
from backend.services.repository import repository

async def main():
    bid = repository.create_bid(filename='real_test_rfp.docx', title='Demo bid', content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', file_type='docx', file_size=1024, document=b'')
    with open('real_test_rfp.docx', 'rb') as f:
        doc = f.read()
    try:
        res = await rocketride_service.analyze(bid, doc)
        with open('direct_out.json', 'w', encoding='utf-8') as f:
            json.dump(res, f, indent=4)
        print('WROTE SUCCESS to direct_out.json')
    except Exception as e:
        with open('direct_err.txt', 'w', encoding='utf-8') as f:
            import traceback
            f.write(traceback.format_exc())
        print('WROTE ERROR to direct_err.txt')

if __name__ == '__main__':
    asyncio.run(main())
