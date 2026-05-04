from ultralytics import YOLO
from PIL import Image
import numpy as np
import os

# ── Load model once when the module is imported ───────────────────────────────
# We use YOLOv8n (nano) — smallest and fastest version, good for a dev machine.
# It will auto-download on first run (~6MB).
#
# Later you can swap this with your own fine-tuned model:
#   MODEL_PATH = "model/weights/ui_yolo.pt"
#   _model = YOLO(MODEL_PATH)

MODEL_PATH = os.environ.get("YOLO_MODEL", "yolov8n.pt")
_model = YOLO(MODEL_PATH)

# ── UI error class names ──────────────────────────────────────────────────────
# These are the error types YOLOv8 will try to detect in a UI screenshot.
# When you fine-tune your own model on UI data, replace these with your labels.
UI_ERROR_CLASSES = {
    0:  "misaligned element",
    1:  "overflow text",
    2:  "broken layout",
    3:  "low contrast",
    4:  "missing icon",
    5:  "overlapping elements",
    6:  "cut-off content",
    7:  "inconsistent spacing",
}


def detect_errors(image: Image.Image, original_size: tuple) -> list:
    """
    Runs YOLOv8 on a PIL Image and returns bounding boxes for UI errors.

    Args:
        image         : PIL Image (RGB)
        original_size : (width, height) of the original screenshot
                        used to scale boxes back to original pixel coordinates

    Returns:
        list of dicts:
        [
            {
                "label":      "misaligned element",
                "confidence": 0.91,       <- 0.0 to 1.0
                "x":          120,         <- top-left x  (pixels, original size)
                "y":          45,          <- top-left y  (pixels, original size)
                "width":      200,         <- box width   (pixels)
                "height":     60           <- box height  (pixels)
            },
            ...
        ]
    """
    orig_w, orig_h = original_size

    # ── 1. Resize image to 640x640 for YOLO (standard input size) ────────────
    img_resized = image.resize((640, 640))
    img_array   = np.array(img_resized)

    # ── 2. Run inference ──────────────────────────────────────────────────────
    results = _model(img_array, verbose=False)

    # ── 3. Parse detections ───────────────────────────────────────────────────
    boxes = []

    for result in results:
        for box in result.boxes:
            # Raw box coords are in 640x640 space — scale back to original size
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            scale_x = orig_w / 640
            scale_y = orig_h / 640

            x      = int(x1 * scale_x)
            y      = int(y1 * scale_y)
            width  = int((x2 - x1) * scale_x)
            height = int((y2 - y1) * scale_y)

            confidence = round(float(box.conf[0]), 2)
            class_id   = int(box.cls[0])

            # Map class id to a UI error label
            # Falls back to the model's own class name if id not in our dict
            label = UI_ERROR_CLASSES.get(
                class_id,
                result.names.get(class_id, f"error_{class_id}")
            )

            # Only include detections above 40% confidence
            if confidence >= 0.40:
                boxes.append({
                    "label":      label,
                    "confidence": confidence,
                    "x":          x,
                    "y":          y,
                    "width":      width,
                    "height":     height
                })

    return boxes