from transformers import pipeline
from PIL import Image
import base64
import io
from typing import Dict, List, Any

class EndpointHandler():
    def __init__(self, path=""): # Load model
        self.classifier = pipeline("image-classification", model="model_owner/model")

    def __call__(self, data: Dict[str, Any]) -> List[Dict[str, float]]:
        """
        Args:
            data (Dict[str, Any]):
                Dictionary containing "inputs" key with image base64 url as value
        Return:
            A list of dictionaries containing:
                - "label": A string representing the class (e.g., "real" or "fake")
                - "score": A float between 0 and 1 for confidence
        """
        # Extract URL
        data_url = data.get("inputs", data)
        encoded_data = data_url.split(',')[1]
        decoded_data = base64.b64decode(encoded_data)
        image = Image.open(io.BytesIO(decoded_data))

        results = self.classifier(image)
        return results
    
handler = EndpointHandler()
result = handler({"input": "base64url"})
print(result)

