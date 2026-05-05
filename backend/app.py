from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import traceback
from PIL import Image

from model.classifier import classify_ui
from model.scorer     import score_ui
from model.detector   import detect_errors

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Helper ────────────────────────────────────────────────────────────────────

def decode_image(data_uri: str) -> Image.Image:
    if data_uri.startswith("data:"):
        header, encoded = data_uri.split(",", 1)
    else:
        encoded = data_uri
    image_bytes = base64.b64decode(encoded)
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "UI-Fixer backend is running"})


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    if "image" not in data or not data["image"]:
        return jsonify({"error": "Missing 'image' field in request body"}), 400

    try:
        image = decode_image(data["image"])
    except Exception as e:
        return jsonify({"error": f"Failed to decode image: {str(e)}"}), 422

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


@app.route("/api/analyze/upload", methods=["POST"])
def analyze_upload():
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
    app.run(host="127.0.0.1", port=5001, debug=True)