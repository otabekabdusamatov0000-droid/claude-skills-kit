"""Generates narration clips with ElevenLabs TTS. Key is read from env ELEVEN_KEY (never stored)."""
import json, os, sys, urllib.request

KEY = os.environ["ELEVEN_KEY"]
VOICE = "cgSgspJ2msm6clMCkdW9"  # Jessica - playful, bright, warm
LINES = {
    "intro": "Hello, little friends! Let's learn our colors together!",
    "red": "Red, red, red! Here is a round red apple. Hello, red apple! Hi, hi, hi!",
    "orange": "Orange, orange, orange! Here is a juicy orange. Hello, orange! Wave, wave, wave!",
    "yellow": "Yellow, yellow, yellow! Here is a sunny lemon. Hello, lemon! Smile, smile, smile!",
    "green": "Green, green, green! Here is a happy green leaf. Hello, leaf! Dance, dance, dance!",
    "blue": "Blue, blue, blue! Here is a little blueberry. Hello, blueberry! Bounce, bounce, bounce!",
    "purple": "Purple, purple, purple! Here are sweet purple grapes. Hello, grapes! Yum, yum, yum!",
    "r_red": "Red!", "r_orange": "Orange!", "r_yellow": "Yellow!",
    "r_green": "Green!", "r_blue": "Blue!", "r_purple": "Purple!",
    "outro": "Red, orange, yellow, green, blue, purple! We learned our colors! Goodbye, friends!",
}
for name, text in LINES.items():
    body = json.dumps({"text": text, "model_id": "eleven_multilingual_v2",
                       "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.35}}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
                                 data=body, headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r, open(f"public/voice/{name}.mp3", "wb") as f:
        f.write(r.read())
    print("ok", name, flush=True)
