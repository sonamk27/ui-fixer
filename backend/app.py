from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import traceback
from PIL import Image

# ── Import your three model modules (create these next) ──────────────────────
from model.classifier import classify_ui       # MobileNetV2  → UI type label
from model.scorer     import score_ui          # CLIP / ViT   → score + suggestions
from model.detector   import detect_errors     # YOLOv8       → bounding boxes

app = Flask(__name__)

# Allow requests from your React dev server (localhost:5173 for Vite)
# In production replace "*" with your actual domain
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Helper ────────────────────────────────────────────────────────────────────

def decode_image(data_uri: str) -> Image.Image:
    """
    Accepts either:
      - a base64 data URI:  "data:image/png;base64,iVBORw0KGgo..."
      - raw base64 string:  "iVBORw0KGgo..."
    Returns a PIL Image in RGB mode.
    """
    if data_uri.startswith("data:"):
        # Strip the "data:image/png;base64," prefix
        header, encoded = data_uri.split(",", 1)
    else:
        encoded = data_uri

    image_bytes = base64.b64decode(encoded)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return image


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    """Quick ping to check the server is running."""
    return jsonify({"status": "ok", "message": "UI-Fixer backend is running"})


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """
    Main endpoint called by UploadSection.jsx / Dashboard.jsx in React.

    Expected request body (JSON):
    {
        "image": "<base64 encoded screenshot>"   ← required
    }

    Returns:
    {
        "type":        "Login Screen",           ← from MobileNetV2
        "score":       78,                       ← 0-100 from CLIP/ViT
        "suggestions": ["Increase contrast ...", "Align button ..."],
        "boxes": [                               ← from YOLOv8
            {
                "label":      "misaligned element",
                "confidence": 0.91,
                "x":          120,   ← top-left x (pixels)
                "y":          45,    ← top-left y (pixels)
                "width":      200,
                "height":     60
            }
        ]
    }
    """
    # ── 1. Validate request ───────────────────────────────────────────────────
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    if "image" not in data or not data["image"]:
        return jsonify({"error": "Missing 'image' field in request body"}), 400

    # ── 2. Decode the screenshot ──────────────────────────────────────────────
    try:
        image = decode_image(data["image"])
    except Exception as e:
        return jsonify({"error": f"Failed to decode image: {str(e)}"}), 422

    original_size = image.size   # (width, height) — needed to scale YOLO boxes

    # ── 3. Run the three models in sequence ───────────────────────────────────
    try:
        ui_type     = classify_ui(image)           # str
        score, tips = score_ui(image)              # int, list[str]
        boxes       = detect_errors(image,
                                    original_size) # list[dict]
    except Exception:
        # Log the full traceback server-side, return a clean error to the client
        traceback.print_exc()
        return jsonify({"error": "Model inference failed. Check server logs."}), 500

    # ── 4. Return results ─────────────────────────────────────────────────────
    return jsonify({
        "type":        ui_type,
        "score":       score,
        "suggestions": tips,
        "boxes":       boxes
    })


# ── Optional: accept file upload instead of base64 ───────────────────────────

@app.route("/api/analyze/upload", methods=["POST"])
def analyze_upload():
    """
    Alternative endpoint — accepts multipart/form-data file upload.
    Useful for testing with Postman / curl.

    curl -X POST http://localhost:5000/api/analyze/upload \
         -F "file=@screenshot.png"
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        image = Image.open(file.stream).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Cannot open image: {str(e)}"}), 422

    original_size = image.size

    try:
        ui_type     = classify_ui(image)
        score, tips = score_ui(image)
        boxes       = detect_errors(image, original_size)
    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Model inference failed. Check server logs."}), 500

    return jsonify({
        "type":        ui_type,
        "score":       score,
        "suggestions": tips,
        "boxes":       boxes
    })


# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # debug=True → auto-reloads on code change (dev only, never in production)
    app.run(host="127.0.0.1", port=5000, debug=True)