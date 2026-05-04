import sys
import numpy as np
import cv2
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

model = MobileNetV2(weights='imagenet', include_top=False)

image_path = sys.argv[1]

img = cv2.imread(image_path)
img = cv2.resize(img, (224, 224))
img = preprocess_input(img)
img = np.expand_dims(img, axis=0)

features = model.predict(img)

score = float(np.mean(features))
score = max(0, min(100, score * 100))

print(score)