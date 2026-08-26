from pathlib import Path
from typing import Any, Protocol

from backend.models.entities import Bid


class PipelineService(Protocol):
    async def analyze(self, bid: Bid, document: bytes) -> dict[str, Any]: ...

    async def generate(self, bid: Bid, document: bytes) -> dict[str, Any]: ...


class RocketRideServiceError(RuntimeError):
    """A sanitized error raised when RocketRide execution is unavailable."""


class RocketRideService:
    def __init__(self, pipeline_path: Path | None = None) -> None:
        self._pipeline_path = pipeline_path or Path(__file__).resolve().parents[2] / "bid_factory.pipe"

    async def analyze(self, bid: Bid, document: bytes) -> dict[str, Any]:
        return await self._execute(bid, document)

    async def generate(self, bid: Bid, document: bytes) -> dict[str, Any]:
        return await self._execute(bid, document)

    async def _execute(self, bid: Bid, document: bytes) -> dict[str, Any]:
        try:
            from rocketride import RocketRideClient
        except ImportError as exc:
            raise RocketRideServiceError("RocketRide SDK is not installed.") from exc

        if not self._pipeline_path.is_file():
            raise RocketRideServiceError("BidFactory pipeline file was not found.")

        client = RocketRideClient()
        token: str | None = None
        try:
            await client.connect()
            execution = await client.use(filepath=str(self._pipeline_path))
            token = execution.get("token")
            if not isinstance(token, str) or not token:
                raise RocketRideServiceError("RocketRide did not return a pipeline token.")

            result = await client.send(
                token,
                document,
                objinfo={
                    "bid_id": str(bid.id),
                    "filename": bid.rfp.filename,
                },
                mimetype=bid.rfp.content_type,
            )
            return {
                "status": "completed",
                "message": "RocketRide pipeline completed.",
                "data": result,
            }
        except RocketRideServiceError:
            raise
        except Exception as exc:
            raise RocketRideServiceError("RocketRide pipeline execution failed.") from exc
        finally:
            if token:
                try:
                    await client.terminate(token)
                except Exception:
                    pass
            try:
                await client.disconnect()
            except Exception:
                pass


rocketride_service: PipelineService = RocketRideService()