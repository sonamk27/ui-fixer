import sys
import json
import numpy as np
from pathlib import Path
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms
import clip

UI_TYPES = [
    "login_page", "dashboard", "landing_page", "profile_page",
    "settings_page", "checkout_page", "onboarding_screen",
    "error_page", "home_screen", "form_page",
]

QUALITY_PROMPTS = {
    "visual_hierarchy": [
        "a UI with clear visual hierarchy and well-organized layout",
        "a UI with poor visual hierarchy and cluttered layout",
    ],
    "color_contrast": [
        "a UI with excellent color contrast and readable text",
        "a UI with poor color contrast and hard to read text",
    ],
    "whitespace": [
        "a UI with good whitespace and breathing room between elements",
        "a UI with no whitespace and cramped elements",
    ],
    "typography": [
        "a UI with consistent and readable typography",
        "a UI with inconsistent fonts and poor typography",
    ],
    "alignment": [
        "a UI with perfectly aligned elements and consistent grid",
        "a UI with misaligned elements and no consistent grid",
    ],
    "cta_clarity": [
        "a UI with clear and prominent call to action buttons",
        "a UI with unclear or hidden call to action buttons",
    ],
    "consistency": [
        "a UI with consistent design language and components",
        "a UI with inconsistent design and mixed styles",
    ],
    "accessibility": [
        "a UI that is accessible with proper labels and contrast",
        "a UI that is inaccessible with missing labels and low contrast",
    ],
}

SUGGESTIONS_MAP = {
    "visual_hierarchy": {
        "bad": [
            "Establish a clear visual hierarchy using size, weight, and color.",
            "Use headings (H1 → H2 → H3) consistently to guide the user's eye.",
        ],
    },
    "color_contrast": {
        "bad": [
            "Increase text-to-background contrast to at least 4.5:1 (WCAG AA).",
            "Avoid placing light gray text on white backgrounds.",
        ],
    },
    "whitespace": {
        "bad": [
            "Add more padding between sections to reduce visual clutter.",
            "Increase line-height for body text to improve readability.",
        ],
    },
    "typography": {
        "bad": [
            "Limit font families to 2 maximum for a cohesive look.",
            "Establish a clear type scale (12/14/16/20/24/32px).",
        ],
    },
    "alignment": {
        "bad": [
            "Use a 12-column grid to align elements consistently.",
            "Align text and UI components to a common baseline.",
        ],
    },
    "cta_clarity": {
        "bad": [
            "Make the primary CTA button larger and use a high-contrast color.",
            "Use action-oriented labels like 'Get Started' instead of 'Submit'.",
        ],
    },
    "consistency": {
        "bad": [
            "Use a design system or component library for consistent UI elements.",
            "Standardize button styles, border-radius, and shadow usage.",
        ],
    },
    "accessibility": {
        "bad": [
            "Add alt text to all images and icons.",
            "Ensure interactive elements have focus states.",
        ],
    },
}

SCORE_THRESHOLD = 0.55

mobilenet_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# ── Model loaders (cached) ────────────────────────────────────────────────────

_mobilenet = None
_clip_model = None
_clip_preprocess = None
_device = None

def _get_mobilenet():
    global _mobilenet
    if _mobilenet is None:
        _mobilenet = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
        _mobilenet.classifier[1] = nn.Linear(_mobilenet.last_channel, len(UI_TYPES))
        _mobilenet.eval()
    return _mobilenet

def _get_clip():
    global _clip_model, _clip_preprocess, _device
    if _clip_model is None:
        _device = "cuda" if torch.cuda.is_available() else "cpu"
        _clip_model, _clip_preprocess = clip.load("ViT-B/32", device=_device)
    return _clip_model, _clip_preprocess, _device


# ── Core functions ────────────────────────────────────────────────────────────

def classify_ui_type(image: Image.Image) -> dict:
    model = _get_mobilenet()
    tensor = mobilenet_transform(image).unsqueeze(0)
    with torch.no_grad():
        logits = model(tensor)
        probs  = torch.softmax(logits, dim=1)[0]
    top_idx    = int(torch.argmax(probs).item())
    confidence = float(probs[top_idx].item())
    return {"ui_type": UI_TYPES[top_idx], "confidence": round(confidence * 100, 2)}


def score_ui_quality(image: Image.Image) -> dict:
    model, preprocess, device = _get_clip()
    image_tensor = preprocess(image).unsqueeze(0).to(device)
    dimension_scores = {}
    suggestions = []
    errors = []

    with torch.no_grad():
        image_features = model.encode_image(image_tensor)
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)

        for dimension, prompts in QUALITY_PROMPTS.items():
            text_tokens   = clip.tokenize(prompts).to(device)
            text_features = model.encode_text(text_tokens)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)

            similarities = (image_features @ text_features.T).squeeze(0)
            probs        = torch.softmax(similarities * 100, dim=0)
            good_prob    = float(probs[0].item())
            score        = round(good_prob * 100, 2)
            dimension_scores[dimension] = score

            if good_prob < SCORE_THRESHOLD:
                tips = SUGGESTIONS_MAP[dimension]["bad"]
                suggestions.extend(tips)
                errors.append({
                    "dimension": dimension,
                    "score":     score,
                    "severity":  "high" if score < 40 else "medium",
                    "message":   f"{dimension.replace('_', ' ').title()} needs improvement (score: {score:.0f}/100)",
                })

    overall_score = round(float(np.mean(list(dimension_scores.values()))), 2)
    return {
        "overall_score":    overall_score,
        "dimension_scores": dimension_scores,
        "suggestions":      list(dict.fromkeys(suggestions)),
        "errors":           errors,
    }


def get_severity_label(score: float) -> str:
    if score >= 80: return "excellent"
    if score >= 60: return "good"
    if score >= 40: return "needs_improvement"
    return "poor"


# ── Public API ────────────────────────────────────────────────────────────────

def detect(image_path: str) -> dict:
    """Called from CLI: python detector.py image.jpg"""
    image             = Image.open(image_path).convert("RGB")
    ui_classification = classify_ui_type(image)
    quality_results   = score_ui_quality(image)

    return {
        "status":            "success",
        "image_path":        image_path,
        "ui_type":           ui_classification["ui_type"],
        "ui_type_confidence":ui_classification["confidence"],
        "overall_score":     quality_results["overall_score"],
        "severity":          get_severity_label(quality_results["overall_score"]),
        "dimension_scores":  quality_results["dimension_scores"],
        "errors":            quality_results["errors"],
        "suggestions":       quality_results["suggestions"],
    }


def detect_errors(image: Image.Image, original_size=None) -> list:
    """Called from app.py with a PIL Image — returns bounding box list."""
    quality_results = score_ui_quality(image)
    w, h = original_size if original_size else image.size

    boxes = []
    num_errors = len(quality_results["errors"])
    for i, err in enumerate(quality_results["errors"]):
        # Divide image into horizontal bands per error
        band_h = h // max(num_errors, 1)
        boxes.append({
            "label":      err["message"],
            "confidence": round(1 - (err["score"] / 100), 2),
            "x":          0,
            "y":          i * band_h,
            "width":      w,
            "height":     band_h,
        })
    return boxes


# ── CLI entry point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "Usage: python detector.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]
    if not Path(image_path).exists():
        print(json.dumps({"status": "error", "message": f"Image not found: {image_path}"}))
        sys.exit(1)

    try:
        output = detect(image_path)
        print(json.dumps(output, indent=2))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
        sys.exit(1)