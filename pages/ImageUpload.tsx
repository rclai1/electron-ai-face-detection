import { useState, ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Upload,
  Image,
  Loader2,
  AlertCircle,
  CheckCircle,
  Settings,
} from "lucide-react";
import { ModelResponse } from "@/data/ModelResponse";

interface InferenceParams {
  imageUrl: string;
  apiToken: string;
  //modelId: string;
}

async function runInference({
  imageUrl,
  apiToken,
}: InferenceParams): Promise<ModelResponse[]> {
  //const modelId = "microsoft/resnet-50";

  const response = await fetch(
    `https://aop9zs4wjj3yvkmh.us-east-1.aws.endpoints.huggingface.cloud/`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: imageUrl,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

interface ImageUploadComponentProps {
  apiToken: string;
  modelId: string;
}

export default function ImageUpload({
  apiToken,
  modelId,
}: ImageUploadComponentProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // React Query mutation
  const mutation = useMutation({
    mutationFn: runInference,
    onSuccess: (data) => {
      console.log("Success:", data);
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      mutation.reset();

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedImage || !apiToken || !modelId) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extract base64 string without the data URL prefix
        const dataUrl = reader.result as string;
        mutation.mutate({ imageUrl: dataUrl, apiToken });
      };
      reader.readAsDataURL(selectedImage);
    } catch (err) {
      console.error("Error reading file:", err);
    }
  };

  const handleSnippingTool = async () => {
    if (window.electron) {
      const result = await window.electron.openSnippingTool();
      if (result.success && result.dataUrl) {
        // Set the image preview and clear any previously selected file
        setImagePreview(result.dataUrl);
        setSelectedImage(null);
        mutation.mutate({ imageUrl: result.dataUrl, apiToken });
        console.log("Screenshot captured successfully");
      } else {
        console.error("Failed to capture screenshot:", result.error);
      }
    }
  };

  const results = mutation.data || [];
  const topResult = results[0];

  return (
    <div className="min-h-screen bg-gray-50 p-8 min-w-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6"></div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Is your face AI?
            </h1>
            <p className="text-gray-600 mt-2">Upload an image to find out!</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6"></div>
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Click to upload an image</p>
                      <p className="text-sm text-gray-400 mt-1">
                        PNG, JPG, GIF, WebP
                      </p>
                    </label>
                  </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="flex justify-center items-center">
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm w-64 h-64">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="flex w-64 h-64 object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!selectedImage || mutation.isPending}
                  className="w-full bg-green-400 text-white py-3 rounded-lg font-medium hover:bg-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Image className="w-5 h-5" />
                      Process Face
                    </>
                  )}
                </button>
                <button
                  className="w-full bg-green-400 text-white py-3 rounded-lg font-medium hover:bg-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  onClick={handleSnippingTool}
                >
                  Snipping Tool
                </button>
              </div>

              {/* Error Display */}
              {mutation.isError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">Error:</h3>
                    <p className="text-red-700 text-sm">
                      {mutation.error instanceof Error
                        ? mutation.error.message
                        : "An error occurred"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Results</h2>

              {mutation.isPending && (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                </div>
              )}

              {mutation.isSuccess && mutation.data.length > 0 && (
                <div className="space-y-6">
                  {/* <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6">
                      <p className="text-sm text-gray-600 mb-1">Most Likely:</p>
                      <h3 className="text-3xl font-bold text-gray-800">
                        {topResult?.label}
                      </h3>
                      <p className="text-lg text-gray-600 mt-1">
                        {(topResult?.score * 100).toFixed(1)}% confidence
                      </p>
                    </div> */}
                  <div
                    className={`bg-gradient-to-r border-2 rounded-lg p-6 ${
                      topResult?.label.toLowerCase() === "fake"
                        ? "from-red-50 to-red-100 border-red-300"
                        : "from-green-50 to-green-100 border-green-300"
                    }`}
                  >
                    <p className="text-sm text-gray-600 mb-1">Most Likely:</p>
                    <h3 className="text-3xl font-bold text-gray-800">
                      {topResult?.label}
                    </h3>
                    <p className="text-lg text-gray-600 mt-1">
                      {(topResult?.score * 100).toFixed(1)}% confidence
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">
                      Detailed Results:
                    </p>
                    {results.map((entry, index) => (
                      <div key={entry.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{entry.label}</span>
                          <span className="font-medium text-gray-700">
                            {Math.trunc(entry.score * 100) / 100}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              entry.label.toLowerCase() === "fake"
                                ? "bg-red-500"
                                : index === 0
                                ? "bg-green-500"
                                : "bg-blue-400"
                            }`}
                            style={{ width: `${entry.score * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!mutation.isPending &&
                !mutation.isError &&
                !mutation.isSuccess && (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <p>Upload an image to see results</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
