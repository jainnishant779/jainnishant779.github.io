import os
import cv2
from PIL import Image

video_path = 'gemini_generated_video_b8b5924f.mp4'
desktop_dir = 'nightfall-src/public/film/desktop'
mobile_dir = 'nightfall-src/public/film/mobile'

os.makedirs(desktop_dir, exist_ok=True)
os.makedirs(mobile_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)

print(f'Extracting {total_frames} frames from {video_path} (fps: {fps})...')

frame_idx = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Convert BGR (OpenCV) to RGB (PIL)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)
    
    # Desktop: 1600x900 (Lanczos upscale for crisp sharpness)
    desktop_img = pil_img.resize((1600, 900), Image.Resampling.LANCZOS)
    desktop_path = os.path.join(desktop_dir, f'f_{frame_idx:04d}.webp')
    desktop_img.save(desktop_path, 'WEBP', quality=85, method=4)
    
    # Mobile: 960x540
    mobile_img = pil_img.resize((960, 540), Image.Resampling.LANCZOS)
    mobile_path = os.path.join(mobile_dir, f'f_{frame_idx:04d}.webp')
    mobile_img.save(mobile_path, 'WEBP', quality=80, method=4)
    
    if frame_idx % 30 == 0 or frame_idx == total_frames - 1:
        print(f'Processed frame {frame_idx}/{total_frames - 1}')
    
    frame_idx += 1

cap.release()
print(f'Extracted {frame_idx} frames successfully into {desktop_dir} and {mobile_dir}.')
