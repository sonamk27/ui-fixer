from PIL import Image
import requests, base64, io

# Create a simple test image (white box)
img = Image.new('RGB', (400, 300), color=(255, 255, 255))
buf = io.BytesIO()
img.save(buf, format='PNG')
b64 = base64.b64encode(buf.getvalue()).decode()

# Send to backend
r = requests.post('http://127.0.0.1:5000/api/analyze', json={'image': b64})
print(r.json())