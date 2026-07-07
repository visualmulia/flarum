import os
import sys
import re
import json
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET

# Configuration
RSS_FEED_URL = "https://venturebeat.com/category/ai/feed"
FLARUM_API_URL = "https://forum.widatama.com/api/discussions"
FLARUM_API_KEY = os.environ.get("FLARUM_API_KEY", "widatamamasterkey7802546c01e94ebd87fa34b4ed10fe41")
AIBOY_USER_ID = 7
TAG_ID = 1  # Pintar AI & Produktivitas

# Determine working directory
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
POSTED_LINKS_FILE = os.path.join(SCRIPT_DIR, "posted_links.txt")

def get_gemini_api_key():
    # 1. Check environment variable
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    
    # 2. Check local .env file
    env_file = os.path.join(SCRIPT_DIR, ".env")
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    return line.strip().split("=", 1)[1].strip()
                    
    return None

def get_posted_links():
    if os.path.exists(POSTED_LINKS_FILE):
        with open(POSTED_LINKS_FILE, "r") as f:
            return set(line.strip() for line in f if line.strip())
    return set()

def save_posted_link(link):
    with open(POSTED_LINKS_FILE, "a") as f:
        f.write(link + "\n")

def fetch_rss_feed():
    req = urllib.request.Request(
        RSS_FEED_URL, 
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )
    with urllib.request.urlopen(req) as response:
        return response.read()

def parse_rss(xml_data):
    root = ET.fromstring(xml_data)
    channel = root.find("channel")
    items = []
    
    for item in channel.findall("item"):
        title = item.find("title").text if item.find("title") is not None else ""
        link = item.find("link").text if item.find("link") is not None else ""
        description = item.find("description").text if item.find("description") is not None else ""
        
        # Extract content:encoded if available
        content_encoded = ""
        for child in item:
            if child.tag.endswith("encoded"):
                content_encoded = child.text
                break
                
        # Find feature image URL
        image_url = None
        # Check enclosure
        enclosure = item.find("enclosure")
        if enclosure is not None and enclosure.get("url"):
            image_url = enclosure.get("url")
            
        # Check media:content or media:thumbnail
        if not image_url:
            for child in item:
                if "content" in child.tag or "thumbnail" in child.tag:
                    if child.get("url"):
                        image_url = child.get("url")
                        break
                        
        # Check image tag in description or content
        if not image_url:
            search_text = content_encoded or description
            if search_text:
                match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', search_text)
                if match:
                    image_url = match.group(1)
                    
        items.append({
            "title": title,
            "link": link,
            "description": description,
            "image_url": image_url
        })
        
    return items

def rewrite_with_gemini(gemini_key, orig_title, orig_desc, orig_link):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
    
    prompt = f"""
Terjemahkan dan tulis ulang berita teknologi/AI berikut menjadi postingan forum komunitas yang seru, informatif, dan sangat menarik untuk dibaca anak muda Indonesia.

Gunakan gaya bahasa santai, kekinian (tidak kaku), tapi tetap edukatif dan berbobot ala "Widatama" (komunitas AI terbesar).
Ajak pembaca untuk berdiskusi atau berkomentar di akhir postingan.

Format keluaran harus dalam bentuk JSON mentah (raw JSON) dengan struktur objek sebagai berikut:
{{
  "title": "[Judul postingan yang sangat menarik/clickbait cerdas dalam Bahasa Indonesia. MAKSIMAL 75 KARAKTER]",
  "body": "[Isi tulisan lengkap dalam Bahasa Indonesia menggunakan format Markdown. Gunakan emoji yang relevan, list, sub-heading, dan cetak tebal untuk poin penting]"
}}

Berikut adalah detail berita sumbernya:
Judul Asli: {orig_title}
Sumber Link: {orig_link}
Deskripsi Singkat: {orig_desc}
"""

    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            text = res_data['candidates'][0]['content']['parts'][0]['text']
            
            # Strip markdown block quotes if present
            if text.strip().startswith("```"):
                text = re.sub(r'^```(?:json)?\n|```$', '', text.strip(), flags=re.MULTILINE)
                
            return json.loads(text.strip())
    except Exception as e:
        print(f"Error calling Gemini API: {e}", file=sys.stderr)
        return None

def post_to_flarum(title, body, tag_id):
    payload = {
        "data": {
            "type": "discussions",
            "attributes": {
                "title": title,
                "content": body
            },
            "relationships": {
                "tags": {
                    "data": [
                        {
                            "type": "tags",
                            "id": str(tag_id)
                        }
                    ]
                }
            }
        }
    }
    
    req = urllib.request.Request(
        FLARUM_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Token {FLARUM_API_KEY}; userId={AIBOY_USER_ID}"
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            discussion_id = res_data["data"]["id"]
            discussion_slug = res_data["data"]["attributes"]["slug"]
            print(f"Successfully posted thread: ID {discussion_id} ({discussion_slug})")
            return True
    except urllib.error.HTTPError as e:
        print(f"HTTP Error posting to Flarum: {e.code} - {e.read().decode('utf-8')}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Error posting to Flarum: {e}", file=sys.stderr)
        return False

def main():
    gemini_key = get_gemini_api_key()
    if not gemini_key:
        print("Error: GEMINI_API_KEY not found in environment or .env file.", file=sys.stderr)
        sys.exit(1)
        
    print("Fetching RSS feed...")
    try:
        xml_data = fetch_rss_feed()
    except Exception as e:
        print(f"Error fetching RSS feed: {e}", file=sys.stderr)
        sys.exit(1)
        
    items = parse_rss(xml_data)
    if not items:
        print("No items found in RSS feed.")
        sys.exit(0)
        
    posted_links = get_posted_links()
    
    # Process the first unposted item
    target_item = None
    for item in items:
        if item["link"] not in posted_links:
            target_item = item
            break
            
    if not target_item:
        print("All latest items have already been posted.")
        sys.exit(0)
        
    print(f"Processing new article: {target_item['title']}")
    
    # Rewrite content using Gemini
    rewrite = rewrite_with_gemini(
        gemini_key, 
        target_item["title"], 
        target_item["description"], 
        target_item["link"]
    )
    
    if not rewrite:
        print("Failed to rewrite content using Gemini.")
        sys.exit(1)
        
    post_title = rewrite.get("title", target_item["title"])
    if len(post_title) > 80:
        post_title = post_title[:77] + "..."
    post_body = rewrite.get("body", target_item["description"])
    
    # Prepend image if available (Option 1)
    if target_item["image_url"]:
        post_body = f"![featured_image]({target_item['image_url']})\n\n" + post_body
        
    # Append attribution
    post_body += f"\n\n---\n*Sumber asli berita: [VentureBeat]({target_item['link']})*"
    
    # Post to Flarum
    success = post_to_flarum(post_title, post_body, TAG_ID)
    if success:
        save_posted_link(target_item["link"])
        print("Automation cycle completed successfully.")
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
