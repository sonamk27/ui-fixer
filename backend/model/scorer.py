import numpy as np
from PIL import Image, ImageFilter
import colorsys

SUGGESTIONS_MAP = {
    "color_contrast":   "Increase text-to-background contrast to at least 4.5:1 (WCAG AA).",
    "whitespace":       "Add more padding between sections to reduce visual clutter.",
    "color_variety":    "Use a more distinct color palette to improve visual interest.",
    "edge_clarity":     "Improve element boundaries and separation for better readability.",
    "brightness":       "Adjust overall brightness for better readability and accessibility.",
    "visual_balance":   "Balance the visual weight across different sections of the UI.",
    "color_harmony":    "Use a consistent color scheme with complementary colors.",
    "simplicity":       "Reduce visual complexity to improve user focus and clarity.",
}

SCORE_THRESHOLD = 55


def _analyze_image_properties(image: Image.Image) -> dict:
    """
    Analyze actual image pixel properties to derive meaningful scores.
    Each dimension is based on real image characteristics.
    """
    # Resize for faster processing
    img_small = image.resize((256, 256))
    img_array = np.array(img_small).astype(float)

    # ── 1. Color contrast (std deviation of pixel values) ──────────────────
    gray = np.mean(img_array, axis=2)
    contrast_score = min(100, float(np.std(gray)) * 2.5)

    # ── 2. Whitespace (percentage of near-white pixels) ────────────────────
    white_mask = np.all(img_array > 220, axis=2)
    white_ratio = float(np.mean(white_mask))
    # Good whitespace = 15-40% white pixels
    if 0.15 <= white_ratio <= 0.40:
        whitespace_score = 75 + white_ratio * 50
    elif white_ratio < 0.15:
        whitespace_score = white_ratio * 400  # too little whitespace
    else:
        whitespace_score = max(40, 100 - (white_ratio - 0.40) * 200)
    whitespace_score = min(100, max(20, whitespace_score))

    # ── 3. Color variety (number of distinct hue ranges) ───────────────────
    r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
    hues = []
    for i in range(0, 256, 8):
        for j in range(0, 256, 8):
            rv, gv, bv = r[i,j]/255, g[i,j]/255, b[i,j]/255
            h, s, v = colorsys.rgb_to_hsv(rv, gv, bv)
            if s > 0.2:  # only count saturated colors
                hues.append(int(h * 12))  # 12 hue buckets
    unique_hues = len(set(hues))
    # Good UI = 2-5 distinct hues
    if 2 <= unique_hues <= 5:
        color_variety_score = 70 + unique_hues * 5
    elif unique_hues < 2:
        color_variety_score = 40 + unique_hues * 15
    else:
        color_variety_score = max(45, 95 - (unique_hues - 5) * 8)
    color_variety_score = min(100, max(20, color_variety_score))

    # ── 4. Edge clarity (edge density from sobel-like filter) ──────────────
    img_pil_gray = img_small.convert('L')
    edges = img_pil_gray.filter(ImageFilter.FIND_EDGES)
    edge_array = np.array(edges).astype(float)
    edge_density = float(np.mean(edge_array)) / 255.0
    # Good UI = moderate edge density (clear elements but not cluttered)
    if 0.05 <= edge_density <= 0.20:
        edge_score = 70 + edge_density * 150
    elif edge_density < 0.05:
        edge_score = edge_density * 800  # too few edges = boring
    else:
        edge_score = max(40, 95 - (edge_density - 0.20) * 200)
    edge_score = min(100, max(20, edge_score))

    # ── 5. Brightness (mean luminance — should be moderate) ────────────────
    luminance = float(np.mean(gray)) / 255.0
    if 0.3 <= luminance <= 0.75:
        brightness_score = 75 + (1 - abs(luminance - 0.525) * 4) * 25
    else:
        brightness_score = max(30, 60 - abs(luminance - 0.525) * 100)
    brightness_score = min(100, max(20, brightness_score))

    # ── 6. Visual balance (left vs right half similarity) ──────────────────
    left_half  = gray[:, :128]
    right_half = gray[:, 128:]
    balance_diff = abs(float(np.mean(left_half)) - float(np.mean(right_half)))
    balance_score = max(30, 100 - balance_diff * 2)

    # ── 7. Color harmony (hue spread evenness) ─────────────────────────────
    if len(hues) > 0:
        hue_std = float(np.std(hues)) if len(hues) > 1 else 0
        harmony_score = min(100, max(30, 80 - abs(hue_std - 3) * 5))
    else:
        harmony_score = 50

    # ── 8. Simplicity (inverse of visual complexity) ───────────────────────
    complexity = edge_density * 100 + float(np.std(img_array)) / 5
    simplicity_score = max(20, min(100, 100 - complexity * 0.8))

    return {
        "color_contrast":  round(contrast_score, 1),
        "whitespace":      round(whitespace_score, 1),
        "color_variety":   round(color_variety_score, 1),
        "edge_clarity":    round(edge_score, 1),
        "brightness":      round(brightness_score, 1),
        "visual_balance":  round(balance_score, 1),
        "color_harmony":   round(harmony_score, 1),
        "simplicity":      round(simplicity_score, 1),
    }


def score_ui(image: Image.Image):
    """
    Takes a PIL Image.
    Returns (score: int, suggestions: list[str])
    """
    props = _analyze_image_properties(image)
    suggestions = []

    for dimension, score in props.items():
        if score < SCORE_THRESHOLD:
            suggestions.append(SUGGESTIONS_MAP.get(dimension, f"Improve {dimension.replace('_', ' ')}."))

    overall_score = int(round(float(np.mean(list(props.values())))))
    return overall_score, suggestions