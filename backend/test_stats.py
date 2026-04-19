import requests

# Test data
USER_ID = "69c4bb9a6c5f1721779c" # Pradeepto Pal
BASE_URL = "http://localhost:8000"

try:
    response = requests.get(f"{BASE_URL}/api/users/{USER_ID}")
    if response.status_code == 200:
        data = response.json()
        print(f"User ID: {data.get('id')}")
        print(f"Reputation: {data.get('reputation')}")
        print(f"Ward Rank: {data.get('wardRank')}")
        print(f"Streak: {data.get('streak')}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Connection failed: {e}")
