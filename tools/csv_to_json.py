import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "board.csv"
JSON_PATH = ROOT / "data" / "data.json"

def truthy(value):
    text = str(value or "").strip().lower()
    return text in ["y", "yes", "true", "1", "o", "on", "예", "노출"]

def cast(value):
    text = str(value or "").strip()
    if text.lower() in ["true", "y", "yes", "1", "o", "on", "예", "노출"]:
        return True
    if text.lower() in ["false", "n", "no", "0", "x", "off", "아니오", "숨김"]:
        return False
    try:
        if text and "." not in text:
            return int(text)
        if text:
            return float(text)
    except ValueError:
        pass
    return text

data = {"settings": {}, "banners": [], "notices": []}

with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        row_type = (row.get("type") or "").strip().lower()

        if row_type in ["setting", "설정"]:
            key = row.get("key")
            if key:
                data["settings"][key] = cast(row.get("value"))

        elif row_type in ["banner", "배너"]:
            data["banners"].append({
                "visible": cast(row.get("visible")),
                "title": row.get("title", ""),
                "imageUrl": row.get("imageUrl", ""),
                "alt": row.get("alt", "")
            })

        elif row_type in ["notice", "공지"]:
            data["notices"].append({
                "visible": cast(row.get("visible")),
                "important": cast(row.get("important")),
                "title": row.get("title", ""),
                "date": row.get("date", "")
            })

JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"saved: {JSON_PATH}")
