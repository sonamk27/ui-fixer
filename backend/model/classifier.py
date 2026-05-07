import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# ── UI type labels ────────────────────────────────────────────────────────────
# These are the UI screen types MobileNetV2 will classify into.
# If you fine-tune on your own dataset, update this list to match your classes.
UI_CLASSES = [
    "Login Screen",
    "Dashboard",
    "Form Page",
    "Landing Page",
    "Profile Page",
    "Settings Page",
    "Product Page",
    "Checkout Page",
    "Error Page",
    "Home Screen",
]

NUM_CLASSES = len(UI_CLASSES)

# ── Build MobileNetV2 model ───────────────────────────────────────────────────
def _build_model():
    # Load MobileNetV2 with ImageNet pretrained weights
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)

    # Replace the final classifier layer to match our number of UI classes
    # Original: (classifier): Linear(in_features=1280, out_features=1000)
    # Ours:     (classifier): Linear(in_features=1280, out_features=10)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, NUM_CLASSES)

    model.eval()
    
    # Try to load fine-tuned weights if available
    try:
        checkpoint_path = "model/fine_tuned_classifier_best.pth"
        if os.path.exists(checkpoint_path):
            checkpoint = torch.load(checkpoint_path, map_location='cpu')
            model.load_state_dict(checkpoint['model_state_dict'])
            print(f"Loaded fine-tuned weights from {checkpoint_path}")
        else:
            print("No fine-tuned weights found, using ImageNet pretrained weights")
    except Exception as e:
        print(f"Failed to load fine-tuned weights: {e}")
        print("Using ImageNet pretrained weights")
    
    return model

_model = _build_model()

# ── Image preprocessing pipeline ─────────────────────────────────────────────
# MobileNetV2 expects 224x224 RGB images normalized with ImageNet mean/std
_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],   # ImageNet mean
        std=[0.229, 0.224, 0.225]     # ImageNet std
    ),
])


def classify_ui(image: Image.Image) -> str:
    """
    Classifies a UI screenshot into one of the UI_CLASSES categories.

    Args:
        image : PIL Image (RGB)

    Returns:
        str — e.g. "Login Screen", "Dashboard", "Form Page" etc.

    Note:
        The model currently uses ImageNet pretrained weights, so predictions
        may not be accurate for UI screenshots until you fine-tune it on
        a UI screenshot dataset (e.g. Rico dataset or your own screenshots).
        See: https://interactionmining.org/rico
    """
    # ── 1. Preprocess ─────────────────────────────────────────────────────────
    tensor = _transform(image).unsqueeze(0)   # shape: (1, 3, 224, 224)

    # ── 2. Run inference ──────────────────────────────────────────────────────
    with torch.no_grad():
        outputs = _model(tensor)              # shape: (1, NUM_CLASSES)
        probs   = torch.softmax(outputs, dim=1)[0]
        top_idx = torch.argmax(probs).item()

    # ── 3. Return the label ───────────────────────────────────────────────────
    confidence = round(float(probs[top_idx]), 2)
    label      = UI_CLASSES[top_idx]

    # If confidence is very low, return a generic label
    if confidence < 0.3:
        return "Unknown Screen"

    return label