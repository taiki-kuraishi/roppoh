# syntax=docker/dockerfile:1.7
#
# Build context is the repository root:
#   docker build -f .docker/remote-dev/Dockerfile .
#
# 言語ランタイム(Claude Code 含む)はイメージに焼かない。dotfiles の
# mise/bootstrap がユーザーの PVC ホーム配下(~/.local, ~/.config/mise)に
# 展開する(roppoh-remote-dev-plan.md 参照)。

FROM ubuntu:24.04

ARG GHQ_VERSION=v1.7.1

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server \
    git \
    curl \
    ca-certificates \
    zsh \
    tmux \
    ripgrep \
    vim \
    yadm \
    jq \
    openssl \
    unzip \
    build-essential \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# mise: 公式 apt リポジトリ経由(自己更新 = イメージ再ビルドのたびに apt が最新を取得)
RUN install -dm 755 /etc/apt/keyrings \
    && curl -fsSL https://mise.jdx.dev/gpg-key.pub | gpg --dearmor -o /etc/apt/keyrings/mise-archive-keyring.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/mise-archive-keyring.gpg arch=amd64] https://mise.jdx.dev/deb stable main" \
    > /etc/apt/sources.list.d/mise.list \
    && apt-get update && apt-get install -y --no-install-recommends mise \
    && rm -rf /var/lib/apt/lists/*

# gh: GitHub 公式 apt リポジトリ経由(自己更新)
RUN install -dm 755 /etc/apt/keyrings \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y --no-install-recommends gh \
    && rm -rf /var/lib/apt/lists/*

# starship: 公式インストーラ(自己更新。バージョン固定なし = 常に最新を取得)
RUN curl -fsSL https://starship.rs/install.sh | sh -s -- --yes --bin-dir /usr/local/bin

# dprint: 公式インストーラ(第1引数はバージョンタグとして解釈されるため、
# インストール先の指定には DPRINT_INSTALL 環境変数を使う)
RUN curl -fsSL https://dprint.dev/install.sh -o /tmp/dprint-install.sh \
    && DPRINT_INSTALL=/usr/local/dprint sh /tmp/dprint-install.sh \
    && ln -s /usr/local/dprint/bin/dprint /usr/local/bin/dprint \
    && rm /tmp/dprint-install.sh

# ghq: GitHub リリースの linux_amd64 バイナリを直接取得(バージョン固定。Renovate が
# renovate.json の customManagers 経由で GHQ_VERSION を追従する)
RUN curl -fsSL -o /tmp/ghq.zip \
    "https://github.com/x-motemen/ghq/releases/download/${GHQ_VERSION}/ghq_linux_amd64.zip" \
    && unzip -j /tmp/ghq.zip "*/ghq" -d /usr/local/bin \
    && chmod +x /usr/local/bin/ghq \
    && rm /tmp/ghq.zip

# ベースの ubuntu(uid 1000)を削除して dev ユーザーを作る(HOME は PVC でマウントされる)
RUN userdel -r ubuntu 2>/dev/null; \
    useradd -m -u 1000 -s /usr/bin/zsh dev

COPY .docker/remote-dev/files/sshd-remote-dev.conf /etc/ssh/sshd_config.d/remote-dev.conf
COPY .docker/remote-dev/files/gh-app-token /usr/local/bin/gh-app-token
COPY .docker/remote-dev/files/git-credential-github-app /usr/local/bin/git-credential-github-app
COPY .docker/remote-dev/files/remote-dev-init /usr/local/bin/remote-dev-init
COPY .docker/remote-dev/files/remote-dev-claude /usr/local/bin/remote-dev-claude

RUN chmod 755 \
    /usr/local/bin/gh-app-token \
    /usr/local/bin/git-credential-github-app \
    /usr/local/bin/remote-dev-init \
    /usr/local/bin/remote-dev-claude \
    && mkdir -p /run/sshd /etc/ssh/authorized_keys /etc/ssh/keys
