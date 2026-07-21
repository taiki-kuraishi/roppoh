# roppoh

## Setup Instructions

### Prerequisites

- [mise](https://mise.jdx.dev/) - Development tool version manager
- [Docker](https://www.docker.com/) - Required for visual regression testing

### Installation

1. install dev tools

```sh
mise install
```

1. install project dependency

```sh
mise tasks run install
```

## Visual Regression Testing

Visual regression tests compare screenshots to detect UI changes. Since screenshot rendering differs between platforms (macOS vs Linux), we use Docker to generate consistent Linux screenshots for CI compatibility.

### Running VRT locally (macOS)

```sh
cd apps/neo-fujimatsu
bun run test:vrt
```

### Generating Linux screenshots for CI

Use Docker to generate Linux-compatible screenshots:

```sh
# Build and run Docker container to generate Linux screenshots
mise run test:vrt:update-screen-shots

# The screenshots will be saved to:
# apps/neo-fujimatsu/test/vrt/**/__screenshots__/*-linux.png
```

**Important:** After generating Linux screenshots, commit them to the repository so CI tests pass.
