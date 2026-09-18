FROM postgres:16-bookworm

RUN apt-get update && \
    apt-get install -y --no-install-recommends postgresql-16-partman && \
    rm -rf /var/lib/apt/lists/*

RUN echo "shared_preload_libraries = 'pg_partman_bgw'" >> /usr/share/postgresql/postgresql.conf.sample
