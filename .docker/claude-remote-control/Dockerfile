# syntax=docker/dockerfile:1.7
#
# Build context is the repository root:
#   docker build -f .docker/claude-remote-control/Dockerfile .
#
# CLIツール類(mise/gh/starship/dprint/ghq/ripgrep/tmux/vim含む)や言語ランタイムは
# イメージに焼かない。dotfiles の yadm bootstrap が Nix + Home Manager 経由で
# ユーザーの PVC ホーム配下(~/.local, ~/.config/mise, /nix)に展開する
# (roppoh-claude-remote-control-plan.md 参照)。
# ここに残すのは (1) sshd コンテナ自体の起動に要るもの、(2) yadm bootstrap を
# 起動するための最小限(鶏卵依存)、(3) bootstrap 前でも Git 認証のたびに呼ばれる
# git-credential-github-app / gh-app-token の実行依存、の3種類のみ。

FROM ubuntu:24.04

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server \
    git \
    curl \
    ca-certificates \
    zsh \
    yadm \
    jq \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# ベースの ubuntu(uid 1000)を削除して claude ユーザーを作る(HOME は PVC でマウントされる)
RUN userdel -r ubuntu 2>/dev/null; \
    useradd -m -u 1000 -s /usr/bin/zsh claude

COPY .docker/claude-remote-control/files/sshd-claude-remote-control.conf /etc/ssh/sshd_config.d/claude-remote-control.conf
COPY --chmod=755 .docker/claude-remote-control/files/bin/ /usr/local/bin/

RUN mkdir -p /run/sshd /etc/ssh/authorized_keys /etc/ssh/keys
