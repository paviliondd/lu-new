# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS libvips-builder

ARG LIBVIPS_VERSION=8.18.3
ARG LIBVIPS_SHA256=f41285b61bfb495605494f074ca341f7791a1d406e2f157dcea606ef1ae1b146

ENV DEBIAN_FRONTEND=noninteractive
ENV CFLAGS="-O2 -march=x86-64 -mtune=generic -mno-ssse3 -mno-sse4.1 -mno-sse4.2 -mno-popcnt -mno-avx -mno-avx2"
ENV CXXFLAGS="-O2 -march=x86-64 -mtune=generic -mno-ssse3 -mno-sse4.1 -mno-sse4.2 -mno-popcnt -mno-avx -mno-avx2"

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     build-essential \
     ca-certificates \
     curl \
     meson \
     ninja-build \
     pkg-config \
     python3 \
     xz-utils \
     libarchive-dev \
     libcgif-dev \
     libexif-dev \
     libexpat1-dev \
     libglib2.0-dev \
     libheif-dev \
     libjpeg62-turbo-dev \
     liblcms2-dev \
     libimagequant-dev \
     libfontconfig1-dev \
     libpango1.0-dev \
     libpng-dev \
     librsvg2-dev \
     libtiff-dev \
     libwebp-dev \
     zlib1g-dev \
  && curl -fsSL "https://github.com/libvips/libvips/releases/download/v${LIBVIPS_VERSION}/vips-${LIBVIPS_VERSION}.tar.xz" -o /tmp/libvips.tar.xz \
  && echo "${LIBVIPS_SHA256}  /tmp/libvips.tar.xz" | sha256sum -c - \
  && mkdir -p /tmp/libvips \
  && tar -xJf /tmp/libvips.tar.xz -C /tmp/libvips --strip-components=1 \
  && meson setup /tmp/libvips/build /tmp/libvips \
     --prefix=/opt/vips-legacy \
     --libdir=lib \
     --buildtype=release \
     -Dauto_features=disabled \
     -Dcplusplus=true \
     -Ddeprecated=false \
     -Dexamples=false \
     -Dintrospection=disabled \
     -Dmodules=disabled \
     -Dcfitsio=disabled \
     -Dcgif=enabled \
     -Dfftw=disabled \
     -Dfontconfig=enabled \
     -Darchive=enabled \
     -Dimagequant=enabled \
     -Duhdr=disabled \
     -Djpeg-xl=disabled \
     -Dmagick=disabled \
     -Dmatio=disabled \
     -Dnifti=disabled \
     -Dopenexr=disabled \
     -Dopenjpeg=disabled \
     -Dopenslide=disabled \
     -Dhighway=disabled \
     -Dorc=disabled \
     -Dpangocairo=enabled \
     -Dpdfium=disabled \
     -Dpoppler=disabled \
     -Dquantizr=disabled \
     -Draw=disabled \
     -Dspng=disabled \
     -Dzlib=enabled \
     -Dexif=enabled \
     -Djpeg=enabled \
     -Dpng=enabled \
     -Dwebp=enabled \
     -Dtiff=enabled \
     -Dheif=enabled \
     -Drsvg=enabled \
     -Dlcms=enabled \
  && meson compile -C /tmp/libvips/build \
  && meson install -C /tmp/libvips/build \
  && test "$(PKG_CONFIG_PATH=/opt/vips-legacy/lib/pkgconfig pkg-config --modversion vips-cpp)" = "${LIBVIPS_VERSION}" \
  && rm -rf /tmp/libvips /tmp/libvips.tar.xz /var/lib/apt/lists/*

FROM libvips-builder AS deps
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PKG_CONFIG_PATH=/opt/vips-legacy/lib/pkgconfig
ENV LD_LIBRARY_PATH=/opt/vips-legacy/lib
ENV SHARP_FORCE_GLOBAL_LIBVIPS=1

COPY package.json package-lock.json ./
COPY patches ./patches

RUN --mount=type=cache,target=/root/.npm npm ci --include=optional \
  && rm -rf node_modules/@img/sharp-linux-x64 node_modules/@img/sharp-libvips-linux-x64 node_modules/next/node_modules/sharp node_modules/next/node_modules/@img/sharp-linux-x64 node_modules/next/node_modules/@img/sharp-libvips-linux-x64 \
  && npm explore sharp -- npm run build \
  && node -e "const sharp=require('sharp'); const input=Buffer.from([255,0,0,255]); if(sharp.versions.sharp !== '0.35.3' || sharp.versions.vips !== '8.18.3' || sharp.versions.emscripten) throw new Error('Sharp must use the legacy native build'); sharp(input,{raw:{width:1,height:1,channels:4}}).png().toBuffer().then(output=>{if(!output.length) throw new Error('Sharp image probe failed')})"

FROM deps AS deps-prod
RUN npm prune --omit=dev \
  && rm -rf node_modules/@img/sharp-linux-x64 node_modules/@img/sharp-libvips-linux-x64 node_modules/next/node_modules/sharp node_modules/next/node_modules/@img/sharp-linux-x64 node_modules/next/node_modules/@img/sharp-libvips-linux-x64 \
  && node -e "const sharp=require('sharp'); if(sharp.versions.sharp !== '0.35.3' || sharp.versions.vips !== '8.18.3' || sharp.versions.emscripten) throw new Error('Pruned dependencies must retain legacy native Sharp')"

FROM deps AS builder
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV LD_LIBRARY_PATH=/opt/vips-legacy/lib

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     wget \
     libarchive13 \
     libcgif0 \
     libexif12 \
     libexpat1 \
     libglib2.0-0 \
     libheif1 \
     libjpeg62-turbo \
     liblcms2-2 \
     libimagequant0 \
     libfontconfig1 \
     libpango-1.0-0 \
     libpangocairo-1.0-0 \
     libpng16-16 \
     librsvg2-2 \
     libtiff6 \
     libwebp7 \
     libwebpdemux2 \
     libwebpmux3 \
     zlib1g \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nextjs \
  && useradd --system --uid 1001 --gid nextjs --home-dir /app --shell /usr/sbin/nologin nextjs

COPY --from=libvips-builder /opt/vips-legacy /opt/vips-legacy
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/content ./content
COPY --from=builder --chown=nextjs:nextjs /app/scripts ./scripts
COPY --from=deps-prod --chown=nextjs:nextjs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /app/src/app/data.ts ./src/app/data.ts
COPY --from=builder --chown=nextjs:nextjs /app/src/collections ./src/collections
COPY --from=builder --chown=nextjs:nextjs /app/src/content/projects ./src/content/projects
COPY --from=builder --chown=nextjs:nextjs /app/src/payload.config.ts ./src/payload.config.ts
COPY --from=builder --chown=nextjs:nextjs /app/src/migrations ./src/migrations
COPY --from=builder --chown=nextjs:nextjs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nextjs /app/package.json ./package.json

RUN rm -rf node_modules/@img/sharp-linux-x64 node_modules/@img/sharp-libvips-linux-x64 node_modules/next/node_modules/sharp node_modules/next/node_modules/@img/sharp-linux-x64 node_modules/next/node_modules/@img/sharp-libvips-linux-x64 \
  && node -e "const sharp=require('sharp'); const input=Buffer.from([255,0,0,255]); if(sharp.versions.sharp !== '0.35.3' || sharp.versions.vips !== '8.18.3' || sharp.versions.emscripten) throw new Error('Runner must use legacy native Sharp'); sharp(input,{raw:{width:1,height:1,channels:4}}).png().toBuffer().then(output=>{if(!output.length) throw new Error('Runner Sharp image probe failed')})" \
  && mkdir -p /app/public/uploads \
  && chown -R nextjs:nextjs /app/public/uploads

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "npm run payload -- migrate && node server.js"]
