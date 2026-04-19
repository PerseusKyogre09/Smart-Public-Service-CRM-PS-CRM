import json
from fastapi import APIRouter, Query as QParam
from appwrite.query import Query
from appwrite_client import databases, DATABASE_ID, COLLECTION_ID
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/users", tags=["users"])


def calculate_tier(reputation: int) -> int:
    """Calculate user tier based on reputation points."""
    if reputation >= 400:
        return 2
    elif reputation >= 150:
        return 1
    else:
        return 0


def aggregate_user_stats(docs: list) -> dict[str, dict]:
    """Helper to aggregate stats from a list of complaint docs."""
    user_stats: dict[str, dict] = {}
    for doc in docs:
        status = doc.get("status", "")
        ward = doc.get("ward") or doc.get("district") or "General"
        
        reporter_id = doc.get("reporterId") or doc.get("userId")
        if reporter_id:
            if reporter_id not in user_stats:
                user_stats[reporter_id] = {
                    "id": reporter_id,
                    "name": doc.get("reporterName") or "Citizen",
                    "email": doc.get("reporterEmail") or f"{reporter_id}@citizen.local",
                    "phone": doc.get("reporterPhone") or "N/A",
                    "reputation": 0,
                    "complaints": 0,
                    "resolved": 0,
                    "ward": ward,
                    "badges": 0,
                    "status": "Active",
                }
            
            points = {"Resolved": 50, "Verified": 20}.get(status, 10)
            user_stats[reporter_id]["reputation"] += points
            user_stats[reporter_id]["complaints"] += 1
            if status == "Resolved":
                user_stats[reporter_id]["resolved"] += 1
                user_stats[reporter_id]["badges"] = min(user_stats[reporter_id]["resolved"] // 5 + 1, 5)

        # Handle verification points
        timeline_raw = doc.get("timeline")
        if timeline_raw:
            try:
                timeline = json.loads(timeline_raw) if isinstance(timeline_raw, str) else timeline_raw
                if isinstance(timeline, list):
                    for event in timeline:
                        note_content = event.get("note", "")
                        if "Verified by user:" in note_content:
                            parts = note_content.split("Verified by user:")
                            if len(parts) > 1:
                                v_uid = parts[1].strip()
                                if v_uid not in user_stats:
                                    user_stats[v_uid] = {
                                        "id": v_uid,
                                        "name": "Citizen",
                                        "email": f"{v_uid}@citizen.local",
                                        "phone": "N/A",
                                        "reputation": 0,
                                        "complaints": 0,
                                        "resolved": 0,
                                        "ward": "General",
                                        "badges": 0,
                                        "status": "Active",
                                    }
                                user_stats[v_uid]["reputation"] += 20
            except:
                pass
    
    for uid in user_stats:
        user_stats[uid]["tier"] = calculate_tier(user_stats[uid]["reputation"])
        user_stats[uid]["status"] = "Flagged" if user_stats[uid]["reputation"] < 0 else "Active"
        
    return user_stats


@router.get("")
async def get_all_users():
    """Get all users with their stats aggregated from complaints."""
    try:
        resp = databases.list_documents(DATABASE_ID, COLLECTION_ID, queries=[Query.limit(500)])
        docs = resp["documents"]
    except Exception:
        return []

    user_stats = aggregate_user_stats(docs)
    all_users = list(user_stats.values())
    return sorted(all_users, key=lambda x: x["reputation"], reverse=True)


@router.get("/{user_id}")
async def get_user(user_id: str):
    """Get details for a specific user."""
    try:
        resp = databases.list_documents(DATABASE_ID, COLLECTION_ID, queries=[Query.limit(500)])
        docs = resp["documents"]
    except Exception:
        return None

    user_stats = aggregate_user_stats(docs)
    if user_id not in user_stats:
        return None

    stats = user_stats[user_id]
    user_ward = stats["ward"]
    
    # Calculate Ward Rank
    all_users = list(user_stats.values())
    ward_users = [u for u in all_users if u["ward"] == user_ward]
    ward_users.sort(key=lambda x: x["reputation"], reverse=True)
    
    rank = 1
    for u in ward_users:
        if u["id"] == user_id:
            break
        rank += 1
    
    total_ward_users = len(ward_users)
    percentile = (rank / total_ward_users) * 100 if total_ward_users > 0 else 100
    
    if percentile <= 5:
        stats["wardRank"] = "Top 5%"
    elif percentile <= 10:
        stats["wardRank"] = "Top 10%"
    elif percentile <= 25:
        stats["wardRank"] = "Top 25%"
    else:
        stats["wardRank"] = f"Top {int(percentile)}%"
    
    # Calculate Streak
    user_docs = [doc for doc in docs if (doc.get("reporterId") or doc.get("userId")) == user_id]
    dates = sorted(list(set([doc["$createdAt"].split("T")[0] for doc in user_docs])), reverse=True)
    
    streak = 0
    if dates:
        today = datetime.utcnow().date()
        last_active = datetime.strptime(dates[0], "%Y-%m-%d").date()
        
        # Streak continues if last active is today or yesterday
        if last_active >= today - timedelta(days=1):
            streak = 1
            current_date = last_active
            for next_date_str in dates[1:]:
                next_date = datetime.strptime(next_date_str, "%Y-%m-%d").date()
                if next_date == current_date - timedelta(days=1):
                    streak += 1
                    current_date = next_date
                else:
                    break
    
    stats["streak"] = streak
    return stats
