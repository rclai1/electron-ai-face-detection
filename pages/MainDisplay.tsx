import ImageUpload from "./ImageUpload";

export default function MainDisplay() {
  const API_TOKEN = process.env.NEXT_PUBLIC_HF_API_TOKEN || "";
  const MODEL_ID = process.env.NEXT_PUBLIC_HF_MODEL_ID || "";

  return (
    <div>
      <ImageUpload apiToken={API_TOKEN} modelId={MODEL_ID} />
    </div>
  );
}
