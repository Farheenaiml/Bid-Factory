import asyncio
from rocketride import RocketRideClient
async def check():
    c = RocketRideClient()
    await c.connect()
    print(await c.call('providers'))
    await c.disconnect()
asyncio.run(check())
