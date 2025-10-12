#!/bin/bash

#SBATCH -n 1
#SBATCH --cpus-per-task=2
#SBATCH --mem=30g
#SBATCH -t 02:00:00
#SBATCH -p a100-gpu
#SBATCH --qos=gpu_access
#SBATCH --gres=gpu:1
#SBATCH --mail-type=begin,end,fail
#SBATCH --mail-user=kevpeng@unc.edu

module load cuda/12.9
module load datasets

python train-model.py