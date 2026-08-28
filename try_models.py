import asyncio
import json
from backend.models.entities import Bid, RFP
from uuid import uuid4

async def check():
    configs = [
        {'model_in_profile': 'gemini-1.5-flash'},
        {'model_in_google': 'gemini-1.5-flash'},
        {'model_in_google': 'models/gemini-1.5-flash'}
    ]
    with open('bid_factory.pipe', 'r') as f:
        cfg_base = json.load(f)
    
    for i, cfg_test in enumerate(configs):
        import copy
        cfg = copy.deepcopy(cfg_base)
        for c in cfg['components']:
            if c['id'] == 'llm_gemini_1':
                c['config']['profile'] = 'models-gemini-flash'
                val = {'apikey': 'u0024{ROCKETRIDE_GEMINI_KEY}'}
                if 'model_in_profile' in cfg_test:
                    val['model'] = cfg_test['model_in_profile']
                c['config']['models-gemini-flash'] = val
                
                params = {'google': {}}
                if 'model_in_google' in cfg_test:
                    params['google']['model'] = cfg_test['model_in_google']
                c['config']['parameters'] = params
        
        with open('temp.pipe', 'w') as f:
            json.dump(cfg, f)
        from backend.services.rocketride_service import RocketRideService
        srv = RocketRideService(pipeline_path=__import__('pathlib').Path('temp.pipe'))
        b = Bid(id=uuid4(), bid_id=uuid4(), rfp=RFP(filename='real_test_rfp.docx', title='t', file_type='docx', file_size=1, document_text=''))
        try:
            res = await srv.analyze(b, open('real_test_rfp.docx', 'rb').read())
            print(f'Test {i} -> SUCCESS: ', res.get('data', {}).get('requirements', []))
        except Exception as e:
            print(f'Test {i} -> FAILED: {str(e.__cause__)}')
asyncio.run(check())
