import cv2, os

src_video = 'gemini_generated_video_b8b5924f.mp4'
desktop_out = 'nightfall-src/public/film/desktop'
mobile_out = 'nightfall-src/public/film/mobile'
dist_desktop_out = 'nightfall/film/desktop'
dist_mobile_out = 'nightfall/film/mobile'

for d in [desktop_out, mobile_out, dist_desktop_out, dist_mobile_out]:
    os.makedirs(d, exist_ok=True)

cap = cv2.VideoCapture(src_video)
source_frames = []
for f in range(43):
    cap.set(cv2.CAP_PROP_POS_FRAMES, f)
    ret, frame = cap.read()
    if ret:
        source_frames.append(frame)
cap.release()

print(f'Read {len(source_frames)} source walk frames')

TOTAL = 240
for i in range(TOTAL):
    t = i / float(TOTAL - 1)
    src_idx = t * (len(source_frames) - 1)
    idx1 = int(src_idx)
    idx2 = min(idx1 + 1, len(source_frames) - 1)
    alpha = src_idx - idx1

    if idx1 == idx2 or alpha < 1e-4:
        blended = source_frames[idx1]
    else:
        blended = cv2.addWeighted(source_frames[idx1], 1.0 - alpha, source_frames[idx2], alpha, 0.0)

    desktop_img = cv2.resize(blended, (1600, 900), interpolation=cv2.INTER_LANCZOS4)
    mobile_img = cv2.resize(blended, (960, 540), interpolation=cv2.INTER_AREA)

    fname = f'f_{i:04d}.webp'
    cv2.imwrite(os.path.join(desktop_out, fname), desktop_img, [cv2.IMWRITE_WEBP_QUALITY, 85])
    cv2.imwrite(os.path.join(dist_desktop_out, fname), desktop_img, [cv2.IMWRITE_WEBP_QUALITY, 85])
    cv2.imwrite(os.path.join(mobile_out, fname), mobile_img, [cv2.IMWRITE_WEBP_QUALITY, 80])
    cv2.imwrite(os.path.join(dist_mobile_out, fname), mobile_img, [cv2.IMWRITE_WEBP_QUALITY, 80])

print('Complete 240 frames generated!')
