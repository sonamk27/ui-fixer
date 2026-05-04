from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

# ── Load CLIP model once when the module is imported ─────────────────────────
# openai/clip-vit-base-patch32 is a good balance of speed and accuracy.
# Auto-downloads on first run (~600MB).
_clip_model     = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
_clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
_clip_model.eval()

# ── Text prompts used to score UI quality ─────────────────────────────────────
# CLIP compares the screenshot against these text descriptions.
# Higher similarity to "good" prompts = higher score.

GOOD_PROMPTS = [
    "a clean and well-designed user interface",
    "a professional and modern UI with good spacing",
    "a visually consistent and accessible web design",
    "a well-aligned and readable user interface",
    "a polished app screen with clear typography",
]

BAD_PROMPTS = [
    "a broken and poorly designed user interface",
    "a cluttered and hard to read UI",
    "a messy layout with overlapping elements",
    "a UI with bad contrast and poor readability",
    "a poorly aligned and inconsistent design",
]

# ── Suggestion templates based on score range ─────────────────────────────────
def _generate_suggestions(score: int, bad_similarities: list) -> list:
    suggestions = []

    if score < 40:
        suggestions.append("Major layout issues detected — review overall structure and alignment.")
    if score < 55:
        suggestions.append("Improve visual hierarchy by using consistent font sizes and weights.")
    if score < 70:
        suggestions.append("Check spacing between elements — use consistent padding and margins.")
    if bad_similarities[3] > 0.25:   # bad contrast prompt triggered
        suggestions.append("Increase color contrast between text and background for accessibility.")
    if bad_similarities[2] > 0.25:   # overlapping elements prompt triggered
        suggestions.append("Fix overlapping UI elements — ensure each component has enough space.")
    if bad_similarities[1] > 0.25:   # cluttered prompt triggered
        suggestions.append("Reduce visual clutter — remove unnecessary elements or group related ones.")
    if score >= 70:
        suggestions.append("Good overall design! Consider fine-tuning spacing and typography.")
    if score >= 85:
        suggestions.append("Excellent UI! Minor polish — check alignment on all screen sizes.")

    # Always include at least one suggestion
    if not suggestions:
        suggestions.append("UI looks good — consider testing with real users for feedback.")

    return suggestions[:4]   # return max 4 suggestions


def score_ui(image: Image.Image):
    """
    Uses CLIP to score UI quality by comparing the screenshot against
    good and bad UI description prompts.

    Args:
        image : PIL Image (RGB)

    Returns:
        (score: int 0-100, suggestions: list[str])
    """
    # ── 1. Prepare inputs ─────────────────────────────────────────────────────
    all_prompts = GOOD_PROMPTS + BAD_PROMPTS

    inputs = _clip_processor(
        text=all_prompts,
        images=image,
        return_tensors="pt",
        padding=True
    )

    # ── 2. Run CLIP inference ─────────────────────────────────────────────────
    with torch.no_grad():
        outputs    = _clip_model(**inputs)
        logits     = outputs.logits_per_image   # shape: (1, num_prompts)
        probs      = logits.softmax(dim=1)[0]   # normalize to probabilities

    # ── 3. Split good vs bad probabilities ───────────────────────────────────
    n_good = len(GOOD_PROMPTS)
    good_probs = probs[:n_good].tolist()
    bad_probs  = probs[n_good:].tolist()

    good_score = sum(good_probs) / len(good_probs)
    bad_score  = sum(bad_probs)  / len(bad_probs)

    # ── 4. Calculate final score (0-100) ─────────────────────────────────────
    # good_score high + bad_score low = high final score
    raw_score = (good_score - bad_score + 1) / 2   # normalize to 0-1
    score     = int(max(0, min(100, raw_score * 100)))

    # ── 5. Generate suggestions based on score and bad prompt similarities ────
    suggestions = _generate_suggestions(score, bad_probs)

    return score, suggestions