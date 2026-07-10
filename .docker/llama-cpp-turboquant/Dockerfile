# syntax=docker/dockerfile:1.7
#
# TurboQuant(FWHT回転 + Trellis-Coded Quantizationによる KV キャッシュ圧縮、
# -ctk/-ctv turbo3_tcq 等)は本家 llama.cpp に未マージ(PR #21089 オープン中)のため、
# 非公式フォーク spiritbuun/buun-llama-cpp からビルドした llama-server バイナリを
# 本番と同じ llama-swap ベースイメージに差し替える。
# ("highly experimental... Use at your own discretion" と README に明記された
# 個人開発フォークである点に留意。spiritbuun/llama-cpp-turboquant-cuda という
# 旧リポジトリ名・feature/turboquant-kv-cache という旧ブランチ名は既に
# spiritbuun/buun-llama-cpp・master へ改編済み。追随時は git ls-remote 等で
# 実在を都度確認してから FORK_REF を書き換えること。)
#
# Build context is the repository root:
#   docker build -f .docker/llama-cpp-turboquant/Dockerfile \
#     --build-arg FORK_REF=<pinned-commit-sha> .

ARG CUDA_VERSION=12.4.1
ARG UBUNTU_VERSION=22.04
# 本番 k8s/llama-cpp と同一バージョンに揃え、KV キャッシュ量子化方式以外の
# 変数(llama-swap/llama.cpp のビルド差)が比較検証に混ざらないようにする。
ARG LLAMA_SWAP_TAG=v235-cuda-b9870
# RTX 3050(Ampere, GA10x)は compute capability 8.6
ARG CUDA_ARCHITECTURES=86
ARG FORK_REPO=https://github.com/spiritbuun/buun-llama-cpp.git
ARG FORK_BRANCH=master
# pin 済み commit SHA。既定値なし(CronWorkflow の build-arg で都度注入する。
# フォーク側の無審査な追随ビルドを避けるため一点管理とする)。
ARG FORK_REF

FROM nvidia/cuda:${CUDA_VERSION}-devel-ubuntu${UBUNTU_VERSION} AS build
ARG FORK_REPO
ARG FORK_BRANCH
ARG FORK_REF
ARG CUDA_ARCHITECTURES

RUN apt-get update && apt-get install -y --no-install-recommends \
    git cmake build-essential ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN git clone "${FORK_REPO}" /src \
    && cd /src \
    && git fetch origin "${FORK_BRANCH}" \
    && git checkout "${FORK_REF}"

WORKDIR /src

# フォーク README 記載のビルドコマンドをベースにしつつ、CI(kaniko)ビルド環境向けに
# 2点調整する:
#   - GGML_NATIVE=OFF: README は ON を推奨しているが、それはビルド機=実行機が
#     同一であることが前提。kaniko の CI Pod は実機(z390/i5-9600K)と別ハード
#     ウェアの可能性が高く、ON のままだとビルド機の方が新しい命令セットを
#     持つ場合に実機で Illegal instruction を起こしうる。CUDA_ARCHITECTURES を
#     明示指定している既存方針と同じ理由で明示的に OFF にする。
#   - --target llama-server: README は全体ビルドだが、必要な成果物のみに絞り
#     CI のビルド時間を短縮する。
RUN cmake -B build \
      -DGGML_CUDA=ON \
      -DGGML_NATIVE=OFF \
      -DGGML_CUDA_FA=ON \
      -DGGML_CUDA_FA_ALL_QUANTS=ON \
      -DCMAKE_CUDA_ARCHITECTURES=${CUDA_ARCHITECTURES} \
      -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build --target llama-server -j"$(nproc)"

FROM ghcr.io/mostlygeek/llama-swap:${LLAMA_SWAP_TAG}
COPY --chmod=755 --from=build /src/build/bin/llama-server /app/llama-server
