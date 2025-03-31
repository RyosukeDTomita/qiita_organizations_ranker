FROM mcr.microsoft.com/devcontainers/base:bookworm AS devcontainers

WORKDIR /app

# install deno
RUN curl -fsSL https://deno.land/install.sh | sudo DENO_INSTALL=/usr/local sh

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "main.ts"]