from huggingface_hub import HfApi

api = HfApi()

api.upload_folder(
    folder_path="path/to/folder",
    repo_id="repo_owner_repo",
    repo_type="model",
)