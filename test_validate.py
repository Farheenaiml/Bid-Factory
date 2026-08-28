import rocketride, json, asyncio
from dotenv import load_dotenv

load_dotenv()

async def r():
    c = rocketride.RocketRideClient()
    p = json.load(open('bid_factory.pipe'))
    res = await c.validate(p)
    print('VALIDATION_RESULT:', res)

asyncio.run(r())
