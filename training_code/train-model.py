from huggingface_hub import login
from datasets import load_dataset, concatenate_datasets, DatasetDict
from transformers import BeitForImageClassification, BeitFeatureExtractor, TrainingArguments, Trainer
import evaluate
import numpy as np
import torch
import os

login(os.getenv("HF_TOKEN"))

# Load base model & dataset
model_name = "microsoft/beit-base-patch16-224"
dataset_name = "owner/dataset_name"
dataset = load_dataset(dataset_name)

feature_extractor = BeitFeatureExtractor.from_pretrained(model_name)
num_labels = len(dataset["train"].features["label"].names)

model = BeitForImageClassification.from_pretrained(
    model_name,
    num_labels=num_labels,
    id2label={i: label for i, label in enumerate(dataset["train"].features["label"].names)},
    label2id={label: i for i, label in enumerate(dataset["train"].features["label"].names)},
    ignore_mismatched_sizes=True
)

# Convert to beit tensor
def transform(example):
    inputs = feature_extractor(images=example["image"], return_tensors="pt")
    return {"pixel_values": inputs["pixel_values"][0], "label": example["label"]}

encoded_dataset = dataset.map(transform, batched=False)

# Load training arguments (optimized for A100)
training_args = TrainingArguments(
    output_dir="./beit_finetuned",
    per_device_train_batch_size=64,
    per_device_eval_batch_size=64,
    gradient_accumulation_steps=1,
    num_train_epochs=5,
    learning_rate=3e-5,
    warmup_ratio=0.05,
    weight_decay=0.05,
    lr_scheduler_type="cosine",
    eval_strategy="epoch",
    save_strategy="epoch",
    save_total_limit=2,
    logging_dir="./logs",
    logging_steps=50,
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    bf16=True,
    dataloader_num_workers=8,
    seed=42,
)

accuracy_metric = evaluate.load("accuracy")

def compute_metrics(p):
    preds = np.argmax(p.predictions, axis=1)
    return accuracy_metric.compute(predictions=preds, references=p.label_ids)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=encoded_dataset["train"],
    eval_dataset=encoded_dataset["validation"],
    tokenizer=feature_extractor,
    compute_metrics=compute_metrics,
)

# Make sure you have a GPU
print(torch.cuda.is_available())
print(torch.cuda.get_device_name(0))

trainer.train()

results = trainer.evaluate(encoded_dataset["test"])
print("Test accuracy:", results["eval_accuracy"])