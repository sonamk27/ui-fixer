# scoring_engine.py

from PIL import Image
import pytesseract
import anthropic
import json

class UIScoringEngine:

    def analyze(self, image_path: str) -> dict:
        image = Image.open(image_path)

        # Step 1 — Rule-based checks (fast, deterministic)
        contrast_result  = self.check_contrast(image)
        typography_result = self.check_typography(image)

        # Step 2 — LLM scores the rest (subjective categories)
        llm_result = self.llm_score(image_path, {
            "contrast_data": contrast_result["data"],
            "typography_data": typography_result["data"]
        })

        # Step 3 — Merge and calculate final score
        return self.merge_scores(contrast_result, typography_result, llm_result)


    def check_contrast(self, image: Image) -> dict:
        """Extract dominant color pairs and check WCAG contrast ratio"""
        # Sample pixels from likely text regions
        pixels = list(image.getdata())
        # ... color extraction logic
        ratio = self.wcag_contrast_ratio(fg_color, bg_color)

        score = 100 if ratio >= 7 else (80 if ratio >= 4.5 else 50 if ratio >= 3 else 20)
        return {
            "score": score,
            "data": {"ratio": ratio, "passes_aa": ratio >= 4.5},
            "issues": [] if ratio >= 4.5 else [f"Contrast ratio {ratio:.1f}:1 fails WCAG AA (need 4.5:1)"]
        }

    def wcag_contrast_ratio(self, c1, c2) -> float:
        """Standard WCAG 2.1 contrast formula"""
        def luminance(c):
            r, g, b = [x/255 for x in c[:3]]
            r, g, b = [(x/12.92 if x <= 0.03928 else ((x+0.055)/1.055)**2.4) for x in [r,g,b]]
            return 0.2126*r + 0.7152*g + 0.0722*b
        l1, l2 = luminance(c1), luminance(c2)
        bright, dark = max(l1,l2), min(l1,l2)
        return (bright + 0.05) / (dark + 0.05)

    def check_typography(self, image: Image) -> dict:
        """Use OCR to detect font sizes and hierarchy"""
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        heights = [h for h in data['height'] if h > 0]

        issues = []
        score = 100

        if heights:
            min_size = min(heights)
            if min_size < 12:
                issues.append(f"Text as small as {min_size}px detected — below 12px minimum")
                score -= 30

            unique_sizes = len(set([round(h/4)*4 for h in heights]))
            if unique_sizes > 5:
                issues.append(f"{unique_sizes} different font sizes — too many, use max 3-4")
                score -= 20

        return {"score": max(score, 0), "data": {"min_size": min(heights) if heights else 0}, "issues": issues}


    def llm_score(self, image_path: str, rule_data: dict) -> dict:
        """Send image + rule data to Vision LLM for subjective scoring"""
        client = anthropic.Anthropic()

        with open(image_path, "rb") as f:
            image_data = f.read()
            import base64
            b64 = base64.standard_b64encode(image_data).decode()

        prompt = f"""
You are an expert UI/UX reviewer. Analyze this screenshot.

I have already measured these objective metrics:
- Contrast ratio: {rule_data['contrast_data']['ratio']:.2f}:1
- Min font size detected: {rule_data['typography_data']['min_size']}px

Now score ONLY these 4 categories based on what you visually see:

Return ONLY valid JSON, no explanation:
{{
  "layout_spacing": {{
    "score": <0-100>,
    "issues": ["specific issue 1", "specific issue 2"]
  }},
  "accessibility": {{
    "score": <0-100>,
    "issues": ["specific issue 1"]
  }},
  "mobile_friendliness": {{
    "score": <0-100>,
    "issues": ["specific issue 1"]
  }},
  "visual_consistency": {{
    "score": <0-100>,
    "issues": ["specific issue 1"]
  }},
  "summary": "2-3 sentence plain English summary of the biggest problems"
}}

Be specific — mention actual UI elements, not generic advice.
"""
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": b64}},
                    {"type": "text", "text": prompt}
                ]
            }]
        )

        return json.loads(response.content[0].text)


    def merge_scores(self, contrast, typography, llm) -> dict:
        """Weighted final score"""
        weights = {
            "color_contrast":     0.20,
            "typography":         0.15,
            "layout_spacing":     0.20,
            "accessibility":      0.25,
            "mobile_friendliness":0.10,
            "visual_consistency": 0.10,
        }

        categories = {
            "color_contrast":      {"score": contrast["score"],          "issues": contrast["issues"]},
            "typography":          {"score": typography["score"],         "issues": typography["issues"]},
            "layout_spacing":      {"score": llm["layout_spacing"]["score"],       "issues": llm["layout_spacing"]["issues"]},
            "accessibility":       {"score": llm["accessibility"]["score"],        "issues": llm["accessibility"]["issues"]},
            "mobile_friendliness": {"score": llm["mobile_friendliness"]["score"],  "issues": llm["mobile_friendliness"]["issues"]},
            "visual_consistency":  {"score": llm["visual_consistency"]["score"],   "issues": llm["visual_consistency"]["issues"]},
        }

        overall = sum(categories[k]["score"] * weights[k] for k in weights)

        all_issues = []
        for cat, data in categories.items():
            for issue in data["issues"]:
                all_issues.append({"category": cat, "description": issue,
                                   "severity": "critical" if data["score"] < 50 else "warning" if data["score"] < 75 else "pass"})

        return {
            "overall_score": round(overall),
            "categories": categories,
            "top_issues": sorted(all_issues, key=lambda x: {"critical":0,"warning":1,"pass":2}[x["severity"]]),
            "summary": llm["summary"]
        }