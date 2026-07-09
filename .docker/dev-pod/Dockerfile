# syntax=docker/dockerfile:1.7
#
# Build context is the repository root:
#   docker build -f .docker/dev-pod/Dockerfile .
#
# CLIツール類(mise/gh/starship/dprint/ghq/ripgrep/tmux/vim含む)や言語ランタイムは
# イメージに焼かない。dotfiles の yadm bootstrap が Home Manager 経由で
# ユーザーの PVC ホーム配下(~/.local, ~/.config/mise)に展開する
# (roppoh-dev-pod-plan.md 参照)。
# ここに残すのは (1) sshd コンテナ自体の起動に要るもの、(2) yadm bootstrap を
# 起動するための最小限(鶏卵依存)、(3) bootstrap 前でも Git 認証のたびに呼ばれる
# git-credential-github-app / gh-app-token の実行依存、(4) Nix 本体、の4種類のみ。
#
# Nix は /nix をコンテナ rootfs(イメージ)側に焼き込む。/nix は Pod 再作成のたびに
# 失われて構わないキャッシュではなく、initContainer が root 昇格(sudo)なしの
# uid 1000 で動くため、そもそも起動時に nix-installer を実行できない
# (sudo が無い runAsNonRoot + allowPrivilegeEscalation: false 環境)。
# そのためイメージビルド時に user ユーザーで single-user インストールしておく。

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
    xz-utils \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*

# ベースの ubuntu(uid 1000)を削除して user ユーザーを作る(HOME は PVC でマウントされる)
RUN userdel -r ubuntu 2>/dev/null; \
    useradd -m -u 1000 -s /usr/bin/zsh user

# user(uid 1000)が root 昇格なしで使える single-user Nix を /nix に焼き込む。
# /nix はビルドコンテキストの HOME(/home/user, PVC でマウントされる)とは
# 独立したパスなので、Pod 再作成後も常にこのイメージレイヤーの内容がそのまま使える。
# filter-syscalls = false は、コンテナビルド環境(kaniko/CI/QEMU エミュレーション等)で
# Nix のビルドサンドボックス用 seccomp フィルタが `unable to load seccomp BPF program`
# で失敗するのを避けるための既知の回避策。sandbox = false と合わせて runtime の
# home-manager rebuild にも引き続き適用される(同じ制約下で動くため)。
RUN mkdir -m 0755 /nix && chown user:user /nix \
    && mkdir -p /etc/nix \
    && printf 'sandbox = false\nfilter-syscalls = false\n' > /etc/nix/nix.conf
USER user
RUN curl -fsSL https://nixos.org/nix/install | sh -s -- --no-daemon
USER root

# single-user Nix のプロファイル($HOME/.nix-profile)は PVC でマスクされて実行時に
# 消えるため、nix 系 CLI を解決できるよう対策する:
#  (1) nix / nix-env / nix-store 等すべてを /usr/local/bin に通す。home-manager の
#      activation は $HOME/.nix-profile 生成前に nix-env を呼ぶため nix 単体では足りない。
#  (2) dotfiles bootstrap(dash, set -e)は起動時に nix プロファイルスクリプトを
#      `. /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh` で source する。
#      single-user --no-daemon 版にはこのファイルが無く、dash では「存在しないファイルの
#      source」が special-builtin エラーとなり `|| :` を待たずシェルが即終了する。
#      PATH を通す最小スクリプトを既定パスに置き、source を成功させる。
RUN NIXBIN="$(dirname "$(readlink -f /home/user/.nix-profile/bin/nix)")" \
    && ln -sf "$NIXBIN"/nix "$NIXBIN"/nix-* /usr/local/bin/ \
    && mkdir -p /nix/var/nix/profiles/default/etc/profile.d \
    && printf 'export PATH="%s${PATH:+:$PATH}"\n' "$NIXBIN" \
       > /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh

COPY .docker/dev-pod/files/sshd-dev-pod.conf /etc/ssh/sshd_config.d/dev-pod.conf
COPY --chmod=755 .docker/dev-pod/files/bin/ /usr/local/bin/

RUN mkdir -p /run/sshd /etc/ssh/authorized_keys /etc/ssh/keys
