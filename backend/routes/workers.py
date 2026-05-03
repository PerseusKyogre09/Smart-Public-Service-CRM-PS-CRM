from fastapi import APIRouter, HTTPException, Query as QParam
from appwrite.query import Query
from appwrite_client import databases, DATABASE_ID, WORKERS_COLLECTION_ID, COLLECTION_ID
from typing import Optional, List

router = APIRouter(prefix="/api/workers", tags=["workers"])

def _map_worker(doc: dict) -> dict:
    internal = {"$id", "$collectionId", "$databaseId", "$createdAt", "$updatedAt", "$permissions"}
    out = {k: v for k, v in doc.items() if k not in internal}
    out["id"] = doc["$id"]
    return out

@router.get("")
async def list_workers(state: Optional[str] = None):
    try:
        queries = [Query.limit(100)]
        if state:
            queries.append(Query.equal("state", state))
        
        resp = databases.list_documents(DATABASE_ID, WORKERS_COLLECTION_ID, queries=queries)
        workers = [_map_worker(d) for d in resp["documents"]]
        
        # Optimized: Batch fetch all active complaints to count workloads in one go
        # This avoids the N+1 query problem (making a DB call for every worker)
        try:
            active_resp = databases.list_documents(
                DATABASE_ID, COLLECTION_ID,
                queries=[
                    Query.not_equal("status", "Resolved"),
                    Query.not_equal("status", "Closed"),
                    Query.limit(1000) # Support up to 1000 active complaints for workload calc
                ]
            )
            all_active = active_resp.get("documents", [])
            
            # Count in-memory
            workload_map = {}
            for comp in all_active:
                assigned = comp.get("assignedTo")
                if assigned:
                    workload_map[assigned] = workload_map.get(assigned, 0) + 1
            
            for worker in workers:
                worker["activeTasks"] = workload_map.get(worker["name"], 0)
                
        except Exception as e:
            print(f"Workload calculation failed: {e}")
            for worker in workers:
                worker["activeTasks"] = 0
                
        return workers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
