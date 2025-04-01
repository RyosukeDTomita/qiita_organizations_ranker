FROM mcr.microsoft.com/devcontainers/base:bookworm AS devcontainers
WORKDIR /app
# install deno
RUN curl -fsSL https://deno.land/install.sh | sudo DENO_INSTALL=/usr/local sh


FROM devcontainers AS compile
COPY . .
WORKDIR /app/org_ranker
RUN deno compile --allow-net --allow-env --allow-read --output main main.ts


FROM gcr.io/distroless/cc-debian12:latest AS run
COPY --from=compile /app/org_ranker/main /app/main
ENTRYPOINT ["/app/main"]
